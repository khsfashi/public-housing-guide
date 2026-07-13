'use client';

import { useState } from 'react';
import { HouseType } from '../types';

interface CompareCartItem extends HouseType {
  announcementTitle: string;
  provider: string;
  housingType: string;
}

interface ComparePanelProps {
  compareCart: CompareCartItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export default function ComparePanel({ compareCart, onRemove, onClear }: ComparePanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (compareCart.length === 0) return null;

  // Format helper
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

  // Metric calculators
  const getDepositPerPyeong = (item: CompareCartItem) => {
    const pyeong = item.exclusiveArea * 0.3025;
    return Math.round(item.deposit / pyeong);
  };

  const getRentPerPyeong = (item: CompareCartItem) => {
    const pyeong = item.exclusiveArea * 0.3025;
    return Math.round(item.monthlyRent / pyeong);
  };

  // Calculate 2-year cost: Deposit + (Rent * 24 months)
  const get2YearTotalCost = (item: CompareCartItem) => {
    return item.deposit + (item.monthlyRent * 24);
  };

  return (
    <>
      {/* Compare Floating Bar (Bottom) */}
      <div 
        className="compare-bar open"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          border: '1.5px solid var(--primary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.85rem'
          }}>
            {compareCart.length}
          </div>
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>비교함에 담긴 주택형</h4>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              {compareCart.map(c => c.name).join(', ')}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={onClear} 
            className="btn btn-secondary" 
            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
          >
            비우기
          </button>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="btn btn-primary" 
            style={{ padding: '6px 16px', fontSize: '0.75rem' }}
          >
            상세 비교하기 (표)
          </button>
        </div>
      </div>

      {/* Comparison Modal Overlay */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '1000px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-premium)',
            border: '1px solid var(--border-light)',
            overflow: 'hidden',
            animation: 'scaleIn 0.2s ease-out'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--bg-secondary)'
            }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                🏠 선택한 주택형 세부 비교
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="btn-icon" 
                style={{ fontSize: '1.2rem', padding: '6px' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content - Table */}
            <div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto', padding: '24px' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.85rem'
              }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-medium)' }}>
                    <th style={{ padding: '12px 16px', minWidth: '150px', color: 'var(--text-secondary)' }}>구분</th>
                    {compareCart.map(item => (
                      <th key={item.id} style={{ padding: '12px 16px', minWidth: '220px', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                          <span className={`badge ${item.provider === 'LH' ? 'badge-lh' : item.provider === 'SH' ? 'badge-sh' : 'badge-private'}`}>
                            {item.provider}
                          </span>
                          <button 
                            onClick={() => onRemove(item.id)}
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              color: 'var(--text-tertiary)', 
                              cursor: 'pointer',
                              fontSize: '0.8rem'
                            }}
                            title="비교에서 삭제"
                          >
                            ✕
                          </button>
                        </div>
                        <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{item.name}</div>
                        <div style={{ 
                          fontSize: '0.7rem', 
                          fontWeight: 500, 
                          color: 'var(--text-secondary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '200px',
                          marginTop: '2px'
                        }} title={item.announcementTitle}>
                          {item.announcementTitle}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Housing Type */}
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)', backgroundColor: 'var(--bg-primary)' }}>주택 유형</td>
                    {compareCart.map(item => (
                      <td key={item.id} style={{ padding: '12px 16px', fontWeight: 600 }}>{item.housingType}</td>
                    ))}
                  </tr>

                  {/* Areas */}
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)', backgroundColor: 'var(--bg-primary)' }}>전용 면적</td>
                    {compareCart.map(item => (
                      <td key={item.id} style={{ padding: '12px 16px' }}>
                        <strong>{item.exclusiveArea} ㎡</strong> ({(item.exclusiveArea * 0.3025).toFixed(1)}평)
                      </td>
                    ))}
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)', backgroundColor: 'var(--bg-primary)' }}>공급 면적</td>
                    {compareCart.map(item => (
                      <td key={item.id} style={{ padding: '12px 16px' }}>
                        <strong>{item.supplyArea} ㎡</strong> ({(item.supplyArea * 0.3025).toFixed(1)}평)
                      </td>
                    ))}
                  </tr>

                  {/* Basic Deposit */}
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)', backgroundColor: 'var(--bg-primary)' }}>기본 보증금</td>
                    {compareCart.map(item => (
                      <td key={item.id} style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>{formatPrice(item.deposit)}</td>
                    ))}
                  </tr>

                  {/* Basic Monthly Rent */}
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)', backgroundColor: 'var(--bg-primary)' }}>기본 월세</td>
                    {compareCart.map(item => (
                      <td key={item.id} style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--primary)' }}>{formatPrice(item.monthlyRent)}</td>
                    ))}
                  </tr>

                  {/* Deposit per Pyeong */}
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)', backgroundColor: 'var(--bg-primary)' }}>평당 보증금 <span style={{ fontSize: '0.65rem', fontWeight: 500 }}>(전용면적 기준)</span></td>
                    {compareCart.map(item => (
                      <td key={item.id} style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                        {formatPrice(getDepositPerPyeong(item))} / 평
                      </td>
                    ))}
                  </tr>

                  {/* Rent per Pyeong */}
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)', backgroundColor: 'var(--bg-primary)' }}>평당 월세 <span style={{ fontSize: '0.65rem', fontWeight: 500 }}>(전용면적 기준)</span></td>
                    {compareCart.map(item => (
                      <td key={item.id} style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                        {formatPrice(getRentPerPyeong(item))} / 평
                      </td>
                    ))}
                  </tr>

                  {/* Max Conversion options */}
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)', backgroundColor: 'var(--bg-primary)' }}>최대 전환 보증금 ↔ 월세</td>
                    {compareCart.map(item => (
                      <td key={item.id} style={{ padding: '12px 16px', fontSize: '0.78rem', lineHeight: '1.4' }}>
                        보증금: {formatPrice(item.maxDeposit)}<br />
                        월세: <strong style={{ color: 'var(--primary)' }}>{formatPrice(item.minMonthlyRent)}</strong>
                      </td>
                    ))}
                  </tr>

                  {/* 2-Year Total Cost (Estimation) */}
                  <tr style={{ borderBottom: '1px solid var(--border-medium)', backgroundColor: 'var(--primary-light)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      2년 거주 총 지출<br />
                      <span style={{ fontSize: '0.65rem', fontWeight: 500, color: 'var(--text-secondary)' }}>(보증금 + 24개월 월세)</span>
                    </td>
                    {compareCart.map(item => (
                      <td key={item.id} style={{ padding: '14px 16px', fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>
                        {formatPrice(get2YearTotalCost(item))}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'flex-end',
              backgroundColor: 'var(--bg-primary)'
            }}>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="btn btn-primary"
                style={{ padding: '8px 24px' }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Basic Keyframe Animation in CSS Injection */}
      <style jsx global>{`
        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
