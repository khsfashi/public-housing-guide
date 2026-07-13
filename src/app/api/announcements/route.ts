import { NextResponse } from 'next/server';
import { generateFlatUnits } from '../../../data/mockDataGenerator';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const apiKey = process.env.NEXT_PUBLIC_PUBLIC_DATA_API_KEY;

  // If API Key is configured, try fetching live data from Public Data Portal (공공데이터포털)
  if (apiKey && apiKey !== 'YOUR_API_KEY_HERE') {
    try {
      // 1. Fetch from LH Lease Notice Info Open API (LH 분양임대공고문 조회 서비스)
      const url = `http://apis.data.go.kr/B552555/lhLeaseNoticeInfo1/getLeaseNoticeInfo1?serviceKey=${apiKey}&PG_SZ=50&PAGE=1&UPP_AIS_TP_CD=06&NoticeType=1`; // 06 is typically Lease (임대주택)
      
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 3600 } // cache for 1 hour
      });

      if (response.ok) {
        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          // If XML is returned or JSON parsing fails, fallback
        }

        if (data && data[1] && data[1].dsList) {
          const rawAnnouncements = data[1].dsList;
          // Transform raw LH API data into FlatHouseUnit model
          const liveFlatUnits = rawAnnouncements.map((item: any, idx: number) => {
            const exclusiveArea = parseFloat(item.DDO_AR || '26.5');
            const deposit = parseInt(item.LTTOT_GORT || '25000000', 10);
            const monthlyRent = parseInt(item.RNTCHRG || '150000', 10);
            const pyeongSize = +(exclusiveArea * 0.3025).toFixed(1);

            return {
              id: `live-lh-${item.PAN_ID || idx}`,
              announcementId: item.PAN_ID || `live-ann-${idx}`,
              provider: 'LH' as const,
              housingType: '매입임대' as const, // Or parse from item.AIS_TP_CD_NM
              announcementTitle: item.PAN_NM || '실시간 LH 임대주택 공고',
              announcementDate: item.PAN_NT_DT || '2026-07-10',
              deadlineDate: item.CLSG_DT || '2026-07-30',
              status: '모집중' as const,
              region: item.CNTR_NM || '서울시',
              address: item.LCTN_ADR || '상세 주소는 LH 청약플러스에서 확인 가능합니다.',
              latitude: 37.5665 + (Math.random() * 0.1 - 0.05), // fallback random near center
              longitude: 126.9780 + (Math.random() * 0.1 - 0.05),
              originalUrl: 'https://apply.lh.or.kr/',
              applyUrl: 'https://apply.lh.or.kr/lh/co/menu.do?miNo=1157',

              unitName: `${item.AIS_TP_CD_NM || '매입임대'} ${exclusiveArea}㎡`,
              exclusiveArea,
              supplyArea: exclusiveArea * 1.35,
              pyeongSize,
              supplyCount: 1,
              deposit,
              monthlyRent,
              maxDeposit: deposit * 1.5,
              minMonthlyRent: Math.max(50000, monthlyRent * 0.4),
              minDeposit: deposit * 0.3,
              maxMonthlyRent: monthlyRent * 1.3,
            };
          });

          return NextResponse.json({
            mode: 'live',
            data: liveFlatUnits
          });
        }
      }
    } catch (error) {
      console.error('Error fetching live LH API data:', error);
      // Fall through to mock generator if API call fails
    }
  }

  // Generate 120+ nationwide flattened mock units
  const flatUnits = generateFlatUnits();
  
  return NextResponse.json({
    mode: 'simulation',
    data: flatUnits
  });
}
