'use client';

import { useState, useEffect } from 'react';
import { FlatHouseUnit, ProviderType, HousingType, UserProfileData } from '../types';
import { regionsData, getRegionHierarchy } from '../data/regions';

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
  selectedGu: string;
  setSelectedGu: (gu: string) => void;
  
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
  selectedGu,
  setSelectedGu,
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
  const [activeTab, setActiveTab] = useState<'search' | 'bookmarks'>('search');
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);

  const regionHierarchy = getRegionHierarchy();

  // Local state for profile inputs (3-level region input states)
  const [currentSido, setCurrentSido] = useState('ALL');
  const [currentSigungu, setCurrentSigungu] = useState('ALL');
  const [currentGu, setCurrentGu] = useState('ALL');

  interface PreferredRegionInput {
    sido: string;
    sigungu: string;
    gu: string;
  }
  const [prefRegions, setPrefRegions] = useState<PreferredRegionInput[]>([
    { sido: 'ALL', sigungu: 'ALL', gu: 'ALL' }
  ]);

  const handleAddPrefRegion = () => {
    setPrefRegions(prev => [...prev, { sido: 'ALL', sigungu: 'ALL', gu: 'ALL' }]);
  };

  const handleRemovePrefRegion = (index: number) => {
    if (prefRegions.length <= 1) {
      setPrefRegions([{ sido: 'ALL', sigungu: 'ALL', gu: 'ALL' }]);
      return;
    }
    setPrefRegions(prev => prev.filter((_, i) => i !== index));
  };

  const handlePrefRegionValueChange = (index: number, field: 'sido' | 'sigungu' | 'gu', value: string) => {
    setPrefRegions(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const updated = { ...item, [field]: value };
      if (field === 'sido') {
        updated.sigungu = 'ALL';
        updated.gu = 'ALL';
      } else if (field === 'sigungu') {
        updated.gu = 'ALL';
      }
      return updated;
    }));
  };

  const [residenceYearsInput, setResidenceYearsInput] = useState(0);
  const [ageInput, setAgeInput] = useState('');

  // Extended personalization form states
  const [prefProviders, setPrefProviders] = useState<Set<ProviderType>>(new Set(['LH', 'SH', 'PRIVATE']));
  const [prefHousingTypes, setPrefHousingTypes] = useState<Set<HousingType>>(
    new Set(['매입임대', '행복주택', '국민임대', '공공임대', '영구임대', '장기전세', '민간임대', '신혼희망타운'])
  );
  const [prefMinPyeong, setPrefMinPyeong] = useState(0);
  const [prefMaxPyeong, setPrefMaxPyeong] = useState(45);
  const [prefMaxDeposit, setPrefMaxDeposit] = useState(800000000);
  const [prefMaxMonthlyRent, setPrefMaxMonthlyRent] = useState(2000000);

  // 3-level region parsing and combining helpers
  const parseProfileRegion = (regionStr: string | undefined) => {
    if (!regionStr || regionStr === 'ALL') {
      return { sido: 'ALL', sigungu: 'ALL', gu: 'ALL' };
    }
    const parts = regionStr.split(' ');
    return {
      sido: parts[0] || 'ALL',
      sigungu: parts[1] || 'ALL',
      gu: parts[2] || 'ALL'
    };
  };

  const combineProfileRegion = (sido: string, sigungu: string, gu: string) => {
    if (sido === 'ALL') return 'ALL';
    let combined = sido;
    if (sigungu !== 'ALL') {
      combined += ' ' + sigungu;
      if (gu !== 'ALL') {
        combined += ' ' + gu;
      }
    }
    return combined;
  };

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

  const openEditProfile = () => {
    if (userProfile) {
      const parsedCurrent = parseProfileRegion(userProfile.currentRegion);
      setCurrentSido(parsedCurrent.sido);
      setCurrentSigungu(parsedCurrent.sigungu);
      setCurrentGu(parsedCurrent.gu);
      
      setResidenceYearsInput(userProfile.residenceYears);
      setAgeInput(userProfile.age);
      
      if (userProfile.preferredRegions && userProfile.preferredRegions.length > 0) {
        const loadedRegions = userProfile.preferredRegions.map((r: string) => parseProfileRegion(r));
        setPrefRegions(loadedRegions);
      } else {
        setPrefRegions([{ sido: 'ALL', sigungu: 'ALL', gu: 'ALL' }]);
      }

      // Load extended settings
      setPrefProviders(new Set(userProfile.preferredProviders || ['LH', 'SH', 'PRIVATE']));
      setPrefHousingTypes(new Set(userProfile.preferredHousingTypes || ['매입임대', '행복주택', '국민임대', '공공임대', '영구임대', '장기전세', '민간임대', '신혼희망타운']));
      setPrefMinPyeong(userProfile.preferredMinPyeong ?? 0);
      setPrefMaxPyeong(userProfile.preferredMaxPyeong ?? 45);
      setPrefMaxDeposit(userProfile.preferredMaxDeposit ?? 800000000);
      setPrefMaxMonthlyRent(userProfile.preferredMaxMonthlyRent ?? 2000000);
    } else {
      setCurrentSido('ALL');
      setCurrentSigungu('ALL');
      setCurrentGu('ALL');
      setResidenceYearsInput(0);
      setAgeInput('');
      setPrefRegions([{ sido: 'ALL', sigungu: 'ALL', gu: 'ALL' }]);
      setPrefProviders(new Set(['LH', 'SH', 'PRIVATE']));
      setPrefHousingTypes(new Set(['매입임대', '행복주택', '국민임대', '공공임대', '영구임대', '장기전세', '민간임대', '신혼희망타운']));
      setPrefMinPyeong(0);
      setPrefMaxPyeong(45);
      setPrefMaxDeposit(800000000);
      setPrefMaxMonthlyRent(2000000);
    }
    setIsEditProfileOpen(true);
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
      
      const parsedCurrent = parseProfileRegion(saved.currentRegion);
      setCurrentSido(parsedCurrent.sido);
      setCurrentSigungu(parsedCurrent.sigungu);
      setCurrentGu(parsedCurrent.gu);
      
      setResidenceYearsInput(saved.residenceYears);
      setAgeInput(saved.age);
      
      if (saved.preferredRegions && saved.preferredRegions.length > 0) {
        const loadedRegions = saved.preferredRegions.map((r: string) => parseProfileRegion(r));
        setPrefRegions(loadedRegions);
      } else {
        setPrefRegions([{ sido: 'ALL', sigungu: 'ALL', gu: 'ALL' }]);
      }

      setPrefProviders(new Set(saved.preferredProviders || ['LH', 'SH', 'PRIVATE']));
      setPrefHousingTypes(new Set(saved.preferredHousingTypes || ['매입임대', '행복주택', '국민임대', '공공임대', '영구임대', '장기전세', '민간임대', '신혼희망타운']));
      setPrefMinPyeong(saved.preferredMinPyeong ?? 0);
      setPrefMaxPyeong(saved.preferredMaxPyeong ?? 45);
      setPrefMaxDeposit(saved.preferredMaxDeposit ?? 800000000);
      setPrefMaxMonthlyRent(saved.preferredMaxMonthlyRent ?? 2000000);
      
      setIsEditProfileOpen(false);
    } else {
      const newProfile: UserProfileData = {
        currentRegion: 'ALL',
        residenceYears: 0,
        age: '',
        preferredRegions: [],
        preferredProviders: ['LH', 'SH', 'PRIVATE'],
        preferredHousingTypes: ['매입임대', '행복주택', '국민임대', '공공임대', '영구임대', '장기전세', '민간임대', '신혼희망타운'],
        preferredMinPyeong: 0,
        preferredMaxPyeong: 45,
        preferredMaxDeposit: 800000000,
        preferredMaxMonthlyRent: 2000000
      };
      onLogin(username, newProfile);
      setCurrentSido('ALL');
      setCurrentSigungu('ALL');
      setCurrentGu('ALL');
      setResidenceYearsInput(0);
      setAgeInput('');
      setPrefRegions([{ sido: 'ALL', sigungu: 'ALL', gu: 'ALL' }]);
      setPrefProviders(new Set(['LH', 'SH', 'PRIVATE']));
      setPrefHousingTypes(new Set(['매입임대', '행복주택', '국민임대', '공공임대', '영구임대', '장기전세', '민간임대', '신혼희망타운']));
      setPrefMinPyeong(0);
      setPrefMaxPyeong(45);
      setPrefMaxDeposit(800000000);
      setPrefMaxMonthlyRent(2000000);
      setIsEditProfileOpen(true); // Open profile settings immediately for new signup
    }
    setUsernameInput('');
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const combinedCurrent = combineProfileRegion(currentSido, currentSigungu, currentGu);
    const combinedPrefs = prefRegions
      .map(r => combineProfileRegion(r.sido, r.sigungu, r.gu))
      .filter(r => r !== 'ALL');
    
    const updated: UserProfileData = {
      currentRegion: combinedCurrent,
      residenceYears: Number(residenceYearsInput),
      age: ageInput,
      preferredRegions: combinedPrefs,
      preferredProviders: Array.from(prefProviders),
      preferredHousingTypes: Array.from(prefHousingTypes),
      preferredMinPyeong: prefMinPyeong,
      preferredMaxPyeong: prefMaxPyeong,
      preferredMaxDeposit: prefMaxDeposit,
      preferredMaxMonthlyRent: prefMaxMonthlyRent
    };
    onUpdateProfile(updated);
    setIsEditProfileOpen(false);
  };

  const confirmLogout = () => {
    const isConfirmed = window.confirm('정말 로그아웃 하시겠습니까?');
    if (isConfirmed) {
      onLogout();
    }
  };

  // Get active Sigungu options based on selected Sido
  const activeSigunguList = regionHierarchy.find(r => r.sido === selectedSido)?.sigunguList || [];

  // Get active Gu options based on selected Sigungu
  const activeGuList = activeSigunguList.find(s => s.sigungu === selectedSigungu)?.guList || [];

  // Get filter summary text for collapsed view
  const getFilterSummaryText = () => {
    const parts = [];
    
    // Region
    if (selectedSido !== 'ALL') {
      let regionStr = selectedSido;
      if (selectedSigungu !== 'ALL') {
        regionStr += ` ${selectedSigungu}`;
        if (selectedGu !== 'ALL') {
          regionStr += ` ${selectedGu}`;
        }
      }
      parts.push(regionStr);
    } else {
      parts.push('전체 지역');
    }
    
    // Pyeong size
    parts.push(`${minPyeong}~${maxPyeong === 45 ? '무제한' : `${maxPyeong}평`}`);
    
    // Deposit
    parts.push(`보증금 ${formatPrice(minDeposit)}~${maxDeposit === 800000000 ? '무제한' : formatPrice(maxDeposit)}`);

    // Monthly Rent
    if (minMonthlyRent > 0 || maxMonthlyRent < 2000000) {
      parts.push(`월세 ${formatPrice(minMonthlyRent)}~${maxMonthlyRent === 2000000 ? '무제한' : formatPrice(maxMonthlyRent)}`);
    }

    // Sort order
    const sortLabels: Record<string, string> = {
      recommendation: '추천순',
      latest: '최신순',
      minDeposit: '최저보증금순',
      minRent: '최저월세순',
      maxArea: '넓은평수순',
      deadline: '마감임박순'
    };
    parts.push(sortLabels[sortBy] || '정렬');
    
    return parts.join(' · ');
  };

  // Scroll to selected unit when selectedUnitId changes
  useEffect(() => {
    if (selectedUnitId) {
      const el = document.getElementById(`unit-card-${selectedUnitId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedUnitId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden', position: 'relative' }}>
      
      {/* Overlay Filter Drawer */}
      {isFiltersExpanded && (
        <div className="filter-overlay-drawer" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'var(--bg-secondary)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Drawer Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-light)',
            backgroundColor: 'var(--bg-primary)',
            flexShrink: 0
          }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>상세 검색 필터</span>
            <button
              onClick={() => setIsFiltersExpanded(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '1.2rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                padding: '4px',
                lineHeight: 1
              }}
            >
              ✕
            </button>
          </div>

          {/* Drawer Body (Scrollable filter form) */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            backgroundColor: 'var(--bg-secondary)'
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
                padding: '14px 16px',
                border: '1.5px solid var(--primary-light)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)' }}>{currentUser}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}> 님 설정</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      onClick={openEditProfile}
                      className="btn"
                      style={{ padding: '4px 10px', fontSize: '0.68rem', height: '26px', border: '1px solid var(--border-medium)', borderRadius: '4px' }}
                    >
                      수정
                    </button>
                    <button 
                      onClick={confirmLogout}
                      className="btn"
                      style={{ padding: '4px 10px', fontSize: '0.68rem', height: '26px', border: '1px solid var(--border-medium)', color: '#ef4444', borderRadius: '4px' }}
                    >
                      로그아웃
                    </button>
                  </div>
                </div>
                
                {userProfile && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                    <div>
                      거주지: <strong style={{ color: 'var(--text-primary)' }}>{userProfile.currentRegion === 'ALL' ? '전체' : userProfile.currentRegion}</strong> (년수: <strong style={{ color: 'var(--text-primary)' }}>{userProfile.residenceYears}년</strong>)
                    </div>
                    {userProfile.preferredRegions.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px', alignItems: 'center' }}>
                        <span>선호지역:</span>
                        {userProfile.preferredRegions.map((region, idx) => (
                          <span key={idx} style={{ padding: '2px 6px', backgroundColor: 'var(--bg-secondary)', borderRadius: '3px', fontWeight: 600 }}>
                            {region}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Custom Recommendation Themes */}
            {currentUser && userProfile && (
              <div style={{
                backgroundColor: 'var(--bg-primary)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                border: '1px solid var(--border-light)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '4px' }}>유형별 맞춤 추천 테마</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  <button
                    onClick={() => {
                      setPrefProviders(new Set(['LH', 'SH', 'PRIVATE']));
                      setPrefHousingTypes(new Set(['행복주택', '매입임대', '민간임대']));
                      setPrefMinPyeong(0);
                      setPrefMaxPyeong(18);
                      setPrefMaxDeposit(150000000);
                      setPrefMaxMonthlyRent(350000);
                    }}
                    className="hover-scale"
                    style={{
                      padding: '6px 10px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-light)',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    청년 1인가구 
                  </button>
                  <button
                    onClick={() => {
                      setPrefProviders(new Set(['LH', 'SH', 'PRIVATE']));
                      setPrefHousingTypes(new Set(['행복주택', '신혼희망타운', '국민임대', '공공임대']));
                      setPrefMinPyeong(12);
                      setPrefMaxPyeong(25);
                      setPrefMaxDeposit(350000000);
                      setPrefMaxMonthlyRent(600000);
                    }}
                    className="hover-scale"
                    style={{
                      padding: '6px 10px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-light)',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    신혼부부 특공 
                  </button>
                  <button
                    onClick={() => {
                      setPrefProviders(new Set(['LH', 'SH']));
                      setPrefHousingTypes(new Set(['국민임대', '공공임대', '장기전세', '매입임대']));
                      setPrefMinPyeong(18);
                      setPrefMaxPyeong(45);
                      setPrefMaxDeposit(500000000);
                      setPrefMaxMonthlyRent(800000);
                    }}
                    className="hover-scale"
                    style={{
                      padding: '6px 10px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-light)',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    다자녀/일반가구 
                  </button>
                </div>
              </div>
            )}

            {/* Keyword Search */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '2px' }}>키워드 검색</label>
              <input
                type="text"
                className="form-input"
                placeholder="공고명, 주소 등 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ height: '34px', fontSize: '0.76rem' }}
              />
            </div>

            {/* Region Filter (3-level selector) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '4px' }}>시·도</label>
                  <select
                    className="form-input"
                    value={selectedSido}
                    onChange={(e) => {
                      setSelectedSido(e.target.value);
                      setSelectedSigungu('ALL');
                      setSelectedGu('ALL');
                    }}
                    style={{ cursor: 'pointer', height: '34px', fontSize: '0.75rem', padding: '0 4px' }}
                  >
                    <option value="ALL">전체 지역</option>
                    {regionHierarchy.map(r => (
                      <option key={r.sido} value={r.sido}>{r.sido}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '4px' }}>시·군·구</label>
                  <select
                    className="form-input"
                    value={selectedSigungu}
                    disabled={selectedSido === 'ALL'}
                    onChange={(e) => {
                      setSelectedSigungu(e.target.value);
                      setSelectedGu('ALL');
                    }}
                    style={{ cursor: 'pointer', height: '34px', fontSize: '0.75rem', padding: '0 4px' }}
                  >
                    <option value="ALL">시·군·구 전체</option>
                    {activeSigunguList.map(s => (
                      <option key={s.sigungu} value={s.sigungu}>{s.sigungu}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '4px' }}>구/군</label>
                  <select
                    className="form-input"
                    value={selectedGu}
                    disabled={selectedSigungu === 'ALL' || activeGuList.length === 0}
                    onChange={(e) => setSelectedGu(e.target.value)}
                    style={{ cursor: 'pointer', height: '34px', fontSize: '0.75rem', padding: '0 4px' }}
                  >
                    <option value="ALL">구/읍 전체</option>
                    {activeGuList.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Providers Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '4px' }}>공급 주체</label>
              <div style={{ display: 'flex', gap: '16px', padding: '4px 0' }}>
                {(['LH', 'SH', 'PRIVATE'] as ProviderType[]).map(prov => {
                  const active = selectedProviders.has(prov);
                  const isDisabled = prov !== 'LH';
                  return (
                    <label key={prov} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', cursor: isDisabled ? 'not-allowed' : 'pointer', userSelect: 'none', fontWeight: 600, color: isDisabled ? 'var(--text-tertiary)' : 'var(--text-secondary)' }} title={isDisabled ? "현재 공공데이터 OpenAPI는 LH만 지원합니다." : ""}>
                      <input
                        type="checkbox"
                        checked={active}
                        disabled={isDisabled}
                        onChange={() => toggleProvider(prov)}
                        style={{ width: '15px', height: '15px', cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                      />
                      {prov === 'LH' ? 'LH 한국토지주택공사' : prov === 'SH' ? 'SH 서울주택도시공사' : '민간 임대'}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Housing Type Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '4px' }}>주택 유형</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '4px 0' }}>
                {(['매입임대', '행복주택', '국민임대', '공공임대', '영구임대', '장기전세', '민간임대', '신혼희망타운'] as HousingType[]).map(type => {
                  const active = selectedHousingTypes.has(type);
                  return (
                    <label key={type} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', cursor: 'pointer', userSelect: 'none', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggleHousingType(type)}
                        style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                      />
                      {type}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Area Pyeong Range Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span className="form-label" style={{ fontSize: '0.72rem', margin: 0 }}>전용 평수</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)' }}>{minPyeong}평 ~ {maxPyeong === 45 ? '무제한' : `${maxPyeong}평`}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="range"
                  min="0"
                  max="45"
                  step="1"
                  value={minPyeong}
                  onChange={(e) => setMinPyeong(Number(e.target.value))}
                  style={{ flex: 1, cursor: 'pointer' }}
                />
                <input
                  type="range"
                  min="0"
                  max="45"
                  step="1"
                  value={maxPyeong}
                  onChange={(e) => setMaxPyeong(Number(e.target.value))}
                  style={{ flex: 1, cursor: 'pointer' }}
                />
              </div>
            </div>

            {/* Deposit Range Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span className="form-label" style={{ fontSize: '0.72rem', margin: 0 }}>임대 보증금 범위</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)' }}>{formatPrice(minDeposit)} ~ {maxDeposit === 800000000 ? '무제한' : formatPrice(maxDeposit)}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="range"
                  min="0"
                  max="800000000"
                  step="10000000"
                  value={minDeposit}
                  onChange={(e) => setMinDeposit(Number(e.target.value))}
                  style={{ flex: 1, cursor: 'pointer' }}
                />
                <input
                  type="range"
                  min="0"
                  max="800000000"
                  step="10000000"
                  value={maxDeposit}
                  onChange={(e) => setMaxDeposit(Number(e.target.value))}
                  style={{ flex: 1, cursor: 'pointer' }}
                />
              </div>
            </div>

            {/* Rent Range Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span className="form-label" style={{ fontSize: '0.72rem', margin: 0 }}>월 임대료 범위</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)' }}>{formatPrice(minMonthlyRent)} ~ {maxMonthlyRent === 2000000 ? '무제한' : formatPrice(maxMonthlyRent)}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="range"
                  min="0"
                  max="2000000"
                  step="50000"
                  value={minMonthlyRent}
                  onChange={(e) => setMinMonthlyRent(Number(e.target.value))}
                  style={{ flex: 1, cursor: 'pointer' }}
                />
                <input
                  type="range"
                  min="0"
                  max="2000000"
                  step="50000"
                  value={maxMonthlyRent}
                  onChange={(e) => setMaxMonthlyRent(Number(e.target.value))}
                  style={{ flex: 1, cursor: 'pointer' }}
                />
              </div>
            </div>

            {/* Sort Criteria */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="form-label" style={{ fontSize: '0.72rem', margin: 0 }}>정렬 기준</label>
              <select
                className="form-input"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ cursor: 'pointer', height: '34px', padding: '0 8px', fontSize: '0.75rem' }}
              >
                {currentUser && <option value="recommendation">개인 맞춤 추천순</option>}
                <option value="latest">최신 공고 등록 순</option>
                <option value="minDeposit">최저 보증금 순</option>
                <option value="minRent">최저 월세 순</option>
                <option value="maxArea">넓은 면적(평수) 순</option>
                <option value="deadline">마감 임박 순</option>
              </select>
            </div>
          </div>

          {/* Drawer Footer */}
          <div style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border-light)',
            backgroundColor: 'var(--bg-primary)',
            display: 'flex',
            flexShrink: 0
          }}>
            <button
              onClick={() => setIsFiltersExpanded(false)}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                height: '40px',
                fontSize: '0.8rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              필터 적용 완료
            </button>
          </div>
        </div>
      )}

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
        borderBottom: '1px solid var(--border-light)',
        flexShrink: 0
      }}>
        <span>
          {apiMode === 'live' ? '실시간 API 모드' : '시뮬레이션 모드'}
        </span>
        <span style={{ fontSize: '0.68rem', fontWeight: 500, opacity: 0.8 }}>
          {apiMode === 'live' ? 'LH/SH 실시간 공고 로딩' : '총 120개+ 전지역 매물'}
        </span>
      </div>

      {/* Dashboard Top Navigation Tabs */}
      <div className="dashboard-tabs" style={{ flexShrink: 0 }}>
        <button
          onClick={() => setActiveTab('search')}
          className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
        >
          매물 검색
        </button>
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`tab-button ${activeTab === 'bookmarks' ? 'active' : ''}`}
        >
          관심 공고 ({bookmarks.length})
        </button>
      </div>

      {/* Search Summary Bar (Always shown when activeTab is search and drawer is closed) */}
      {activeTab === 'search' && !isFiltersExpanded && (
        <div className="filter-summary-bar">
          <div className="filter-summary-text-container">
            <span className="filter-summary-text" title={getFilterSummaryText()}>
              {getFilterSummaryText()}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsFiltersExpanded(true)}
            className="filter-summary-btn"
          >
            필터 펼치기 ▼
          </button>
        </div>
      )}

      {/* Bookmarks (찜 목록) Tab Header & Simulation */}
      {activeTab === 'bookmarks' && (
        <div style={{
          padding: '18px 20px',
          borderBottom: '1px solid var(--border-light)',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>관심 등록 공고 목록</span>
            <button 
              onClick={onSimulateStatusChange}
              className="btn btn-primary"
              style={{ padding: '6px 12px', fontSize: '0.72rem', height: '30px', borderRadius: 'var(--radius-sm)' }}
            >
              모집상태 변경 시뮬레이션
            </button>
          </div>
          <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
            찜한 공고의 청약 접수 상태가 실시간으로 변동될 때 브라우저 및 시스템 알림이 발생하는 과정을 테스트할 수 있습니다.
          </p>
        </div>
      )}

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
          backgroundColor: 'var(--bg-secondary)',
          position: 'sticky',
          top: 0,
          zIndex: 4
        }}>
          {activeTab === 'search' ? (
            <span>검색 매물: <strong>{filteredUnits.length}</strong>개 주택</span>
          ) : (
            <span>관심 매물: <strong>{bookmarks.length}</strong>개 주택</span>
          )}
          {selectedUnitId && (
            <button
              onClick={() => onSelectUnit(null)}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}
            >
              선택 해제
            </button>
          )}
        </div>

        {activeTab === 'search' ? (
          filteredUnits.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                style={{ width: '40px', height: '40px', marginBottom: '12px', opacity: 0.5, display: 'inline-block' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>일치하는 매물이 없습니다.</p>
              <p style={{ fontSize: '0.72rem', marginTop: '4px' }}>지역 또는 평수/가격 필터 제한을 늘려보세요.</p>
            </div>
          ) : (
            filteredUnits.map((unit) => renderUnitCard(unit, true))
          )
        ) : (
          bookmarks.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                style={{ width: '40px', height: '40px', marginBottom: '12px', opacity: 0.5, display: 'inline-block' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
              <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>관심 등록한 공고가 없습니다.</p>
              <p style={{ fontSize: '0.72rem', marginTop: '4px' }}>매물 검색 목록의 하트 아이콘을 클릭하여 추가해 보세요.</p>
            </div>
          ) : (
            bookmarks.map((unit) => renderUnitCard(unit, false))
          )
        )}
      </div>

      {/* EXTENDED PERSONALIZATION SETUP MODAL */}
      {isEditProfileOpen && (
        <div className="modal-overlay" onClick={() => setIsEditProfileOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>맞춤 프로필 및 상세 조건 설정</h2>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '1.25rem', fontWeight: 700 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* 현재 거주지 (3단계) */}
              <div>
                <label className="form-label" style={{ fontSize: '0.7rem', marginBottom: '4px' }}>현재 거주지</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr', gap: '6px' }}>
                  <select 
                    className="form-input" 
                    value={currentSido} 
                    onChange={(e) => {
                      setCurrentSido(e.target.value);
                      setCurrentSigungu('ALL');
                      setCurrentGu('ALL');
                    }}
                    style={{ height: '36px', fontSize: '0.78rem', padding: '0 4px', cursor: 'pointer' }}
                  >
                    <option value="ALL">도 전체</option>
                    {regionHierarchy.map(r => (
                      <option key={r.sido} value={r.sido}>{r.sido}</option>
                    ))}
                  </select>
                  
                  <select 
                    className="form-input" 
                    value={currentSigungu} 
                    disabled={currentSido === 'ALL'}
                    onChange={(e) => {
                      setCurrentSigungu(e.target.value);
                      setCurrentGu('ALL');
                    }}
                    style={{ height: '36px', fontSize: '0.78rem', padding: '0 4px', cursor: 'pointer' }}
                  >
                    <option value="ALL">시·군·구</option>
                    {(regionHierarchy.find(r => r.sido === currentSido)?.sigunguList || []).map(s => (
                      <option key={s.sigungu} value={s.sigungu}>{s.sigungu}</option>
                    ))}
                  </select>
                  
                  <select 
                    className="form-input" 
                    value={currentGu} 
                    disabled={
                      currentSigungu === 'ALL' || 
                      ((regionHierarchy.find(r => r.sido === currentSido)?.sigunguList.find(s => s.sigungu === currentSigungu))?.guList.length || 0) === 0
                    }
                    onChange={(e) => setCurrentGu(e.target.value)}
                    style={{ height: '36px', fontSize: '0.78rem', padding: '0 4px', cursor: 'pointer' }}
                  >
                    <option value="ALL">구/읍 전체</option>
                    {((regionHierarchy.find(r => r.sido === currentSido)?.sigunguList.find(s => s.sigungu === currentSigungu))?.guList || []).map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 거주 년수 & 나이 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.7rem', marginBottom: '4px' }}>거주 년수</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    min="0"
                    value={residenceYearsInput || ''} 
                    onChange={(e) => setResidenceYearsInput(Number(e.target.value))}
                    style={{ height: '36px', fontSize: '0.8rem' }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.7rem', marginBottom: '4px' }}>나이 (선택)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="예: 25"
                    min="0"
                    value={ageInput} 
                    onChange={(e) => setAgeInput(e.target.value)}
                    style={{ height: '36px', fontSize: '0.8rem' }}
                  />
                </div>
              </div>

              {/* 선호지역 1 & 2 */}
              {/* 선호지역 동적 리스트 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" style={{ fontSize: '0.7rem', margin: 0 }}>선호지역 설정</label>
                  <button
                    type="button"
                    onClick={handleAddPrefRegion}
                    className="btn-add-region"
                  >
                    + 지역 추가
                  </button>
                </div>
                
                {prefRegions.map((region, index) => {
                  const sigunguList = regionHierarchy.find(r => r.sido === region.sido)?.sigunguList || [];
                  const guList = sigunguList.find(s => s.sigungu === region.sigungu)?.guList || [];
                  
                  return (
                    <div key={index} className="region-select-row-container" style={{ border: '1px solid var(--border-light)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                      <div className="region-select-row-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)' }}>선호지역 {index + 1}</span>
                        {prefRegions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePrefRegion(index)}
                            className="btn-remove-region"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                      
                      <div className="region-select-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr', gap: '6px' }}>
                        <select 
                          className="form-input select-compact" 
                          value={region.sido} 
                          onChange={(e) => handlePrefRegionValueChange(index, 'sido', e.target.value)}
                          style={{ height: '36px', fontSize: '0.78rem', padding: '0 4px', cursor: 'pointer' }}
                        >
                          <option value="ALL">도 전체</option>
                          {regionHierarchy.map(r => (
                            <option key={r.sido} value={r.sido}>{r.sido}</option>
                          ))}
                        </select>
                        
                        <select 
                          className="form-input select-compact" 
                          value={region.sigungu} 
                          disabled={region.sido === 'ALL'}
                          onChange={(e) => handlePrefRegionValueChange(index, 'sigungu', e.target.value)}
                          style={{ height: '36px', fontSize: '0.78rem', padding: '0 4px', cursor: 'pointer' }}
                        >
                          <option value="ALL">시·군·구</option>
                          {sigunguList.map(s => (
                            <option key={s.sigungu} value={s.sigungu}>{s.sigungu}</option>
                          ))}
                        </select>
                        
                        <select 
                          className="form-input select-compact" 
                          value={region.gu} 
                          disabled={region.sigungu === 'ALL' || guList.length === 0}
                          onChange={(e) => handlePrefRegionValueChange(index, 'gu', e.target.value)}
                          style={{ height: '36px', fontSize: '0.78rem', padding: '0 4px', cursor: 'pointer' }}
                        >
                          <option value="ALL">구/읍 전체</option>
                          {guList.map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 선호 공급 주체 */}
              <div>
                <label className="form-label" style={{ fontSize: '0.7rem', marginBottom: '4px' }}>선호 공급 주체 (중복 선택)</label>
                <div style={{ display: 'flex', gap: '16px', padding: '4px 0' }}>
                  {(['LH', 'SH', 'PRIVATE'] as ProviderType[]).map(prov => {
                    const active = prefProviders.has(prov);
                    return (
                      <label key={prov} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', cursor: 'pointer', userSelect: 'none', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => {
                            const next = new Set(prefProviders);
                            if (next.has(prov)) {
                              if (next.size > 1) next.delete(prov);
                            } else {
                              next.add(prov);
                            }
                            setPrefProviders(next);
                          }}
                          style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                        />
                        {prov === 'PRIVATE' ? '민간임대' : prov}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 선호 주택 유형 */}
              <div>
                <label className="form-label" style={{ fontSize: '0.7rem', marginBottom: '4px' }}>선호 주택 유형 (중복 선택)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', maxHeight: '110px', overflowY: 'auto', padding: '8px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-primary)' }}>
                  {(['매입임대', '행복주택', '국민임대', '공공임대', '영구임대', '장기전세', '민간임대', '신혼희망타운'] as HousingType[]).map(type => {
                    const active = prefHousingTypes.has(type);
                    return (
                      <label key={type} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', cursor: 'pointer', userSelect: 'none', fontWeight: 500, color: 'var(--text-secondary)' }}>
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => {
                            const next = new Set(prefHousingTypes);
                            if (next.has(type)) {
                              if (next.size > 1) next.delete(type);
                            } else {
                              next.add(type);
                            }
                            setPrefHousingTypes(next);
                          }}
                          style={{ cursor: 'pointer', width: '14px', height: '14px' }}
                        />
                        {type}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 선호 평형 범위 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.7rem', marginBottom: '4px' }}>최소 평형</label>
                  <select
                    className="form-input"
                    value={prefMinPyeong}
                    onChange={(e) => setPrefMinPyeong(Number(e.target.value))}
                    style={{ height: '36px', fontSize: '0.78rem', cursor: 'pointer' }}
                  >
                    {[0, 5, 10, 15, 20, 25, 30, 35, 40].map(p => (
                      <option key={p} value={p}>{p}평</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.7rem', marginBottom: '4px' }}>최대 평형</label>
                  <select
                    className="form-input"
                    value={prefMaxPyeong}
                    onChange={(e) => setPrefMaxPyeong(Number(e.target.value))}
                    style={{ height: '36px', fontSize: '0.78rem', cursor: 'pointer' }}
                  >
                    {[5, 10, 15, 20, 25, 30, 35, 40, 45].map(p => (
                      <option key={p} value={p}>{p === 45 ? '무제한' : `${p}평`}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 가격 한도 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.7rem', marginBottom: '4px' }}>최대 보증금 한도</label>
                  <select
                    className="form-input"
                    value={prefMaxDeposit}
                    onChange={(e) => setPrefMaxDeposit(Number(e.target.value))}
                    style={{ height: '36px', fontSize: '0.78rem', cursor: 'pointer' }}
                  >
                    {[10000000, 20000000, 50000000, 100000000, 200000000, 300000000, 500000000, 800000000].map(d => (
                      <option key={d} value={d}>{d === 800000000 ? '무제한' : formatPrice(d)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.7rem', marginBottom: '4px' }}>최대 월 임대료 한도</label>
                  <select
                    className="form-input"
                    value={prefMaxMonthlyRent}
                    onChange={(e) => setPrefMaxMonthlyRent(Number(e.target.value))}
                    style={{ height: '36px', fontSize: '0.78rem', cursor: 'pointer' }}
                  >
                    {[100000, 200000, 300000, 500000, 800000, 1200000, 1500000, 2000000].map(r => (
                      <option key={r} value={r}>{r === 2000000 ? '무제한' : formatPrice(r)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsEditProfileOpen(false)} className="btn btn-secondary" style={{ flex: 1, height: '40px' }}>
                  취소
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, height: '40px' }}>
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // Reusable Unit Card block layout renderer
  function renderUnitCard(unit: FlatHouseUnit & { score?: number }, showRank: boolean) {
    const isSelected = unit.id === selectedUnitId;
    return (
      <div
        key={unit.id}
        id={`unit-card-${unit.id}`}
        onClick={() => onSelectUnit(unit.id)}
        className={`house-card ${isSelected ? 'selected' : ''}`}
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
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.1s'
            }}
            title="관심 등록"
            className="hover-scale"
          >
            {bookmarks.some(b => b.id === unit.id) ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="#ef4444" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#ef4444" style={{ width: '16px', height: '16px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px', color: 'var(--text-tertiary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
            )}
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
          {showRank && currentUser && unit.score !== undefined && unit.score > 0 && (
            <span className="badge" style={{ backgroundColor: '#10b981', color: '#ffffff', fontSize: '0.65rem', fontWeight: 800 }}>
              추천 {filteredUnits.findIndex(fu => fu.id === unit.id) + 1}순위
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
              gap: '4px',
              boxShadow: 'var(--shadow-sm)',
              transition: 'background-color 0.2s'
            }}
            className="hover-opacity"
          >
            신청 접수
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '10px', height: '10px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </a>
        </div>
      </div>
    );
  }
}
