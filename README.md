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
├── components/
│   └── settings/
│       ├── PersonalizeDialog.vue    # Settings modal dialog
│       ├── OptionsList.vue          # Simplified settings buttons
│       └── UserContentManagement.vue # Bookmark management
├── pages/
│   ├── Home/                        # Home page
│   ├── MtrTrain/                    # Main MTR page with real-time data
│   └── BusEta/                      # Bus ETA page (placeholder)
├── constants/
│   └── mtrLines.ts                  # MTR line configurations
├── types/
│   └── train.ts                     # TypeScript type definitions
└── App.vue                          # Main app component
```

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

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Hong Kong MTR Corporation for providing public transportation
- DATA.GOV.HK for open data APIs
- HKBUS.APP for design inspiration
