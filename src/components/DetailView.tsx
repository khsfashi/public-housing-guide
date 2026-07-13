'use client';

import { useState, useEffect } from 'react';
import { FlatHouseUnit } from '../types';

interface DetailViewProps {
  unit: FlatHouseUnit | null;
  onClose: () => void;
  compareCart: FlatHouseUnit[];
  onToggleCompare: (unit: FlatHouseUnit) => void;
}

export default function DetailView({
  unit,
  onClose,
  compareCart,
  onToggleCompare,
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
            📍 {unit.address}
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
            style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '15px', textDecoration: 'none' }}
          >
            원본 공고문 ↗
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
            🚀 실제 주택 청약 신청하기 (LH/SH 바로가기) ↗
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
            소속 모집 공고 정보
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-secondary)' }}>
            <div><strong>공고명:</strong> {unit.announcementTitle}</div>
            <div><strong>공고일자:</strong> {unit.announcementDate}</div>
            <div><strong>접수기한:</strong> {unit.deadlineDate} ({unit.status})</div>
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
            <button
              onClick={() => onToggleCompare(unit)}
              className={`btn ${isInCart ? 'btn-secondary' : 'btn-primary'}`}
              style={{ padding: '4px 12px', fontSize: '0.75rem', borderRadius: '12px' }}
            >
              {isInCart ? '비교 해제' : '비교 담기'}
            </button>
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
            <span className="logo-icon" style={{ width: '18px', height: '18px', fontSize: '0.6rem' }}>%</span>
            보증금 ↔ 월세 상호전환 모의 계산기
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
                  💡 보증금을 <strong>{formatPrice(customDeposit - unit.deposit)}</strong> 늘려 
                  월세를 매월 <strong>{formatPrice(unit.monthlyRent - simulatedRent)}</strong> 절감합니다. 
                  (연 전환이율 6.0% 적용)
                </div>
              ) : customDeposit < unit.deposit ? (
                <div>
                  💡 보증금을 <strong>{formatPrice(unit.deposit - customDeposit)}</strong> 감액하는 대신 
                  월세가 매월 <strong>{formatPrice(simulatedRent - unit.monthlyRent)}</strong> 증가합니다. 
                  (연 전환이율 3.5% 적용)
                </div>
              ) : (
                <div>💡 현재 기본 임대조건 상태입니다. 슬라이더를 조정하여 상호전환 모의 계산을 수행해보세요.</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
