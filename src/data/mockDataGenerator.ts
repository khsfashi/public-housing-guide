import { Announcement, HouseType, ProviderType, HousingType, FlatHouseUnit } from '../types';

// Coordinates for Sido/Sigungu centers to position units realistically
const regionalCenters: Record<string, { lat: number; lng: number }> = {
  '서울시 강남구': { lat: 37.498, lng: 127.027 },
  '서울시 송파구': { lat: 37.514, lng: 127.106 },
  '서울시 마포구': { lat: 37.566, lng: 126.901 },
  '서울시 강서구': { lat: 37.550, lng: 126.849 },
  '서울시 노원구': { lat: 37.654, lng: 127.056 },
  '서울시 서초구': { lat: 37.483, lng: 127.032 },
  '서울시 은평구': { lat: 37.602, lng: 126.929 },
  '서울시 영등포구': { lat: 37.526, lng: 126.896 },
  '경기도 성남시 분당구': { lat: 37.382, lng: 127.118 },
  '경기도 성남시 수정구': { lat: 37.442, lng: 127.149 },
  '경기도 수원시 영통구': { lat: 37.259, lng: 127.046 },
  '경기도 용인시 수지구': { lat: 37.322, lng: 127.098 },
  '경기도 부천시': { lat: 37.503, lng: 126.766 },
  '경기도 화성시': { lat: 37.199, lng: 126.831 },
  '인천시 서구': { lat: 37.569, lng: 126.674 },
  '인천시 연수구': { lat: 37.409, lng: 126.678 },
  '부산시 해운대구': { lat: 35.163, lng: 129.163 },
  '대구시 수성구': { lat: 35.858, lng: 128.630 },
  '대전시 유성구': { lat: 36.362, lng: 127.356 },
  '광주시 광산구': { lat: 35.139, lng: 126.790 },
  '세종시 세종특별자치시': { lat: 36.480, lng: 127.289 },
  '강원도 춘천시': { lat: 37.881, lng: 127.729 },
  '충북도 청주시 흥덕구': { lat: 36.634, lng: 127.428 },
  '충남도 천안시 서북구': { lat: 36.815, lng: 127.113 },
  '전북도 전주시 완산구': { lat: 35.811, lng: 127.119 },
  '전남도 여수시': { lat: 34.760, lng: 127.662 },
  '경북도 포항시 남구': { lat: 36.010, lng: 129.379 },
  '경남도 창원시 성산구': { lat: 35.215, lng: 128.683 },
  '제주도 제주시': { lat: 33.499, lng: 126.531 },
};

// Default center fallback
const defaultCenter = { lat: 37.5665, lng: 126.9780 };

// Sample Building Names for realistic addresses
const buildingNames = [
  '하임빌', '그린파크', '라온오피스텔', '에코뷰 1차', '예가하우스', 
  '다온빌라', '행복드림타운', '솔숲타운', '웰니스파크', '한비타운', 
  '스카이레지던스', '아이파크빌', '클래시안', '서희스타뷰', '골드캐슬'
];

