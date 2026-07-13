'use client';

import { useState, useMemo, useEffect } from 'react';
import { FlatHouseUnit, ProviderType, HousingType, UserProfileData } from '../types';
import Dashboard from '../components/Dashboard';
import KakaoMap from '../components/KakaoMap';
import DetailView from '../components/DetailView';
import ComparePanel from '../components/ComparePanel';
import ThemeToggle from '../components/ThemeToggle';
import IntroScreen from '../components/IntroScreen';

export default function Home() {
  // Start Screen State
  const [hasStarted, setHasStarted] = useState(false);

  // Responsive Layout States
  const [isMobile, setIsMobile] = useState(false);
  const [mobileTab, setMobileTab] = useState<'list' | 'map'>('list');

  // API Data States
  const [allUnits, setAllUnits] = useState<FlatHouseUnit[]>([]);
  const [apiMode, setApiMode] = useState<'live' | 'simulation'>('simulation');
  const [loading, setLoading] = useState(true);

  // Resize States
  const [sidebarWidth, setSidebarWidth] = useState(420);
  const [isDragging, setIsDragging] = useState(false);

  // Selection state (individual unit level)
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedProviders, setSelectedProviders] = useState<Set<ProviderType>>(
    new Set<ProviderType>(['LH', 'SH', 'PRIVATE'])
  );

  const [selectedHousingTypes, setSelectedHousingTypes] = useState<Set<HousingType>>(
    new Set<HousingType>(['매입임대', '행복주택', '국민임대', '공공임대', '영구임대', '장기전세', '민간임대', '신혼희망타운'])
  );

  const [selectedSido, setSelectedSido] = useState('ALL');
  const [selectedSigungu, setSelectedSigungu] = useState('ALL');
  const [selectedGu, setSelectedGu] = useState('ALL');

  // Price & Area filter states
  const [minDeposit, setMinDeposit] = useState(0);
  const [maxDeposit, setMaxDeposit] = useState(800000000); // 8억
  const [minMonthlyRent, setMinMonthlyRent] = useState(0);
  const [maxMonthlyRent, setMaxMonthlyRent] = useState(2000000); // 200만
  const [minPyeong, setMinPyeong] = useState(0);
  const [maxPyeong, setMaxPyeong] = useState(45); // 45평 이상 (무제한)

  const [sortBy, setSortBy] = useState('latest');

  // Compare Cart State
  const [compareCart, setCompareCart] = useState<FlatHouseUnit[]>([]);

  // Bookmarks State
  const [bookmarks, setBookmarks] = useState<FlatHouseUnit[]>([]);

  // Personalization User Profile State
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);

  // Alerts State
  const [expiredCleanedAlert, setExpiredCleanedAlert] = useState<string | null>(null);
  const [notificationAlert, setNotificationAlert] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    // Detect mobile size
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    async function fetchData() {
      try {
        const res = await fetch('/api/announcements');
        if (res.ok) {
          const json = await res.json();
          setAllUnits(json.data || []);
          setApiMode(json.mode || 'simulation');
        }
      } catch (err) {
        console.error('Failed to load announcements API', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();

    // Load active session on mount
    const lastUser = localStorage.getItem('housing_hub_current_user');
    if (lastUser) {
      setCurrentUser(lastUser);
    } else {
      // Load global bookmarks on mount
      const storedBookmarks = localStorage.getItem('housing_hub_bookmarks_global');
      if (storedBookmarks) {
        try {
          const loaded: FlatHouseUnit[] = JSON.parse(storedBookmarks);
          const todayStr = new Date().toISOString().split('T')[0];
          const valid = loaded.filter(b => b.deadlineDate >= todayStr);
          if (valid.length < loaded.length) {
            const expiredNames = loaded.filter(b => b.deadlineDate < todayStr).map(b => b.unitName).join(', ');
            setExpiredCleanedAlert(`마감 기간이 지난 찜 공고 [${expiredNames}]가 목록에서 자동 정리되었습니다.`);
          }
          setBookmarks(valid);
          localStorage.setItem('housing_hub_bookmarks_global', JSON.stringify(valid));
        } catch (e) {
          console.error(e);
        }
      }
    }

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle profile and bookmark changes when user logs in or out
  useEffect(() => {
    if (currentUser) {
      // Load user profile
      const storedProfiles = localStorage.getItem('housing_hub_profiles');
      if (storedProfiles) {
        const profiles = JSON.parse(storedProfiles);
        if (profiles[currentUser]) {
          setUserProfile(profiles[currentUser]);
        } else {
          const defaultProfile: UserProfileData = {
            currentRegion: 'ALL',
            residenceYears: 0,
            age: '',
            preferredRegions: []
          };
          setUserProfile(defaultProfile);
        }
      } else {
        const defaultProfile: UserProfileData = {
          currentRegion: 'ALL',
          residenceYears: 0,
          age: '',
          preferredRegions: []
        };
        setUserProfile(defaultProfile);
      }

      // Load user bookmarks
      const storedBookmarks = localStorage.getItem(`housing_hub_bookmarks_${currentUser}`);
      if (storedBookmarks) {
        try {
          const loaded: FlatHouseUnit[] = JSON.parse(storedBookmarks);
          const todayStr = new Date().toISOString().split('T')[0];
          const valid = loaded.filter(b => b.deadlineDate >= todayStr);
          if (valid.length < loaded.length) {
            const expiredNames = loaded.filter(b => b.deadlineDate < todayStr).map(b => b.unitName).join(', ');
            setExpiredCleanedAlert(`마감 기간이 지난 찜 공고 [${expiredNames}]가 목록에서 자동 정리되었습니다.`);
          }
          setBookmarks(valid);
          localStorage.setItem(`housing_hub_bookmarks_${currentUser}`, JSON.stringify(valid));
        } catch (e) {
          console.error(e);
        }
      } else {
        setBookmarks([]);
      }
    } else {
      setUserProfile(null);
      // Load global bookmarks on logout / guest mode
      const storedBookmarks = localStorage.getItem('housing_hub_bookmarks_global');
      if (storedBookmarks) {
        try {
          const loaded: FlatHouseUnit[] = JSON.parse(storedBookmarks);
          const todayStr = new Date().toISOString().split('T')[0];
          const valid = loaded.filter(b => b.deadlineDate >= todayStr);
          setBookmarks(valid);
        } catch (e) {
          console.error(e);
          setBookmarks([]);
        }
      } else {
        setBookmarks([]);
      }
    }
  }, [currentUser]);

  // Sidebar drag handler
  const startResizing = (mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(300, Math.min(800, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Toggle Provider selection helper
  const toggleProvider = (provider: ProviderType) => {
    const newProviders = new Set(selectedProviders);
    if (newProviders.has(provider)) {
      if (newProviders.size > 1) {
        newProviders.delete(provider);
      }
    } else {
      newProviders.add(provider);
    }
    setSelectedProviders(newProviders);
  };

  // Toggle Housing Type selection helper
  const toggleHousingType = (type: HousingType) => {
    const newTypes = new Set(selectedHousingTypes);
    if (newTypes.has(type)) {
      if (newTypes.size > 1) {
        newTypes.delete(type);
      }
    } else {
      newTypes.add(type);
    }
    setSelectedHousingTypes(newTypes);
  };

  // Authentication Callbacks
  const handleLogin = (username: string, profileData: UserProfileData) => {
    setCurrentUser(username);
    localStorage.setItem('housing_hub_current_user', username);
    
    const storedProfiles = localStorage.getItem('housing_hub_profiles');
    const profiles = storedProfiles ? JSON.parse(storedProfiles) : {};
    profiles[username] = profileData;
    localStorage.setItem('housing_hub_profiles', JSON.stringify(profiles));
    setUserProfile(profileData);
    
    // Merge guest bookmarks with user's existing bookmarks
    const userBookmarksKey = `housing_hub_bookmarks_${username}`;
    const storedUserBookmarks = localStorage.getItem(userBookmarksKey);
    let userBookmarks: FlatHouseUnit[] = [];
    if (storedUserBookmarks) {
      try {
        userBookmarks = JSON.parse(storedUserBookmarks);
      } catch (e) {
        console.error(e);
      }
    }
    
    // Deduplicate by ID
    const mergedMap = new Map<string, FlatHouseUnit>();
    userBookmarks.forEach(b => mergedMap.set(b.id, b));
    bookmarks.forEach(b => mergedMap.set(b.id, b));
    const merged = Array.from(mergedMap.values());
    
    const todayStr = new Date().toISOString().split('T')[0];
    const valid = merged.filter(b => b.deadlineDate >= todayStr);
    
    localStorage.setItem(userBookmarksKey, JSON.stringify(valid));
    setBookmarks(valid);
    
    // Clear global guest bookmarks after merging into user account
    localStorage.removeItem('housing_hub_bookmarks_global');

    // Auto-apply user preferences to dashboard filters
    if (profileData.preferredProviders && profileData.preferredProviders.length > 0) {
      setSelectedProviders(new Set(profileData.preferredProviders));
    }
    if (profileData.preferredHousingTypes && profileData.preferredHousingTypes.length > 0) {
      setSelectedHousingTypes(new Set(profileData.preferredHousingTypes));
    }
    if (profileData.preferredMinPyeong !== undefined) {
      setMinPyeong(profileData.preferredMinPyeong);
    }
    if (profileData.preferredMaxPyeong !== undefined) {
      setMaxPyeong(profileData.preferredMaxPyeong);
    }
    if (profileData.preferredMaxDeposit !== undefined) {
      setMaxDeposit(profileData.preferredMaxDeposit);
    }
    if (profileData.preferredMaxMonthlyRent !== undefined) {
      setMaxMonthlyRent(profileData.preferredMaxMonthlyRent);
    }

    // Default to recommendation sort when logging in
    setSortBy('recommendation');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('housing_hub_current_user');
    setUserProfile(null);
    setSortBy('latest');
    setHasStarted(false); // Redirect to intro screen

    // Restore guest bookmarks
    const storedBookmarks = localStorage.getItem('housing_hub_bookmarks_global');
    if (storedBookmarks) {
      try {
        setBookmarks(JSON.parse(storedBookmarks));
      } catch (e) {
        console.error(e);
        setBookmarks([]);
      }
    } else {
      setBookmarks([]);
    }
  };

  const handleUpdateProfile = (profileData: UserProfileData) => {
    if (!currentUser) return;
    setUserProfile(profileData);
    const storedProfiles = localStorage.getItem('housing_hub_profiles');
    const profiles = storedProfiles ? JSON.parse(storedProfiles) : {};
    profiles[currentUser] = profileData;
    localStorage.setItem('housing_hub_profiles', JSON.stringify(profiles));
  };

  // Toggle Bookmark
  const handleToggleBookmark = (unit: FlatHouseUnit) => {
    const isBookmarked = bookmarks.some(b => b.id === unit.id);
    let updatedBookmarks;
    if (isBookmarked) {
      updatedBookmarks = bookmarks.filter(b => b.id !== unit.id);
    } else {
      updatedBookmarks = [...bookmarks, unit];
    }
    setBookmarks(updatedBookmarks);
    
    const key = currentUser ? `housing_hub_bookmarks_${currentUser}` : 'housing_hub_bookmarks_global';
    localStorage.setItem(key, JSON.stringify(updatedBookmarks));
  };

  // Simulated Status Change & Web Notification
  const handleSimulateStatusChange = () => {
    if (bookmarks.length === 0) {
      alert('시뮬레이션을 진행하려면 먼저 매물 목록에서 공고를 찜(하트 아이콘)해주세요!');
      return;
    }

    const target = bookmarks[0];
    const currentUnitState = allUnits.find(u => u.id === target.id);
    if (!currentUnitState) return;

    if (currentUnitState.status === '모집중') {
      // Revert to '접수종료' first, then toggle back to '모집중' after 1.5 seconds to show status changed
      setAllUnits(prev => prev.map(u => u.id === target.id ? { ...u, status: '접수종료' } : u));
      alert(`[${target.unitName}]의 상태를 '접수종료'로 임시 변경했습니다. 1.5초 후 '모집중' 상태로 복원되면서 웹 알림이 발생합니다.`);
      
      setTimeout(() => {
        setAllUnits(prev => prev.map(u => u.id === target.id ? { ...u, status: '모집중' } : u));
        
        const msg = `📢 찜한 공고 [${target.unitName}]의 상태가 '모집중'으로 전환되었습니다! 지금 신청할 수 있습니다.`;
        setNotificationAlert(msg);
        triggerBrowserNotification(msg);
      }, 1500);
    } else {
      // Directly change to '모집중'
      setAllUnits(prev => prev.map(u => u.id === target.id ? { ...u, status: '모집중' } : u));
      
      const msg = `📢 찜한 공고 [${target.unitName}]의 상태가 '모집중'으로 전환되었습니다! 지금 신청할 수 있습니다.`;
      setNotificationAlert(msg);
      triggerBrowserNotification(msg);
    }
  };

  const triggerBrowserNotification = (msg: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Housing Hub', { body: msg });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('Housing Hub', { body: msg });
          }
        });
      }
    }
  };

  // Compute recommendation scores based on personalization
  const scoredUnits = useMemo(() => {
    return allUnits.map(unit => {
      let score = 0;
      if (currentUser && userProfile) {
        const { currentRegion, residenceYears, age, preferredRegions } = userProfile;
        
        // 1. Current region match (highest priority)
        if (currentRegion && currentRegion !== 'ALL' && unit.region.includes(currentRegion)) {
          score += 1000;
          // 2. Years of residence adds weight
          score += (residenceYears || 0) * 100;
        }
        
        // 3. Preferred regions match
        if (preferredRegions && preferredRegions.length > 0) {
          const matchPreferred = preferredRegions.some(pref => pref !== 'ALL' && unit.region.includes(pref));
          if (matchPreferred) {
            score += 500;
          }
        }
        
        // 4. Age match
        if (age) {
          const ageNum = parseInt(age, 10);
          if (!isNaN(ageNum)) {
            // Youth (청년): 19-39
            if (ageNum >= 19 && ageNum <= 39) {
              if (unit.unitName.includes('청년') || unit.unitName.includes('대학생') || unit.housingType === '행복주택') {
                score += 300;
              }
            }
            // Senior (고령자): 65+
            if (ageNum >= 65) {
              if (unit.unitName.includes('고령자') || unit.housingType === '영구임대') {
                score += 300;
              }
            }
            // Newlyweds (신혼부부): 20-45 (approx)
            if (ageNum >= 20 && ageNum <= 45) {
              if (unit.unitName.includes('신혼부부') || unit.housingType === '신혼희망타운') {
                score += 300;
              }
            }
          }
        }
      }
      return { ...unit, score };
    });
  }, [allUnits, currentUser, userProfile]);

  // Filtered & Sorted Units
  const filteredUnits = useMemo(() => {
    return scoredUnits
      .filter((unit) => {
        // 1. Search Query filter (unit name, announcement title, address, region)
        const matchSearch =
          unit.unitName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          unit.announcementTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          unit.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          unit.region.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchSearch) return false;

        // 2. Provider filter
        if (!selectedProviders.has(unit.provider)) return false;

        // 3. Housing Type filter
        if (!selectedHousingTypes.has(unit.housingType)) return false;

        // 4. Cascading Region filter
        if (selectedSido !== 'ALL') {
          if (!unit.region.includes(selectedSido)) return false;
          if (selectedSigungu !== 'ALL') {
            if (!unit.region.includes(selectedSigungu)) return false;
            if (selectedGu !== 'ALL' && !unit.region.includes(selectedGu)) {
              return false;
            }
          }
        }

        // 5. Price Filter
        const depositOk =
          unit.deposit >= minDeposit &&
          (maxDeposit === 800000000 || unit.deposit <= maxDeposit);
        const rentOk =
          unit.monthlyRent >= minMonthlyRent &&
          (maxMonthlyRent === 2000000 || unit.monthlyRent <= maxMonthlyRent);

        if (!depositOk || !rentOk) return false;

        // 6. Area / Pyeong Filter
        const pyeongOk =
          unit.pyeongSize >= minPyeong &&
          (maxPyeong === 45 || unit.pyeongSize <= maxPyeong);

        if (!pyeongOk) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'recommendation') {
          if (b.score === a.score) {
            return new Date(b.announcementDate).getTime() - new Date(a.announcementDate).getTime();
          }
          return b.score - a.score;
        }
        if (sortBy === 'latest') {
          return new Date(b.announcementDate).getTime() - new Date(a.announcementDate).getTime();
        }
        if (sortBy === 'minDeposit') {
          return a.deposit - b.deposit;
        }
        if (sortBy === 'minRent') {
          return a.monthlyRent - b.monthlyRent;
        }
        if (sortBy === 'maxArea') {
          return b.exclusiveArea - a.exclusiveArea;
        }
        if (sortBy === 'deadline') {
          return new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime();
        }
        return 0;
      });
  }, [
    scoredUnits,
    searchQuery,
    selectedProviders,
    selectedHousingTypes,
    selectedSido,
    selectedSigungu,
    selectedGu,
    minDeposit,
    maxDeposit,
    minMonthlyRent,
    maxMonthlyRent,
    minPyeong,
    maxPyeong,
    sortBy
  ]);

  // Selected Unit Object
  const selectedUnit = useMemo(() => {
    if (!selectedUnitId) return null;
    return allUnits.find((u) => u.id === selectedUnitId) || null;
  }, [selectedUnitId, allUnits]);

  // Compare Cart Actions
  const handleToggleCompare = (unit: FlatHouseUnit) => {
    const isAlreadyInCart = compareCart.some((item) => item.id === unit.id);

    if (isAlreadyInCart) {
      setCompareCart(compareCart.filter((item) => item.id !== unit.id));
    } else {
      if (compareCart.length >= 4) {
        alert('비교함에는 최대 4개의 주택만 담을 수 있습니다.');
        return;
      }
      setCompareCart([...compareCart, unit]);
    }
  };

  const handleRemoveCompare = (id: string) => {
    setCompareCart(compareCart.filter((item) => item.id !== id));
  };

  const handleClearCompare = () => {
    setCompareCart([]);
  };

  if (!hasStarted) {
    return (
      <IntroScreen
        onStartWithoutAuth={() => {
          setCurrentUser(null);
          setUserProfile(null);
          setSortBy('latest');
          setHasStarted(true);
        }}
        onStartWithAuth={(username, profile) => {
          setCurrentUser(username);
          setUserProfile(profile);
          setSortBy('recommendation');
          setHasStarted(true);
        }}
      />
    );
  }

  return (
    <div className={`app-container ${isDragging ? 'dragging' : ''}`}>
      {/* Toast Alerts Container */}
      {(expiredCleanedAlert || notificationAlert) && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          maxWidth: '450px'
        }}>
          {expiredCleanedAlert && (
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              borderLeft: '4px solid #f59e0b',
              padding: '12px 18px',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{expiredCleanedAlert}</span>
              <button onClick={() => setExpiredCleanedAlert(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>✕</button>
            </div>
          )}
          {notificationAlert && (
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              borderLeft: '4px solid var(--primary)',
              padding: '12px 18px',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{notificationAlert}</span>
              <button onClick={() => setNotificationAlert(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>✕</button>
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <header className="app-header">
        <div className="header-logo">
          <div className="logo-icon" style={{ display: 'none' }}></div>
          <div>
            <span style={{ fontWeight: 800, letterSpacing: '-0.5px' }}>Housing Hub</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '10px' }}>
              LH / SH / 민간임대 조건 비교 분석기
            </span>
          </div>
        </div>

        <div className="header-actions">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Layout */}
      <main className="app-main">
        {/* Sidebar Filter & List */}
        <section 
          className="app-sidebar" 
          style={{ 
            width: isMobile ? '100%' : sidebarWidth,
            display: isMobile && mobileTab !== 'list' ? 'none' : 'flex'
          }}
        >
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px' }}>
              <div className="animate-pulse" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                임대주택 데이터베이스 불러오는 중...
              </div>
            </div>
          ) : (
            <Dashboard
              filteredUnits={filteredUnits}
              selectedUnitId={selectedUnitId}
              onSelectUnit={setSelectedUnitId}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedProviders={selectedProviders}
              toggleProvider={toggleProvider}
              selectedHousingTypes={selectedHousingTypes}
              toggleHousingType={toggleHousingType}
              selectedSido={selectedSido}
              setSelectedSido={setSelectedSido}
              selectedSigungu={selectedSigungu}
              setSelectedSigungu={setSelectedSigungu}
              selectedGu={selectedGu}
              setSelectedGu={setSelectedGu}
              minDeposit={minDeposit}
              setMinDeposit={setMinDeposit}
              maxDeposit={maxDeposit}
              setMaxDeposit={setMaxDeposit}
              minMonthlyRent={minMonthlyRent}
              setMinMonthlyRent={setMinMonthlyRent}
              maxMonthlyRent={maxMonthlyRent}
              setMaxMonthlyRent={setMaxMonthlyRent}
              minPyeong={minPyeong}
              setMinPyeong={setMinPyeong}
              maxPyeong={maxPyeong}
              setMaxPyeong={setMaxPyeong}
              sortBy={sortBy}
              setSortBy={setSortBy}
              apiMode={apiMode}
              bookmarks={bookmarks}
              onToggleBookmark={handleToggleBookmark}
              currentUser={currentUser}
              onLogin={handleLogin}
              onLogout={handleLogout}
              userProfile={userProfile}
              onUpdateProfile={handleUpdateProfile}
              onSimulateStatusChange={handleSimulateStatusChange}
            />
          )}
        </section>

        {/* Dynamic Resize Splitter Handle */}
        {!isMobile && (
          <div className="resize-handle" onMouseDown={startResizing} />
        )}

        {/* Map View */}
        <section 
          className="app-map-area"
          style={{
            display: isMobile && mobileTab !== 'map' ? 'none' : undefined
          }}
        >
          <KakaoMap
            units={filteredUnits}
            selectedUnitId={selectedUnitId}
            onSelectUnit={setSelectedUnitId}
          />

          {/* Bottom Floating Compare basket */}
          <ComparePanel
            compareCart={compareCart}
            onRemove={handleRemoveCompare}
            onClear={handleClearCompare}
          />
        </section>

        {/* Right side Detail Slide panel */}
        <section className={`app-detail-panel ${selectedUnit ? 'open' : ''}`}>
          <DetailView
            unit={selectedUnit}
            onClose={() => setSelectedUnitId(null)}
            compareCart={compareCart}
            onToggleCompare={handleToggleCompare}
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
            currentUser={currentUser}
            userProfile={userProfile}
          />
        </section>
      </main>

      {/* Floating Bottom Tab Bar for Mobile */}
      {isMobile && (
        <div className="mobile-floating-tabs">
          <button 
            className={`mobile-tab-btn ${mobileTab === 'list' ? 'active' : ''}`}
            onClick={() => setMobileTab('list')}
          >
            목록 보기
          </button>
          <button 
            className={`mobile-tab-btn ${mobileTab === 'map' ? 'active' : ''}`}
            onClick={() => setMobileTab('map')}
          >
            지도 보기
          </button>
        </div>
      )}
    </div>
  );
}
