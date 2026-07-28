import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import BedtimeRoundedIcon from "@mui/icons-material/BedtimeRounded";
import LocalCafeRoundedIcon from "@mui/icons-material/LocalCafeRounded";
import WorkHistoryRoundedIcon from "@mui/icons-material/WorkHistoryRounded";
import DirectionsRunRoundedIcon from "@mui/icons-material/DirectionsRunRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import type { CSSProperties, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SportsEsportsRoundedIcon from "@mui/icons-material/SportsEsportsRounded";
import SplashScreen from "./SplashScreen";
import DinoGame from "./DinoGame";
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
  muted?: boolean;
}

const FULL_DAY_SECONDS = 8 * 3600 + 33 * 60;
const HALF_DAY_SECONDS = 4 * 3600 + 3 * 60;

const buildMessagePool = (parts: string[][], targetCount: number) => {
  const generatedMessages = parts.reduce<string[]>((accumulator, segment, segmentIndex) => {
    if (segmentIndex === 0) {
      return segment;
    }

    const nextMessages: string[] = [];

    accumulator.forEach((prefix) => {
      segment.forEach((suffix) => {
        nextMessages.push(`${prefix}${suffix}`);
      });
    });

    return nextMessages;
  }, []);

  return generatedMessages.slice(0, targetCount);
};

const FUN_MESSAGES = buildMessagePool(
  [
    [
      "Fun fact: Honey never spoils.",
      "Fun fact: Octopuses have three hearts.",
      "Fun fact: Bananas are berries but strawberries are not.",
      "Fun fact: Sharks are older than trees.",
      "Fun fact: A day on Venus is longer than its year.",
      "Fun fact: Wombats make cube-shaped poop.",
      "Fun fact: Clouds can weigh millions of pounds.",
      "Fun fact: Koalas sleep up to 20 hours.",
      "Fun fact: Sloths can hold their breath longer than dolphins.",
      "Fun fact: Pineapples take years to grow.",
      "Fun fact: Sea otters hold hands while sleeping.",
      "Fun fact: Cows have best friends.",
      "Fun fact: Space smells like burnt steak, according to astronauts.",
      "Fun fact: A group of flamingos is called a flamboyance.",
      "Fun fact: Some turtles breathe through their butts.",
      "Fun fact: The Eiffel Tower grows in summer heat.",
      "Fun fact: Popcorn was eaten thousands of years ago.",
      "Fun fact: A bolt of lightning is hotter than the sun's surface.",
      "Fun fact: There are more stars than grains of sand you can count.",
      "Fun fact: Penguins propose with pebbles.",
    ],
    [
      " Tumhara",
      " Aaj tumhara",
      " Meanwhile tumhara",
      " Fir bhi tumhara",
      " Aur idhar tumhara",
      " Side note: tumhara",
      " Reality check: tumhara",
      " Office edition: tumhara",
      " Plot twist: tumhara",
      " Is beech tumhara",
      " End result: tumhara",
      " Seedhi baat, tumhara",
    ],
    [
      " task list",
      " pending work",
      " Jira board",
      " attendance page",
      " focus meter",
      " productivity streak",
      " to-do column",
      " browser tab count",
      " work ethic",
      " coffee-powered momentum",
      " deadline tracker",
      " comeback plan",
    ],
    [
      " abhi bhi refresh ka wait kar raha hai.",
      " abhi bhi motivation ki parking me khada hai.",
      " abhi bhi loading screen se bahar nahi aaya.",
      " aise behave kar raha hai jaise weekend kal hi ho.",
      " kaam dekh ke halka sa emotional ho gaya hai.",
      " ab tak shortcut dhoondh raha hai.",
      " thoda sa aur push maang raha hai.",
      " drama zyada aur output thoda kam dikha raha hai.",
      " seedha bol raha hai ki boss, kaam pe wapas aa ja.",
      " quietly request bhej raha hai ki distractions band kar de.",
      " abhi bhi start button ko respect nahi de raha.",
      " kaafi time se bol raha hai ki bhai bas ek task finish kar le.",
    ],
  ],
  240,
);

