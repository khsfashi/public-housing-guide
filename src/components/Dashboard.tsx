'use client';

import { Announcement, ProviderType } from '../types';

interface DashboardProps {
  filteredAnnouncements: Announcement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  
  // Filter states and setters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedProviders: Set<ProviderType>;
  toggleProvider: (provider: ProviderType) => void;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  maxDeposit: number;
  setMaxDeposit: (val: number) => void;
  maxMonthlyRent: number;
  setMaxMonthlyRent: (val: number) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
}

export default function Dashboard({
  filteredAnnouncements,
  selectedId,
  onSelect,
  searchQuery,
  setSearchQuery,
  selectedProviders,
  toggleProvider,
  selectedRegion,
  setSelectedRegion,
  maxDeposit,
  setMaxDeposit,
  maxMonthlyRent,
  setMaxMonthlyRent,
  sortBy,
  setSortBy,
}: DashboardProps) {

  // Formatter helpers
  const formatPrice = (val: number) => {
    if (val === 0) return '없음';
    if (val >= 100000000) {
      const eok = Math.floor(val / 100000000);
      const remain = Math.floor((val % 100000000) / 10000);
      return remain > 0 ? `${eok}억 ${remain}만원` : `${eok}억원`;
    }
    return `${Math.floor(val / 10000)}만원`;
  };

  const getMinMaxPrice = (ann: Announcement) => {
    if (ann.houseTypes.length === 0) return { minDep: 0, maxDep: 0, minRent: 0, maxRent: 0 };
    const deposits = ann.houseTypes.map(h => h.deposit);
    const rents = ann.houseTypes.map(h => h.monthlyRent);
    return {
      minDep: Math.min(...deposits),
      maxDep: Math.max(...deposits),
      minRent: Math.min(...rents),
      maxRent: Math.max(...rents)
    };
  };

  const getProviderBadgeClass = (provider: ProviderType) => {
    switch (provider) {
      case 'LH': return 'badge badge-lh';
      case 'SH': return 'badge badge-sh';
      case 'PRIVATE': return 'badge badge-private';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden' }}>
      {/* Search and Filters Section */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid var(--border-light)',
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="공고명 또는 지역 검색 (예: 수서, 마포...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
          {/* Search Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '18px',
              height: '18px',
              color: 'var(--text-tertiary)'
            }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.603 10.602Z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-tertiary)'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Provider Badges Filters */}
        <div>
          <label className="form-label">공급 주체</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(['LH', 'SH', 'PRIVATE'] as ProviderType[]).map(prov => {
              const active = selectedProviders.has(prov);
              let baseColor = 'var(--lh-color)';
              let baseBg = 'var(--lh-bg)';
              if (prov === 'SH') {
                baseColor = 'var(--sh-color)';
                baseBg = 'var(--sh-bg)';
              } else if (prov === 'PRIVATE') {
                baseColor = 'var(--private-color)';
                baseBg = 'var(--private-bg)';
              }

              return (
                <button
                  key={prov}
                  onClick={() => toggleProvider(prov)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: `1.5px solid ${active ? baseColor : 'var(--border-light)'}`,
                    backgroundColor: active ? baseBg : 'var(--bg-secondary)',
                    color: active ? baseColor : 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {active && <span>✓</span>}
                  {prov === 'PRIVATE' ? '민간임대' : prov}
                </button>
              );
            })}
          </div>
        </div>

        {/* Region Filter */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label className="form-label">지역 선택</label>
            <select
              className="form-input"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              style={{ cursor: 'pointer', height: '40px', padding: '0 10px' }}
            >
              <option value="ALL">전체 지역</option>
              <option value="서울시">서울특별시</option>
              <option value="경기도">경기도</option>
              <option value="인천시">인천광역시</option>
            </select>
          </div>

          <div>
            <label className="form-label">정렬 기준</label>
            <select
              className="form-input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ cursor: 'pointer', height: '40px', padding: '0 10px' }}
            >
              <option value="latest">최신 공고 순</option>
              <option value="minDeposit">최저 보증금 순</option>
              <option value="minRent">최저 월세 순</option>
              <option value="deadline">마감 임박 순</option>
            </select>
          </div>
        </div>

        {/* Sliders for Prices */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span className="form-label" style={{ margin: 0 }}>최대 임대보증금</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>
                {maxDeposit === 600000000 ? '무제한' : formatPrice(maxDeposit)}
              </span>
            </div>
            <input
              type="range"
              min="10000000" // 1000만
              max="600000000" // 6억
              step="10000000"
              value={maxDeposit}
              onChange={(e) => setMaxDeposit(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span className="form-label" style={{ margin: 0 }}>최대 월임대료</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>
                {maxMonthlyRent === 1500000 ? '무제한' : formatPrice(maxMonthlyRent)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1500000" // 150만
              step="50000"
              value={maxMonthlyRent}
              onChange={(e) => setMaxMonthlyRent(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {/* Result Count and Announcement List */}
      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
        <div style={{
          padding: '12px 20px',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          fontWeight: 600,
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>검색 결과: <strong>{filteredAnnouncements.length}</strong>건</span>
          {selectedId && (
            <button
              onClick={() => onSelect(null)}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
            >
              선택 해제
            </button>
          )}
        </div>

        {filteredAnnouncements.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              style={{ width: '48px', height: '48px', marginBottom: '12px', opacity: 0.5 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>필터에 일치하는 공고가 없습니다.</p>
            <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>필터 검색 조건을 초기화하거나 넓혀보세요.</p>
          </div>
        ) : (
          filteredAnnouncements.map((ann) => {
            const isSelected = ann.id === selectedId;
            const { minDep, maxDep, minRent, maxRent } = getMinMaxPrice(ann);

            return (
              <div
                key={ann.id}
                onClick={() => onSelect(ann.id)}
                style={{
                  padding: '20px',
                  borderBottom: '1px solid var(--border-light)',
                  backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-secondary)',
                  borderLeft: isSelected ? '4px solid var(--primary)' : '4px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                className={!isSelected ? 'hover-scale' : ''}
              >
                {/* Badges */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
                  <span className={getProviderBadgeClass(ann.provider)}>
                    {ann.provider === 'PRIVATE' ? '민간' : ann.provider}
                  </span>
                  <span className="badge" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                    {ann.housingType}
                  </span>
                  <span className={`badge ${ann.status === '모집중' ? 'badge-active' : 'badge-closed'}`}>
                    {ann.status}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  lineHeight: '1.4',
                  color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                  marginBottom: '8px'
                }}>
                  {ann.title}
                </h3>

                {/* Info Text */}
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '14px', height: '14px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  {ann.address}
                </p>

                {/* Spec Summary */}
                <div style={{
                  backgroundColor: isSelected ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  border: '1px solid var(--border-light)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>임대보증금</span>
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {minDep === maxDep ? formatPrice(minDep) : `${formatPrice(minDep)} ~ ${formatPrice(maxDep)}`}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>월 임대료</span>
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {minRent === maxRent ? formatPrice(minRent) : `${formatPrice(minRent)} ~ ${formatPrice(maxRent)}`}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>주택 평형</span>
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {ann.houseTypes.map(h => `${Math.round(h.pyeongSize)}평`).join(', ')} ({ann.houseTypes.length}개 타입)
                    </strong>
                  </div>
                </div>

                {/* Date */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '10px',
                  fontSize: '0.7rem',
                  color: 'var(--text-tertiary)'
                }}>
                  <span>공고일: {ann.announcementDate}</span>
                  <span style={{ color: ann.status === '모집중' ? 'var(--status-active-color)' : 'var(--text-tertiary)', fontWeight: ann.status === '모집중' ? 700 : 500 }}>
                    접수마감: {ann.deadlineDate}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
