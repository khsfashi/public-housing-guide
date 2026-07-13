'use client';

import { useEffect, useRef, useState } from 'react';
import { FlatHouseUnit } from '../types';

interface KakaoMapProps {
  units: FlatHouseUnit[];
  selectedUnitId: string | null;
  onSelectUnit: (id: string | null) => void;
}

declare global {
  interface Window {
    kakao: any;
  }
}

export default function KakaoMap({ units, selectedUnitId, onSelectUnit }: KakaoMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const apiKey = process.env.NEXT_PUBLIC_KA_KAO_MAP_CLIENT_KEY || process.env.NEXT_PUBLIC_KAKAO_MAP_CLIENT_KEY;

  // Coordinate limits for Fallback interactive map
  const minLat = 33.0; // expanded to cover all of South Korea
  const maxLat = 38.6;
  const minLng = 126.0;
  const maxLng = 130.0;

  useEffect(() => {
    if (!apiKey) {
      setMapError(true);
      return;
    }

    const scriptId = 'kakao-map-sdk';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const initializeMap = () => {
      const kakao = window.kakao;
      if (!kakao || !kakao.maps) {
        setMapError(true);
        return;
      }

      kakao.maps.load(() => {
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
        initializeMap();
      };
      script.onerror = () => {
        setMapError(true);
      };
    } else {
      if (window.kakao && window.kakao.maps) {
        initializeMap();
      } else {
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

    if (units.length === 0) return;

    const bounds = new kakao.maps.LatLngBounds();
    let boundsCount = 0;

    units.forEach(unit => {
      // Ensure valid coords
      const lat = unit.latitude || defaultCenter.lat;
      const lng = unit.longitude || defaultCenter.lng;
      const position = new kakao.maps.LatLng(lat, lng);
      
      // Only extend bounds for valid coords
      if (lat > 30 && lat < 45 && lng > 120 && lng < 135) {
        bounds.extend(position);
        boundsCount++;
      }

      const isSelected = unit.id === selectedUnitId;

      const marker = new kakao.maps.Marker({
        position: position,
        map: map,
        title: `${unit.provider}: ${unit.unitName}`
      });

      markersRef.current.push(marker);

      // Click Event
      kakao.maps.event.addListener(marker, 'click', () => {
        onSelectUnit(unit.id);
      });
    });

    // Pan map to bounds
    if (selectedUnitId) {
      const selectedUnit = units.find(u => u.id === selectedUnitId);
      if (selectedUnit) {
        const moveLatLng = new kakao.maps.LatLng(selectedUnit.latitude, selectedUnit.longitude);
        map.panTo(moveLatLng);
      }
    } else if (boundsCount > 0) {
      map.setBounds(bounds);
    }
  }, [units, mapLoaded, selectedUnitId, onSelectUnit]);

  // Default coordinate center
  const defaultCenter = { lat: 37.5665, lng: 126.9780 };

  // Fallback Mock Map Click Handler
  const handleFallbackMarkerClick = (id: string) => {
    onSelectUnit(id);
  };

  // Convert coords to percentage for Fallback Map
  const getPercentageCoords = (lat: number, lng: number) => {
    // If coords are out of Korean bounding box, use default
    const targetLat = (lat > 30 && lat < 45) ? lat : defaultCenter.lat;
    const targetLng = (lng > 120 && lng < 135) ? lng : defaultCenter.lng;

    // Adjust scale based on coordinates density (focusing on Seoul/Gyeonggi area)
    const localMinLat = 34.8;
    const localMaxLat = 38.2;
    const localMinLng = 126.2;
    const localMaxLng = 129.5;

    const x = ((targetLng - localMinLng) / (localMaxLng - localMinLng)) * 100;
    const y = 100 - ((targetLat - localMinLat) / (localMaxLat - localMinLat)) * 100;
    
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
          padding: '12px 18px',
          boxShadow: 'var(--shadow-md)',
          zIndex: 10,
          maxWidth: '520px',
          textAlign: 'left'
        }}>
          {isKeyMissing ? (
            <>
              <h4 style={{ color: 'var(--primary)', marginBottom: '4px', fontSize: '0.85rem', margin: 0 }}>
                가상 인터랙티브 지도 활성화됨
              </h4>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginTop: '4px' }}>
                카카오맵 SDK 키가 설정되지 않아 가상 오프라인 지도를 표시합니다. 로컬 <code>.env.local</code> 파일에 <code>NEXT_PUBLIC_KAKAO_MAP_CLIENT_KEY</code>를 추가하면 실제 지도가 연동됩니다.
              </p>
            </>
          ) : (
            <>
              <h4 style={{ color: '#ef4444', marginBottom: '4px', fontSize: '0.85rem', margin: 0 }}>
                카카오맵 API 키 연동 안내
              </h4>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginTop: '4px' }}>
                지도 SDK를 불러오지 못했습니다 (403 에러). 카카오 개발자 콘솔에서 발급받은 JavaScript 키가 맞는지, 그리고 Web 플랫폼 설정에 현재 도메인(<code>https://public-housing-guide.vercel.app</code> 또는 <code>http://localhost:3000</code>)이 등록되어 있는지 확인해 주세요.
              </p>
            </>
          )}
        </div>

        {/* Interactive Markers on Grid */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          {units.map(unit => {
            const { x, y } = getPercentageCoords(unit.latitude, unit.longitude);
            const isSelected = unit.id === selectedUnitId;
            let markerColor = 'var(--lh-color)';
            if (unit.provider === 'SH') markerColor = 'var(--sh-color)';
            if (unit.provider === 'PRIVATE') markerColor = 'var(--private-color)';

            return (
              <button
                key={unit.id}
                onClick={() => handleFallbackMarkerClick(unit.id)}
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
                {/* Tooltip */}
                <div style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '3px 6px',
                  borderRadius: '4px',
                  border: `1.2px solid ${isSelected ? 'var(--primary)' : 'var(--border-medium)'}`,
                  whiteSpace: 'nowrap',
                  boxShadow: 'var(--shadow-sm)',
                  marginBottom: '2px',
                  opacity: isSelected ? 1 : 0.8,
                  display: isSelected ? 'block' : 'none'
                }}>
                  {unit.unitName} ({unit.pyeongSize}평)
                </div>
                {/* Marker Pin */}
                <div style={{
                  width: isSelected ? '26px' : '18px',
                  height: isSelected ? '26px' : '18px',
                  borderRadius: '50% 50% 50% 0',
                  background: markerColor,
                  transform: 'rotate(-45deg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid white',
                  boxShadow: 'var(--shadow-md)',
                  transition: 'all 0.2s'
                }}>
                  <div style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    background: 'white',
                    transform: 'rotate(45deg)'
                  }} />
                </div>
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
          fontSize: '0.72rem'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--lh-color)' }} /> LH
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--sh-color)' }} /> SH
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--private-color)' }} /> 민간
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
