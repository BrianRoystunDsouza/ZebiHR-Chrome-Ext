import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, Typography, Grid } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { motion } from "framer-motion";

interface RollingNumberProps {
  value: string;
}

const RollingNumber = ({ value }: RollingNumberProps) => {
  return (
    <motion.span
      key={value}
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 10, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{ fontSize: "0.9em", lineHeight: "1em", fontFamily: "'Inter', sans-serif" }}
    >
      {value}
    </motion.span>
  );
};

function App() {
  const [breakHours, setBreakHours] = useState("");
  const [workHours, setWorkHours] = useState("");
  const [authHeader, setAuthHeader] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchWorkHours = useCallback((url: string, header: string): void => {
    setIsLoading(true)
    const empIDMatch = url.match(/employee\/(\d+)\//);
    if (!empIDMatch) {
      console.warn("Invalid URL format: Employee ID not found.");
      return;
    }

    const empID = empIDMatch[1];

    const baseUrl = `https://api.zebihr.com/customer/238/employee/${empID}`;

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

    Promise.all([
      fetch(breakTimeUrl, { method: 'GET', headers })
        .then(response => response.json())
        .then(data => {
          console.log("Break Time API Response:", data);
          if (data[0]?.breakHrs) setBreakHours(data[0].breakHrs);
        }),

      fetch(workHoursUrl, { method: 'GET', headers })
        .then(response => response.json())
        .then(data => {
          console.log("Work Hour API Response:", data);
          if (data?.workHrs) setWorkHours(data.workHrs);
        })
    ])
      .catch(error => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });


  }, []);

  useEffect(() => {
    chrome.storage.local.get(['apiUrl', 'apiHeaders'], (result) => {
      setAuthHeader(result.apiHeaders);
      setApiUrl(result.apiUrl);
      fetchWorkHours(result.apiUrl, result.apiHeaders);
    });
  }, [fetchWorkHours]);

  const getTodayTimestamps = () => {
    const now = new Date();

    // Start of the day (00:00:00)
    const startOfDay = new Date(now.setHours(0, 0, 0, 0)).getTime();

    // End of the day (23:59:59)
    const endOfDay = new Date(now.setHours(23, 59, 59, 999)).getTime();

    return { startOfDay, endOfDay };
  };

  const subtractTimes = (time1: string, time2: string): string => {
    const timeToSeconds = (time: string): number => {
      const [hh, mm, ss] = time.split(":").map(Number);
      return hh * 3600 + mm * 60 + ss;
    };
    console.log("time", { time1, time2 });

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

    const FormatedTime = formatTime(diffInSeconds);
    return FormatedTime
  };

  const getFunnyWorkHourComment = (): string => {
    const maxWorkHours = subtractTimes(workHours, breakHours);

    const timeToSeconds = (time: string): number => {
      const [hh, mm, ss] = time.split(":").map(Number);
      return hh * 3600 + mm * 60 + ss;
    };

    const workSeconds = timeToSeconds(workHours);
    const maxSeconds = timeToSeconds(maxWorkHours);

    if (workSeconds < maxSeconds) {
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
        "At this rate, you’ll own the company soon! 🏢😂",
        "Hey, even robots take breaks! 🤖💤",
        "Your keyboard is overheating! 🚨🔥",
        "Workaholic alert! Someone needs to unplug you! 🛑😂",
        "Are you farming XP in real life? 🎮🤣",
        "I see you’re training for the Work Marathon! 🏃‍♂️💨",
        "Go home! Your desk misses you, but your bed misses you more! 🛏️💤",
        "If work were a sport, you'd be MVP! 🏅😂",
        "You’re setting a new office record! 🏆👏",
        "Your manager just fainted seeing your hours! 😂",
        "Time to file a missing person report… for your social life! 📢",
        "Careful! HR might start charging you rent for that chair! 😆",
        "I hope your company gives loyalty points for this! 💰",
        "Work-life balance? Never heard of it! 😂",
        "Someone get this person an **extra** lunch break! 🍔🍟"
      ];
      return funnyComments[Math.floor(Math.random() * funnyComments.length)];
    }

    return "";
  };

  const WorkHoursDisplay = ({ isLoading, workHours, isEndTime }: { isLoading: boolean; workHours: string; isEndTime: boolean }) => {
    if (isLoading) return <Typography variant="body1">Loading...</Typography>;
    if (!workHours) return <Typography variant="body1">No hours available</Typography>;

    const [hh, mm, ss] = workHours.split(":");

    return (
      <Typography variant="body1">
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
    const targetWorkSeconds = 8 * 3600 + 30 * 60; // 8:30:00 in seconds
    const timeToSeconds = (time: string): number => {
      const [hh, mm, ss] = time.split(":").map(Number);
      return hh * 3600 + mm * 60 + ss;
    };

    const currentNetSeconds = timeToSeconds(subtractTimes(workHours, breakHours));
    const remainingSeconds = targetWorkSeconds - currentNetSeconds;

    if (remainingSeconds <= 0) {
      return "You can clock out now!";
    }

    const now = new Date();
    const endTime = new Date(now.getTime() + remainingSeconds * 1000);
    return endTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Card sx={{ margin: '20px auto', backgroundColor: '#f4f6f8', boxShadow: 'none', width: '500px', maxWidth: '400px' }}>

      <CardContent>
        <Typography color="info" variant="h5" component="div" gutterBottom sx={{ position: 'relative' }}>
          <RefreshIcon
            onClick={() => !isLoading ? fetchWorkHours(apiUrl, authHeader) : console.log("wait")}
            style={{
              cursor: 'pointer',
              position: 'absolute',
              right: 0,
              top: 0,
              transform: 'translateY(-50%)'
            }}
          />
          <span style={{ width: '100%', textAlign: 'center', display: 'block' }}>
            Work Hours Summary
          </span>
        </Typography>

        <Grid container spacing={2} sx={{ marginTop: '10px' }}>
          <Grid item xs={6} sx={{ textAlign: 'center', borderRight: '1px solid #ccc' , borderBottom: '1px solid #ccc' }}>
            <Typography variant="body1" color="textSecondary">
              Break Hours
            </Typography>
            <WorkHoursDisplay isLoading={isLoading} workHours={breakHours} isEndTime={false} />
          </Grid>
          <Grid item xs={6} sx={{ textAlign: 'center' , borderBottom: '1px solid #ccc' }}>
            <Typography variant="body1" color="textSecondary">
              Total Work Hours
            </Typography>
            <WorkHoursDisplay isLoading={isLoading} workHours={workHours} isEndTime={false} />
          </Grid>

          <Grid item xs={6} sx={{ textAlign: 'center' , borderRight: '1px solid #ccc' }}>
            <Typography variant="body1" color="textSecondary">
              Net Work Hours
            </Typography>
            <WorkHoursDisplay isLoading={isLoading} workHours={subtractTimes(workHours, breakHours)} isEndTime={false} />
          </Grid>
          <Grid item xs={6} sx={{ textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              Workday End Time
            </Typography>
            <WorkHoursDisplay isLoading={isLoading} workHours={calculateWorkdayEndTime(workHours, breakHours)} isEndTime={true} />
          </Grid>

          <Grid item xs={12}>
            <Typography sx={{ fontSize: 11 }} color="textSecondary">
              {isLoading ? "Loading" : getFunnyWorkHourComment()}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
export default App;