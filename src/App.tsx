import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  FormControlLabel,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import BedtimeRoundedIcon from "@mui/icons-material/BedtimeRounded";
import LocalCafeRoundedIcon from "@mui/icons-material/LocalCafeRounded";
import WorkHistoryRoundedIcon from "@mui/icons-material/WorkHistoryRounded";
import DirectionsRunRoundedIcon from "@mui/icons-material/DirectionsRunRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SplashScreen from "./SplashScreen";
import "./App.css";

interface RollingNumberProps {
  value: string;
}

interface StatCardProps {
  icon: ReactNode;
  label: string;
  hint: string;
  value: string;
  loading: boolean;
  accentClass: string;
  compact?: boolean;
}

const FULL_DAY_SECONDS = 8 * 3600 + 33 * 60;
const HALF_DAY_SECONDS = 4 * 3600 + 3 * 60;

const ENCOURAGEMENTS = [
  "Sharp pace today. The board is looking very healthy.",
  "This is a clean rhythm. Productive without looking chaotic.",
  "Steady progress. This feels sustainably strong.",
  "You are building serious momentum today.",
  "The hours are stacking up nicely. Keep the groove.",
  "Locked in. Calm, focused, and moving well.",
  "The dashboard approves this level of discipline.",
  "Good flow. You are balancing effort and timing well.",
];

const parseTimeToSeconds = (time: string): number => {
  const [hours = 0, minutes = 0, seconds = 0] = time.split(":").map(Number);

  if ([hours, minutes, seconds].some(Number.isNaN)) {
    return 0;
  }

  return hours * 3600 + minutes * 60 + seconds;
};

const formatSecondsToClock = (totalSeconds: number): string => {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  return [hours, minutes, seconds]
    .map((unit) => String(unit).padStart(2, "0"))
    .join(":");
};

const getTodayTimestamps = () => {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return {
    startOfDay: start.getTime(),
    endOfDay: end.getTime(),
  };
};

