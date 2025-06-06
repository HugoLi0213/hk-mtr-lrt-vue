import {
    Search as SearchIcon,
    Settings as SettingsIcon,
} from "@mui/icons-material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import {
    Avatar,
    Box,
    Button,
    IconButton,
    Input,
    SxProps,
    Theme,
    Toolbar
} from "@mui/material";
import { useCallback, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AppContext from "../../context/AppContext";
import DbContext from "../../context/DbContext";
import useOnline from "../../hooks/useOnline";
import useLanguage from "../../hooks/useTranslation";
import { checkMobile, vibrate } from "../../utils";
import { useWeatherCode, WeatherIcons } from "../Weather";

const Header = () => {
  const {
    searchRoute,
    setSearchRoute,
    vibrateDuration,
    geoPermission,
    updateGeolocation,
    changeLanguage,
    _colorMode,
    toggleColorMode,
  } = useContext(AppContext);
  const {
    db: { routeList },
  } = useContext(DbContext);
  const { t } = useTranslation();
  const language = useLanguage();
  let location = useLocation();
  const navigate = useNavigate();
  const weatherCodes = useWeatherCode();
  const onlineStatus = useOnline();

  const handleLanguageChange = (lang: "zh" | "en") => {
    vibrate(vibrateDuration);
    navigate(location.pathname.replace("/" + language, "/" + lang), {
      replace: true,
    });
    changeLanguage(lang);
  };

  const relocateGeolocation = useCallback(() => {
    try {
      if (window.iOSRNWebView === true) return;
      navigator.geolocation.getCurrentPosition(
        ({ coords: { latitude, longitude } }) => {
          updateGeolocation({ lat: latitude, lng: longitude });
        },
        () => {},
        { enableHighAccuracy: true }
      );
    } catch (e) {
      console.log("error in getting location");
    }
  }, [updateGeolocation]);

  const handleKeydown = useCallback(
    ({ key, ctrlKey, altKey, metaKey, target }: KeyboardEvent) => {
      // escape if key is functional
      if (ctrlKey || altKey || metaKey) return;
      // escape if any <input> has already been focused
      if ((target as HTMLElement).tagName.toUpperCase() === "INPUT") return;
      if ((target as HTMLElement).tagName.toUpperCase() === "TEXTAREA") return;

      if (key === "Escape") {
        setSearchRoute("");
      } else if (key === "Backspace") {
        setSearchRoute(searchRoute.slice(0, -1));
      } else if (key.length === 1) {
        setSearchRoute(searchRoute + key);
        navigate(`/${language}/board`, { replace: true });
      }
    },
    [searchRoute, language, setSearchRoute, navigate]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [handleKeydown]);

  return (
    <Toolbar sx={rootSx}>
      {/* 移除 MTR logo */}
      {/* <Link ...>
        <Box ... />
        <Typography ... />
      </Link> */}
      {/* 恢復定位按鈕 */}
      {geoPermission === "granted" && (
        <IconButton
          aria-label="relocate"
          onClick={() => relocateGeolocation()}
          size="small"
        >
          <LocationOnIcon />
        </IconButton>
      )}
      <Input
        id="searchInput"
        sx={searchRouteInputSx}
        type="text"
        value={searchRoute}
        placeholder={t("路線")}
        startAdornment={<SearchIcon fontSize="small" sx={{ opacity: 0.8 }} />}
        onChange={(e) => {
          if (
            e.target.value.toUpperCase() in routeList ||
            e.target.value in routeList
          ) {
            (document.activeElement as HTMLElement).blur();
            navigate(`/${language}/route/${e.target.value}`);
          }
          setSearchRoute(e.target.value);
        }}
        onFocus={() => {
          vibrate(vibrateDuration);
          if (navigator.userAgent !== "prerendering" && checkMobile()) {
            (document.activeElement as HTMLElement).blur();
          }
          navigate(`/${language}/board`, { replace: true });
        }}
      />
      <Box sx={weatherPanelSx}>
        {weatherCodes.slice(0, 2).map((code) => (
          <Avatar
            onClick={() =>
              window.open(
                `https://www.hko.gov.hk/${
                  language === "zh" ? "tc" : "en"
                }/detail.htm`
              )
            }
            key={code}
            variant="square"
            src={WeatherIcons[code]}
            sx={weatherImg}
          />
        ))}
      </Box>
      {/* 路線資料庫版本按鈕已移除 */}
      <Box sx={funcPanelSx}>
        <Button
          sx={languageSx}
          onClick={() => handleLanguageChange(language === "zh" ? "en" : "zh")}
          id="lang-selector"
          variant="text"
          disableElevation
          disableRipple
        >
          {language !== "zh" ? "繁" : "En"}
        </Button>
        <IconButton
          component={Link}
          to={`/${language}/settings`}
          rel="nofollow"
        >
          <SettingsIcon fontSize="small" />
        </IconButton>
      </Box>
    </Toolbar>
  );
};

export default Header;

const rootSx: SxProps<Theme> = {
  "& a": {
    textDecoration: "none",
  },
  display: "flex",
  justifyContent: "space-between",
};

const searchRouteInputSx: SxProps<Theme> = {
  maxWidth: "100px",
  "& input": {
    textAlign: "center",
  },
  "& input::before": {
    borderBottom: (theme) => `1px ${theme.palette.text.primary} solid`,
  },
  "&.Mui-focused": {
    "::after": {
      borderBottomColor: ({ palette }) =>
        palette.mode === "dark" ? palette.primary.main : palette.text.primary,
    },
  },
};

const weatherPanelSx: SxProps<Theme> = {
  display: "flex",
  alignContent: "center",
};

const funcPanelSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  opacity: 0.7,
};

const languageSx: SxProps<Theme> = {
  color: (theme) => theme.palette.text.primary,
  minWidth: "40px",
  p: 1,
  borderRadius: 5,
  fontWeight: 900,
  textTransform: "none",
};

const weatherImg: SxProps<Theme> = {
  background: "white",
  height: 24,
  width: 24,
  m: 1,
};
