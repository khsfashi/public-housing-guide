'use client';

import { useEffect, useRef, useState } from 'react';
import { Announcement } from '../types';

interface KakaoMapProps {
  announcements: Announcement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

declare global {
  interface Window {
    kakao: any;
  }
}

export default function KakaoMap({ announcements, selectedId, onSelect }: KakaoMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_CLIENT_KEY;

  // Coordinate limits for Fallback interactive map
  const minLat = 37.3;
  const maxLat = 37.65;
  const minLng = 126.65;
  const maxLng = 127.15;

  useEffect(() => {
    if (!apiKey) {
      setMapError(true);
      return;
    }

    const scriptId = 'kakao-map-sdk';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const initializeMap = () => {
      const kakao = window.kakao;
      console.log("Initializing map... window.kakao:", !!kakao, "kakao.maps:", !!(kakao && kakao.maps));
      if (!kakao || !kakao.maps) {
        setMapError(true);
        return;
      }

      kakao.maps.load(() => {
        console.log("kakao.maps.load callback triggered!");
        if (!mapContainerRef.current) return;

        // Default center: Seoul City Hall
        const options = {
          center: new kakao.maps.LatLng(37.5665, 126.9780),
          level: 8,
        };

        const map = new kakao.maps.Map(mapContainerRef.current, options);
        mapInstanceRef.current = map;
        setMapLoaded(true);
      });
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
      script.async = true;
      document.head.appendChild(script);
      script.onload = () => {
        console.log("Kakao Map Script Loaded! apiKey length:", apiKey?.length, "apiKey first 4 chars:", apiKey?.substring(0, 4));
        initializeMap();
      };
      script.onerror = (e) => {
        console.error("Kakao Map Script Load Failed (onerror triggered):", e);
        setMapError(true);
      };
    } else {
      if (window.kakao && window.kakao.maps) {
        initializeMap();
      } else {
        console.log("Script already exists but window.kakao is not ready. Adding event listener...");
        script.addEventListener('load', initializeMap);
      }
    }

    return () => {
      if (script) {
        script.removeEventListener('load', initializeMap);
      }
    };
  }, [apiKey]);

  // Handle Markers and map updates when loaded
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;

    const kakao = window.kakao;
    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    if (announcements.length === 0) return;

    const bounds = new kakao.maps.LatLngBounds();

    announcements.forEach(ann => {
      const position = new kakao.maps.LatLng(ann.latitude, ann.longitude);
      bounds.extend(position);

      // Create Custom Marker Image/Color based on Provider
      let markerColor = '#2563eb'; // LH
      if (ann.provider === 'SH') markerColor = '#059669';
      else if (ann.provider === 'PRIVATE') markerColor = '#7c3aed';

      const isSelected = ann.id === selectedId;

      // Custom Content HTML for Kakao Map CustomOverlay or Marker
      // For simplicity, we create standard markers with custom colors or standard kakao markers.
      // Here we use standard Marker but we can make it prettier.
      const marker = new kakao.maps.Marker({
        position: position,
        map: map,
        title: ann.title
      });

      markersRef.current.push(marker);

      // Click Event
      kakao.maps.event.addListener(marker, 'click', () => {
        onSelect(ann.id);
      });
    });

    // Pan map to bounds
    if (selectedId) {
      const selectedAnn = announcements.find(a => a.id === selectedId);
      if (selectedAnn) {
        const moveLatLng = new kakao.maps.LatLng(selectedAnn.latitude, selectedAnn.longitude);
        map.panTo(moveLatLng);
      }
    } else if (announcements.length > 0) {
      map.setBounds(bounds);
    }
  }, [announcements, mapLoaded, selectedId, onSelect]);

  // Fallback Mock Map Click Handler
  const handleFallbackMarkerClick = (id: string) => {
    onSelect(id);
  };

  // Convert coords to percentage for Fallback Map
  const getPercentageCoords = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100;
    return {
      x: Math.max(5, Math.min(95, x)), // Clamp to avoid bleeding off edges
      y: Math.max(5, Math.min(95, y)),
    };
  };

  // Fallback Map UI
  const isKeyMissing = !apiKey;

  if (mapError || isKeyMissing) {
    return (
      <div className="map-fallback" style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
        {/* Decorative Grid Lines to make it look like a map */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(var(--border-medium) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.4,
          pointerEvents: 'none'
        }} />

        {/* Dynamic Map Lines */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.15 }}>
          {/* Main Han River representation */}
          <path d="M 0,250 Q 150,220 300,280 T 600,260 T 900,310 T 1200,290" fill="none" stroke="var(--primary)" strokeWidth="32" strokeLinecap="round" />
          {/* Main roads */}
          <line x1="0" y1="100" x2="1200" y2="400" stroke="var(--border-medium)" strokeWidth="6" />
          <line x1="300" y1="0" x2="300" y2="800" stroke="var(--border-medium)" strokeWidth="4" />
          <line x1="600" y1="0" x2="600" y2="800" stroke="var(--border-medium)" strokeWidth="4" />
        </svg>

        {/* Info Box */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          boxShadow: 'var(--shadow-md)',
          zIndex: 10,
          maxWidth: '500px',
          textAlign: 'left'
        }}>
          {isKeyMissing ? (
            <>
              <h4 style={{ color: 'var(--primary)', marginBottom: '6px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="logo-icon" style={{ width: '18px', height: '18px', fontSize: '0.6rem' }}>i</span>
                가상 인터랙티브 지도 작동 중
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                현재 Kakao Maps API 키가 기입되지 않아 데모용 가상 인터랙티브 지도가 활성화되었습니다. 
                <strong> .env.local</strong> 파일 또는 Vercel 설정에 <code>NEXT_PUBLIC_KAKAO_MAP_CLIENT_KEY</code>를 등록하시면 실제 카카오 지도가 로드됩니다.
              </p>
            </>
          ) : (
            <>
              <h4 style={{ color: '#ef4444', marginBottom: '6px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="logo-icon" style={{ width: '18px', height: '18px', fontSize: '0.6rem', background: '#ef4444' }}>!</span>
                카카오 지도 로드 오류 발생
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                API 키는 등록되었으나 카카오 SDK 로드에 실패했습니다. 아래 원인을 확인해 주세요:<br />
                1. 발급받으신 키가 <strong>JavaScript 키</strong>가 맞는지 확인 (REST API, Admin 키 등은 작동하지 않음)<br />
                2. 카카오 개발자 센터 [플랫폼 &gt; Web]에 현재 도메인(<code>https://public-housing-guide.vercel.app</code>)이 정확히 등록되었는지 확인<br />
                3. Vercel 환경변수 이름이 <code>NEXT_PUBLIC_KAKAO_MAP_CLIENT_KEY</code>가 맞는지 확인
              </p>
            </>
          )}
        </div>

        {/* Interactive Markers on Grid */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          {announcements.map(ann => {
            const { x, y } = getPercentageCoords(ann.latitude, ann.longitude);
            const isSelected = ann.id === selectedId;
            let markerColor = 'var(--lh-color)';
            if (ann.provider === 'SH') markerColor = 'var(--sh-color)';
            if (ann.provider === 'PRIVATE') markerColor = 'var(--private-color)';

            return (
              <button
                key={ann.id}
                onClick={() => handleFallbackMarkerClick(ann.id)}
                style={{
                  position: 'absolute',
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -100%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  zIndex: isSelected ? 20 : 15,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'transform 0.2s ease-in-out'
                }}
                className={isSelected ? 'hover-scale' : ''}
              >
                {/* Tooltip on Hover or Selection */}
                <div style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border-medium)'}`,
                  whiteSpace: 'nowrap',
                  boxShadow: 'var(--shadow-sm)',
                  marginBottom: '4px',
                  opacity: isSelected ? 1 : 0.8,
                  display: isSelected ? 'block' : 'none' // display only when selected for neatness, or we can make it block on hover in CSS
                }}>
                  {ann.provider}: {ann.housingType}
                </div>
                {/* Marker Pin */}
                <div style={{
                  width: isSelected ? '28px' : '20px',
                  height: isSelected ? '28px' : '20px',
                  borderRadius: '50% 50% 50% 0',
                  background: markerColor,
                  transform: 'rotate(-45deg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid white',
                  boxShadow: 'var(--shadow-md)',
                  transition: 'all 0.2s'
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'white',
                    transform: 'rotate(45deg)'
                  }} />
                </div>
                {/* Pulsing glow if selected */}
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-4px',
                    width: '12px',
                    height: '6px',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '50%',
                    zIndex: -1
                  }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 12px',
          boxShadow: 'var(--shadow-sm)',
          zIndex: 10,
          display: 'flex',
          gap: '12px',
          fontSize: '0.75rem'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--lh-color)' }} /> LH
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--sh-color)' }} /> SH
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--private-color)' }} /> 민간
          </span>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapContainerRef} 
      style={{ width: '100%', height: '100%', position: 'relative' }} 
    />
  );
}