const getCompletionMessage = (
  loginTime: string | null,
  breakHours: string,
  targetSeconds: number,
) => {
  if (!loginTime) {
    return "Login time unknown";
  }

  const [hours, minutes, seconds] = loginTime.split(":").map(Number);
  const completionTime = new Date();

  completionTime.setHours(hours, minutes, seconds, 0);
  completionTime.setSeconds(
    completionTime.getSeconds() + targetSeconds + parseTimeToSeconds(breakHours),
  );

  return completionTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const RollingNumber = ({ value }: RollingNumberProps) => (
  <AnimatePresence mode="wait">
    <motion.span
      key={value}
      initial={{ y: -16, opacity: 0, filter: "blur(6px)" }}
      animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
      exit={{ y: 16, opacity: 0, filter: "blur(6px)" }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="rolling-digit"
    >
      {value}
    </motion.span>
  </AnimatePresence>
);

const TimeDisplay = ({
  loading,
  value,
  compact = false,
}: {
  loading: boolean;
  value: string;
  compact?: boolean;
}) => {
  if (loading) {
    return (
      <Box className="stat-loading">
        <CircularProgress size={18} thickness={5} />
      </Box>
    );
  }

  if (!value || value.includes("Invalid") || value.includes("NaN")) {
    return <span className="time-fallback">No data</span>;
  }

  if (value.startsWith("Done @")) {
    return <span className="time-badge">{value}</span>;
  }

  const parts = value.split(":");

  return (
    <span className={`time-readout ${compact ? "compact" : ""}`}>
      <RollingNumber value={parts[0] ?? "00"} />
      <span className="time-separator">:</span>
      <RollingNumber value={parts[1] ?? "00"} />
      {!compact && (
        <>
          <span className="time-separator">:</span>
          <RollingNumber value={parts[2] ?? "00"} />
        </>
      )}
    </span>
  );
};

const StatCard = ({
  icon,
  label,
  hint,
  value,
  loading,
  accentClass,
  compact = false,
}: StatCardProps) => (
  <Tooltip title={hint} arrow>
    <motion.div
      whileHover={{ y: -6, rotateX: 4, rotateY: compact ? -4 : 4 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className={`stat-card ${accentClass}`}
    >
      <div className="stat-card__glow" />
      <div className="stat-card__header">
        <span className="stat-card__icon">{icon}</span>
        <span className="stat-card__label">{label}</span>
      </div>
      <div className="stat-card__value">
        <TimeDisplay loading={loading} value={value} compact={compact} />
      </div>
    </motion.div>
  </Tooltip>
);

function App() {
  const [breakHours, setBreakHours] = useState("00:00:00");
  const [workHours, setWorkHours] = useState("00:00:00");
  const [authHeader, setAuthHeader] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHalfDay, setShowHalfDay] = useState(false);
  const [loginTime, setLoginTime] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [employeeName, setEmployeeName] = useState("");
  const [todayPunches, setTodayPunches] = useState<string[]>([]);

  const fetchWorkHours = useCallback(async (url: string, header: string) => {
    setIsLoading(true);
    setRefreshing(true);

    try {
      const employeeMatch = url.match(/employee\/(\d+)\//);

      if (!employeeMatch) {
        throw new Error("Employee ID could not be resolved from the stored URL.");
      }

      const employeeId = employeeMatch[1];
      const baseUrl = `https://synergyapi.helixbeat.com/customer/238/employee/${employeeId}`;
      const headers = {
        Authorization: header,
        "Content-Type": "application/json;charset=UTF-8",
      };

      const { startOfDay, endOfDay } = getTodayTimestamps();
      const params = new URLSearchParams({
        employeeId,
        startDate: String(startOfDay),
        endDate: String(endOfDay),
        isEmployee: "true",
      });

      const breakTimeUrl = `${baseUrl}/break-time?${params.toString()}`;
      const workHoursUrl = `${baseUrl}/today-work-hrs`;

      const [breakResponse, workResponse] = await Promise.all([
        fetch(breakTimeUrl, { method: "GET", headers }),
        fetch(workHoursUrl, { method: "GET", headers }),
      ]);

      if (!breakResponse.ok || !workResponse.ok) {
        throw new Error("One of the dashboard requests failed.");
      }

      const breakData = await breakResponse.json();
      const workData = await workResponse.json();

      const firstEntry = Array.isArray(breakData) ? breakData[0] : null;
      const resolvedBreakHours = firstEntry?.breakHrs ?? "00:00:00";
      const resolvedWorkHours = workData?.workHrs ?? "00:00:00";
      const resolvedName = firstEntry?.employeeName ?? "";
      const inTime = firstEntry?.inTime?.match(/\d{2}:\d{2}:\d{2}/)?.[0] ?? null;
      const resolvedPunches = String(firstEntry?.punches ?? "")
        .split(",")
        .map((entry: string) => entry.trim())
        .filter(Boolean);

      setBreakHours(resolvedBreakHours);
      setWorkHours(resolvedWorkHours);
      setEmployeeName(resolvedName);
      setLoginTime(inTime);
      setTodayPunches(resolvedPunches);

      if (resolvedName) {
        chrome.storage.local.set({ employeeName: resolvedName });
      }
    } catch (error) {
      console.error("Error fetching work-hour data:", error);
      setBreakHours("00:00:00");
      setWorkHours("00:00:00");
      setLoginTime(null);
      setTodayPunches([]);
    } finally {
      setIsLoading(false);
      setDataFetched(true);

      window.setTimeout(() => {
        setRefreshing(false);
      }, 650);
    }
  }, []);

  useEffect(() => {
    chrome.storage.local.get(["apiUrl", "apiHeaders", "showHalfDay"], (result) => {
      if (!result.apiUrl || !result.apiHeaders) {
        console.error("API URL or headers not found in storage.");
        setDataFetched(true);
        return;
      }

      setApiUrl(result.apiUrl);
      setAuthHeader(result.apiHeaders);
      setShowHalfDay(Boolean(result.showHalfDay));
      fetchWorkHours(result.apiUrl, result.apiHeaders);
    });
  }, [fetchWorkHours]);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const netWorkHours = useMemo(() => {
    return formatSecondsToClock(
      parseTimeToSeconds(workHours) - parseTimeToSeconds(breakHours),
    );
  }, [breakHours, workHours]);

  const workdayEndValue = useMemo(() => {
    const targetSeconds = showHalfDay ? HALF_DAY_SECONDS : FULL_DAY_SECONDS;
    const currentNetSeconds = parseTimeToSeconds(netWorkHours);

    if (currentNetSeconds >= targetSeconds) {
      return `Done @ ${getCompletionMessage(loginTime, breakHours, targetSeconds)}`;
    }

    return getCompletionMessage(loginTime, breakHours, targetSeconds);
  }, [breakHours, loginTime, netWorkHours, showHalfDay]);

  const motivation = useMemo(() => {
    if (!dataFetched || isLoading) {
      return "";
    }

    const index = parseTimeToSeconds(netWorkHours) % ENCOURAGEMENTS.length;
    return ENCOURAGEMENTS[index];
  }, [dataFetched, isLoading, netWorkHours]);

  const statItems = useMemo(
    () => [
      {
        icon: <LocalCafeRoundedIcon fontSize="small" />,
        label: "Break Hours",
        hint: "Time spent away from active work today.",
        value: breakHours,
        accentClass: "accent-teal",
      },
      {
        icon: <WorkHistoryRoundedIcon fontSize="small" />,
        label: "Total Work",
        hint: "Raw work hours currently reported by the source API.",
        value: workHours,
        accentClass: "accent-amber",
      },
      {
        icon: <BedtimeRoundedIcon fontSize="small" />,
        label: "Net Work",
        hint: "Total work hours minus break time.",
        value: netWorkHours,
        accentClass: "accent-coral",
      },
      {
        icon: <DirectionsRunRoundedIcon fontSize="small" />,
        label: "Exit Window",
        hint: showHalfDay
          ? "Estimated finish time for half-day mode."
          : "Estimated finish time for the standard workday.",
        value: workdayEndValue,
        accentClass: "accent-sky",
        compact: true,
      },
    ],
    [breakHours, netWorkHours, showHalfDay, workHours, workdayEndValue],
  );

  const handleHalfDayToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.checked;
    setShowHalfDay(nextValue);
    chrome.storage.local.set({ showHalfDay: nextValue });
  };

  const handleRefresh = () => {
    if (!isLoading && !refreshing && apiUrl && authHeader) {
      fetchWorkHours(apiUrl, authHeader);
    }
  };

  const punchTooltip = (
    <div className="punch-tooltip">
      <div className="punch-tooltip__divider" />
      <div className="punch-tooltip__stack">
        {todayPunches.length > 0 ? (
          todayPunches.map((entry) => (
            <div key={entry} className="punch-tooltip__entry">
              {entry}
            </div>
          ))
        ) : (
          <div className="punch-tooltip__entry muted">No punches yet</div>
        )}
      </div>
    </div>
  );

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} employeeName={employeeName} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="dashboard-shell"
    >
      <motion.div
        className="ambient-orb orb-left"
        animate={{ y: [-10, 14, -10], x: [0, 8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="ambient-orb orb-right"
        animate={{ y: [12, -18, 12], x: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <Card className="dashboard-card">
        <CardContent className="dashboard-content">
          <div className="hero-panel">
            <div className="hero-copy">
              <div className="eyebrow">
                <AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />
                <span>Daily Rhythm</span>
              </div>

              <Typography component="h1" className="hero-title">
                {employeeName ? `Hello, ${employeeName.split(" ")[0]}` : "Workday Pulse"}
              </Typography>

              <Typography className="hero-subtitle">
                Live work-hour tracking with cleaner signal, better hierarchy, and a little
                bit of attitude.
              </Typography>
            </div>

            <div className="hero-actions">
              <Tooltip title="Refresh live data" arrow>
                <motion.button
                  type="button"
                  className="refresh-button"
                  onClick={handleRefresh}
                  whileTap={{ scale: 0.96 }}
                  disabled={refreshing || isLoading}
                >
                  <motion.span
                    animate={{ rotate: refreshing ? 360 : 0 }}
                    transition={{
                      duration: 1.2,
                      ease: "linear",
                      repeat: refreshing ? Infinity : 0,
                    }}
                  >
                    <RefreshRoundedIcon fontSize="small" />
                  </motion.span>
                  <span>{refreshing ? "Syncing" : "Refresh"}</span>
                </motion.button>
              </Tooltip>
            </div>
          </div>

          <div className="status-row">
            <div className="status-chip">
              <LoginRoundedIcon sx={{ fontSize: 16 }} />
              <span>{loginTime ? `Logged in at ${loginTime}` : "Login time unavailable"}</span>
            </div>
            <div className="status-chip muted">
              <span>{showHalfDay ? "Half-Day Mode" : "Full-Day Mode"}</span>
              <Tooltip title={punchTooltip} arrow placement="top">
                <span className="punch-icon-button" aria-label="Show today's in and out times">
                  <ScheduleRoundedIcon sx={{ fontSize: 15 }} />
                </span>
              </Tooltip>
            </div>
          </div>

          <div className="stats-grid">
            {statItems.map((item) => (
              <StatCard
                key={item.label}
                icon={item.icon}
                label={item.label}
                hint={item.hint}
                value={item.value}
                loading={isLoading}
                accentClass={item.accentClass}
                compact={item.compact}
              />
            ))}
          </div>

          <div className="bottom-row">
            <FormControlLabel
              className="mode-toggle"
              control={
                <Switch
                  checked={showHalfDay}
                  onChange={handleHalfDayToggle}
                  color="default"
                  size="small"
                />
              }
              label="Half Day Mode"
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={motivation}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="motivation-note"
              >
                {motivation}
              </motion.div>
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default App;
