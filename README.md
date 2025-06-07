# HK Railway - MTR Real-time Information App

A Vue 3 web application for Hong Kong MTR (Mass Transit Railway) real-time train information with mobile-first design.

## Features

- 🚇 **Real-time MTR train arrival information** from all major lines
- 📱 **Mobile-centered UI** inspired by HKBUS.APP design
- ⚙️ **Simplified settings** with essential controls only
- 🌙 **Dark mode support**
- 📍 **Geolocation integration**
- 💾 **Bookmark management** for favorite stations
- 🔄 **Auto-refresh** functionality
- 📳 **Haptic feedback** support

## Tech Stack

- **Vue 3** with Composition API
- **TypeScript** for type safety
- **Vite** for fast development and building
- **Vanilla CSS** with mobile-first responsive design

## Project Structure

```
src/
├── App.vue                          # Main app component with routing logic
├── main.ts                          # Vue app entry point
├── pages/                           # Page components
│   ├── MtrTrain/
│   │   └── MtrTrain.vue            # Main MTR train page with real-time data
│   ├── LightRail/
│   │   └── LightRail.vue           # Light Rail transit page
│   ├── Home/
│   │   └── Home.vue                # Home page component
│   └── BusEta/
│       └── BusEta.vue              # Bus ETA page (placeholder)
├── components/                      # Reusable UI components
│   ├── settings/
│   │   ├── PersonalizeDialog.vue   # Settings modal dialog
│   │   └── OptionsList.vue         # Simplified settings buttons
│   ├── icons/                      # SVG icon components
│   │   ├── BackspaceIcon.vue
│   │   ├── ClearIcon.vue
│   │   └── CloseIcon.vue
│   ├── route-board/                # Route selection components
│   │   ├── BoardTabbar.vue         # Tab navigation
│   │   ├── RouteInputPad.vue       # Route input interface
│   │   └── SwipeableRoutesBoard.vue # Swipeable route board
│   └── route-eta/                  # ETA display components
│       ├── RouteHeader.vue         # Route information header
│       ├── StopAccordionList.vue   # Expandable stop list
│       └── TimeTableButton.vue     # Timetable access button
├── composables/                     # Vue 3 composable functions
│   ├── useMtrData.ts               # MTR API data fetching logic
│   ├── useFavoriteStations.ts      # Bookmark management
│   ├── useTheme.ts                 # Dark/light theme handling
│   └── useNetworkStatus.ts         # Network connectivity monitoring
├── constants/
│   └── mtrLines.ts                 # MTR line configurations and station data
├── types/
│   └── train.ts                    # TypeScript interfaces for train data
└── utils/
    ├── index.ts                    # Utility functions (distance, formatting)
    └── tests/
        └── searchRouteHelpers.ts   # Helper functions for route search
```

### Key Dependencies and Data Flow

#### Data Fetching (`useMtrData.ts`)
- **Used by**: `MtrTrain.vue`, `LightRail.vue`
- **Purpose**: Fetches real-time train arrival data from DATA.GOV.HK APIs
- **Features**: 10-second caching, retry logic, error handling
- **APIs**: 
  - MTR: `https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php`
  - LRT: `https://rt.data.gov.hk/v1/transport/mtr/lrt/getSchedule`

#### Theme Management (`useTheme.ts`)
- **Used by**: `App.vue` (global), all components inherit
- **Purpose**: Manages dark/light mode, font sizes, color schemes
- **Features**: System preference detection, localStorage persistence
- **CSS Variables**: Dynamically sets CSS custom properties for theming

#### Favorite Stations (`useFavoriteStations.ts`)
- **Used by**: Station selection components, route displays
- **Purpose**: Manages user's bookmarked stations
- **Storage**: localStorage with JSON serialization

#### Network Status (`useNetworkStatus.ts`)
- **Used by**: Data fetching components for connection monitoring
- **Purpose**: Monitors online/offline status and connection quality
- **Features**: Connection type detection (2G, 3G, 4G, etc.)

#### Station Configuration (`mtrLines.ts`)
- **Used by**: All MTR-related components
- **Purpose**: Central configuration for all MTR lines and stations
- **Data**: Line colors, station names (Chinese/English), terminus information

#### Type Definitions (`train.ts`)
- **Used by**: All components handling train data
- **Purpose**: TypeScript interfaces for type safety
- **Interfaces**: `TrainArrival`, `StationData`, `LineConfig`, etc.

## Development Notes

- **Clean Architecture**: Removed all legacy React components and unnecessary files
- **Mobile-First Design**: Container max-width of 480px, centered layout like HKBUS.APP
- **Simplified Settings**: Converted complex React settings to simple button-based interface
- **TypeScript Support**: Full type safety with proper interfaces and type definitions

## Installation

1. Clone the repository:
```bash
git clone https://github.com/HugoLi0213/hkrailway.git
cd hkrailway
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## API Data Source

This app uses real-time data from:
- **DATA.GOV.HK** - Hong Kong Government's open data platform
- MTR real-time arrival API endpoints

## Mobile UI Design

The app features a mobile-centered design similar to HKBUS.APP:
- Maximum container width of 480px
- Centered layout on larger screens
- Touch-friendly button sizes
- Smooth animations and transitions
- Card-based design with subtle shadows

## Settings Features

- **🔄 App Updates**: Force refresh service worker
- **🛠️ Database Updates**: Renew route database
- **📍 Geolocation**: Toggle location services
- **🌙 Dark Mode**: Switch between light/dark themes
- **📳 Vibration**: Enable/disable haptic feedback
- **📋 Bookmark Management**: Save and organize favorite stations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Author

**Hugo**  
📧 Email: s12332146@gmail.com  
🐙 GitHub: [HugoLi0213](https://github.com/HugoLi0213)

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Hong Kong MTR Corporation for providing public transportation
- DATA.GOV.HK for open data APIs
- HKBUS.APP for design inspiration
