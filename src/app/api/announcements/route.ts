import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const apiKey = process.env.NEXT_PUBLIC_PUBLIC_DATA_API_KEY;

  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    return NextResponse.json(
      { error: 'API key is not configured in .env.local (NEXT_PUBLIC_PUBLIC_DATA_API_KEY)' },
      { status: 500 }
    );
  }

  try {
    // 1. Fetch from LH Lease Notice Info Open API (분양임대공고문 조회)
    // Removed URL encoding on apiKey because it is expected to be used as-is from .env.local
    const url = `http://apis.data.go.kr/B552555/lhLeaseNoticeInfo1/lhLeaseNoticeInfo1?serviceKey=${apiKey}&PG_SZ=30&PAGE=1&PAN_SS=공고중`;
    
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 } // cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`LH API Info1 returned status ${response.status}`);
    }

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Failed to parse JSON from LH Info1 API. May be invalid XML or Key.');
    }

    if (data && data[1] && data[1].dsList) {
      const rawAnnouncements = data[1].dsList;
      
      // Fetch details for each announcement to get area/price (Parallel)
      // Cap at 15 to avoid too many requests / timeouts.
      const detailPromises = rawAnnouncements.slice(0, 15).map(async (item: any) => {
        try {
          const splCd = item.SPL_INF_TP_CD || '063';
          const sysCd = item.CCR_CNNT_SYS_DS_CD || '03';
          const dtlUrl = `http://apis.data.go.kr/B552555/lhLeaseNoticeDtlInfo1/getLeaseNoticeDtlInfo1?serviceKey=${apiKey}&SPL_INF_TP_CD=${splCd}&CCR_CNNT_SYS_DS_CD=${sysCd}&PAN_ID=${item.PAN_ID}`;
          
          const dtlRes = await fetch(dtlUrl, {
            headers: { 'Accept': 'application/json' },
            next: { revalidate: 3600 }
          });
          
          if (dtlRes.ok) {
            const dtlText = await dtlRes.text();
            try {
              const dtlData = JSON.parse(dtlText);
              if (dtlData && Array.isArray(dtlData)) {
                return { item, dtlData };
              }
            } catch (e) {
              // ignore json parse error on dtl
            }
          }
        } catch (e) {
          console.error(`Failed to fetch details for PAN_ID: ${item.PAN_ID}`, e);
        }
        return { item, dtlData: null };
      });

      const detailedResults = await Promise.all(detailPromises);

      // Flatten and transform to FlatHouseUnit
      const liveFlatUnits = [];

      for (let i = 0; i < detailedResults.length; i++) {
        const { item, dtlData } = detailedResults[i];
        
        // Default fallbacks in case DTL is empty or missing fields
        let area = 26.5;
        let deposit = 25000000;
        let monthlyRent = 150000;
        let supplyCount = parseInt(item.ALL_CNT || '1', 10);
        let unitName = `${item.AIS_TP_CD_NM || '임대주택'} 기본형`;

        // If DTL data is present, try to extract area, deposit, and rent from dsAhkInfo
        if (dtlData) {
          const ahkInfoObj = dtlData.find((d: any) => d.dsAhkInfo);
          if (ahkInfoObj && ahkInfoObj.dsAhkInfo && ahkInfoObj.dsAhkInfo.length > 0) {
            const unitInfo = ahkInfoObj.dsAhkInfo[0];
            if (unitInfo.DDO_AR) area = parseFloat(unitInfo.DDO_AR);
            if (unitInfo.LTTOT_GORT) deposit = parseInt(unitInfo.LTTOT_GORT, 10);
            if (unitInfo.RNTCHRG) monthlyRent = parseInt(unitInfo.RNTCHRG, 10);
            if (unitInfo.HSH_CNT) supplyCount = parseInt(unitInfo.HSH_CNT, 10);
            if (unitInfo.TY_NM) unitName = unitInfo.TY_NM;
          }
        }

        const pyeongSize = +(area * 0.3025).toFixed(1);

        liveFlatUnits.push({
          id: `live-lh-${item.PAN_ID}-${i}`,
          announcementId: item.PAN_ID || `live-ann-${i}`,
          provider: 'LH',
          housingType: item.AIS_TP_CD_NM || '공공임대',
          announcementTitle: item.PAN_NM || '실시간 LH 임대주택 공고',
          announcementDate: item.PAN_NT_ST_DT?.replace(/\./g, '-') || '2026-07-14',
          deadlineDate: item.CLSG_DT?.replace(/\./g, '-') || '2026-12-31',
          status: item.PAN_SS === '접수마감' ? '접수종료' : (item.PAN_SS === '공고중' ? '모집중' : '공고예정'),
          region: item.CNTR_NM || item.UPP_AIS_TP_NM || '전국',
          address: item.LCTN_ADR || '상세 주소는 공고문(LH청약플러스)을 참조하세요.',
          latitude: 37.5665 + (Math.random() * 0.5 - 0.25), // Map clustering fallback
          longitude: 126.9780 + (Math.random() * 0.5 - 0.25),
          originalUrl: item.DTL_URL || 'https://apply.lh.or.kr/',
          applyUrl: item.DTL_URL || 'https://apply.lh.or.kr/',

          unitName: unitName,
          exclusiveArea: area,
          supplyArea: area * 1.3, // Approximation
          pyeongSize: pyeongSize,
          supplyCount: supplyCount,
          deposit: deposit,
          monthlyRent: monthlyRent,
          maxDeposit: deposit * 1.5,
          minMonthlyRent: Math.max(50000, monthlyRent * 0.4),
          minDeposit: deposit * 0.3,
          maxMonthlyRent: monthlyRent * 1.3,
        });
      }

      return NextResponse.json({
        mode: 'live',
        data: liveFlatUnits
      });
    } else {
      return NextResponse.json({ mode: 'live', data: [] });
    }
  } catch (error: any) {
    console.error('Error fetching live LH API data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
