'use client';

import { useState, useMemo, useEffect } from 'react';
import { FlatHouseUnit, ProviderType, HousingType } from '../types';
import Dashboard from '../components/Dashboard';
import KakaoMap from '../components/KakaoMap';
import DetailView from '../components/DetailView';
import ComparePanel from '../components/ComparePanel';
import ThemeToggle from '../components/ThemeToggle';

export default function Home() {
  // API Data States
  const [allUnits, setAllUnits] = useState<FlatHouseUnit[]>([]);
  const [apiMode, setApiMode] = useState<'live' | 'simulation'>('simulation');
  const [loading, setLoading] = useState(true);

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

  // Fetch data on mount
  useEffect(() => {
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
  }, []);

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

  // Filtered & Sorted Units
  const filteredUnits = useMemo(() => {
    return allUnits
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
        // Sido Match
        if (selectedSido !== 'ALL') {
          if (!unit.region.includes(selectedSido)) return false;
          // Sigungu Match (only relevant if Sido is selected)
          if (selectedSigungu !== 'ALL' && !unit.region.includes(selectedSigungu)) {
            return false;
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
    allUnits,
    searchQuery,
    selectedProviders,
    selectedHousingTypes,
    selectedSido,
    selectedSigungu,
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

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-logo">
          <div className="logo-icon" style={{ display: 'none' }}></div>
          <div>
            <span style={{ fontWeight: 800, letterSpacing: '-0.5px' }}>Rental Home Finder</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '10px' }}>
              LH / SH / Private Rental Condition Comparison
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
        <section className="app-sidebar">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px' }}>
              <div className="animate-pulse" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Loading rental housing database...
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
            />
          )}
        </section>

        {/* Map View */}
        <section className="app-map-area">
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
          />
        </section>
      </main>
    </div>
  );
}
