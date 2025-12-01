import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import WeekendIcon from '@mui/icons-material/Weekend';
import CelebrationIcon from '@mui/icons-material/Celebration';
import WavingHandIcon from '@mui/icons-material/WavingHand';

interface SplashScreenProps {
  onComplete: () => void;
  employeeName?: string;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, employeeName = "" }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const getFirstName = (fullName: string): string => {
    if (!fullName) return "";
    return fullName.split(' ')[0];
  };

  const getTimeBasedGreeting = (): string => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return "Good Morning";
    } else if (hour >= 12 && hour < 17) {
      return "Good Afternoon";
    } else if (hour >= 17 && hour < 21) {
      return "Good Evening";
    } else {
      return "Good Night";
    }
  };

  const getDaySpecificContent = () => {
    const today = new Date().getDay();
    const firstName = getFirstName(employeeName);
    const greeting = firstName ? `, ${firstName}` : "";
    const timeGreeting = getTimeBasedGreeting();
    switch (today) {
      case 1: // Monday
        return {
          icon: <WeekendIcon sx={{ fontSize: '2rem', color: '#4caf50' }} />,
          title: `${timeGreeting}${greeting}! 🌟`,
          subtitle: "Hope you had a wonderful weekend!",
          messages: [
            "Ready to conquer this Monday? 💪",
            "Fresh week, fresh opportunities! ⚡",
            "Let's make this week amazing! 🎯"
          ],
          gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        };

      case 5: // Friday
        return {
          icon: <CelebrationIcon sx={{ fontSize: '2rem', color: '#ff9800' }} />,
          title: `Happy Friday${greeting}! 🎉`,
          subtitle: "You've earned this weekend!",
          messages: [
            "TGIF! Time to celebrate! 🥳",
            "Weekend vibes loading... 🏖️",
            "You crushed this week! ✨"
          ],
          gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        };

      default:
        return {
          icon: <WavingHandIcon sx={{ fontSize: '2rem', color: '#2196f3' }} />,
          title: `Welcome back${greeting}! 👋`,
          subtitle: "Ready to track your productivity?",
          messages: [
            "Let's make today count! 🚀",
            "Your goals are waiting! ⏰",
            "Time to shine bright! ⭐"
          ],
          gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        };
    }
  };

  const content = getDaySpecificContent();

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % content.messages.length);
    }, 500);

    const splashTimeout = setTimeout(() => {
      onComplete();
    }, 550);

    return () => {
      clearInterval(messageInterval);
      clearTimeout(splashTimeout);
    };
  }, [content.messages.length, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.25 }}
    >
      <Card
        sx={{
          backgroundColor: '#f8f9fa',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          width: '500px',
          maxWidth: '400px',
          borderRadius: '12px',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          background: content.gradient,
          position: 'relative'
        }}
      >
        <CardContent sx={{ padding: '16px 20px', position: 'relative', zIndex: 2 }}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              zIndex: 1
            }}
          />

          <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center', color: 'white' }}>
            {/* Animated Icon */}
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              style={{ marginBottom: '12px', marginTop: '8px' }}
            >
              {content.icon}
            </motion.div>

            {/* Personalized Title */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  marginBottom: '8px',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  fontSize: '1.1rem'
                }}
              >
                {content.title}
              </Typography>
            </motion.div>

            {/* Show full name if available */}
            {employeeName && (
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.8,
                    fontSize: '0.75rem',
                    fontStyle: 'italic',
                    display: 'block',
                    marginBottom: '8px',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }}
                >
                  {employeeName}
                </Typography>
              </motion.div>
            )}

            {/* Subtitle */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <Typography
                variant="body2"
                sx={{
                  marginBottom: '16px',
                  opacity: 0.9,
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  fontSize: '0.9rem'
                }}
              >
                {content.subtitle}
              </Typography>
            </motion.div>

            {/* Rotating Messages */}
            <Box sx={{ height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMessageIndex}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontStyle: 'italic',
                      opacity: 0.8,
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                      fontSize: '0.8rem'
                    }}
                  >
                    {content.messages[currentMessageIndex]}
                  </Typography>
                </motion.div>
              </AnimatePresence>
            </Box>

            {/* Progress Bar */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{
                height: '2px',
                background: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '1px',
                overflow: 'hidden',
                marginTop: '8px'
              }}
            >
              <motion.div
                style={{
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '1px'
                }}
              />
            </motion.div>
          </Box>
        </CardContent>

        {/* Floating particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * 300,
              y: 200,
              opacity: 0
            }}
            animate={{
              y: -20,
              opacity: [0, 0.6, 0],
              x: Math.random() * 300
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: Math.random() * 1
            }}
            style={{
              position: 'absolute',
              width: '2px',
              height: '2px',
              background: 'rgba(255, 255, 255, 0.6)',
              borderRadius: '50%',
              pointerEvents: 'none',
              zIndex: 1
            }}
          />
        ))}
      </Card>
    </motion.div>
  );
};

export default SplashScreen;
