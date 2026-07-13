'use client';

import { FlatHouseUnit, ProviderType, HousingType } from '../types';
import { regionsData } from '../data/regions';

interface DashboardProps {
  filteredUnits: FlatHouseUnit[];
  selectedUnitId: string | null;
  onSelectUnit: (id: string | null) => void;
  
  // Filter states
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedProviders: Set<ProviderType>;
  toggleProvider: (provider: ProviderType) => void;
  selectedHousingTypes: Set<HousingType>;
  toggleHousingType: (type: HousingType) => void;
  selectedSido: string;
  setSelectedSido: (sido: string) => void;
  selectedSigungu: string;
  setSelectedSigungu: (sigungu: string) => void;
  
  minDeposit: number;
  setMinDeposit: (val: number) => void;
  maxDeposit: number;
  setMaxDeposit: (val: number) => void;
  
  minMonthlyRent: number;
  setMinMonthlyRent: (val: number) => void;
  maxMonthlyRent: number;
  setMaxMonthlyRent: (val: number) => void;
  
  minPyeong: number;
  setMinPyeong: (val: number) => void;
  maxPyeong: number;
  setMaxPyeong: (val: number) => void;
  
  sortBy: string;
  setSortBy: (val: string) => void;
  apiMode: 'live' | 'simulation';
}

