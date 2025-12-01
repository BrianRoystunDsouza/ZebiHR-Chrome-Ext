import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, Typography, Grid, Switch, FormControlLabel, CircularProgress, Fade, Grow } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TimerIcon from '@mui/icons-material/Timer';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import WorkIcon from '@mui/icons-material/Work';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import { motion, AnimatePresence } from "framer-motion";
import Tooltip from '@mui/material/Tooltip';
import SplashScreen from './SplashScreen';
import './App.css'
interface RollingNumberProps {
  value: string;
}

const RollingNumber = ({ value }: RollingNumberProps) => {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={value}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 10, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{
          fontSize: "1.1em",
          lineHeight: "1em",
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600
        }}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
};

function App() {
  const [breakHours, setBreakHours] = useState("");
  const [workHours, setWorkHours] = useState("");
  const [authHeader, setAuthHeader] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHalfDay, setShowHalfDay] = useState(false);
  const [loginTime, setLoginTime] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [employeeName, setEmployeeName] = useState<string>("");

  const getTodayTimestamps = () => {
    const now = new Date();

    const startOfDay = new Date(now.setHours(0, 0, 0, 0)).getTime();

    const endOfDay = new Date(now.setHours(23, 59, 59, 999)).getTime();

    return { startOfDay, endOfDay };
  };

  const fetchWorkHours = useCallback((url: string, header: string): void => {
    setIsLoading(true);
    setRefreshing(true);
    const empIDMatch = url.match(/employee\/(\d+)\//);
    if (!empIDMatch) {
      console.warn("Invalid URL format: Employee ID not found.");
      setIsLoading(false);
      setRefreshing(false);
      return;
    }

    const empID = empIDMatch[1];
    const baseUrl = `https://synergyapi.helixbeat.com/customer/238/employee/${empID}`;

    const headers = {
      'Authorization': header,
      'Content-Type': 'application/json;charset=UTF-8'
    };
    const { startOfDay, endOfDay } = getTodayTimestamps();
    const params = new URLSearchParams({
      employeeId: empID,
      startDate: startOfDay.toString(),
      endDate: endOfDay.toString(),
      isEmployee: "true"
    }).toString();

    const breakTimeUrl = `${baseUrl}/break-time?${params}`;
    const workHoursUrl = `${baseUrl}/today-work-hrs`;
    // const loginTimeUrl = `${baseUrl}/attendance?${params}`;

    Promise.all([
      fetch(breakTimeUrl, { method: 'GET', headers })
        .then(response => response.json())
        .then(data => {
          if (data[0]?.breakHrs) setBreakHours(data[0].breakHrs);
          if (data[0]?.employeeName) {
            setEmployeeName(data[0].employeeName);
            // Store in chrome storage for splash screen
            chrome.storage.local.set({ employeeName: data[0].employeeName });
          }
          if (data && data.length > 0 && data[0].inTime) {

            const inTimeStr = data[0].inTime;
            const timeMatch = inTimeStr.match(/\d{2}:\d{2}:\d{2}/);

            if (timeMatch) {
              setLoginTime(timeMatch[0]);
            }
          }
        }),

      fetch(workHoursUrl, { method: 'GET', headers })
        .then(response => response.json())
        .then(data => {
          if (data?.workHrs) setWorkHours(data.workHrs);
        }),
    ])
      .catch(error => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setIsLoading(false);
        setDataFetched(true);

        setTimeout(() => {
          setRefreshing(false);
        }, 600);
      });
  }, []);

  useEffect(() => {
    chrome.storage.local.get(['apiUrl', 'apiHeaders', 'showHalfDay'], (result) => {
      if (!result.apiUrl || !result.apiHeaders) {
        console.error("API URL or headers not found in storage.");
        return;
      }
      setAuthHeader(result.apiHeaders);
      setApiUrl(result.apiUrl);
      if (result.showHalfDay !== undefined) {
        setShowHalfDay(result.showHalfDay);
      }
      fetchWorkHours(result.apiUrl, result.apiHeaders);
    });
  }, [fetchWorkHours]);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} employeeName={employeeName} />;
  }


  const subtractTimes = (time1: string, time2: string): string => {
    const timeToSeconds = (time: string): number => {
      const [hh, mm, ss] = time.split(":").map(Number);
      return hh * 3600 + mm * 60 + ss;
    };

    const seconds1 = timeToSeconds(time1);
    const seconds2 = timeToSeconds(time2);

    let diffInSeconds = seconds1 - seconds2;
    if (diffInSeconds < 0) {
      diffInSeconds = 0;
    }

    const formatTime = (totalSeconds: number): string => {
      const hh = Math.floor(totalSeconds / 3600);
      const mm = Math.floor((totalSeconds % 3600) / 60);
      const ss = totalSeconds % 60;
      return [hh, mm, ss].map(unit => String(unit).padStart(2, "0")).join(":");
    };

    return formatTime(diffInSeconds);
  };

  const getFunnyWorkHourComment = (): string => {
    const maxWorkHours = subtractTimes(workHours, breakHours);

    const timeToSeconds = (time: string): number => {
      const [hh, mm, ss] = time.split(":").map(Number);
      return hh * 3600 + mm * 60 + ss;
    };

    const workSeconds = timeToSeconds(workHours);
    const maxSeconds = timeToSeconds(maxWorkHours);
    const funnyComments = [
      "Whoa! You working overtime or saving the world? 🦸‍♂️",
      "You deserve a raise… or at least a coffee! ☕",
      "Are you sure you're not stuck in a time loop? ⏳😂",
      "Somebody give this person a vacation! 🏖️",
      "Workaholic mode: ACTIVATED! 🚀",
      "Does your chair have a glue trap? Time to escape! 😆",
      "You're making the rest of us look bad! Slow down! 😜",
      "Enough work for today! Your keyboard needs a break too! ⌨️💨",
      "Boss Level Unlocked: Ultimate Workaholic! 🏆",
      "Code, sleep, repeat? More like work, work, work! 😅",
      "At this rate, you'll own the company soon! 🏢😂",
      "Hey, even robots take breaks! 🤖💤",
      "Your keyboard is overheating! 🚨🔥",
      "Workaholic alert! Someone needs to unplug you! 🛑😂",
      "Are you farming XP in real life? 🎮🤣",
      "I see you're training for the Work Marathon! 🏃‍♂️💨",
      "Go home! Your desk misses you, but your bed misses you more! 🛏️💤",
      "If work were a sport, you'd be MVP! 🏅😂",
      "You're setting a new office record! 🏆👏",
      "Your manager just fainted seeing your hours! 😂",
      "Time to file a missing person report… for your social life! 📢",
      "Careful! HR might start charging you rent for that chair! 😆",
      "I hope your company gives loyalty points for this! 💰",
      "Work-life balance? Never heard of it! 😂",
      "Someone get this person an **extra** lunch break! 🍔🍟"
    ];

    if (workSeconds < maxSeconds) {
      return funnyComments[Math.floor(Math.random() * funnyComments.length)];
    } else if (calculateWorkdayEndTime(workHours, breakHours).includes("You can clock out now")) {
      return funnyComments[Math.floor(Math.random() * funnyComments.length)];
    }

    return "";
  };

  const WorkHoursDisplay = ({ isLoading, workHours, isEndTime }: { isLoading: boolean; workHours: string; isEndTime: boolean }) => {
    if (isLoading) return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '24px' }}>
        <CircularProgress size={20} thickness={5} />
      </div>
    );

    if (!workHours || workHours.includes("Invalid") || workHours.includes("NaN")) {
      return <Typography variant="body1">No data available</Typography>;
    }

    if (workHours.includes("You can clock out now")) {
      const timeMatch = workHours.match(/\(Since (.*?)\)/);
      const clockOutTime = timeMatch ? timeMatch[1] : "";

      return (
        <Tooltip
          title={`You completed your ${showHalfDay ? 'half-day' : 'full-day'} hours at ${clockOutTime}`}
          arrow
        >
          <Typography
            variant="body1"
            sx={{
              color: '#4caf50',
              fontWeight: 'bold',
              animation: 'pulse 1.5s infinite'
            }}
          >
            {clockOutTime ? `Done @ ${clockOutTime}` : 'Clock out now! 🎉'}
          </Typography>
        </Tooltip>
      );
    }

    const [hh, mm, ss] = workHours.split(":");

    return (
      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
        {
          isEndTime ?
            <>
              <RollingNumber value={hh} /> : <RollingNumber value={mm} />
            </>
            :
            <>
              <RollingNumber value={hh} /> : <RollingNumber value={mm} /> : <RollingNumber value={ss} />
            </>
        }
      </Typography>
    );
  };

  const calculateWorkdayEndTime = (workHours: string, breakHours: string): string => {
    if (!loginTime) return "Login time unknown";

    const targetWorkSeconds = 8 * 3600 + 33 * 60; // 8:33:00
    const halfDayTargetSeconds = 4 * 3600 + 3 * 60; // 4:03:00
    const targetSeconds = showHalfDay ? halfDayTargetSeconds : targetWorkSeconds;

    const timeToSeconds = (time: string): number => {
      const [hh, mm, ss] = time.split(":").map(Number);
      return hh * 3600 + mm * 60 + ss;
    };

    // Get login time as base
    const [hours, minutes, seconds] = loginTime.split(':').map(Number);
    const loginDate = new Date();
    loginDate.setHours(hours, minutes, seconds);

    // Calculate current net work (work hours - break hours)
    const currentNetSeconds = timeToSeconds(subtractTimes(workHours, breakHours));
    const remainingWorkSeconds = targetSeconds - currentNetSeconds;

    if (remainingWorkSeconds <= 0) {
      // For completed work hours, show actual completion time
      const completionTime = new Date(
        loginDate.getTime() +
        targetSeconds * 1000 +
        timeToSeconds(breakHours) * 1000
      );

      const formattedClockOutTime = completionTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      return `You can clock out now! (Since ${formattedClockOutTime})`;
    }

    // For estimated end time, use target hours
    const estimatedEndTime = new Date(
      loginDate.getTime() +
      targetSeconds * 1000 +
      timeToSeconds(breakHours) * 1000
    );

    return estimatedEndTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };


  // const calculateHalfDayEndTime = (): string => {
  //   if (!loginTime) return "Login time unknown";

  //   const [hours, minutes, seconds] = loginTime.split(':').map(Number);

  //   const loginDate = new Date();
  //   loginDate.setHours(hours, minutes, seconds);

  //   // Keep this as 4:03 since half day is correct
  //   const halfDayEndDate = new Date(loginDate.getTime() + (4 * 60 * 60 * 1000) + (3 * 60 * 1000));

  //   return halfDayEndDate.toLocaleTimeString('en-US', {
  //     hour: '2-digit',
  //     minute: '2-digit',
  //     hour12: true
  //   });
  // };


  const handleHalfDayToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setShowHalfDay(newValue);
    chrome.storage.local.set({ showHalfDay: newValue });
  };

  const handleRefresh = () => {
    if (!isLoading && !refreshing) {
      fetchWorkHours(apiUrl, authHeader);
    }
  };


  return (
    <Grow in={true} timeout={500}>
      <Card
        sx={{
          backgroundColor: '#f8f9fa',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          width: '500px',
          maxWidth: '400px',
          borderRadius: '12px',
          overflow: 'hidden',
          transition: 'all 0.3s ease'
        }}
      >
        <CardContent sx={{ padding: '16px 20px' }}>
          <Typography
            color="primary"
            variant="h5"
            component="div"
            gutterBottom
            sx={{
              position: 'relative',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}
          >
            <AccessTimeIcon sx={{ marginRight: '8px', fontSize: '1.2em' }} />
            <span>Work Hours Summary</span>
            <motion.div
              animate={{ rotate: refreshing ? 360 : 0 }}
              transition={{ duration: 1, ease: "easeInOut", repeat: refreshing ? Infinity : 0 }}
              style={{
                position: 'absolute',
                right: 0,
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            >
            </motion.div>
            <Tooltip title="Refresh Data">
              <RefreshIcon
                onClick={handleRefresh}
                color={refreshing ? "disabled" : "primary"}
                style={{
                  marginLeft: '10px',
                  cursor: refreshing ? 'default' : 'pointer',
                  opacity: refreshing ? 0.6 : 1
                }}
              />
            </Tooltip>
          </Typography>

          <Grid container spacing={2} sx={{ marginTop: '10px' }}>
            <Tooltip
              title="🍵 Chill Maarne Ka Time"
              placement="top"
              arrow
              enterDelay={500}
            >
              <Grid
                item
                xs={6}
                sx={{
                  textAlign: 'center',
                  borderRight: '1px solid rgba(0,0,0,0.08)',
                  borderBottom: '1px solid rgba(0,0,0,0.08)',
                  padding: '16px 8px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.02)'
                  }
                }}
              >
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px',
                    fontSize: '0.85rem'
                  }}
                >
                  <LocalCafeIcon sx={{ fontSize: '1rem', marginRight: '4px' }} />
                  Break Hours
                </Typography>
                <Fade in={dataFetched} timeout={800}>
                  <div>
                    <WorkHoursDisplay isLoading={isLoading} workHours={breakHours} isEndTime={false} />
                  </div>
                </Fade>
              </Grid>
            </Tooltip>

            <Tooltip
              title="💪 Mehnat Ka Total Hisaab"
              placement="top"
              arrow
              enterDelay={500}
            >
              <Grid
                item
                xs={6}
                sx={{
                  textAlign: 'center',
                  borderBottom: '1px solid rgba(0,0,0,0.08)',
                  padding: '16px 8px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.02)'
                  }
                }}
              >
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px',
                    fontSize: '0.85rem'
                  }}
                >
                  <TimerIcon sx={{ fontSize: '1rem', marginRight: '4px' }} />
                  Total Work Hours
                </Typography>
                <Fade in={dataFetched} timeout={800}>
                  <div>
                    <WorkHoursDisplay isLoading={isLoading} workHours={workHours} isEndTime={false} />
                  </div>
                </Fade>
              </Grid>
            </Tooltip>

            <Tooltip
              title="📈 Salary Waala Time"
              placement="bottom"
              arrow
              enterDelay={500}
            >
              <Grid
                item
                xs={6}
                sx={{
                  textAlign: 'center',
                  borderRight: '1px solid rgba(0,0,0,0.08)',
                  padding: '16px 8px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.02)'
                  }
                }}
              >
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px',
                    fontSize: '0.85rem'
                  }}
                >
                  <WorkIcon sx={{ fontSize: '1rem', marginRight: '4px' }} />
                  Net Work Hours
                </Typography>
                <Fade in={dataFetched} timeout={800}>
                  <div>
                    <WorkHoursDisplay isLoading={isLoading} workHours={subtractTimes(workHours, breakHours)} isEndTime={false} />
                  </div>
                </Fade>
              </Grid>
            </Tooltip>

            <Tooltip
              title={showHalfDay ? "🏃 Half Day Bhaag Time" : "🏃 Bhaag DK Bose Time"}
              placement="bottom"
              arrow
              enterDelay={500}
            >
              <Grid
                item
                xs={6}
                sx={{
                  textAlign: 'center',
                  padding: '16px 8px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.02)'
                  }
                }}
              >
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px',
                    fontSize: '0.85rem'
                  }}
                >
                  <DirectionsRunIcon sx={{ fontSize: '1rem', marginRight: '4px' }} />
                  Workday End Time
                </Typography>
                <Fade in={dataFetched} timeout={800}>
                  <div>
                    <WorkHoursDisplay isLoading={isLoading} workHours={calculateWorkdayEndTime(workHours, breakHours)} isEndTime={true} />
                  </div>
                </Fade>
              </Grid>
            </Tooltip>

            <Grid
              item
              xs={12}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '8px',
                padding: '0 16px'
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={showHalfDay}
                      onChange={handleHalfDayToggle}
                      color="primary"
                      size="small"
                    />
                  }
                  label={
                    <Tooltip
                      title={loginTime ? `login time: ${loginTime}` : "Login time not available"}
                      arrow
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        Half Day Mode
                        {/* {showHalfDay && loginTime && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            style={{ marginLeft: '4px', color: '#1976d2' }}
                          >
                            (End: {calculateHalfDayEndTime()})
                          </motion.span>
                        )} */}
                      </Typography>
                    </Tooltip>
                  }
                  sx={{ marginTop: 1, marginBottom: 1 }}
                />
              </motion.div>
            </Grid>

            <Grid item xs={12}>
              <Fade in={!isLoading && dataFetched} timeout={1000}>
                <Typography
                  sx={{
                    fontSize: 11,
                    textAlign: 'center',
                    fontStyle: 'italic',
                    color: 'text.secondary',
                    marginTop: '4px',
                    animation: 'fadeIn 1s'
                  }}
                >
                  {isLoading ? "" : getFunnyWorkHourComment()}
                </Typography>
              </Fade>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Grow>
  );
}

export default App;

