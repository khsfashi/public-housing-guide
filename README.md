# Housing Hub
> LH, SH, and Private Rental flat-unit search and condition comparison platform

A Next.js application that flattens public and private rental announcements into individual housing units. This allows users to filter by specific districts, pyeong sizes, and rental conditions, maps unit locations using Kakao Maps, and provides direct links to official application portals.

---

## Features

1. **Flat-Unit Search**
   - Flatten announcements and nested house types into individual units (e.g., "Villa A 101" instead of the parent announcement).
   - Filter and query specific units without opening large PDF/HWP announcement documents.

2. **Cascading Region Filter**
   - Support South Korea's 17 administrative provinces (Sido) and their municipal districts (Sigungu).
   - Selecting a Sido dynamically updates the Sigungu options to ensure precise targeting.

3. **Granular Price & Area Filters**
   - **Pyeong Filter**: Select minimum and maximum sizes (from 5 to 45+ pyeong).
   - **Price Filter**: Set minimum and maximum boundaries for deposits and monthly rents.

4. **Geolocated Map Integration**
   - Individual units are mapped based on their specific addresses, allowing multiple buildings under a single announcement to be scattered accurately.
   - Includes a fallback interactive grid canvas map if the Kakao Maps SDK key is not configured.

5. **Deposit Conversion Calculator**
   - Simulate rental adjustments using standard conversion rates (6.0% for increasing deposit, 3.5% for lowering deposit).

6. **Direct Application Links**
   - Connects each unit directly to the LH Subscription Plus or SH Internet Subscription portal using the direct `applyUrl` field.

7. **Open API Integration**
   - Server-side Next.js route handler (`/api/announcements`) fetches lease notice info from data.go.kr.
   - Automatically falls back to a 120+ simulated nationwide dataset when API keys are absent.

---

## Tech Stack

* **Framework**: Next.js 16.2.10 (App Router), React 19, TypeScript
* **Styling**: Vanilla CSS, CSS Modules
* **Mapping**: Kakao Maps JavaScript SDK
* **Data Sources**: Public Data Portal (data.go.kr) Open API

---

## Getting Started

### 1. Environment Variables
Create a `.env.local` file in the root directory:

```env
# Kakao Maps App Key (JavaScript Key required)
NEXT_PUBLIC_KAKAO_MAP_CLIENT_KEY=your_kakao_javascript_app_key_here

# Public Data Portal Service Key (Encoding required)
NEXT_PUBLIC_PUBLIC_DATA_API_KEY=your_data_go_kr_api_key_here
```

> **Configuration Tip**: Add both `https://public-housing-guide.vercel.app` and `http://localhost:3000` to the Web platform settings in Kakao Developers console (Apps > Settings > Platforms > Web). Enable Maps status in Product Settings.

### 2. Setup and Execution
* **Production URL**: [https://public-housing-guide.vercel.app/](https://public-housing-guide.vercel.app/)
* **Local Development**:
  ```bash
  npm install
  npm run dev
  npm run build
  ```
  Open `http://localhost:3000` to run and test the server locally.

---

## Development Guidelines
Refer to [AGENTS.md](file:///d:/home/AGENTS.md) for commit conventions and workspace rules.
* **Commit Prefix**: Use `feat:`, `fix:`, `refactor:`, `docs:`, or `style:`.
* **Verification**: Always run `npm run build` locally before pushing to remote.