export function generateAnnouncements(): Announcement[] {
  const providers: ProviderType[] = ['LH', 'SH', 'PRIVATE'];
  const housingTypes: HousingType[] = ['행복주택', '국민임대', '공공임대', '영구임대', '장기전세', '민간임대', '신혼희망타운', '매입임대'];
  
  const list: Announcement[] = [];
  
  // 1. Core hand-crafted announcements for major locations, especially 매입임대
  let index = 1;

  // Let's create specific 매입임대 (Purchase-Rental) announcements first
  const purchaseRentalConfigs = [
    {
      sido: '서울시',
      sigungu: ['송파구', '강남구', '마포구', '강서구', '노원구', '서초구', '은평구', '영등포구'],
      provider: 'LH' as ProviderType,
      title: '2026년 제1차 LH 청년 매입임대주택 입주자 모집공고 (서울지역)'
    },
    {
      sido: '서울시',
      sigungu: ['강남구', '서초구', '송파구', '마포구', '영등포구'],
      provider: 'SH' as ProviderType,
      title: '2026년 SH 청년 및 신혼부부 매입임대주택 모집공고 (서울지역)'
    },
    {
      sido: '경기도',
      sigungu: ['성남시 수정구', '성남시 분당구', '수원시 영통구', '용인시 수지구', '부천시', '화성시'],
      provider: 'LH' as ProviderType,
      title: '2026년 제1차 LH 경기도 지역 매입임대주택 입주자 모집공고'
    },
  ];

  purchaseRentalConfigs.forEach((config) => {
    const annId = `ann-pr-${index++}`;
    const houseTypes: HouseType[] = [];

    // Under each announcement, we add many distinct building units in different districts (sigungu)
    config.sigungu.forEach((sigungu, unitIdx) => {
      const region = `${config.sido} ${sigungu}`;
      const center = regionalCenters[region] || defaultCenter;
      const bldName = buildingNames[unitIdx % buildingNames.length];
      const address = `${config.sido} ${sigungu} ${bldName}로 ${12 + unitIdx * 7}번길 ${unitIdx + 1}동 ${100 + unitIdx * 101}호`;
      
      // Slightly jitter coords to represent separate buildings
      const lat = center.lat + (unitIdx * 0.003 - 0.009);
      const lng = center.lng + (unitIdx * 0.003 - 0.009);
      
      // Generates two sizes per building (e.g., small room vs. medium room)
      const isLH = config.provider === 'LH';
      const applyUrl = isLH 
        ? 'https://apply.lh.or.kr/lh/co/menu.do?miNo=1157' 
        : 'https://www.i-sh.co.kr/app/';

      // Unit 1: Smaller Studio (5평 - 9평)
      const excl1 = +(18 + unitIdx * 2.3).toFixed(2);
      const pyeong1 = +(excl1 * 0.3025).toFixed(1);
      const dep1 = 12000000 + (unitIdx * 3000000);
      const rent1 = 120000 + (unitIdx * 25000);

      houseTypes.push({
        id: `ht-pr-${annId}-${unitIdx}-1`,
        name: `${bldName} 원룸형 (A형)`,
        exclusiveArea: excl1,
        supplyArea: +(excl1 * 1.35).toFixed(2),
        pyeongSize: pyeong1,
        supplyCount: Math.floor(Math.random() * 8) + 1,
        deposit: dep1,
        monthlyRent: rent1,
        maxDeposit: dep1 + 25000000,
        minMonthlyRent: Math.max(50000, rent1 - 125000),
        minDeposit: Math.max(4000000, dep1 - 8000000),
        maxMonthlyRent: rent1 + 25000,
        address,
        region,
        latitude: lat,
        longitude: lng,
        applyUrl
      });

      // Unit 2: Larger Studio/Two-room (10평 - 18평)
      const excl2 = +(33 + unitIdx * 4.1).toFixed(2);
      const pyeong2 = +(excl2 * 0.3025).toFixed(1);
      const dep2 = 28000000 + (unitIdx * 7000000);
      const rent2 = 250000 + (unitIdx * 40000);

      houseTypes.push({
        id: `ht-pr-${annId}-${unitIdx}-2`,
        name: `${bldName} 투룸형 (B형)`,
        exclusiveArea: excl2,
        supplyArea: +(excl2 * 1.35).toFixed(2),
        pyeongSize: pyeong2,
        supplyCount: Math.floor(Math.random() * 5) + 1,
        deposit: dep2,
        monthlyRent: rent2,
        maxDeposit: dep2 + 50000000,
        minMonthlyRent: Math.max(80000, rent2 - 250000),
        minDeposit: Math.max(7000000, dep2 - 18000000),
        maxMonthlyRent: rent2 + 60000,
        address,
        region,
        latitude: lat,
        longitude: lng,
        applyUrl
      });
    });

    list.push({
      id: annId,
      provider: config.provider,
      housingType: '매입임대',
      title: config.title,
      announcementDate: '2026-07-02',
      deadlineDate: '2026-07-28',
      status: '모집중',
      region: `${config.sido} 전체`,
      address: `${config.sido} 소재 매입임대주택`,
      latitude: defaultCenter.lat,
      longitude: defaultCenter.lng,
      houseTypes,
      originalUrl: config.provider === 'LH' ? 'https://apply.lh.or.kr/' : 'https://www.i-sh.co.kr/app/'
    });
  });

  // 2. Generate other types (Happy Housing, 장기전세, etc.) across other provinces (Busan, Daegu, Sejong, Jeju, etc.)
  const localConfig = [
    { region: '부산시 해운대구', type: '행복주택' as HousingType, prov: 'LH' as ProviderType, title: '2026년 부산 해운대 청년 행복주택 입주자 모집' },
    { region: '대구시 수성구', type: '국민임대' as HousingType, prov: 'LH' as ProviderType, title: '대구 수성 국민임대주택 입주자 추가 모집' },
    { region: '대전시 유성구', type: '신혼희망타운' as HousingType, prov: 'LH' as ProviderType, title: '대전 유성 신혼희망타운 A3블록 입주자 모집' },
    { region: '광주시 광산구', type: '영구임대' as HousingType, prov: 'LH' as ProviderType, title: '광주 광산지구 영구임대주택 모집공고' },
    { region: '세종시 세종특별자치시', type: '공공임대' as HousingType, prov: 'LH' as ProviderType, title: '세종특별자치시 공공임대주택 10년 장기 임대 모집' },
    { region: '강원도 춘천시', type: '행복주택' as HousingType, prov: 'LH' as ProviderType, title: '강원 춘천 강원대 인근 청년 행복주택 입주자 모집' },
    { region: '충북도 청주시 흥덕구', type: '국민임대' as HousingType, prov: 'LH' as ProviderType, title: '청주 흥덕 국민임대 입주자 모집공고' },
    { region: '충남도 천안시 서북구', type: '민간임대' as HousingType, prov: 'PRIVATE' as ProviderType, title: '천안 두정 롯데캐슬 장기민간임대 청약공고' },
    { region: '전북도 전주시 완산구', type: '매입임대' as HousingType, prov: 'LH' as ProviderType, title: '전라북도 전주 매입임대주택 입주자 모집' },
    { region: '전남도 여수시', type: '국민임대' as HousingType, prov: 'LH' as ProviderType, title: '여수 웅천지구 국민임대주택 입주자 공고' },
    { region: '경북도 포항시 남구', type: '행복주택' as HousingType, prov: 'LH' as ProviderType, title: '포항 남구 효자동 대학생/청년 행복주택 공고' },
    { region: '경남도 창원시 성산구', type: '장기전세' as HousingType, prov: 'SH' as ProviderType, title: '창원 성산지구 장기전세주택 입주자 모집' }, // SH is Seoul-specific but for simulation GH/local equivalents are under SH/LH models.
    { region: '제주도 제주시', type: '매입임대' as HousingType, prov: 'LH' as ProviderType, title: '제주지역 다세대 매입임대주택 입주자 모집공고' }
  ];

  localConfig.forEach((cfg) => {
    const annId = `ann-loc-${index++}`;
    const center = regionalCenters[cfg.region] || defaultCenter;
    const bldName = buildingNames[index % buildingNames.length];
    const address = `${cfg.region} ${bldName} 아파트 102동`;
    const applyUrl = cfg.prov === 'LH' ? 'https://apply.lh.or.kr/lh/co/menu.do?miNo=1157' : 'https://www.i-sh.co.kr/app/';

    // Generate 3 unit sizes per announcement (small, medium, large)
    const houseTypes: HouseType[] = [
      {
        id: `ht-${annId}-1`,
        name: '26㎡형 (청년)',
        exclusiveArea: 26.8,
        supplyArea: 38.5,
        pyeongSize: 8.1,
        supplyCount: 45,
        deposit: 18000000,
        monthlyRent: 95000,
        maxDeposit: 30000000,
        minMonthlyRent: 45000,
        minDeposit: 8000000,
        maxMonthlyRent: 130000,
        address: `${address} 101호`,
        region: cfg.region,
        latitude: center.lat + 0.001,
        longitude: center.lng - 0.001,
        applyUrl
      },
      {
        id: `ht-${annId}-2`,
        name: '36㎡형 (청년/신혼)',
        exclusiveArea: 36.5,
        supplyArea: 52.1,
        pyeongSize: 11.0,
        supplyCount: 75,
        deposit: 34000000,
        monthlyRent: 180000,
        maxDeposit: 58000000,
        minMonthlyRent: 80000,
        minDeposit: 10000000,
        maxMonthlyRent: 260000,
        address: `${address} 201호`,
        region: cfg.region,
        latitude: center.lat - 0.002,
        longitude: center.lng + 0.002,
        applyUrl
      },
      {
        id: `ht-${annId}-3`,
        name: '59㎡형 (신혼/다자녀)',
        exclusiveArea: 59.9,
        supplyArea: 84.8,
        pyeongSize: 18.1,
        supplyCount: 30,
        deposit: 78000000,
        monthlyRent: 380000,
        maxDeposit: 130000000,
        minMonthlyRent: 140000,
        minDeposit: 18000000,
        maxMonthlyRent: 520000,
        address: `${address} 301호`,
        region: cfg.region,
        latitude: center.lat + 0.003,
        longitude: center.lng + 0.003,
        applyUrl
      }
    ];

    list.push({
      id: annId,
      provider: cfg.prov,
      housingType: cfg.type,
      title: cfg.title,
      announcementDate: '2026-07-06',
      deadlineDate: '2026-07-29',
      status: '모집중',
      region: cfg.region,
      address,
      latitude: center.lat,
      longitude: center.lng,
      houseTypes,
      originalUrl: 'https://apply.lh.or.kr/'
    });
  });

  return list;
}