const OPEN_COUNT_ROASTS = buildMessagePool(
  [
    [
      "Extension itni baar khol liya",
      "Popup ko phir se jaga diya",
      "Dashboard pe ek aur entry maar di",
      "Refresh button ka rishtedaar lag raha hai",
      "Aaj popup pe attendance laga raha hai",
      "Ye extension tumse zyada active ho gaya",
      "Phir aa gaye status check karne",
      "Ek aur heroic open register ho gaya",
      "Popup ne tumhe phir pehchan liya",
      "Zyada pyaar dashboard ko mil raha hai",
      "Daily visit counter khushiyon se ro raha hai",
      "Aaj bhi popup tumhara comfort zone ban gaya",
      "Itni checking toh airport security bhi nahi karti",
      "Counter bol raha hai bhai bas bhi karo",
      "Yeh open streak thoda suspicious lag raha hai",
      "Popup ko tumne personal therapist bana diya",
      "Dashboard se nazar hi nahi hat rahi",
      "Visit count ne ab sarcasm unlock kar liya",
      "Extension tumhari aankhon ka crush ban chuka hai",
      "Aaj ka inspection round phir complete hua",
    ],
    [
      ", aur",
      ", fir bhi",
      ", lekin",
      ", par sach yeh hai ki",
      ", aur office records ke mutabik",
      ", tab bhi",
      ", aur background me",
      ", magar asli scene yeh hai ki",
      ", aur meanwhile",
      ", fir result yeh nikla ki",
      ", aur honestly",
      ", seedhi report yeh keh rahi hai ki",
    ],
    [
      " salary yahan se download nahi hogi",
      " promotion print hokar popup se bahar nahi aayega",
      " task apne aap complete nahi hoga",
      " manager impress hone wala shortcut yahan nahi chhupa",
      " pending work stare contest se khatam nahi hota",
      " kaam ko sirf dekhne se progress bar nahi bharta",
      " deadline ko refresh se allergy nahi jaati",
      " browser devotion ko appraisal points nahi milte",
      " attendance page tumhe medal nahi degi",
      " yeh koi magic vending machine nahi hai",
      " open count ko achievement samajhna risky hobby hai",
      " output abhi bhi keyboard ke paas hi pada hai",
    ],
    [
      ".",
      ", boss.",
      ", champion.",
      ", mere bhai.",
      ", legend.",
      ", sher.",
      ", dost.",
      ", guru.",
      ", captain.",
      ", superstar.",
      ", explorer.",
      ", detective babu.",
    ],
  ],
  240,
);

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

const getTodayStorageDate = () => {
  return new Date().toLocaleDateString("en-CA");
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

const parsePunchTime = (entry: string, referenceDate = new Date()) => {
  const match = entry.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);

  if (!match) {
    return null;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3] ?? "0");
  const meridiem = match[4]?.toUpperCase();

  if ([hours, minutes, seconds].some(Number.isNaN)) {
    return null;
  }

  if (meridiem) {
    if (meridiem === "AM" && hours === 12) {
      hours = 0;
    } else if (meridiem === "PM" && hours < 12) {
      hours += 12;
    }
  }

  const parsedDate = new Date(referenceDate);
  parsedDate.setHours(hours, minutes, seconds, 0);
  return parsedDate;
};

