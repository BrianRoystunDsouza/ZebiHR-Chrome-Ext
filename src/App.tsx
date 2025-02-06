import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, Typography, Grid } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

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
    // Get the stored API data
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
console.log("time",{time1,time2});

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
  
    // Convert HH:mm:ss to total seconds
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
      // Pick a random funny comment
      return funnyComments[Math.floor(Math.random() * funnyComments.length)];
    }
  
    return "";
  };
  
  return (
    <Card sx={{ margin: '20px auto', backgroundColor: '#f4f6f8' }}>
      <CardContent>
        <Typography color="info" variant="h5" component="div" gutterBottom align="center">
          Break Timing
          <RefreshIcon onClick={() => !isLoading ? fetchWorkHours(apiUrl, authHeader) : console.log("wait")
          } style={{ cursor: 'pointer', marginLeft: '30px' }} />
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="body1" color="textSecondary">
              Break Hours:
            </Typography>
            <Typography variant="body1">
              {isLoading ? "Loading" : breakHours || 'No hours available'}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1" color="textSecondary">
              Total Work Hours:
            </Typography>
            <Typography variant="body1">
              {isLoading ? "Loading" : workHours || 'No hours available'}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1" color="textSecondary">
              Net Work Hours:
            </Typography>
            <Typography variant="body1">
              {isLoading ? "Loading" : subtractTimes(workHours, breakHours) || 'No hours available'}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography sx={{fontSize:11}} color="textSecondary">
              {isLoading ? "Loading" : getFunnyWorkHourComment()}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
export default App;