export default function Dashboard({
  filteredUnits,
  selectedUnitId,
  onSelectUnit,
  searchQuery,
  setSearchQuery,
  selectedProviders,
  toggleProvider,
  selectedHousingTypes,
  toggleHousingType,
  selectedSido,
  setSelectedSido,
  selectedSigungu,
  setSelectedSigungu,
  minDeposit,
  setMinDeposit,
  maxDeposit,
  setMaxDeposit,
  minMonthlyRent,
  setMinMonthlyRent,
  maxMonthlyRent,
  setMaxMonthlyRent,
  minPyeong,
  setMinPyeong,
  maxPyeong,
  setMaxPyeong,
  sortBy,
  setSortBy,
  apiMode,
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

  const getProviderBadgeClass = (provider: ProviderType) => {
    switch (provider) {
      case 'LH': return 'badge badge-lh';
      case 'SH': return 'badge badge-sh';
      case 'PRIVATE': return 'badge badge-private';
    }
  };

  // Get active Sigungu options based on selected Sido
  const activeSigunguList = regionsData.find(r => r.name === selectedSido)?.sigungu || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden' }}>
      
      {/* Simulation / API Mode Banner */}
      <div style={{
        padding: '10px 20px',
        backgroundColor: apiMode === 'live' ? 'var(--status-active-bg)' : 'var(--primary-light)',
        color: apiMode === 'live' ? 'var(--status-active-color)' : 'var(--primary)',
        fontSize: '0.75rem',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <span>
          {apiMode === 'live' ? '🟢 실시간 공공데이터 API 연동 중' : '💡 전국 청약 시뮬레이션 모드 작동 중'}
        </span>
        <span style={{ fontSize: '0.68rem', fontWeight: 500, opacity: 0.8 }}>
          {apiMode === 'live' ? 'LH/SH 실시간 공고 로딩' : '총 120개+ 전지역 매물'}
        </span>
      </div>

      {/* Search and Filters Section */}
      <div style={{
        padding: '18px 20px',
        borderBottom: '1px solid var(--border-light)',
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        maxHeight: '65%',
        overflowY: 'auto'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="주택명, 공고명 또는 상세 주소 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '38px', height: '38px' }}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
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

        {/* 2-Level Cascading Region Filter */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '4px' }}>시·도</label>
            <select
              className="form-input"
              value={selectedSido}
              onChange={(e) => {
                setSelectedSido(e.target.value);
                setSelectedSigungu('ALL'); // Reset sigungu when sido changes
              }}
              style={{ cursor: 'pointer', height: '36px', padding: '0 8px', fontSize: '0.8rem' }}
            >
              <option value="ALL">전국 전체</option>
              {regionsData.map(r => (
                <option key={r.name} value={r.name}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '4px' }}>시·군·구</label>
            <select
              className="form-input"
              value={selectedSigungu}
              disabled={selectedSido === 'ALL'}
              onChange={(e) => setSelectedSigungu(e.target.value)}
              style={{ cursor: 'pointer', height: '36px', padding: '0 8px', fontSize: '0.8rem' }}
            >
              <option value="ALL">구/군 전체</option>
              {activeSigunguList.map(sg => (
                <option key={sg} value={sg}>{sg}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Provider Filters */}
        <div>
          <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '4px' }}>공급 주체</label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {(['LH', 'SH', 'PRIVATE'] as ProviderType[]).map(prov => {
              const active = selectedProviders.has(prov);
              let color = 'var(--lh-color)';
              let bg = 'var(--lh-bg)';
              if (prov === 'SH') { color = 'var(--sh-color)'; bg = 'var(--sh-bg)'; }
              else if (prov === 'PRIVATE') { color = 'var(--private-color)'; bg = 'var(--private-bg)'; }

              return (
                <button
                  key={prov}
                  onClick={() => toggleProvider(prov)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '15px',
                    border: `1.2px solid ${active ? color : 'var(--border-light)'}`,
                    backgroundColor: active ? bg : 'var(--bg-secondary)',
                    color: active ? color : 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {prov === 'PRIVATE' ? '민간임대' : prov}
                </button>
              );
            })}
          </div>
        </div>

        {/* Housing Type Filters (Include 매입임대) */}
        <div>
          <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '4px' }}>주택 유형</label>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxHeight: '72px', overflowY: 'auto', padding: '2px' }}>
            {(['매입임대', '행복주택', '국민임대', '공공임대', '영구임대', '장기전세', '민간임대', '신혼희망타운'] as HousingType[]).map(type => {
              const active = selectedHousingTypes.has(type);
              return (
                <button
                  key={type}
                  onClick={() => toggleHousingType(type)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: active ? 'var(--primary)' : 'var(--bg-primary)',
                    color: active ? '#ffffff' : 'var(--text-secondary)',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Range Controls for Prices & Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
          
          {/* Pyeong Size Filter */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span className="form-label" style={{ fontSize: '0.72rem', margin: 0 }}>전용 평수</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                {minPyeong}평 ~ {maxPyeong === 45 ? '45평 이상' : `${maxPyeong}평`}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                className="form-input"
                value={minPyeong}
                onChange={(e) => setMinPyeong(Number(e.target.value))}
                style={{ height: '32px', fontSize: '0.75rem', padding: '0 4px' }}
              >
                {[0, 5, 10, 15, 20, 25, 30, 35, 40].map(p => (
                  <option key={p} value={p}>{p}평</option>
                ))}
              </select>
              <span style={{ color: 'var(--text-tertiary)' }}>~</span>
              <select
                className="form-input"
                value={maxPyeong}
                onChange={(e) => setMaxPyeong(Number(e.target.value))}
                style={{ height: '32px', fontSize: '0.75rem', padding: '0 4px' }}
              >
                {[5, 10, 15, 20, 25, 30, 35, 40, 45].map(p => (
                  <option key={p} value={p}>{p === 45 ? '무제한' : `${p}평`}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Deposit Range Filter */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span className="form-label" style={{ fontSize: '0.72rem', margin: 0 }}>임대 보증금 범위</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                {formatPrice(minDeposit)} ~ {maxDeposit === 800000000 ? '무제한' : formatPrice(maxDeposit)}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                className="form-input"
                value={minDeposit}
                onChange={(e) => setMinDeposit(Number(e.target.value))}
                style={{ height: '32px', fontSize: '0.75rem', padding: '0 4px' }}
              >
                {[0, 5000000, 10000000, 20000000, 50000000, 100000000, 200000000, 300000000, 500000000].map(d => (
                  <option key={d} value={d}>{d === 0 ? '0원' : formatPrice(d)}</option>
                ))}
              </select>
              <span style={{ color: 'var(--text-tertiary)' }}>~</span>
              <select
                className="form-input"
                value={maxDeposit}
                onChange={(e) => setMaxDeposit(Number(e.target.value))}
                style={{ height: '32px', fontSize: '0.75rem', padding: '0 4px' }}
              >
                {[10000000, 20000000, 50000000, 100000000, 200000000, 300000000, 500000000, 800000000].map(d => (
                  <option key={d} value={d}>{d === 800000000 ? '무제한' : formatPrice(d)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Monthly Rent Range Filter */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span className="form-label" style={{ fontSize: '0.72rem', margin: 0 }}>월 임대료 범위</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                {formatPrice(minMonthlyRent)} ~ {maxMonthlyRent === 2000000 ? '무제한' : formatPrice(maxMonthlyRent)}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                className="form-input"
                value={minMonthlyRent}
                onChange={(e) => setMinMonthlyRent(Number(e.target.value))}
                style={{ height: '32px', fontSize: '0.75rem', padding: '0 4px' }}
              >
                {[0, 50000, 100000, 200000, 300000, 500000, 800000, 1200000].map(r => (
                  <option key={r} value={r}>{r === 0 ? '없음' : formatPrice(r)}</option>
                ))}
              </select>
              <span style={{ color: 'var(--text-tertiary)' }}>~</span>
              <select
                className="form-input"
                value={maxMonthlyRent}
                onChange={(e) => setMaxMonthlyRent(Number(e.target.value))}
                style={{ height: '32px', fontSize: '0.75rem', padding: '0 4px' }}
              >
                {[100000, 200000, 300000, 500000, 800000, 1200000, 1500000, 2000000].map(r => (
                  <option key={r} value={r}>{r === 2000000 ? '무제한' : formatPrice(r)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Sorting Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label className="form-label" style={{ fontSize: '0.72rem', margin: 0 }}>정렬 기준</label>
          <select
            className="form-input"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ cursor: 'pointer', height: '32px', padding: '0 8px', fontSize: '0.75rem' }}
          >
            <option value="latest">최신 공고 등록 순</option>
            <option value="minDeposit">최저 보증금 순</option>
            <option value="minRent">최저 월세 순</option>
            <option value="maxArea">넓은 면적(평수) 순</option>
            <option value="deadline">마감 임박 순</option>
          </select>
        </div>
      </div>

      {/* Result Count and Announcement List */}
      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
        <div style={{
          padding: '12px 20px',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
          fontWeight: 700,
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-secondary)'
        }}>
          <span>검색 매물: <strong>{filteredUnits.length}</strong>개 주택</span>
          {selectedUnitId && (
            <button
              onClick={() => onSelectUnit(null)}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}
            >
              선택 해제
            </button>
          )}
        </div>

        {filteredUnits.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              style={{ width: '40px', height: '40px', marginBottom: '12px', opacity: 0.5 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>일치하는 매물이 없습니다.</p>
            <p style={{ fontSize: '0.72rem', marginTop: '4px' }}>지역 또는 평수/가격 필터 제한을 늘려보세요.</p>
          </div>
        ) : (
          filteredUnits.map((unit) => {
            const isSelected = unit.id === selectedUnitId;

            return (
              <div
                key={unit.id}
                onClick={() => onSelectUnit(unit.id)}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--border-light)',
                  backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-secondary)',
                  borderLeft: isSelected ? '4px solid var(--primary)' : '4px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  position: 'relative'
                }}
                className={!isSelected ? 'hover-scale' : ''}
              >
                {/* Badges */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
                  <span className={getProviderBadgeClass(unit.provider)}>
                    {unit.provider === 'PRIVATE' ? '민간' : unit.provider}
                  </span>
                  <span className="badge" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontSize: '0.65rem' }}>
                    {unit.housingType}
                  </span>
                  <span className={`badge ${unit.status === '모집중' ? 'badge-active' : 'badge-closed'}`} style={{ fontSize: '0.65rem' }}>
                    {unit.status}
                  </span>
                  
                  {/* Pyeong size highlighted */}
                  <span className="badge" style={{ marginLeft: 'auto', backgroundColor: 'var(--primary)', color: '#ffffff', fontWeight: 700, fontSize: '0.65rem' }}>
                    {unit.pyeongSize}평 ({unit.exclusiveArea}㎡)
                  </span>
                </div>

                {/* Main House Unit Name */}
                <h3 style={{
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  lineHeight: '1.4',
                  color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                  marginBottom: '4px'
                }}>
                  {unit.unitName}
                </h3>

                {/* Parent Announcement Title */}
                <p style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-tertiary)',
                  marginBottom: '8px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  📋 {unit.announcementTitle}
                </p>

                {/* Address */}
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '13px', height: '13px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  {unit.address}
                </p>

                {/* Price Details */}
                <div style={{
                  backgroundColor: isSelected ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.76rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px',
                  border: '1px solid var(--border-light)',
                  marginBottom: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>기본 보증금</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{formatPrice(unit.deposit)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>기본 월세</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{formatPrice(unit.monthlyRent)}</strong>
                  </div>
                </div>

                {/* Card Action footer (Direct Apply) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                    마감: {unit.deadlineDate}
                  </span>
                  
                  {/* Prevent click bubbling to card selection */}
                  <a
                    href={unit.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      padding: '4px 10px',
                      backgroundColor: 'var(--primary)',
                      color: '#ffffff',
                      textDecoration: 'none',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'background-color 0.2s'
                    }}
                    className="hover-opacity"
                  >
                    신청 바로가기 ↗
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
