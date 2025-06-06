import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Train as TrainIcon,
} from "@mui/icons-material";
import {
  Alert,
  AppBar,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import AppContext from "../context/AppContext";
import useLanguage from "../hooks/useTranslation";
import { setSeoHeader } from "../utils";
import { getNearestMtrLine } from '../utils/nearestMtrLine';

// MTR Line configurations
const MTR_LINES = {
  TML: {
    zh: "屯馬綫",
    en: "Tuen Ma Line",
    color: "#9C2E00",
    stations: {
      TUM: { zh: "屯門", en: "Tuen Mun" },
      SIH: { zh: "兆康", en: "Siu Hong" },
      TIS: { zh: "天水圍", en: "Tin Shui Wai" },
      LOP: { zh: "朗屏", en: "Long Ping" },
      YUL: { zh: "元朗", en: "Yuen Long" },
      KSR: { zh: "錦上路", en: "Kam Sheung Road" },
      TWW: { zh: "荃灣西", en: "Tsuen Wan West" },
      MEF: { zh: "美孚", en: "Mei Foo" },
      NAC: { zh: "南昌", en: "Nam Cheong" },
      AUS: { zh: "柯士甸", en: "Austin" },
      ETS: { zh: "尖東", en: "East Tsim Sha Tsui" },
      HUH: { zh: "紅磡", en: "Hung Hom" },
      HOM: { zh: "何文田", en: "Ho Man Tin" },
      TKW: { zh: "土瓜灣", en: "To Kwa Wan" },
      SUW: { zh: "宋皇臺", en: "Sung Wong Toi" },
      KAT: { zh: "啟德", en: "Kai Tak" },
      DIH: { zh: "鑽石山", en: "Diamond Hill" },
      HIK: { zh: "顯徑", en: "Hin Keng" },
      TAW: { zh: "大圍", en: "Tai Wai" },
      CKT: { zh: "車公廟", en: "Che Kung Temple" },
      STW: { zh: "沙田圍", en: "Sha Tin Wai" },
      CIO: { zh: "第一城", en: "City One" },
      SHM: { zh: "石門", en: "Shek Mun" },
      TSH: { zh: "大水坑", en: "Tai Shui Hang" },
      HEO: { zh: "恆安", en: "Heng On" },
      MOS: { zh: "馬鞍山", en: "Ma On Shan" },
      WKS: { zh: "烏溪沙", en: "Wu Kai Sha" },
    },
  },
  TKL: {
    zh: "將軍澳綫",
    en: "Tseung Kwan O Line",
    color: "#7E3C93",
    stations: {
      POA: { zh: "寶琳", en: "Po Lam" },
      HAH: { zh: "坑口", en: "Hang Hau" },
      LHP: { zh: "康城", en: "LOHAS Park" },
      TKO: { zh: "將軍澳", en: "Tseung Kwan O" },
      TIK: { zh: "調景嶺", en: "Tiu Keng Leng" },
      YAT: { zh: "油塘", en: "Yau Tong" },
      QUB: { zh: "鰂魚涌", en: "Quarry Bay" },
      NOP: { zh: "北角", en: "North Point" },
    },
  },
  TCL: {
    zh: "東涌綫",
    en: "Tung Chung Line",
    color: "#F3982D",
    stations: {
      TUC: { zh: "東涌", en: "Tung Chung" },
      SUN: { zh: "欣澳", en: "Sunny Bay" },
      TSY: { zh: "青衣", en: "Tsing Yi" },
      LAK: { zh: "荔景", en: "Lai King" },
      NAC: { zh: "南昌", en: "Nam Cheong" },
      OLY: { zh: "奧運", en: "Olympic" },
      KOW: { zh: "九龍", en: "Kowloon" },
      HOK: { zh: "香港", en: "Hong Kong" },
    },
  },
  AEL: {
    zh: "機場快綫",
    en: "Airport Express Line",
    color: "#00888E",
    stations: {
      AWE: { zh: "博覽館", en: "AsiaWorld Expo" },
      AIR: { zh: "機場", en: "Airport" },
      TSY: { zh: "青衣", en: "Tsing Yi" },
      KOW: { zh: "九龍", en: "Kowloon" },
      HOK: { zh: "香港", en: "Hong Kong" },
    },
  },
  EAL: {
    zh: "東鐵綫",
    en: "East Rail Line",
    color: "#5EB7E8",
    stations: {
      LMC: { zh: "落馬洲", en: "Lok Ma Chau" },
      LOW: { zh: "羅湖", en: "Lo Wu" },
      SHS: { zh: "上水", en: "Sheung Shui" },
      FAN: { zh: "粉嶺", en: "Fanling" },
      TWO: { zh: "太和", en: "Tai Wo" },
      TAP: { zh: "大埔墟", en: "Tai Po Market" },
      UNI: { zh: "大學", en: "University" },
      RAC: { zh: "馬場", en: "Racecourse" },
      FOT: { zh: "火炭", en: "Fo Tan" },
      SHT: { zh: "沙田", en: "Sha Tin" },
      TAW: { zh: "大圍", en: "Tai Wai" },
      KOT: { zh: "九龍塘", en: "Kowloon Tong" },
      MKK: { zh: "旺角東", en: "Mong Kok East" },
      HUH: { zh: "紅磡", en: "Hung Hom" },
      EXC: { zh: "會展", en: "Exhibition Centre" },
      ADM: { zh: "金鐘", en: "Admiralty" },
    },
  },
  SIL: {
    zh: "南港島綫",
    en: "South Island Line",
    color: "#CBD300",
    stations: {
      SOH: { zh: "海怡半島", en: "South Horizons" },
      LET: { zh: "利東", en: "Lei Tung" },
      WCH: { zh: "黃竹坑", en: "Wong Chuk Hang" },
      OCP: { zh: "海洋公園", en: "Ocean Park" },
      ADM: { zh: "金鐘", en: "Admiralty" },
    },
  },
  TWL: {
    zh: "荃灣綫",
    en: "Tsuen Wan Line",
    color: "#E60012",
    stations: {
      TSW: { zh: "荃灣", en: "Tsuen Wan" },
      TWH: { zh: "大窩口", en: "Tai Wo Hau" },
      KWH: { zh: "葵興", en: "Kwai Hing" },
      KWF: { zh: "葵芳", en: "Kwai Fong" },
      LAK: { zh: "茘景", en: "Lai King" },
      MEF: { zh: "美孚", en: "Mei Foo" },
      LCK: { zh: "茘枝角", en: "Lai Chi Kok" },
      CSW: { zh: "長沙灣", en: "Cheung Sha Wan" },
      SSP: { zh: "深水埗", en: "Sham Shui Po" },
      PRE: { zh: "太子", en: "Prince Edward" },
      MOK: { zh: "旺角", en: "Mong Kok" },
      YMT: { zh: "油麻地", en: "Yau Ma Tei" },
      JOR: { zh: "佐敦", en: "Jordan" },
      TST: { zh: "尖沙咀", en: "Tsim Sha Tsui" },
      ADM: { zh: "金鐘", en: "Admiralty" },
      CEN: { zh: "中環", en: "Central" },
    },
  },
  ISL: {
    zh: "港島線",
    en: "Island Line",
    color: "#0075C2",
    stations: {
      CHW: { zh: "柴灣", en: "Chai Wan" },
      HFC: { zh: "杏花邨", en: "Heng Fa Chuen" },
      SKW: { zh: "筲箕灣", en: "Shau Kei Wan" },
      SWH: { zh: "西灣河", en: "Sai Wan Ho" },
      TAK: { zh: "太古", en: "Tai Koo" },
      QUB: { zh: "鰂魚涌", en: "Quarry Bay" },
      NOP: { zh: "北角", en: "North Point" },
      FOH: { zh: "炮台山", en: "Fortress Hill" },
      TIH: { zh: "天后", en: "Tin Hau" },
      CAB: { zh: "銅鑼灣", en: "Causeway Bay" },
      WAC: { zh: "灣仔", en: "Wan Chai" },
      ADM: { zh: "金鐘", en: "Admiralty" },
      CEN: { zh: "中環", en: "Central" },
      SHW: { zh: "上環", en: "Sheung Wan" },
      SYP: { zh: "西營盤", en: "Sai Ying Pun" },
      HKU: { zh: "香港大學", en: "HKU" },
      KET: { zh: "堅尼地城", en: "Kennedy Town" },
    },
  },
  KTL: {
    zh: "觀塘綫",
    en: "Kwun Tong Line",
    color: "#7ED321",
    stations: {
      TIK: { zh: "調景嶺", en: "Tiu Keng Leng" },
      YAT: { zh: "油塘", en: "Yau Tong" },
      LAT: { zh: "藍田", en: "Lam Tin" },
      KWT: { zh: "觀塘", en: "Kwun Tong" },
      NTK: { zh: "牛頭角", en: "Ngau Tau Kok" },
      KOB: { zh: "九龍灣", en: "Kowloon Bay" },
      CHH: { zh: "彩虹", en: "Choi Hung" },
      DIH: { zh: "鑽石山", en: "Diamond Hill" },
      WTS: { zh: "黃大仙", en: "Wong Tai Sin" },
      LOF: { zh: "樂富", en: "Lok Fu" },
      KOT: { zh: "九龍塘", en: "Kowloon Tong" },
      SKM: { zh: "石硤尾", en: "Shek Kip Mei" },
      PRE: { zh: "太子", en: "Prince Edward" },
      MOK: { zh: "旺角", en: "Mong Kok" },
      YMT: { zh: "油麻地", en: "Yau Ma Tei" },
      HOM: { zh: "何文田", en: "Ho Man Tin" },
      WHA: { zh: "黃埔", en: "Whampoa" },
    },
  },
};

interface TrainEta {
  time: string;
  dest: string;
  plat?: string;
}

interface StationData {
  UP: TrainEta[];
  DOWN: TrainEta[];
}

interface MtrApiResponse {
  curr_time: string;
  data: Record<string, StationData>;
}

const MtrTrain = () => {
  const { line: lineParam } = useParams<{ line?: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const language = useLanguage();
  const { geolocation } = useContext(AppContext);

  const [selectedLine, setSelectedLine] = useState<string>(lineParam || "TML");
  const [trainData, setTrainData] = useState<Record<string, StationData>>({});
  const [currentTime, setCurrentTime] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [direction, setDirection] = useState<'UP' | 'DOWN'>('UP');

  const lineConfig = MTR_LINES[selectedLine as keyof typeof MTR_LINES];

  const formatTime = useCallback((timeString: string) => {
    if (!timeString) return "-";
    return timeString.replace(/^[0-9-]* /, "").replace(/:[0-9]*$/, "");
  }, []);

  const fetchTrainData = useCallback(async () => {
    if (!selectedLine || !lineConfig) return;

    setLoading(true);
    setError(null);

    try {
      const stations = Object.keys(lineConfig.stations);
      const promises = stations.map((station) =>
        fetch(
          `https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=${selectedLine}&sta=${station}`
        ).then((res) => res.json())
      );

      const responses: MtrApiResponse[] = await Promise.all(promises);
      const newTrainData: Record<string, StationData> = {};
      let currentTimeFromApi = "";

      responses.forEach((response, index) => {
        if (response && response.data) {
          const stationCode = stations[index];
          const stationKey = `${selectedLine}-${stationCode}`;

          if (response.data[stationKey]) {
            newTrainData[stationCode] = response.data[stationKey];
          }

          if (!currentTimeFromApi && response.curr_time) {
            currentTimeFromApi = response.curr_time;
          }
        }
      });

      setTrainData(newTrainData);
      setCurrentTime(currentTimeFromApi);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Failed to fetch MTR data:", err);
      setError(t("無法載入港鐵數據"));
    } finally {
      setLoading(false);
    }
  }, [selectedLine, lineConfig, t]);

  useEffect(() => {
    setSeoHeader({
      title: `${lineConfig?.zh || lineConfig?.en || "港鐵"} - ${t("港鐵列車即時班次")}`,
      description: t("查看港鐵各線列車的即時到站時間"),
      lang: language,
    });
  }, [selectedLine, lineConfig, language, t]);

  useEffect(() => {
    fetchTrainData();
    
    // Auto refresh every 15 seconds
    const interval = setInterval(fetchTrainData, 15000);
    
    return () => clearInterval(interval);
  }, [fetchTrainData]);

  useEffect(() => {
    // 自動選擇最近的 MTR line（只在初次載入或 geolocation 變化時自動切換）
    let autoSelected = false;
    if (geolocation?.current && !autoSelected) {
      (async () => {
        const nearestLine = await getNearestMtrLine(
          geolocation.current.lat,
          geolocation.current.lng,
          MTR_LINES
        );
        // 只在初次載入時自動切換，之後用戶可自由選擇
        if (nearestLine && nearestLine !== selectedLine && lineParam == null) {
          setSelectedLine(nearestLine);
          autoSelected = true;
        }
      })();
    }
    // eslint-disable-next-line
  }, [geolocation]);

  const handleLineChange = (line: string) => {
    setSelectedLine(line);
    navigate(`/${language}/mtr-train/${line}`, { replace: true });
  };

  const handleRefresh = () => {
    fetchTrainData();
  };

  const handleDirectionChange = (_: any, newDirection: 'UP' | 'DOWN') => {
    if (newDirection) setDirection(newDirection);
  };

  const getTerminusNames = useMemo(() => {
    if (!lineConfig) return { up: "", down: "" };
    
    const stations = Object.keys(lineConfig.stations);
    const firstStation = stations[0];
    const lastStation = stations[stations.length - 1];
    
    return {
      up: (lineConfig.stations as any)[firstStation][language] || "",
      down: (lineConfig.stations as any)[lastStation][language] || "",
    };
  }, [lineConfig, language]);

  if (!lineConfig) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {t("未支援的港鐵線路")}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: "100vh", 
      backgroundColor: "background.default",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }}>
      {/* Compact Header */}
      <AppBar position="static" sx={{ backgroundColor: lineConfig.color, zIndex: 1100, flexShrink: 0 }}>
        <Toolbar variant="dense" sx={{ minHeight: 48 }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate(-1)}
            size="small"
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <TrainIcon sx={{ mr: 1, fontSize: 20 }} />
          <Typography variant="subtitle1" sx={{ flexGrow: 1, fontSize: '1rem' }}>
            {lineConfig[language]} ({selectedLine})
          </Typography>
          <IconButton color="inherit" onClick={handleRefresh} disabled={loading} size="small">
            {loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon fontSize="small" />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Compact Line selector */}
      <Box sx={{ 
        px: 2, 
        py: 1, 
        backgroundColor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
        flexShrink: 0
      }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
          {t("選擇綫路")}
          {currentTime && (
            <span style={{ float: 'right' }}>
              ⌚️ {currentTime}
              {lastUpdate && (
                <span style={{ marginLeft: 4, opacity: 0.7 }}>
                  ({lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                </span>
              )}
            </span>
          )}
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {Object.entries(MTR_LINES).map(([code, config]) => (
            <Tooltip key={code} title={`${config[language]} (${code})`} arrow>
              <Chip
                label={code}
                size="small"
                onClick={() => handleLineChange(code)}
                variant={selectedLine === code ? "filled" : "outlined"}
                sx={{
                  backgroundColor: selectedLine === code ? config.color : "transparent",
                  color: selectedLine === code ? "white" : config.color,
                  borderColor: config.color,
                  fontSize: '0.75rem',
                  height: 24,
                  '& .MuiChip-label': {
                    px: 1,
                  },
                  "&:hover": {
                    backgroundColor: selectedLine === code ? config.color : `${config.color}20`,
                  },
                }}
              />
            </Tooltip>
          ))}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {/* Scrollable content container */}
      <Box sx={{ 
        flex: 1,
        overflow: "auto",
        WebkitOverflowScrolling: "touch",
        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "rgba(0,0,0,0.2)",
          borderRadius: "3px",
        },
      }}>
        <Box sx={{ px: 2, py: 1 }}>
          {/* 切換上/下行按鈕 */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" sx={{
              fontWeight: 700,
              fontSize: (direction === 'UP' ? getTerminusNames.up.length : getTerminusNames.down.length) >= 3 ? '0.92rem' : '1rem',
              letterSpacing: 0.5,
              color: '#fff',
              borderLeft: 3,
              borderColor: lineConfig.color || 'primary.main',
              pl: 1.2,
              background: `linear-gradient(90deg, ${lineConfig.color} 80%, #222 100%)`,
              borderRadius: 1.5,
              boxShadow: '0 1px 4px 0 rgba(0,0,0,0.08)',
              transition: 'background 0.2s',
              display: 'flex',
              alignItems: 'center',
              minHeight: 28,
              py: 0.5,
              mb: 0,
              justifyContent: 'center',
              flexShrink: 0,
              mr: 1,
              maxWidth: 120,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {direction === 'UP' ? getTerminusNames.up : getTerminusNames.down}
            </Typography>
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
              <ToggleButtonGroup
                value={direction}
                exclusive
                onChange={handleDirectionChange}
                size="small"
                sx={{ background: '#222', borderRadius: 2, boxShadow: '0 1px 4px 0 rgba(0,0,0,0.08)' }}
              >
                <ToggleButton value="UP"
                  sx={{
                    fontWeight: 700,
                    color: direction === 'UP' ? '#fff' : lineConfig.color,
                    background: direction === 'UP' ? lineConfig.color : 'transparent',
                    border: 0,
                    borderRadius: 1.5,
                    px: 1.5,
                    py: 0.5,
                    mx: 0.3,
                    minHeight: 28,
                    fontSize: '0.95rem',
                    boxShadow: direction === 'UP' ? '0 1px 4px 0 rgba(0,0,0,0.12)' : 'none',
                    transition: 'all 0.2s',
                    '&:hover': {
                      background: direction === 'UP' ? lineConfig.color : '#333',
                      color: '#fff',
                      boxShadow: '0 1px 4px 0 rgba(0,0,0,0.15)'
                    },
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <TrainIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  {getTerminusNames.up}
                </ToggleButton>
                <ToggleButton value="DOWN"
                  sx={{
                    fontWeight: 700,
                    color: direction === 'DOWN' ? '#fff' : lineConfig.color,
                    background: direction === 'DOWN' ? lineConfig.color : 'transparent',
                    border: 0,
                    borderRadius: 1.5,
                    px: 1.5,
                    py: 0.5,
                    mx: 0.3,
                    minHeight: 28,
                    fontSize: '0.95rem',
                    boxShadow: direction === 'DOWN' ? '0 1px 4px 0 rgba(0,0,0,0.12)' : 'none',
                    transition: 'all 0.2s',
                    '&:hover': {
                      background: direction === 'DOWN' ? lineConfig.color : '#333',
                      color: '#fff',
                      boxShadow: '0 1px 4px 0 rgba(0,0,0,0.15)'
                    },
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <TrainIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  {getTerminusNames.down}
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>

          {/* 根據 direction 顯示對應方向表格 */}
          {direction === 'UP' && (
            <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2, mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", py: 1 }}>{t("班次")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold", py: 1 }}>1</TableCell>
                    <TableCell sx={{ fontWeight: "bold", py: 1 }}>2</TableCell>
                    <TableCell sx={{ fontWeight: "bold", py: 1 }}>3</TableCell>
                    <TableCell sx={{ fontWeight: "bold", py: 1 }}>4</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(lineConfig.stations)
                    .reverse()
                    .map(([stationCode, stationName]) => (
                      <TableRow key={stationCode}>
                        <TableCell sx={{ fontWeight: "bold", py: 0.5 }}>
                          {stationName[language]} ({stationCode})
                        </TableCell>
                        {[0, 1, 2, 3].map((idx) => {
                          const eta = trainData[stationCode]?.UP?.[idx];
                          let destName = eta && eta.dest ? (lineConfig.stations[eta.dest as keyof typeof lineConfig.stations]?.[language] || eta.dest) : "";
                          const fontSize = destName.length > 6 ? '0.8rem' : '1rem';
                          return (
                            <TableCell key={idx} sx={{ py: 0.5, px: 0.5 }}>
                              {eta ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
                                  <Typography variant="body2" sx={{ fontWeight: "bold", lineHeight: 1.2, whiteSpace: 'nowrap', textAlign: 'center' }}>
                                    {formatTime(eta.time)}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1, fontSize, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', textAlign: 'center', mt: 0.2 }}>
                                    ({destName})
                                  </Typography>
                                </Box>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {direction === 'DOWN' && (
            <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", py: 1 }}>{t("班次")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold", py: 1 }}>1</TableCell>
                    <TableCell sx={{ fontWeight: "bold", py: 1 }}>2</TableCell>
                    <TableCell sx={{ fontWeight: "bold", py: 1 }}>3</TableCell>
                    <TableCell sx={{ fontWeight: "bold", py: 1 }}>4</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(lineConfig.stations)
                    .map(([stationCode, stationName]) => (
                      <TableRow key={stationCode}>
                        <TableCell sx={{ fontWeight: "bold", py: 0.5 }}>
                          {stationName[language]} ({stationCode})
                        </TableCell>
                        {[0, 1, 2, 3].map((idx) => {
                          const eta = trainData[stationCode]?.DOWN?.[idx];
                          let destName = eta && eta.dest ? (lineConfig.stations[eta.dest as keyof typeof lineConfig.stations]?.[language] || eta.dest) : "";
                          const fontSize = destName.length > 6 ? '0.8rem' : '1rem';
                          return (
                            <TableCell key={idx} sx={{ py: 0.5, px: 0.5 }}>
                              {eta ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
                                  <Typography variant="body2" sx={{ fontWeight: "bold", lineHeight: 1.2, whiteSpace: 'nowrap', textAlign: 'center' }}>
                                    {formatTime(eta.time)}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1, fontSize, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', textAlign: 'center', mt: 0.2 }}>
                                    ({destName})
                                  </Typography>
                                </Box>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>

      {/* Compact Footer info */}
      <Box sx={{ 
        px: 2, 
        py: 1, 
        textAlign: "center", 
        backgroundColor: "background.paper", 
        borderTop: 1,
        borderColor: "divider"
      }}>
        <Typography variant="caption" color="text.secondary">
          {t("數據來自")} <a href="https://data.gov.hk" target="_blank" rel="noopener noreferrer">DATA.GOV.HK</a>
          {" • "}
          {t("每15秒自動更新")}
        </Typography>
      </Box>
    </Box>
  );
}

export default MtrTrain;
