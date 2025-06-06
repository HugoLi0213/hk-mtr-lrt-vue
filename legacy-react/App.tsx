import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import {
  StyledEngineProvider,
  ThemeProvider,
  createTheme,
} from "@mui/material/styles";
import "leaflet/dist/leaflet.css";
import React, { useContext, useEffect, useMemo } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import "./App.css";
import Root from "./components/layout/Root";
import AppContext from "./context/AppContext";
import useLanguage from "./hooks/useTranslation";
import RedirectPage from "./pages/RedirectPage";
import reportWebVitals, { sendToGoogleAnalytics } from "./reportWebVitals";
import { SearchContextProvider } from "./SearchContext";

const Home = React.lazy(() => import("./pages/Home"));
const RouteEta = React.lazy(() => import("./pages/RouteEta"));
const BookmarkedStop = React.lazy(() => import("./pages/BookmarkedStop"));
const RouteBoard = React.lazy(() => import("./pages/RouteBoard"));
const RouteSearch = React.lazy(() => import("./pages/RouteSearch"));
const Notice = React.lazy(() => import("./pages/Notice"));
const Settings = React.lazy(() => import("./pages/Settings"));
const DataImport = React.lazy(() => import("./pages/DataImport"));
const DataExport = React.lazy(() => import("./pages/DataExport"));
const MtrTrain = React.lazy(() => import("./pages/MtrTrain"));
const DeveloperApp = React.lazy(() => import("./pages/DeveloperApp"));

const App = () => {
  const { analytics, fontSize } = useContext(AppContext);
  const language = useLanguage();

  const theme = useMemo(() => {
    return createTheme(getThemeTokens(fontSize));
  }, [fontSize]);

  useEffect(() => {
    // If you want to start measuring performance in your app, pass a function
    // to log results (for example: reportWebVitals(console.log))
    // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
    if (analytics) reportWebVitals(sendToGoogleAnalytics);
  }, [analytics]);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CacheProvider value={emotionCache}>
          <SearchContextProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Navigate to={`/${language}`} />} />
                <Route path=":lang" element={<Root />}>
                  <Route path={`collections/:collectionName`} element={<Home />} />
                  <Route path={`route/:id/:panel?`} element={<RouteEta />} />
                  <Route path={`settings`} element={<Settings />} />
                  <Route path={"notice"} element={<Notice />} />
                  <Route path={`import/:data?`} element={<DataImport />} />
                  <Route path={`export`} element={<DataExport />} />
                  <Route path={`mtr`} element={<MtrTrain />} />
                  <Route path={`mtr-train/:line?`} element={<MtrTrain />} />
                  <Route path={`board`} element={<RouteBoard />} />
                  <Route path={`stops`} element={<BookmarkedStop />} />
                  <Route path={`search`} element={<RouteSearch />} />
                  <Route path={`developer`} element={<DeveloperApp />} />
                  <Route path={``} element={<Home />} />
                </Route>
                <Route path="/android" element={<RedirectPage url="https://play.google.com/store/apps/details?id=app.mtrbus" />} />
                <Route path="/ios" element={<RedirectPage url="https://apps.apple.com/hk/app/mtrbus-app" />} />
                <Route path="/wear" element={<RedirectPage url="https://play.google.com/store/apps/details?id=app.mtrbus" />} />
                <Route path="/watch" element={<RedirectPage url="https://apps.apple.com/us/app/hk-bus-eta-watchos/id6475241017" />} />
                <Route path="/telegram" element={<RedirectPage url="https://t.me/mtrbusapp" />} />
                <Route path="/instagram" element={<RedirectPage url="https://instagram.com/mtrbus.app" />} />
              </Routes>
            </Router>
          </SearchContextProvider>
        </CacheProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default App;

const emotionCache = createCache({
  key: "mtrbus",
  speedy: !(import.meta.env.DEV || navigator.userAgent === "prerendering"),
});

declare module "@mui/material/styles" {
  interface TypeBackground {
    contrast: string;
  }
}

const getThemeTokens = (fontSize: number) => ({
  typography: {
    fontFamily: "'Chiron Hei HK WS'",
    h6: {
      fontWeight: 700,
    },
    fontSize,
  },
  avatar: {
    default: {
      color: "white",
    },
  },
  palette: {
    mode: "dark" as const,
    background: {
      default: "#222",
      contrast: "#111",
    },
    primary: {
      main: "#fedb00",
      contrastText: "#000",
    },
    warning: {
      main: "#fedb00",
    },
    secondary: {
      main: "#fedb00",
    },
  },
  elements: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontSize: "0.875rem",
          lineHeight: 1.43,
          scrollbarColor: "#3f3f3f",
          scrollbarWidth: "thin",
          backgroundColor: "#222",
          color: "#fedb00",
        },
      },
    },
  },
});
