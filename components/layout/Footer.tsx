import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import TrainIcon from "@mui/icons-material/Train";
import {
  BottomNavigation,
  BottomNavigationAction,
  SxProps,
  Theme,
} from "@mui/material";
import React, { useCallback, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AppContext from "../../context/AppContext";
import useLanguage from "../../hooks/useTranslation";
import { vibrate } from "../../utils";

const Footer = () => {
  const { t } = useTranslation();
  const language = useLanguage();
  const location = useLocation();
  const { vibrateDuration } = useContext(AppContext);

  const navigate = useNavigate();
  const handleClick = useCallback(
    (link: string, e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      vibrate(vibrateDuration);
      setTimeout(() => navigate(link), 0);
    },
    [vibrateDuration, navigate]
  );

  return useMemo(
    () => (
      <BottomNavigation
        value={location.pathname.replace(/(.*)\/[0-9]*?$/, "$1")}
        showLabels={true}
        sx={rootSx}
      >
        <BottomNavigationAction
          label={t("首頁")}
          component={Link}
          to={`/${language}`}
          onClick={(e: any) => handleClick(`/${language}`, e)}
          value={`/${language}`}
          icon={<HomeIcon />}
        />
        <BottomNavigationAction
          label={t("搜尋")}
          component={Link}
          to={`/${language}/board`}
          onClick={(e: any) => handleClick(`/${language}/board`, e)}
          value={`/${language}/board`}
          icon={<SearchIcon />}
        />
        <BottomNavigationAction
          label={t("MTR")}
          component={Link}
          to={`/${language}/mtr`}
          onClick={(e: any) => handleClick(`/${language}/mtr`, e)}
          value={`/${language}/mtr`}
          icon={<TrainIcon />}
        />
      </BottomNavigation>
    ),
    [location.pathname, language, t, handleClick]
  );
};

export default Footer;

const rootSx: SxProps<Theme> = {
  background: (theme: any) => theme.palette.background.default,
  bottom: "0",
  height: "initial",
  "& .MuiBottomNavigationAction-root": {
    width: "16.67%",
    padding: "6px 0",
    minWidth: 0,
  },
  "& .MuiBottomNavigationAction-label": {
    fontSize: "0.875rem",
  },
  "& .Mui-selected": {
    color: (theme: any) =>
      `${
        theme.palette.mode === "dark"
          ? theme.palette.primary.main
          : theme.palette.text.primary
      } !important`,
  },
};
