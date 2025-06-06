import { DirectionsBus as BusIcon, Train as TrainIcon } from "@mui/icons-material";
import { Box, Button, Paper, SxProps, Theme, Typography } from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import CollectionContext from "../CollectionContext";
import HomeTabbar, { HomeTabType, isHomeTab } from "../components/home/HomeTabbar";
import SwipeableList, { SwipeableListRef } from "../components/home/SwipeableList";
import DbContext from "../context/DbContext";
import useLanguage from "../hooks/useTranslation";
import { setSeoHeader } from "../utils";

const Home = () => {
  const { AppTitle } = useContext(DbContext);
  const { collections } = useContext(CollectionContext);
  const { t } = useTranslation();
  const language = useLanguage();
  const { collectionName } = useParams();
  const navigate = useNavigate();
  const swipeableList = useRef<SwipeableListRef>(null);
  const _homeTab = collectionName ?? localStorage.getItem("homeTab");  const [homeTab, setHomeTab] = useState<HomeTabType>(
    isHomeTab(_homeTab) ? (_homeTab as HomeTabType) : "home"
  );

  useEffect(() => {
    setSeoHeader({
      title: `${t("Dashboard")} - ${t(AppTitle)}`,
      description: t("home-page-description"),
      lang: language,
    });
  }, [language, AppTitle, t]);
  const handleTabChange = (
    v: HomeTabType,
    rerenderList: boolean = false
  ) => {
    setHomeTab(v);
    localStorage.setItem("homeTab", v);
    if (swipeableList.current && rerenderList) {
      swipeableList.current.changeTab(v);
    }
  };

  const handleMtrNavigation = () => {
    navigate('/mtr');
  };

  const handleBusNavigation = () => {
    navigate('/route');
  };
  return (
    <Paper sx={paperSx} square elevation={0}>
      <Typography component="h1" style={visuallyHidden}>{`${t(
        "Dashboard"
      )} - ${t(AppTitle)}`}</Typography>
      <Typography component="h2" style={visuallyHidden}>
        {t("home-page-description")}
      </Typography>
      <HomeTabbar homeTab={homeTab} onChangeTab={(v) => handleTabChange(v as HomeTabType)} />
      <SwipeableList
        ref={swipeableList}
        homeTab={homeTab}
        onChangeTab={(v) => handleTabChange(v as HomeTabType)}
      />
      
      {/* Footer with MTR and Bus navigation buttons */}
      <Box sx={footerSx}>
        <Button
          variant="contained"
          startIcon={<TrainIcon />}
          onClick={handleMtrNavigation}
          sx={buttonSx}
        >
          {t("MTR")}
        </Button>
        <Button
          variant="contained"
          startIcon={<BusIcon />}
          onClick={handleBusNavigation}
          sx={buttonSx}
        >
          {t("Bus")}
        </Button>
      </Box>
    </Paper>
  );
};

export default Home;

const paperSx: SxProps<Theme> = {
  background: "#222",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  overflow: "auto",
  width: "100%",
  height: "100%",
};

const footerSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",
  padding: "16px",
  backgroundColor: "#333",
  borderTop: "1px solid #555",
  marginTop: "auto",
  gap: "16px",
};

const buttonSx: SxProps<Theme> = {
  flex: 1,
  maxWidth: "200px",
  padding: "12px 24px",
  fontSize: "16px",
  fontWeight: "bold",
  borderRadius: "8px",
  textTransform: "none",
  "&:first-of-type": {
    backgroundColor: "#1976d2",
    "&:hover": {
      backgroundColor: "#1565c0",
    },
  },
  "&:last-of-type": {
    backgroundColor: "#388e3c",
    "&:hover": {
      backgroundColor: "#2e7d32",
    },
  },
};
