'use client';

import { useState, useEffect } from 'react';
import { FlatHouseUnit } from '../types';

interface DetailViewProps {
  unit: FlatHouseUnit | null;
  onClose: () => void;
  compareCart: FlatHouseUnit[];
  onToggleCompare: (unit: FlatHouseUnit) => void;
  bookmarks: FlatHouseUnit[];
  onToggleBookmark: (unit: FlatHouseUnit) => void;
  currentUser: string | null;
  userProfile: {
    currentRegion: string;
    residenceYears: number;
    age: string;
    preferredRegions: string[];
  } | null;
}

export default function DetailView({
  unit,
  onClose,
  compareCart,
  onToggleCompare,
  bookmarks,
  onToggleBookmark,
  currentUser,
  userProfile,
}: DetailViewProps) {
  const [customDeposit, setCustomDeposit] = useState<number>(0);
  const [areaUnit, setAreaUnit] = useState<'㎡' | '평'>('㎡');

  // Reset custom deposit when selected unit changes
  useEffect(() => {
    if (unit) {
      setCustomDeposit(unit.deposit);
    }
  }, [unit]);

  if (!unit) return null;

  // Formatting helpers
  const formatPrice = (val: number) => {
    if (val === 0) return '없음';
    if (val >= 100000000) {
      const eok = Math.floor(val / 100000000);
      const remain = Math.floor((val % 100000000) / 10000);
      return remain > 0 ? `${eok}억 ${remain}만원` : `${eok}억원`;
    }
    return `${Math.floor(val / 10000)}만원`;
  };

  // Convert ㎡ to pyeong size text
  const formatArea = (exclusive: number, supply: number) => {
    if (areaUnit === '평') {
      const exclPyeong = (exclusive * 0.3025).toFixed(1);
      const supplyPyeong = (supply * 0.3025).toFixed(1);
      return `전용 ${exclPyeong}평 / 공급 ${supplyPyeong}평`;
    }
    return `전용 ${exclusive}㎡ / 공급 ${supply}㎡`;
  };

  // Calculate rent based on custom deposit (conversion simulation)
  const calculateSimulatedRent = () => {
    const baseDep = unit.deposit;
    const baseRent = unit.monthlyRent;

    if (customDeposit === baseDep) return baseRent;

    if (customDeposit > baseDep) {
      // Increasing deposit, decreasing rent (standard rate is 6% per annum)
      const diff = customDeposit - baseDep;
      const rentReduction = (diff * 0.06) / 12;
      return Math.max(unit.minMonthlyRent, Math.round(baseRent - rentReduction));
    } else {
      // Decreasing deposit, increasing rent (standard rate is 3% to 3.5% per annum)
      const diff = baseDep - customDeposit;
      const rentIncrease = (diff * 0.035) / 12;
      return Math.min(unit.maxMonthlyRent, Math.round(baseRent + rentIncrease));
    }
  };

  const simulatedRent = calculateSimulatedRent();
  const isInCart = compareCart.some(c => c.id === unit.id);
  const isBookmarked = bookmarks.some(b => b.id === unit.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden' }}>
      
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        backgroundColor: 'var(--bg-secondary)',
        gap: '12px'
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', alignItems: 'center' }}>
            <span className={`badge ${unit.provider === 'LH' ? 'badge-lh' : unit.provider === 'SH' ? 'badge-sh' : 'badge-private'}`}>
              {unit.provider === 'PRIVATE' ? '민간' : unit.provider}
            </span>
            <span className="badge" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
              {unit.housingType}
            </span>
          </div>
          <h2 style={{ 
            fontSize: '1.08rem', 
            fontWeight: 800, 
            color: 'var(--text-primary)', 
            lineHeight: '1.4',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {unit.unitName}
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {unit.address}
          </p>
        </div>
        <button onClick={onClose} className="btn-icon" style={{ fontSize: '1.2rem', padding: '6px' }} title="닫기">
          ✕
        </button>
      </div>

      {/* Content Scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Toggle Area Unit & Original Link */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setAreaUnit(areaUnit === '㎡' ? '평' : '㎡')}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '15px' }}
          >
            면적 단위: {areaUnit}으로 보기
          </button>

          <a
            href={unit.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '15px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            원본 공고
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '11px', height: '11px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        </div>

        {/* Dynamic Apply Action Button */}
        <div>
          <a
            href={unit.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              padding: '12px 16px',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: 800,
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              textAlign: 'center',
              boxShadow: 'var(--shadow-md)',
              transition: 'background-color 0.2s',
              border: 'none',
              cursor: 'pointer'
            }}
            className="hover-opacity"
          >
            청약 신청 접수
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '14px', height: '14px', marginLeft: '6px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </a>
        </div>

        {/* Parent Announcement Info */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '14px',
          fontSize: '0.8rem'
        }}>
          <h4 style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', fontSize: '0.82rem' }}>
            상위 모집 공고 정보
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-secondary)' }}>
            <div><strong>공고명:</strong> {unit.announcementTitle}</div>
            <div><strong>공고일자:</strong> {unit.announcementDate}</div>
            <div><strong>마감일자:</strong> {unit.deadlineDate} ({unit.status})</div>
          </div>
        </div>

        {/* Current Unit Specs */}
        <div style={{
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          backgroundColor: 'var(--bg-secondary)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>상세 임대 조건</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => onToggleBookmark(unit)}
                className="btn btn-secondary"
                style={{
                  padding: '4px 12px',
                  fontSize: '0.75rem',
                  borderRadius: '12px',
                  borderColor: isBookmarked ? '#ef4444' : 'var(--border-medium)',
                  color: isBookmarked ? '#ef4444' : 'var(--text-secondary)',
                  backgroundColor: isBookmarked ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {isBookmarked ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="#ef4444" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#ef4444" style={{ width: '13px', height: '13px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                    관심 해제
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '13px', height: '13px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                    관심 등록
                  </>
                )}
              </button>
              <button
                onClick={() => onToggleCompare(unit)}
                className={`btn ${isInCart ? 'btn-secondary' : 'btn-primary'}`}
                style={{ padding: '4px 12px', fontSize: '0.75rem', borderRadius: '12px' }}
              >
                {isInCart ? '비교 해제' : '비교 담기'}
              </button>
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
            <div>
              <strong>모집 세대수:</strong> {unit.supplyCount}세대
            </div>
            <div>
              <strong>평형 크기:</strong> {unit.pyeongSize}평
            </div>
            <div>
              <strong>면적 규격:</strong> {formatArea(unit.exclusiveArea, unit.supplyArea)}
            </div>
            <div>
              <strong>공급 주체:</strong> {unit.provider} ({unit.housingType})
            </div>
            <div style={{ gridColumn: 'span 2', borderTop: '1px dashed var(--border-light)', paddingTop: '8px', marginTop: '4px' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>기본 조건 (상호전환 전):</span>
            </div>
            <div>
              <strong>임대 보증금:</strong> {formatPrice(unit.deposit)}
            </div>
            <div>
              <strong>월 임대료:</strong> {formatPrice(unit.monthlyRent)}
            </div>
          </div>

          {/* Priority Score Analysis */}
          {currentUser && userProfile && (
            <div style={{
              marginTop: '14px',
              padding: '10px 12px',
              backgroundColor: 'var(--primary-light)',
              border: '1.2px dashed var(--primary)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.74rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                개인 청약 우선순위 분석
              </span>
              <div>
                • 거주지 매칭: {userProfile.currentRegion && unit.region.includes(userProfile.currentRegion) ? (
                  <span style={{ color: '#10b981', fontWeight: 700 }}>당해지역 거주자 (우선공급 대상)</span>
                ) : (
                  <span>타지역 거주자 (가점 없음)</span>
                )}
              </div>
              {userProfile.currentRegion && unit.region.includes(userProfile.currentRegion) && (
                <div>• 거주 년수 가점: {userProfile.residenceYears || 0}년 거주 중 (+{(userProfile.residenceYears || 0) * 100}점)</div>
              )}
              {userProfile.preferredRegions?.some(pr => unit.region.includes(pr)) && (
                <div style={{ color: 'var(--primary)', fontWeight: 600 }}>• 선호지역 요건 만족 (+500점)</div>
              )}
              {userProfile.age && (() => {
                const ageNum = parseInt(userProfile.age);
                if (ageNum >= 19 && ageNum <= 39 && (unit.unitName.includes('청년') || unit.unitName.includes('대학생') || unit.housingType === '행복주택')) {
                  return <div style={{ color: 'var(--primary)', fontWeight: 600 }}>• 청년 청약 대상자 연령 범위 (+300점)</div>;
                }
                if (ageNum >= 65 && (unit.unitName.includes('고령자') || unit.housingType === '영구임대')) {
                  return <div style={{ color: 'var(--primary)', fontWeight: 600 }}>• 고령자 청약 대상자 연령 범위 (+300점)</div>;
                }
                if (ageNum >= 20 && ageNum <= 45 && (unit.unitName.includes('신혼부부') || unit.housingType === '신혼희망타운')) {
                  return <div style={{ color: 'var(--primary)', fontWeight: 600 }}>• 신혼부부 청약 대상자 연령 범위 (+300점)</div>;
                }
                return null;
              })()}
            </div>
          )}
        </div>

        {/* Conversion Calculator Section */}
        <div style={{
          border: '2px solid var(--primary-light)',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <h3 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            보증금-월세 상호전환 시뮬레이터
          </h3>

          {/* Price Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.78rem' }}>
              <span className="form-label" style={{ margin: 0 }}>조정할 보증금</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                {formatPrice(customDeposit)}
              </span>
            </div>
            <input
              type="range"
              min={unit.minDeposit}
              max={unit.maxDeposit}
              step="1000000" // 100만 단위
              value={customDeposit}
              onChange={(e) => setCustomDeposit(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              <span>최소 {formatPrice(unit.minDeposit)}</span>
              <span>기본 {formatPrice(unit.deposit)}</span>
              <span>최대 {formatPrice(unit.maxDeposit)}</span>
            </div>
          </div>

          {/* Results Grid */}
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px',
            border: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '0.78rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>예상 임대보증금</span>
              <strong style={{ color: 'var(--text-primary)' }}>{formatPrice(customDeposit)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>예상 월 임대료</span>
              <strong style={{ color: 'var(--primary)', fontSize: '0.92rem' }}>{formatPrice(simulatedRent)}</strong>
            </div>
            
            <div style={{ 
              borderTop: '1px dashed var(--border-medium)', 
              paddingTop: '8px', 
              marginTop: '4px',
              fontSize: '0.7rem', 
              color: 'var(--text-secondary)',
              lineHeight: '1.4'
            }}>
              {customDeposit > unit.deposit ? (
                <div>
                  안내: 보증금을 {formatPrice(customDeposit - unit.deposit)} 증액하여, 월 임대료가 {formatPrice(unit.monthlyRent - simulatedRent)} 감액되었습니다. (연 6.0% 전환이율 적용)
                </div>
              ) : customDeposit < unit.deposit ? (
                <div>
                  안내: 보증금을 {formatPrice(unit.deposit - customDeposit)} 감액하여, 월 임대료가 {formatPrice(simulatedRent - unit.monthlyRent)} 증액되었습니다. (연 3.5% 전환이율 적용)
                </div>
              ) : (
                <div>안내: 기본 임대 조건입니다. 슬라이더를 조절하여 상호전환 조건을 시뮬레이션해 보세요.</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
