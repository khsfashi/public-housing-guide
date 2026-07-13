'use client';

import { useState } from 'react';
import { FlatHouseUnit, ProviderType, HousingType } from '../types';
import { regionsData } from '../data/regions';

export interface UserProfileData {
  currentRegion: string;
  residenceYears: number;
  age: string;
  preferredRegions: string[];
}

interface DashboardProps {
  filteredUnits: (FlatHouseUnit & { score?: number })[];
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

  // Bookmarks
  bookmarks: FlatHouseUnit[];
  onToggleBookmark: (unit: FlatHouseUnit) => void;

  // Personalization & Auth
  currentUser: string | null;
  onLogin: (username: string, profile: UserProfileData) => void;
  onLogout: () => void;
  userProfile: UserProfileData | null;
  onUpdateProfile: (profile: UserProfileData) => void;

  // Simulation Controls
  onSimulateStatusChange: () => void;
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
  bookmarks,
  onToggleBookmark,
  currentUser,
  onLogin,
  onLogout,
  userProfile,
  onUpdateProfile,
  onSimulateStatusChange,
}: DashboardProps) {

  // Local states for presets & login form
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);

  // Local state for profile inputs (initialized from userProfile when edit opens)
  const [currentRegionInput, setCurrentRegionInput] = useState('ALL');
  const [residenceYearsInput, setResidenceYearsInput] = useState(0);
  const [ageInput, setAgeInput] = useState('');
  const [prefRegion1, setPrefRegion1] = useState('ALL');
  const [prefRegion2, setPrefRegion2] = useState('ALL');

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

  // Preset Recommendation Presets trigger
  const applyPreset = (category: 'youth' | 'newlywed' | 'multichild' | 'senior') => {
    if (activePreset === category) {
      // Clear preset
      setActivePreset(null);
      setMinDeposit(0);
      setMaxDeposit(800000000);
      setMinMonthlyRent(0);
      setMaxMonthlyRent(2000000);
      setMinPyeong(0);
      setMaxPyeong(45);
      setSortBy(currentUser ? 'recommendation' : 'latest');
      return;
    }

    setActivePreset(category);
    if (category === 'youth') {
      setMinDeposit(0);
      setMaxDeposit(150000000);
      setMinMonthlyRent(0);
      setMaxMonthlyRent(400000);
      setMinPyeong(0);
      setMaxPyeong(15);
      setSortBy(currentUser ? 'recommendation' : 'minDeposit');
    } else if (category === 'newlywed') {
      setMinDeposit(30000000);
      setMaxDeposit(400000000);
      setMinMonthlyRent(0);
      setMaxMonthlyRent(800000);
      setMinPyeong(12);
      setMaxPyeong(30);
      setSortBy(currentUser ? 'recommendation' : 'latest');
    } else if (category === 'multichild') {
      setMinDeposit(50000000);
      setMaxDeposit(600000000);
      setMinMonthlyRent(0);
      setMaxMonthlyRent(1200000);
      setMinPyeong(18);
      setMaxPyeong(45);
      setSortBy(currentUser ? 'recommendation' : 'latest');
    } else if (category === 'senior') {
      setMinDeposit(0);
      setMaxDeposit(100000000);
      setMinMonthlyRent(0);
      setMaxMonthlyRent(300000);
      setMinPyeong(0);
      setMaxPyeong(18);
      setSortBy(currentUser ? 'recommendation' : 'minRent');
    }
  };

  // Auth Submit Handlers
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) {
      alert('사용자명을 입력해주세요.');
      return;
    }
    const username = usernameInput.trim();
    const storedProfiles = localStorage.getItem('housing_hub_profiles');
    const profiles = storedProfiles ? JSON.parse(storedProfiles) : {};
    
    if (profiles[username]) {
      const saved = profiles[username];
      onLogin(username, saved);
      setCurrentRegionInput(saved.currentRegion);
      setResidenceYearsInput(saved.residenceYears);
      setAgeInput(saved.age);
      setPrefRegion1(saved.preferredRegions[0] || 'ALL');
      setPrefRegion2(saved.preferredRegions[1] || 'ALL');
      setIsEditProfileOpen(false);
    } else {
      const newProfile: UserProfileData = {
        currentRegion: 'ALL',
        residenceYears: 0,
        age: '',
        preferredRegions: []
      };
      onLogin(username, newProfile);
      setCurrentRegionInput('ALL');
      setResidenceYearsInput(0);
      setAgeInput('');
      setPrefRegion1('ALL');
      setPrefRegion2('ALL');
      setIsEditProfileOpen(true); // Open profile settings immediately for new signup
    }
    setUsernameInput('');
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const updated: UserProfileData = {
      currentRegion: currentRegionInput,
      residenceYears: Number(residenceYearsInput),
      age: ageInput,
      preferredRegions: [prefRegion1, prefRegion2].filter(r => r !== 'ALL')
    };
    onUpdateProfile(updated);
    setIsEditProfileOpen(false);
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
          {apiMode === 'live' ? 'Live API Mode' : 'Simulation Mode'}
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
        {/* Auth / Personalization Section */}
        {currentUser === null ? (
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            border: '1px solid var(--border-light)'
          }}>
            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)' }}>개인 맞춤 설정</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>로그인/회원가입</span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="사용자명 입력..."
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  style={{ height: '32px', fontSize: '0.75rem', padding: '0 8px' }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0 12px', height: '32px', fontSize: '0.72rem', borderRadius: 'var(--radius-sm)' }}>
                  확인
                </button>
              </div>
              <p style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', lineHeight: '1.3', margin: 0 }}>
                ※ 이름 입력 시 기존에 저장된 선호지역, 거주기간 등 개인화 설정이 자동으로 로드됩니다.
              </p>
            </form>
          </div>
        ) : (
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            border: '1.5px solid var(--primary-light)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)' }}>
                👤 {currentUser}님 프로필
              </span>
              <button 
                onClick={onLogout} 
                style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600 }}
              >
                로그아웃
              </button>
            </div>

            {!isEditProfileOpen ? (
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div><strong>거주지:</strong> {userProfile?.currentRegion === 'ALL' ? '전국' : userProfile?.currentRegion} ({userProfile?.residenceYears || 0}년 거주)</div>
                <div><strong>선호 지역:</strong> {userProfile?.preferredRegions && userProfile.preferredRegions.length > 0 ? userProfile.preferredRegions.join(', ') : '미지정'}</div>
                <div><strong>나이:</strong> {userProfile?.age ? `${userProfile.age}세` : '미입력'}</div>
                <button 
                  onClick={() => {
                    if (userProfile) {
                      setCurrentRegionInput(userProfile.currentRegion);
                      setResidenceYearsInput(userProfile.residenceYears);
                      setAgeInput(userProfile.age);
                      setPrefRegion1(userProfile.preferredRegions[0] || 'ALL');
                      setPrefRegion2(userProfile.preferredRegions[1] || 'ALL');
                    }
                    setIsEditProfileOpen(true);
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.72rem', marginTop: '4px', width: '100%', height: '28px', borderRadius: '4px' }}
                >
                  설정 수정하기
                </button>
              </div>
            ) : (
              <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.65rem', marginBottom: '2px' }}>현재 거주지</label>
                    <select 
                      className="form-input" 
                      value={currentRegionInput} 
                      onChange={(e) => setCurrentRegionInput(e.target.value)}
                      style={{ height: '28px', fontSize: '0.72rem', padding: '0 4px', cursor: 'pointer' }}
                    >
                      <option value="ALL">전체/없음</option>
                      {regionsData.map(r => (
                        <option key={r.name} value={r.name}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.65rem', marginBottom: '2px' }}>거주 년수</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      min="0"
                      value={residenceYearsInput} 
                      onChange={(e) => setResidenceYearsInput(Number(e.target.value))}
                      style={{ height: '28px', fontSize: '0.72rem', padding: '0 6px' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.65rem', marginBottom: '2px' }}>나이 (선택 사항)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="예: 25"
                    min="0"
                    value={ageInput} 
                    onChange={(e) => setAgeInput(e.target.value)}
                    style={{ height: '28px', fontSize: '0.72rem', padding: '0 6px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.65rem', marginBottom: '2px' }}>선호지역 1</label>
                    <select 
                      className="form-input" 
                      value={prefRegion1} 
                      onChange={(e) => setPrefRegion1(e.target.value)}
                      style={{ height: '28px', fontSize: '0.72rem', padding: '0 4px', cursor: 'pointer' }}
                    >
                      <option value="ALL">없음</option>
                      {regionsData.map(r => (
                        <option key={r.name} value={r.name}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.65rem', marginBottom: '2px' }}>선호지역 2</label>
                    <select 
                      className="form-input" 
                      value={prefRegion2} 
                      onChange={(e) => setPrefRegion2(e.target.value)}
                      style={{ height: '28px', fontSize: '0.72rem', padding: '0 4px', cursor: 'pointer' }}
                    >
                      <option value="ALL">없음</option>
                      {regionsData.map(r => (
                        <option key={r.name} value={r.name}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <p style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', lineHeight: '1.3', margin: '4px 0' }}>
                  * 입력하신 나이 등 모든 개인 정보는 기기에만 안전하게 저장되며, 수집 목적이 아닌 맞춤형 청약 추천 용도로만 활용됩니다. 비워둘 수 있습니다.
                </p>

                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  <button type="button" onClick={() => setIsEditProfileOpen(false)} className="btn btn-secondary" style={{ flex: 1, height: '28px', fontSize: '0.72rem', padding: 0 }}>
                    취소
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, height: '28px', fontSize: '0.72rem', padding: 0 }}>
                    저장하기
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Bookmarks (찜 목록) Section */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden'
        }}>
          <button
            onClick={() => setIsBookmarksOpen(!isBookmarksOpen)}
            style={{
              width: '100%',
              padding: '10px 14px',
              backgroundColor: 'var(--bg-tertiary)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.78rem',
              fontWeight: 800,
              color: 'var(--text-primary)'
            }}
          >
            <span>❤️ 찜한 공고 ({bookmarks.length}개)</span>
            <span style={{ fontSize: '0.7rem' }}>{isBookmarksOpen ? '▲' : '▼'}</span>
          </button>
          
          {isBookmarksOpen && (
            <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
              {bookmarks.length === 0 ? (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textAlign: 'center', padding: '12px 0' }}>
                  찜한 공고가 없습니다.<br />매물 목록의 하트(♡)를 클릭하여 추가해보세요.
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border-light)', paddingBottom: '6px' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>모집 상태 전환 테스트</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onSimulateStatusChange();
                      }}
                      className="btn btn-primary"
                      style={{ padding: '2px 8px', fontSize: '0.65rem', height: '22px', borderRadius: '4px' }}
                    >
                      모집상태 변경 시뮬레이션
                    </button>
                  </div>
                  
                  {bookmarks.map(item => (
                    <div 
                      key={item.id}
                      onClick={() => onSelectUnit(item.id)}
                      style={{
                        padding: '8px 10px',
                        backgroundColor: 'var(--bg-primary)',
                        borderRadius: '6px',
                        border: '1px solid var(--border-light)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.72rem',
                        transition: 'border-color 0.15s'
                      }}
                      className="hover-scale"
                    >
                      <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                        <div style={{ fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.unitName}
                        </div>
                        <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>
                          마감: {item.deadlineDate} ({item.status})
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark(item);
                        }}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.95rem', padding: '2px' }}
                      >
                        ♥
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Target Recommendation Category Presets */}
        <div>
          <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '4px' }}>유형별 맞춤 추천 테마</label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'youth', label: '청년 추천' },
              { id: 'newlywed', label: '신혼부부 추천' },
              { id: 'multichild', label: '다자녀 추천' },
              { id: 'senior', label: '고령자 추천' }
            ].map(preset => {
              const active = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset.id as any)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '15px',
                    border: `1.2px solid ${active ? 'var(--primary)' : 'var(--border-medium)'}`,
                    backgroundColor: active ? 'var(--primary-light)' : 'var(--bg-secondary)',
                    color: active ? 'var(--primary)' : 'var(--text-secondary)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  className="hover-scale"
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

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
            {currentUser && <option value="recommendation">★ 개인 맞춤 추천순</option>}
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
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Heart bookmark toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleBookmark(unit);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: bookmarks.some(b => b.id === unit.id) ? '#ef4444' : 'var(--text-tertiary)',
                      fontSize: '1.05rem',
                      padding: '2px 4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform 0.1s'
                    }}
                    title="찜하기"
                    className="hover-scale"
                  >
                    {bookmarks.some(b => b.id === unit.id) ? '♥' : '♡'}
                  </button>

                  <span className={getProviderBadgeClass(unit.provider)}>
                    {unit.provider === 'PRIVATE' ? '민간' : unit.provider}
                  </span>
                  <span className="badge" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontSize: '0.65rem' }}>
                    {unit.housingType}
                  </span>
                  <span className={`badge ${unit.status === '모집중' ? 'badge-active' : 'badge-closed'}`} style={{ fontSize: '0.65rem' }}>
                    {unit.status}
                  </span>

                  {/* Recommendation Rank Badge */}
                  {currentUser && unit.score !== undefined && unit.score > 0 && (
                    <span className="badge" style={{ backgroundColor: '#10b981', color: '#ffffff', fontSize: '0.65rem', fontWeight: 800 }}>
                      ★ 추천 {filteredUnits.indexOf(unit) + 1}위
                    </span>
                  )}
                  
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
                  {unit.announcementTitle}
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