const formatClockTime = (date: Date) => {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getCompletionMessageFromPunches = (
  punchEntries: string[],
  targetSeconds: number,
  loginTime: string | null,
  breakHours: string,
) => {
  const now = new Date();
  const punchTimes = punchEntries
    .map((entry) => parsePunchTime(entry, now))
    .filter((value): value is Date => value !== null)
    .sort((left, right) => left.getTime() - right.getTime());

  if (punchTimes.length === 0) {
    return getCompletionMessage(loginTime, breakHours, targetSeconds);
  }

  let accumulatedSeconds = 0;

  for (let index = 0; index < punchTimes.length; index += 2) {
    const punchIn = punchTimes[index];

    if (!punchIn) {
      break;
    }

    const punchOut = punchTimes[index + 1] ?? now;
    const intervalSeconds = Math.max(0, Math.floor((punchOut.getTime() - punchIn.getTime()) / 1000));

    if (accumulatedSeconds + intervalSeconds >= targetSeconds) {
      const secondsNeeded = targetSeconds - accumulatedSeconds;
      const completionTime = new Date(punchIn.getTime() + secondsNeeded * 1000);
      return formatClockTime(completionTime);
    }

    accumulatedSeconds += intervalSeconds;
  }

  const remainingSeconds = targetSeconds - accumulatedSeconds;
  const lastPunchTime = punchTimes[punchTimes.length - 1];
  const isCurrentlyWorking = punchTimes.length % 2 === 1;
  const projectedBaseTime = isCurrentlyWorking ? now : lastPunchTime;

  return formatClockTime(new Date(projectedBaseTime.getTime() + remainingSeconds * 1000));
};

const getBreakHint = (breakTime: string) => {
  const breakSeconds = parseTimeToSeconds(breakTime);
  const breakMinutes = Math.floor(breakSeconds / 60);

  if (breakSeconds === 0) {
    return "Abhi tak zero break. Discipline solid hai, bas burnout mode mat on kar dena.";
  }

  if (breakMinutes <= 10) {
    return `Sirf ${breakMinutes} min ka break hua hai. Quick recharge karke seedha grind pe wapas.`;
  }

  if (breakMinutes <= 20) {
    return `${breakMinutes} min ka breather liya hai. Balanced scene hai, na zyada saint na zyada tourist.`;
  }

  if (breakMinutes <= 30) {
    return `${breakMinutes} min break complete. Abhi tak sab control me hai, manager ko tension dene wali baat nahi.`;
  }

  if (breakMinutes <= 45) {
    return `${breakMinutes} min break ho gaya. Ab kaam bhi halka sa ping bhej raha hoga ki boss wapas aa jao.`;
  }

  if (breakMinutes <= 60) {
    return `${breakMinutes} min ka break thoda premium ho gaya. Coffee theek hai, mini vacation mat banao.`;
  }

  return `${breakMinutes} min break chal chuka hai. Itna break pel diya ki workday ab tumhe side-eye de raha hoga.`;
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
  muted = false,
}: StatCardProps) => (
  <Tooltip title={hint} arrow>
    <motion.div
      whileHover={{ y: -6, rotateX: 4, rotateY: compact ? -4 : 4 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className={`stat-card ${accentClass} ${muted ? "stat-card--muted" : ""}`}
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
  const [dailyOpenCount, setDailyOpenCount] = useState(1);
  const [customBackground, setCustomBackground] = useState("");
  const [showDinoGame, setShowDinoGame] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  useEffect(() => {
    chrome.storage.local.get(["customBackground"], (result) => {
      setCustomBackground(typeof result.customBackground === "string" ? result.customBackground : "");
    });
  }, []);

  useEffect(() => {
    const today = getTodayStorageDate();

    chrome.storage.local.get(["popupOpenDate", "popupOpenCount"], (result) => {
      const isSameDay = result.popupOpenDate === today;
      const nextOpenCount = isSameDay ? Number(result.popupOpenCount ?? 0) + 1 : 1;

      setDailyOpenCount(nextOpenCount);
      chrome.storage.local.set({
        popupOpenDate: today,
        popupOpenCount: nextOpenCount,
      });
    });
  }, []);

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
    const completionTime = getCompletionMessageFromPunches(
      todayPunches,
      targetSeconds,
      loginTime,
      breakHours,
    );

    if (currentNetSeconds >= targetSeconds) {
      return `Done @ ${completionTime}`;
    }

    return completionTime;
  }, [breakHours, loginTime, netWorkHours, showHalfDay, todayPunches]);

  const motivation = useMemo(() => {
    if (!dataFetched || isLoading) {
      return "";
    }

    if (dailyOpenCount > 5) {
      const roastIndex = (dailyOpenCount - 6) % OPEN_COUNT_ROASTS.length;
      return OPEN_COUNT_ROASTS[roastIndex];
    }

    const index = parseTimeToSeconds(netWorkHours) % FUN_MESSAGES.length;
    return FUN_MESSAGES[index];
  }, [dailyOpenCount, dataFetched, isLoading, netWorkHours]);

  const latestPunchEntry = useMemo(() => {
    return todayPunches.length > 0 ? todayPunches[todayPunches.length - 1] : "No punch activity yet";
  }, [todayPunches]);

  const customCardStyle = useMemo<CSSProperties | undefined>(() => {
    if (!customBackground) {
      return undefined;
    }

    return {
      "--custom-card-background":
        `linear-gradient(180deg, rgba(7, 11, 18, 0.48), rgba(7, 11, 18, 0.72)), url(${customBackground})`,
    } as CSSProperties;
  }, [customBackground]);

  const statItems = useMemo(
    () => [
      {
        icon: <LocalCafeRoundedIcon fontSize="small" />,
        label: "Break Hours",
        hint: getBreakHint(breakHours),
        value: breakHours,
        accentClass: "accent-teal",
      },
      {
        icon: <WorkHistoryRoundedIcon fontSize="small" />,
        label: "Total Work",
        hint: "Yeh total ghante hain, pura hisaab kitab yahin pada hai, koi chutiyapa nahi.",
        value: workHours,
        accentClass: "accent-amber",
      },
      {
        icon: <BedtimeRoundedIcon fontSize="small" />,
        label: "Net Work",
        hint: "Asli me itna kaam thoka, baaki time toh pakka bakchodi me uda diya.",
        value: netWorkHours,
        accentClass: "accent-coral",
      },
      {
        icon: <DirectionsRunRoundedIcon fontSize="small" />,
        label: "Exit Window",
        hint: showHalfDay
          ? "Half day me kab kat lega, uska jugaad yahin ready pada hai boss."
          : "Kab office se gaand bacha ke nikal sakta hai, woh timing yahin chipki hai.",
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

  const handleBackgroundPicker = () => {
    fileInputRef.current?.click();
  };

  const handleBackgroundChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageDataUrl = typeof reader.result === "string" ? reader.result : "";

      setCustomBackground(imageDataUrl);
      chrome.storage.local.set({ customBackground: imageDataUrl });
    };
    reader.readAsDataURL(file);

    event.target.value = "";
  };

  const handleBackgroundReset = () => {
    setCustomBackground("");
    chrome.storage.local.remove("customBackground");
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

      <Card
        className={`dashboard-card ${customBackground ? "dashboard-card--custom-bg" : ""}`}
        style={customCardStyle}
      >
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
            </div>

            <div className="hero-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="background-input"
                onChange={handleBackgroundChange}
              />
              <div className="background-actions">
                <Tooltip title="Choose a custom background image" arrow>
                  <motion.button
                    type="button"
                    className="icon-action-button"
                    onClick={handleBackgroundPicker}
                    whileTap={{ scale: 0.96 }}
                  >
                    <ImageRoundedIcon fontSize="small" />
                  </motion.button>
                </Tooltip>
                <Tooltip title="Reset to the default background" arrow>
                  <motion.button
                    type="button"
                    className="icon-action-button"
                    onClick={handleBackgroundReset}
                    whileTap={{ scale: 0.96 }}
                    disabled={!customBackground}
                  >
                    <RestartAltRoundedIcon fontSize="small" />
                  </motion.button>
                </Tooltip>
              </div>
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
            <div className="latest-punch-banner">
              <span className="latest-punch-banner__label">Latest Punch</span>
              <span className="latest-punch-banner__value">{latestPunchEntry}</span>
            </div>
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
                muted={Boolean(customBackground)}
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

            <button
              type="button"
              className="game-launch-button"
              onClick={() => setShowDinoGame(true)}
            >
              <SportsEsportsRoundedIcon sx={{ fontSize: 16 }} />
              <span>Play Dino</span>
            </button>

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

        <AnimatePresence>
          {showDinoGame && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 6 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <DinoGame onClose={() => setShowDinoGame(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

export default App;
