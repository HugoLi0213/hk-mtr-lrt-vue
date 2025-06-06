import {
  Build as BuildIcon,
  GetApp as GetAppIcon,
  InsertEmoticon as InsertEmoticonIcon,
  LocationOff as LocationOffIcon,
  LocationOn as LocationOnIcon,
  SyncDisabled as SyncDisabledIcon,
  Sync as SyncIcon
} from "@mui/icons-material";
import {
  Avatar,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  Snackbar,
  SxProps,
  Theme,
  Typography
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import InstallDialog from "../components/settings/InstallDialog";
import PersonalizeDialog from "../components/settings/PersonalizeDialog";
import AppContext from "../context/AppContext";
import DbContext from "../context/DbContext";
import ReactNativeContext from "../context/ReactNativeContext";
import useLanguage from "../hooks/useTranslation";
import {
  checkAppInstalled,
  iOSRNWebView,
  setSeoHeader,
  vibrate
} from "../utils";

const Settings = () => {
  const {
    AppTitle,
    db: { schemaVersion, versionMd5, updateTime },
    renewDb,
    autoRenew,
    toggleAutoDbRenew,
  } = useContext(DbContext);
  const {
    geoPermission,
    updateGeoPermission,
    vibrateDuration,
  } = useContext(AppContext);
  const { debug, toggleDebug } = useContext(ReactNativeContext);
  const [updating, setUpdating] = useState(false);
  const [showGeoPermissionDenied, setShowGeoPermissionDenied] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isOpenInstallDialog, setIsOpenInstallDialog] = useState(false);
  const [isPersonalizeDialog, setIsPersonalizeDialog] = useState(false);

  const { t } = useTranslation();
  const language = useLanguage();

  const navigate = useNavigate();

  useEffect(() => {
    setSeoHeader({
      title: t("設定") + " - " + t(AppTitle),
      description: t("setting-page-description"),
      lang: language,
    });
    setUpdating(false);
  }, [updateTime, language, t, AppTitle]);

  const updateApp = useCallback(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          // registration worked
          registration.update();
          window.location.reload();
        })
        .catch(() => {
          // registration failed
          console.error(`Not registrated`);
        });
    }
  }, []);

  return (
    <Paper sx={rootSx} square elevation={0}>
      <Typography component="h1" style={visuallyHidden}>{`${t("設定")} - ${t(
        AppTitle
      )}`}</Typography>
      <List sx={{ py: 0 }}>
        {/* 安裝 App（PWA，僅在未安裝時顯示） */}
        {!checkAppInstalled() && !iOSRNWebView() && (
          <ListItemButton
            onClick={() => {
              vibrate(vibrateDuration);
              setTimeout(() => setIsOpenInstallDialog(true), 0);
            }}
          >
            <ListItemAvatar>
              <Avatar>
                <GetAppIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={t("安裝")}
              secondary={t("安裝巴士預報 App 到裝置")}
            />
          </ListItemButton>
        )}
        {/* 顯示/更新 App 版本（點擊可強制更新 Service Worker） */}
        {(import.meta.env.VITE_COMMIT_HASH || import.meta.env.VITE_VERSION) && (
          <ListItemButton onClick={updateApp}>
            <ListItemAvatar>
              <Avatar>
                {/* <InfoIcon /> */}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={`${t("版本")}: ${
                import.meta.env.VITE_VERSION || "unknown"
              }${
                import.meta.env.VITE_COMMIT_HASH
                  ? ` - ${import.meta.env.VITE_COMMIT_HASH}`
                  : ""
              }`}
              secondary={import.meta.env.VITE_COMMIT_MESSAGE || ""}
            />
          </ListItemButton>
        )}
        {/* 更新路線資料庫（顯示版本與 MD5，點擊可手動更新） */}
        <ListItemButton
          onClick={() => {
            vibrate(vibrateDuration);
            setUpdating(true);
            renewDb();
          }}
        >
          <ListItemAvatar>
            <Avatar>
              <BuildIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              `${t("更新路線資料庫")}: ` +
              `${schemaVersion} - ${versionMd5.slice(0, 6)}`
            }
            secondary={
              t("更新時間") +
              ": " +
              new Date(updateTime)
                .toLocaleString()
                .slice(0, 20)
                .replace(",", " ")
            }
          />
        </ListItemButton>
        {/* 地理位置定位功能（開啟/關閉定位權限） */}
        <ListItemButton
          onClick={() => {
            vibrate(vibrateDuration);
            if (geoPermission === "granted") {
              updateGeoPermission("closed");
            } else {
              updateGeoPermission("opening", () => {
                setShowGeoPermissionDenied(true);
              });
            }
          }}
        >
          <ListItemAvatar>
            <Avatar>
              {geoPermission === "granted" ? (
                <LocationOnIcon />
              ) : (
                <LocationOffIcon />
              )}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={t("地理位置定位功能")}
            secondary={t(
              geoPermission === "granted"
                ? "開啟"
                : geoPermission === "opening"
                  ? "開啟中..."
                  : "關閉"
            )}
          />
        </ListItemButton>
        {/* 自動更新路線資料（開啟/關閉自動更新） */}
        <ListItemButton
          onClick={() => {
            vibrate(vibrateDuration);
            toggleAutoDbRenew();
          }}
        >
          <ListItemAvatar>
            <Avatar>{autoRenew ? <SyncIcon /> : <SyncDisabledIcon />}</Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={t("自動更新路線資料")}
            secondary={t(autoRenew ? "開啟" : "關閉")}
          />
        </ListItemButton>
        {/* 個性化設定（日夜模式、時間格式、路線次序等，彈窗） */}
        <ListItemButton
          onClick={() => {
            vibrate(vibrateDuration);
            setIsPersonalizeDialog(true);
          }}
        >
          <ListItemAvatar>
            <Avatar>
              <InsertEmoticonIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={t("個性化設定")}
            secondary={t("日夜模式、時間格式、路線次序等")}
          />
        </ListItemButton>
      </List>
      {/* Snackbar 與 Dialog 保留 */}
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={updating}
        message={t("資料更新中") + "..."}
      />
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={showGeoPermissionDenied}
        autoHideDuration={1500}
        onClose={() => {
          setShowGeoPermissionDenied(false);
        }}
        message={t("無法獲得地理位置定位功能權限")}
      />
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={isCopied}
        autoHideDuration={1500}
        onClose={() => {
          setIsCopied(false);
        }}
        message={t("鏈結已複製到剪貼簿")}
      />
      <InstallDialog
        open={isOpenInstallDialog}
        handleClose={() => setIsOpenInstallDialog(false)}
      />
      <PersonalizeDialog
        open={isPersonalizeDialog}
        onClose={() => setIsPersonalizeDialog(false)}
      />
    </Paper>
  );
};

export default Settings;

const rootSx: SxProps<Theme> = {
  background: (theme) =>
    theme.palette.mode === "dark" ? theme.palette.background.default : "white",
  height: "calc(100vh - 120px)",
  overflowY: "scroll",
  "& .MuiAvatar-colorDefault": {
    color: (theme) =>
      theme.palette.mode === "dark"
        ? theme.palette.background.default
        : "white",
  },
};