/**
 * Flattens all generated announcements and their inner houseTypes into FlatHouseUnit list.
 */
export function generateFlatUnits(): FlatHouseUnit[] {
  const announcements = generateAnnouncements();
  const flatList: FlatHouseUnit[] = [];

  announcements.forEach((ann) => {
    ann.houseTypes.forEach((ht) => {
      // Pick local properties if exists, fallback to announcement's
      const region = ht.region || ann.region;
      const address = ht.address || ann.address;
      const latitude = ht.latitude ?? ann.latitude;
      const longitude = ht.longitude ?? ann.longitude;
      const applyUrl = ht.applyUrl || (ann.provider === 'LH' 
        ? 'https://apply.lh.or.kr/lh/co/menu.do?miNo=1157' 
        : 'https://www.i-sh.co.kr/app/');

      flatList.push({
        id: ht.id,
        announcementId: ann.id,
        provider: ann.provider,
        housingType: ann.housingType,
        announcementTitle: ann.title,
        announcementDate: ann.announcementDate,
        deadlineDate: ann.deadlineDate,
        status: ann.status,
        region,
        address,
        latitude,
        longitude,
        originalUrl: ann.originalUrl,
        applyUrl,
        
        unitName: ht.name,
        exclusiveArea: ht.exclusiveArea,
        supplyArea: ht.supplyArea,
        pyeongSize: ht.pyeongSize,
        supplyCount: ht.supplyCount,
        deposit: ht.deposit,
        monthlyRent: ht.monthlyRent,
        maxDeposit: ht.maxDeposit,
        minMonthlyRent: ht.minMonthlyRent,
        minDeposit: ht.minDeposit,
        maxMonthlyRent: ht.maxMonthlyRent,
      });
    });
  });

  return flatList;
}
