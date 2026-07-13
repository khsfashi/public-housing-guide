export type ProviderType = 'LH' | 'SH' | 'PRIVATE';

export type HousingType = 
  | '행복주택' 
  | '국민임대' 
  | '공공임대' 
  | '영구임대' 
  | '장기전세' 
  | '민간임대' 
  | '신혼희망타운';

export interface HouseType {
  id: string;
  name: string; // e.g., "26A", "36B", "59A"
  exclusiveArea: number; // 전용면적 (㎡)
  supplyArea: number; // 공급면적 (㎡)
  pyeongSize: number; // 평형 (전용면적 기준 평수)
  supplyCount: number; // 모집 세대수
  deposit: number; // 기본 임대보증금 (원)
  monthlyRent: number; // 기본 월임대료 (원)
  maxDeposit: number; // 최대 전환보증금 (원)
  minMonthlyRent: number; // 최대 전환 시 월임대료 (원)
  minDeposit: number; // 최소 전환보증금 (원)
  maxMonthlyRent: number; // 최소 전환 시 월임대료 (원)
}

export interface Announcement {
  id: string;
  provider: ProviderType;
  housingType: HousingType;
  title: string;
  announcementDate: string; // YYYY-MM-DD
  deadlineDate: string; // YYYY-MM-DD
  status: '모집중' | '접수종료' | '공고예정';
  region: string; // e.g., "서울시 강남구", "경기도 성남시 분당구"
  address: string; // 상세주소
  latitude: number; // 위도
  longitude: number; // 경도
  houseTypes: HouseType[];
  originalUrl: string;
  imageUrl?: string;
}
