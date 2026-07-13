'use client';

import { useState, useEffect } from 'react';
import { Announcement, HouseType } from '../types';

interface DetailViewProps {
  announcement: Announcement | null;
  onClose: () => void;
  compareCart: HouseType[];
  onToggleCompare: (houseType: HouseType, announcementTitle: string) => void;
}

export default function DetailView({
  announcement,
  onClose,
  compareCart,
  onToggleCompare,
}: DetailViewProps) {
  const [selectedHouseType, setSelectedHouseType] = useState<HouseType | null>(null);
  const [customDeposit, setCustomDeposit] = useState<number>(0);
  const [areaUnit, setAreaUnit] = useState<'㎡' | '평'>('㎡');

  // Reset selected house type when announcement changes
  useEffect(() => {
    if (announcement && announcement.houseTypes.length > 0) {
      setSelectedHouseType(announcement.houseTypes[0]);
      setCustomDeposit(announcement.houseTypes[0].deposit);
    } else {
      setSelectedHouseType(null);
    }
  }, [announcement]);

  // Update custom deposit when selected house type changes
  useEffect(() => {
    if (selectedHouseType) {
      setCustomDeposit(selectedHouseType.deposit);
    }
  }, [selectedHouseType]);

  if (!announcement) return null;

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

  const formatRawNumber = (val: number) => {
    return val.toLocaleString();
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
    if (!selectedHouseType) return 0;
    const baseDep = selectedHouseType.deposit;
    const baseRent = selectedHouseType.monthlyRent;

    if (customDeposit === baseDep) return baseRent;

    if (customDeposit > baseDep) {
      // Increasing deposit, decreasing rent (standard rate is 6% per annum)
      const diff = customDeposit - baseDep;
      const rentReduction = (diff * 0.06) / 12;
      return Math.max(selectedHouseType.minMonthlyRent, Math.round(baseRent - rentReduction));
    } else {
      // Decreasing deposit, increasing rent (standard rate is 3% to 3.5% per annum)
      const diff = baseDep - customDeposit;
      const rentIncrease = (diff * 0.035) / 12;
      return Math.min(selectedHouseType.maxMonthlyRent, Math.round(baseRent + rentIncrease));
    }
  };

  const simulatedRent = calculateSimulatedRent();

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
        <div>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', alignItems: 'center' }}>
            <span className={`badge ${announcement.provider === 'LH' ? 'badge-lh' : announcement.provider === 'SH' ? 'badge-sh' : 'badge-private'}`}>
              {announcement.provider === 'PRIVATE' ? '민간' : announcement.provider}
            </span>
            <span className="badge" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
              {announcement.housingType}
            </span>
          </div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: '1.4' }}>
            {announcement.title}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            {announcement.address}
          </p>
        </div>
        <button onClick={onClose} className="btn-icon" style={{ fontSize: '1.2rem', padding: '6px' }} title="닫기">
          ✕
        </button>
      </div>

      {/* Content Scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Toggle Area Unit & Original Link */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <button
              onClick={() => setAreaUnit(areaUnit === '㎡' ? '평' : '㎡')}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '15px' }}
            >
              면적 단위: {areaUnit}으로 보기
            </button>
          </div>
          <a
            href={announcement.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '15px', textDecoration: 'none' }}
          >
            원본 공고문 바로가기 ↗
          </a>
        </div>

        {/* Housing Types List */}
        <div>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '10px', color: 'var(--text-primary)' }}>
            주택형별 임대 조건 목록
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {announcement.houseTypes.map((ht) => {
              const isInCart = compareCart.some(c => c.id === ht.id);
              return (
                <div
                  key={ht.id}
                  style={{
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    backgroundColor: 'var(--bg-secondary)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{ht.name}</span>
                    <button
                      onClick={() => onToggleCompare(ht, announcement.title)}
                      className={`btn ${isInCart ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '12px' }}
                    >
                      {isInCart ? '비교 해제' : '비교 담기'}
                    </button>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
                    <div>
                      <strong>모집 세대수:</strong> {ht.supplyCount}세대
                    </div>
                    <div>
                      <strong>면적:</strong> {formatArea(ht.exclusiveArea, ht.supplyArea)}
                    </div>
                    <div style={{ gridColumn: 'span 2', borderTop: '1px dashed var(--border-light)', paddingTop: '6px', marginTop: '4px' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>기본 임대 조건:</span>
                    </div>
                    <div>
                      보증금: {formatPrice(ht.deposit)}
                    </div>
                    <div>
                      월세: {formatPrice(ht.monthlyRent)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conversion Calculator Section */}
        {selectedHouseType && (
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
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="logo-icon" style={{ width: '18px', height: '18px', fontSize: '0.6rem' }}>%</span>
              상호전환(보증금 ↔ 월세) 계산기
            </h3>

            {/* Select House Type for Calculator */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>주택형 선택</label>
              <select
                className="form-input"
                value={selectedHouseType.id}
                onChange={(e) => {
                  const ht = announcement.houseTypes.find(h => h.id === e.target.value);
                  if (ht) setSelectedHouseType(ht);
                }}
                style={{ height: '36px', padding: '0 8px', fontSize: '0.85rem' }}
              >
                {announcement.houseTypes.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>

            {/* Price Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem' }}>
                <span className="form-label" style={{ margin: 0 }}>전환할 보증금</span>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                  {formatPrice(customDeposit)}
                </span>
              </div>
              <input
                type="range"
                min={selectedHouseType.minDeposit}
                max={selectedHouseType.maxDeposit}
                step="1000000" // 100만 단위
                value={customDeposit}
                onChange={(e) => setCustomDeposit(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                <span>최소 {formatPrice(selectedHouseType.minDeposit)}</span>
                <span>기본 {formatPrice(selectedHouseType.deposit)}</span>
                <span>최대 {formatPrice(selectedHouseType.maxDeposit)}</span>
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
              fontSize: '0.8rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>예상 보증금</span>
                <strong style={{ color: 'var(--text-primary)' }}>{formatPrice(customDeposit)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>예상 월 임대료</span>
                <strong style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>{formatPrice(simulatedRent)}</strong>
              </div>
              
              <div style={{ 
                borderTop: '1px dashed var(--border-medium)', 
                paddingTop: '8px', 
                marginTop: '4px',
                fontSize: '0.7rem', 
                color: 'var(--text-secondary)',
                lineHeight: '1.4'
              }}>
                {customDeposit > selectedHouseType.deposit ? (
                  <div>
                    💡 보증금을 <strong>{formatPrice(customDeposit - selectedHouseType.deposit)}</strong> 늘려 
                    월세를 매월 <strong>{formatPrice(selectedHouseType.monthlyRent - simulatedRent)}</strong> 절감합니다. 
                    (연 전환이율 6% 적용)
                  </div>
                ) : customDeposit < selectedHouseType.deposit ? (
                  <div>
                    💡 보증금을 <strong>{formatPrice(selectedHouseType.deposit - customDeposit)}</strong> 감액하는 대신 
                    월세가 매월 <strong>{formatPrice(simulatedRent - selectedHouseType.monthlyRent)}</strong> 증가합니다. 
                    (연 전환이율 3.5% 적용)
                  </div>
                ) : (
                  <div>💡 현재 기본 임대조건 상태입니다. 슬라이더를 조정하여 상호전환 모의 계산을 수행해보세요.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
