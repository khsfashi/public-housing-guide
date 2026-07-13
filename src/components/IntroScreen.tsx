'use client';

import { useState, useEffect } from 'react';
import { UserProfileData } from '../types';
import { regionsData, getRegionHierarchy } from '../data/regions';
import ThemeToggle from './ThemeToggle';

interface IntroScreenProps {
  onStartWithoutAuth: () => void;
  onStartWithAuth: (username: string, profile: UserProfileData) => void;
}

export default function IntroScreen({ onStartWithoutAuth, onStartWithAuth }: IntroScreenProps) {
  const [lastUser, setLastUser] = useState<string | null>(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  
  const regionHierarchy = getRegionHierarchy();

  // Form Inputs
  const [username, setUsername] = useState('');
  
  // 3-level region state inputs
  const [currentSido, setCurrentSido] = useState('ALL');
  const [currentSigungu, setCurrentSigungu] = useState('ALL');
  const [currentGu, setCurrentGu] = useState('ALL');

  const [prefSido1, setPrefSido1] = useState('ALL');
  const [prefSigungu1, setPrefSigungu1] = useState('ALL');
  const [prefGu1, setPrefGu1] = useState('ALL');

  const [prefSido2, setPrefSido2] = useState('ALL');
  const [prefSigungu2, setPrefSigungu2] = useState('ALL');
  const [prefGu2, setPrefGu2] = useState('ALL');

  const [residenceYears, setResidenceYears] = useState(0);
  const [age, setAge] = useState('');

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('housing_hub_current_user');
      if (storedUser) {
        setLastUser(storedUser);
      }
    }
  }, []);

  const handleStartLastUser = () => {
    if (!lastUser) return;
    const storedProfiles = localStorage.getItem('housing_hub_profiles');
    if (storedProfiles) {
      try {
        const profiles = JSON.parse(storedProfiles);
        const profile = profiles[lastUser];
        if (profile) {
          onStartWithAuth(lastUser, profile);
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }
    onStartWithAuth(lastUser, {
      currentRegion: 'ALL',
      residenceYears: 0,
      age: '',
      preferredRegions: []
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      alert('사용자명을 입력해 주세요.');
      return;
    }
    
    const combinedCurrent = combineProfileRegion(currentSido, currentSigungu, currentGu);
    const combinedPref1 = combineProfileRegion(prefSido1, prefSigungu1, prefGu1);
    const combinedPref2 = combineProfileRegion(prefSido2, prefSigungu2, prefGu2);

    const formattedProfile: UserProfileData = {
      currentRegion: combinedCurrent,
      residenceYears: Number(residenceYears),
      age,
      preferredRegions: [combinedPref1, combinedPref2].filter(r => r !== 'ALL')
    };

    const storedProfiles = localStorage.getItem('housing_hub_profiles');
    const profiles = storedProfiles ? JSON.parse(storedProfiles) : {};
    profiles[username.trim()] = formattedProfile;
    localStorage.setItem('housing_hub_profiles', JSON.stringify(profiles));
    localStorage.setItem('housing_hub_current_user', username.trim());

    onStartWithAuth(username.trim(), formattedProfile);
  };

  return (
    <div className="intro-container">
      {/* Floating Theme Toggle (Top Right) */}
      <div className="intro-theme-toggle">
        <ThemeToggle />
      </div>

      <div className="intro-wrapper">
        <div className="intro-content">
          {/* Logo & Headline */}
          <div className="intro-header">
            <div className="intro-logo-icon">
              {/* Logo SVG Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" style={{ width: '28px', height: '28px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </div>
            
            <h1 className="intro-title">
              Housing Hub
            </h1>
            
            <p className="intro-subtitle">
              LH, SH 및 민간임대 공고 통합 비교 분석 플랫폼
            </p>
          </div>

          {/* Cards for features */}
          {!showProfileForm && (
            <div className="intro-features">
              <div className="intro-feature-card">
                <div className="intro-feature-icon" style={{ color: 'var(--primary)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="intro-feature-title">공고 분석 및 상호 비교</h3>
                  <p className="intro-feature-desc">흩어진 주택 공고의 조건과 면적(평)을 통일된 기준으로 분석합니다.</p>
                </div>
              </div>

              <div className="intro-feature-card">
                <div className="intro-feature-icon" style={{ color: '#10b981' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18a2.25 2.25 0 0 1-2.25 2.25h-6A2.25 2.25 0 0 1 5.25 18v-8.25A2.25 2.25 0 0 1 7.5 7.5h3m-3 3H18a2.25 2.25 0 0 1 2.25 2.25v3M18 10.5h-5.25A2.25 2.25 0 0 0 10.5 12.75V18M18 10.5v3.75M10.5 15H15" />
                  </svg>
                </div>
                <div>
                  <h3 className="intro-feature-title">상호전환 모의 계산</h3>
                  <p className="intro-feature-desc">보증금 조절 슬라이더로 변경되는 월 임대료를 실시간으로 확인합니다.</p>
                </div>
              </div>

              <div className="intro-feature-card">
                <div className="intro-feature-icon" style={{ color: '#7c3aed' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="intro-feature-title">개인 가점 우선순위 매칭</h3>
                  <p className="intro-feature-desc">거주지와 연령 기반 가점을 적용하여 가장 알맞은 매물을 우선 추천합니다.</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Area */}
          <div className="intro-actions">
            {!showProfileForm ? (
              <>
                {/* 1. Start with Last Session if available */}
                {lastUser && (
                  <button
                    onClick={handleStartLastUser}
                    className="btn btn-primary intro-btn"
                  >
                    이전 프로필 {lastUser}으로 계속하기
                  </button>
                )}

                {/* 2. Start with Personalization Form */}
                <button
                  onClick={() => setShowProfileForm(true)}
                  className={lastUser ? "btn btn-secondary intro-btn" : "btn btn-primary intro-btn"}
                >
                  개인 맞춤 설정 후 시작하기
                </button>

                {/* 3. Start immediately without personalization */}
                <button
                  onClick={onStartWithoutAuth}
                  className="btn btn-secondary intro-btn-link"
                >
                  개인 설정 없이 바로 시작하기
                </button>
              </>
            ) : (
              /* Profile Setting Form Container */
              <div className="intro-form-card">
                <div className="intro-form-header">
                  <h2 className="intro-form-title">맞춤 프로필 등록</h2>
                  <button
                    type="button"
                    onClick={() => setShowProfileForm(false)}
                    className="intro-form-back"
                  >
                    이전으로
                  </button>
                </div>

                <form onSubmit={handleFormSubmit} className="intro-form">
                  <div className="form-group-compact">
                    <label className="form-label-compact">사용자 이름</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="이름이나 닉네임을 입력하세요"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>

                  {/* 1. 현재 거주지 (3단계) */}
                  <div className="form-group-compact">
                    <label className="form-label-compact">현재 거주지</label>
                    <div className="region-select-grid">
                      <select
                        className="form-input select-compact"
                        value={currentSido}
                        onChange={(e) => {
                          setCurrentSido(e.target.value);
                          setCurrentSigungu('ALL');
                          setCurrentGu('ALL');
                        }}
                      >
                        <option value="ALL">도 전체</option>
                        {regionHierarchy.map(r => (
                          <option key={r.sido} value={r.sido}>{r.sido}</option>
                        ))}
                      </select>

                      <select
                        className="form-input select-compact"
                        value={currentSigungu}
                        disabled={currentSido === 'ALL'}
                        onChange={(e) => {
                          setCurrentSigungu(e.target.value);
                          setCurrentGu('ALL');
                        }}
                      >
                        <option value="ALL">시·군·구</option>
                        {(regionHierarchy.find(r => r.sido === currentSido)?.sigunguList || []).map(s => (
                          <option key={s.sigungu} value={s.sigungu}>{s.sigungu}</option>
                        ))}
                      </select>

                      <select
                        className="form-input select-compact"
                        value={currentGu}
                        disabled={
                          currentSigungu === 'ALL' || 
                          ((regionHierarchy.find(r => r.sido === currentSido)?.sigunguList.find(s => s.sigungu === currentSigungu))?.guList.length || 0) === 0
                        }
                        onChange={(e) => setCurrentGu(e.target.value)}
                      >
                        <option value="ALL">구/읍 전체</option>
                        {((regionHierarchy.find(r => r.sido === currentSido)?.sigunguList.find(s => s.sigungu === currentSigungu))?.guList || []).map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 거주 연수 & 나이 */}
                  <div className="form-row-grid">
                    <div className="form-group-compact">
                      <label className="form-label-compact">거주 연수</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="예: 3"
                        min="0"
                        value={residenceYears || ''}
                        onChange={(e) => setResidenceYears(Number(e.target.value))}
                      />
                    </div>
                    <div className="form-group-compact">
                      <label className="form-label-compact">나이 (선택)</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="예: 28"
                        min="0"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* 2. 선호지역 1 (3단계) */}
                  <div className="form-group-compact">
                    <label className="form-label-compact">선호지역 1</label>
                    <div className="region-select-grid">
                      <select
                        className="form-input select-compact"
                        value={prefSido1}
                        onChange={(e) => {
                          setPrefSido1(e.target.value);
                          setPrefSigungu1('ALL');
                          setPrefGu1('ALL');
                        }}
                      >
                        <option value="ALL">도 전체</option>
                        {regionHierarchy.map(r => (
                          <option key={r.sido} value={r.sido}>{r.sido}</option>
                        ))}
                      </select>

                      <select
                        className="form-input select-compact"
                        value={prefSigungu1}
                        disabled={prefSido1 === 'ALL'}
                        onChange={(e) => {
                          setPrefSigungu1(e.target.value);
                          setPrefGu1('ALL');
                        }}
                      >
                        <option value="ALL">시·군·구</option>
                        {(regionHierarchy.find(r => r.sido === prefSido1)?.sigunguList || []).map(s => (
                          <option key={s.sigungu} value={s.sigungu}>{s.sigungu}</option>
                        ))}
                      </select>

                      <select
                        className="form-input select-compact"
                        value={prefGu1}
                        disabled={
                          prefSigungu1 === 'ALL' || 
                          ((regionHierarchy.find(r => r.sido === prefSido1)?.sigunguList.find(s => s.sigungu === prefSigungu1))?.guList.length || 0) === 0
                        }
                        onChange={(e) => setPrefGu1(e.target.value)}
                      >
                        <option value="ALL">구/읍 전체</option>
                        {((regionHierarchy.find(r => r.sido === prefSido1)?.sigunguList.find(s => s.sigungu === prefSigungu1))?.guList || []).map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 3. 선호지역 2 (3단계) */}
                  <div className="form-group-compact">
                    <label className="form-label-compact">선호지역 2</label>
                    <div className="region-select-grid">
                      <select
                        className="form-input select-compact"
                        value={prefSido2}
                        onChange={(e) => {
                          setPrefSido2(e.target.value);
                          setPrefSigungu2('ALL');
                          setPrefGu2('ALL');
                        }}
                      >
                        <option value="ALL">도 전체</option>
                        {regionHierarchy.map(r => (
                          <option key={r.sido} value={r.sido}>{r.sido}</option>
                        ))}
                      </select>

                      <select
                        className="form-input select-compact"
                        value={prefSigungu2}
                        disabled={prefSido2 === 'ALL'}
                        onChange={(e) => {
                          setPrefSigungu2(e.target.value);
                          setPrefGu2('ALL');
                        }}
                      >
                        <option value="ALL">시·군·구</option>
                        {(regionHierarchy.find(r => r.sido === prefSido2)?.sigunguList || []).map(s => (
                          <option key={s.sigungu} value={s.sigungu}>{s.sigungu}</option>
                        ))}
                      </select>

                      <select
                        className="form-input select-compact"
                        value={prefGu2}
                        disabled={
                          prefSigungu2 === 'ALL' || 
                          ((regionHierarchy.find(r => r.sido === prefSido2)?.sigunguList.find(s => s.sigungu === prefSigungu2))?.guList.length || 0) === 0
                        }
                        onChange={(e) => setPrefGu2(e.target.value)}
                      >
                        <option value="ALL">구/읍 전체</option>
                        {((regionHierarchy.find(r => r.sido === prefSido2)?.sigunguList.find(s => s.sigungu === prefSigungu2))?.guList || []).map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <p className="intro-form-notice">
                    입력된 모든 개인 정보는 브라우저 내부 저장소(localStorage)에만 기록되며, 청약 우선순위 분석 외에 어떠한 용도로도 유출되거나 수집되지 않습니다.
                  </p>

                  <button
                    type="submit"
                    className="btn btn-primary intro-submit-btn"
                  >
                    프로필 저장 후 시작하기
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
