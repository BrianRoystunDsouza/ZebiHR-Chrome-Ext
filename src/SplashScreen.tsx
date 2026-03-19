import { useEffect, useMemo, useState } from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import WbSunnyRoundedIcon from "@mui/icons-material/WbSunnyRounded";
import CelebrationRoundedIcon from "@mui/icons-material/CelebrationRounded";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import "./SplashScreen.css";

interface SplashScreenProps {
  onComplete: () => void;
  employeeName?: string;
}

const getFirstName = (fullName: string) => {
  if (!fullName) {
    return "";
  }

  return fullName.trim().split(" ")[0];
};

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Good Morning";
  }

  if (hour >= 12 && hour < 17) {
    return "Good Afternoon";
  }

  if (hour >= 17 && hour < 21) {
    return "Good Evening";
  }

  return "Good Night";
};

const SplashScreen = ({ onComplete, employeeName = "" }: SplashScreenProps) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const content = useMemo(() => {
    const day = new Date().getDay();
    const firstName = getFirstName(employeeName);
    const suffix = firstName ? `, ${firstName}` : "";

    if (day === 1) {
      return {
        icon: <RocketLaunchRoundedIcon sx={{ fontSize: 28 }} />,
        title: `${getGreeting()}${suffix}`,
        subtitle: "Fresh week. Fresh runway.",
        messages: [
          "Monday can still look sharp.",
          "Let us turn momentum back on.",
          "The dashboard is lining everything up.",
        ],
      };
    }

    if (day === 5) {
      return {
        icon: <CelebrationRoundedIcon sx={{ fontSize: 28 }} />,
        title: `Happy Friday${suffix}`,
        subtitle: "Finish the week with style.",
        messages: [
          "You made it to the final stretch.",
          "Keep the pace clean and light.",
          "Weekend energy is almost unlocked.",
        ],
      };
    }

    return {
      icon: <WbSunnyRoundedIcon sx={{ fontSize: 28 }} />,
      title: `${getGreeting()}${suffix}`,
      subtitle: "Your workday pulse is loading.",
      messages: [
        "Syncing today's rhythm.",
        "Pulling your latest hours.",
        "Getting your workspace ready.",
      ],
    };
  }, [employeeName]);

  useEffect(() => {
    const messageInterval = window.setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % content.messages.length);
    }, 650);

    const splashTimeout = window.setTimeout(() => {
      onComplete();
    }, 1250);

    return () => {
      window.clearInterval(messageInterval);
      window.clearTimeout(splashTimeout);
    };
  }, [content.messages.length, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="splash-shell"
    >
      <motion.div
        className="splash-orb splash-orb-left"
        animate={{ y: [-8, 10, -8], x: [0, 8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="splash-orb splash-orb-right"
        animate={{ y: [10, -12, 10], x: [0, -8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <Card className="splash-card">
        <CardContent className="splash-content">
          <div className="splash-badge">
            <AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />
            <span>ZebiHR Flow</span>
          </div>

          <motion.div
            className="splash-icon"
            animate={{ rotateY: [0, 10, -10, 0], y: [0, -4, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          >
            {content.icon}
          </motion.div>

          <Typography className="splash-title">{content.title}</Typography>
          <Typography className="splash-subtitle">{content.subtitle}</Typography>

          {employeeName && <Typography className="splash-name">{employeeName}</Typography>}

          <Box className="splash-message-row">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMessageIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28 }}
              >
                <Typography className="splash-message">
                  {content.messages[currentMessageIndex]}
                </Typography>
              </motion.div>
            </AnimatePresence>
          </Box>

          <div className="splash-progress">
            <motion.div
              className="splash-progress__bar"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.05, ease: "easeInOut" }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SplashScreen;
