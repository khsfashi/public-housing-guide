'use client';

import { useState, useMemo } from 'react';
import { mockAnnouncements } from '../data/mockData';
import { Announcement, HouseType, ProviderType } from '../types';
import Dashboard from '../components/Dashboard';
import KakaoMap from '../components/KakaoMap';
import DetailView from '../components/DetailView';
import ComparePanel from '../components/ComparePanel';
import ThemeToggle from '../components/ThemeToggle';

interface CompareCartItem extends HouseType {
  announcementTitle: string;
  provider: string;
  housingType: string;
}

export default function Home() {
  // Selection state
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProviders, setSelectedProviders] = useState<Set<ProviderType>>(
    new Set<ProviderType>(['LH', 'SH', 'PRIVATE'])
  );
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [maxDeposit, setMaxDeposit] = useState(600000000); // 6억
  const [maxMonthlyRent, setMaxMonthlyRent] = useState(1500000); // 150만
  const [sortBy, setSortBy] = useState('latest');

  // Compare Cart State
  const [compareCart, setCompareCart] = useState<CompareCartItem[]>([]);

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

  // Filtered & Sorted Announcements
  const filteredAnnouncements = useMemo(() => {
    return mockAnnouncements
      .filter((ann) => {
        // Search Query filter (title, region, address)
        const matchSearch =
          ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ann.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ann.address.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchSearch) return false;

        // Provider filter
        if (!selectedProviders.has(ann.provider)) return false;

        // Region filter
        if (selectedRegion !== 'ALL' && !ann.region.includes(selectedRegion)) {
          return false;
        }

        // Price Filter
        // Announcement fits if at least one house type satisfies the deposit and rent bounds
        const hasAffordableType = ann.houseTypes.some((ht) => {
          const depositOk = maxDeposit === 600000000 || ht.deposit <= maxDeposit;
          const rentOk = maxMonthlyRent === 1500000 || ht.monthlyRent <= maxMonthlyRent;
          return depositOk && rentOk;
        });

        return hasAffordableType;
      })
      .sort((a, b) => {
        if (sortBy === 'latest') {
          return new Date(b.announcementDate).getTime() - new Date(a.announcementDate).getTime();
        }
        if (sortBy === 'minDeposit') {
          const minDepA = Math.min(...a.houseTypes.map((h) => h.deposit));
          const minDepB = Math.min(...b.houseTypes.map((h) => h.deposit));
          return minDepA - minDepB;
        }
        if (sortBy === 'minRent') {
          const minRentA = Math.min(...a.houseTypes.map((h) => h.monthlyRent));
          const minRentB = Math.min(...b.houseTypes.map((h) => h.monthlyRent));
          return minRentA - minRentB;
        }
        if (sortBy === 'deadline') {
          return new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime();
        }
        return 0;
      });
  }, [searchQuery, selectedProviders, selectedRegion, maxDeposit, maxMonthlyRent, sortBy]);

  // Selected Announcement Object
  const selectedAnnouncement = useMemo(() => {
    if (!selectedId) return null;
    return mockAnnouncements.find((ann) => ann.id === selectedId) || null;
  }, [selectedId]);

  // Compare Cart Actions
  const handleToggleCompare = (houseType: HouseType, announcementTitle: string) => {
    const isAlreadyInCart = compareCart.some((item) => item.id === houseType.id);

    if (isAlreadyInCart) {
      setCompareCart(compareCart.filter((item) => item.id !== houseType.id));
    } else {
      if (compareCart.length >= 4) {
        alert('비교함에는 최대 4개의 주택형만 담을 수 있습니다.');
        return;
      }
      const ann = mockAnnouncements.find((a) => a.houseTypes.some((h) => h.id === houseType.id));
      if (ann) {
        setCompareCart([
          ...compareCart,
          {
            ...houseType,
            announcementTitle,
            provider: ann.provider,
            housingType: ann.housingType,
          },
        ]);
      }
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
          <div className="logo-icon">🏠</div>
          <div>
            <span>Rental Home Finder</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '10px' }}>
              LH · SH · 민간임대 세부 조건 비교기
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
          <Dashboard
            filteredAnnouncements={filteredAnnouncements}
            selectedId={selectedId}
            onSelect={setSelectedId}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedProviders={selectedProviders}
            toggleProvider={toggleProvider}
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
            maxDeposit={maxDeposit}
            setMaxDeposit={setMaxDeposit}
            maxMonthlyRent={maxMonthlyRent}
            setMaxMonthlyRent={setMaxMonthlyRent}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        </section>

        {/* Map View */}
        <section className="app-map-area">
          <KakaoMap
            announcements={filteredAnnouncements}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId(id)}
          />

          {/* Bottom Floating Compare basket */}
          <ComparePanel
            compareCart={compareCart}
            onRemove={handleRemoveCompare}
            onClear={handleClearCompare}
          />
        </section>

        {/* Right side Detail Slide panel */}
        <section className={`app-detail-panel ${selectedAnnouncement ? 'open' : ''}`}>
          <DetailView
            announcement={selectedAnnouncement}
            onClose={() => setSelectedId(null)}
            compareCart={compareCart}
            onToggleCompare={handleToggleCompare}
          />
        </section>
      </main>
    </div>
  );
}
