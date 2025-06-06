import { SxProps, Theme } from "@mui/material";

interface HomeTabbarProps {
  homeTab: HomeTabType | string;
  onChangeTab: (v: HomeTabType, rerenderList: boolean) => void;
}

const HomeTabbar = ({ homeTab, onChangeTab }: HomeTabbarProps) => {
  // 已移除所有 tab，不渲染任何內容
  return null;
};

export default HomeTabbar;

export type HomeTabType = "home" | "search";

export const isHomeTab = (
  input: unknown
): input is HomeTabType => {
  return input === "home" || input === "search";
};

const tabbarSx: SxProps<Theme> = {
  background: (theme) => theme.palette.background.default,
  minHeight: "36px",
  [`& .MuiTab-root`]: {
    textTransform: "none",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 0,
    paddingBottom: 0,
    minHeight: "32px",
  },
  [`& .MuiTabs-flexContainer`]: {
    justifyContent: "flex-start",
    "& svg": {
      fontSize: "1rem",
    },
    "& .MuiTab-root": {
      fontSize: "0.8em",
    },
  },
};
