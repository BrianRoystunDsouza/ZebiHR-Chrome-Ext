import { useEffect, useRef, useState } from "react";
import "./DinoGame.css";

const STORAGE_KEY = "zebihr-dino-high-score";
const GAME_WIDTH = 340;
const GAME_HEIGHT = 160;
const GROUND_Y = 124;
const DINO_X = 40;
const DINO_WIDTH = 28;
const DINO_HEIGHT = 34;
const GRAVITY = 0.88;
const JUMP_FORCE = 12.8;

type Obstacle = {
  id: number;
  x: number;
  width: number;
  height: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const readHighScore = () => {
  const parsed = Number(localStorage.getItem(STORAGE_KEY) ?? "0");
  return Number.isFinite(parsed) ? parsed : 0;
};

interface DinoGameProps {
  onClose: () => void;
}

function DinoGame({ onClose }: DinoGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const obstacleIdRef = useRef(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => readHighScore());
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  const gameStateRef = useRef({
    dinoY: GROUND_Y - DINO_HEIGHT,
    velocityY: 0,
    obstacleSpeed: 5.6,
    scoreValue: 0,
    cloudOffset: 0,
    groundOffset: 0,
    gameOverValue: false,
    startedValue: false,
    obstacles: [] as Obstacle[],
    nextSpawnIn: 88,
  });

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return undefined;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return undefined;
    }

    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;

    const spawnObstacle = () => {
      const height = Math.random() > 0.68 ? 42 : 28 + Math.floor(Math.random() * 10);
      const width = height > 30 ? 18 : 14 + Math.floor(Math.random() * 6);

      gameStateRef.current.obstacles.push({
        id: obstacleIdRef.current,
        x: GAME_WIDTH + 12,
        width,
        height,
      });

      obstacleIdRef.current += 1;
      gameStateRef.current.nextSpawnIn = 66 + Math.floor(Math.random() * 40);
    };

    const resetGame = () => {
      gameStateRef.current = {
        dinoY: GROUND_Y - DINO_HEIGHT,
        velocityY: 0,
        obstacleSpeed: 5.6,
        scoreValue: 0,
        cloudOffset: 0,
        groundOffset: 0,
        gameOverValue: false,
        startedValue: true,
        obstacles: [],
        nextSpawnIn: 72,
      };

      setStarted(true);
      setGameOver(false);
      setScore(0);
    };

    const jump = () => {
      const state = gameStateRef.current;

      if (state.gameOverValue) {
        resetGame();
        return;
      }

      if (!state.startedValue) {
        state.startedValue = true;
        setStarted(true);
      }

      const isGrounded = state.dinoY >= GROUND_Y - DINO_HEIGHT - 0.5;

      if (isGrounded) {
        state.velocityY = -JUMP_FORCE;
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();
        jump();
      }

      if (event.code === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    const drawRoundedRect = (
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number,
      fillStyle: string,
    ) => {
      context.fillStyle = fillStyle;
      context.beginPath();
      context.moveTo(x + radius, y);
      context.lineTo(x + width - radius, y);
      context.quadraticCurveTo(x + width, y, x + width, y + radius);
      context.lineTo(x + width, y + height - radius);
      context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      context.lineTo(x + radius, y + height);
      context.quadraticCurveTo(x, y + height, x, y + height - radius);
      context.lineTo(x, y + radius);
      context.quadraticCurveTo(x, y, x + radius, y);
      context.closePath();
      context.fill();
    };

    const drawScene = () => {
      const state = gameStateRef.current;

      context.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      const skyGradient = context.createLinearGradient(0, 0, 0, GAME_HEIGHT);
      skyGradient.addColorStop(0, "#1e293b");
      skyGradient.addColorStop(1, "#0b1220");
      context.fillStyle = skyGradient;
      context.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      context.fillStyle = "rgba(255,255,255,0.08)";
      context.beginPath();
      context.arc(284, 34, 16, 0, Math.PI * 2);
      context.fill();

      for (let index = 0; index < 3; index += 1) {
        const cloudX = ((index * 116 + state.cloudOffset) % (GAME_WIDTH + 70)) - 40;
        context.fillStyle = "rgba(196, 230, 255, 0.18)";
        drawRoundedRect(cloudX, 24 + (index % 2) * 10, 36, 12, 6, "rgba(196, 230, 255, 0.18)");
      }

      context.strokeStyle = "rgba(255,255,255,0.18)";
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(0, GROUND_Y + 10);
      context.lineTo(GAME_WIDTH, GROUND_Y + 10);
      context.stroke();

      context.fillStyle = "#9ca3af";
      for (let index = 0; index < 20; index += 1) {
        const dashX = ((index * 26 + state.groundOffset) % (GAME_WIDTH + 26)) - 26;
        context.fillRect(dashX, GROUND_Y + 14 + (index % 2), 16, 3);
      }

      const dinoBaseY = state.dinoY;
      drawRoundedRect(DINO_X, dinoBaseY + 10, DINO_WIDTH - 2, DINO_HEIGHT - 10, 3, "#f8fafc");
      drawRoundedRect(DINO_X + 16, dinoBaseY, 12, 14, 3, "#f8fafc");
      context.fillStyle = "#111827";
      context.fillRect(DINO_X + 23, dinoBaseY + 4, 2, 2);
      context.fillRect(DINO_X + 5, dinoBaseY + DINO_HEIGHT - 3, 4, 10);
      context.fillRect(DINO_X + 17, dinoBaseY + DINO_HEIGHT - 3, 4, 10);
      context.fillRect(DINO_X + 27, dinoBaseY + 19, 9, 4);

      context.fillStyle = "#7dd3fc";
      state.obstacles.forEach((obstacle) => {
        const obstacleY = GROUND_Y + 10 - obstacle.height;
        drawRoundedRect(obstacle.x, obstacleY, obstacle.width, obstacle.height, 3, "#7dd3fc");
        if (obstacle.height > 32) {
          context.fillRect(obstacle.x - 4, obstacleY + 8, 6, 4);
          context.fillRect(obstacle.x + obstacle.width - 2, obstacleY + 14, 6, 4);
        }
      });

      context.fillStyle = "#e2e8f0";
      context.font = "bold 14px 'Trebuchet MS', sans-serif";
      context.fillText(`Score ${state.scoreValue}`, 12, 18);
      context.fillText(`Best ${highScore}`, 258, 18);

      if (!state.startedValue) {
        context.fillStyle = "rgba(11, 18, 32, 0.76)";
        drawRoundedRect(52, 38, 236, 58, 12, "rgba(11, 18, 32, 0.76)");
        context.fillStyle = "#f8fafc";
        context.font = "bold 14px 'Trebuchet MS', sans-serif";
        context.fillText("Tap, click, or press Space to jump", 70, 62);
        context.font = "12px 'Trebuchet MS', sans-serif";
        context.fillStyle = "#cbd5e1";
        context.fillText("Inspired by the offline runner, made for your popup", 64, 82);
      }

      if (state.gameOverValue) {
        context.fillStyle = "rgba(11, 18, 32, 0.78)";
        drawRoundedRect(88, 42, 164, 64, 14, "rgba(11, 18, 32, 0.78)");
        context.fillStyle = "#f8fafc";
        context.font = "bold 16px 'Trebuchet MS', sans-serif";
        context.fillText("Game Over", 132, 66);
        context.font = "12px 'Trebuchet MS', sans-serif";
        context.fillStyle = "#cbd5e1";
        context.fillText("Press Space or tap to restart", 108, 88);
      }
    };

    const tick = (timestamp: number) => {
      const state = gameStateRef.current;
      const delta = clamp((timestamp - lastTimeRef.current) / 16.67, 0.7, 2.2);
      lastTimeRef.current = timestamp;

      state.cloudOffset -= 0.55 * delta;
      state.groundOffset -= state.startedValue ? state.obstacleSpeed * 1.4 * delta : 1.1 * delta;

      if (state.startedValue && !state.gameOverValue) {
        state.velocityY += GRAVITY * delta;
        state.dinoY += state.velocityY * delta;

        if (state.dinoY >= GROUND_Y - DINO_HEIGHT) {
          state.dinoY = GROUND_Y - DINO_HEIGHT;
          state.velocityY = 0;
        }

        state.nextSpawnIn -= delta;

        if (state.nextSpawnIn <= 0) {
          spawnObstacle();
        }

        state.obstacles = state.obstacles
          .map((obstacle) => ({
            ...obstacle,
            x: obstacle.x - state.obstacleSpeed * delta,
          }))
          .filter((obstacle) => obstacle.x + obstacle.width > -12);

        const dinoHitbox = {
          x: DINO_X + 2,
          y: state.dinoY + 4,
          width: DINO_WIDTH + 5,
          height: DINO_HEIGHT + 4,
        };

        const hasCollision = state.obstacles.some((obstacle) => {
          const obstacleY = GROUND_Y + 10 - obstacle.height;
          return (
            dinoHitbox.x < obstacle.x + obstacle.width &&
            dinoHitbox.x + dinoHitbox.width > obstacle.x &&
            dinoHitbox.y < obstacleY + obstacle.height &&
            dinoHitbox.y + dinoHitbox.height > obstacleY
          );
        });

        if (hasCollision) {
          state.gameOverValue = true;
          setGameOver(true);
        } else {
          state.scoreValue += Math.max(1, Math.round(delta));
          state.obstacleSpeed = Math.min(11.5, 5.6 + state.scoreValue / 220);
          setScore(state.scoreValue);

          if (state.scoreValue > highScore) {
            localStorage.setItem(STORAGE_KEY, String(state.scoreValue));
            setHighScore(state.scoreValue);
          }
        }
      }

      drawScene();
      frameRef.current = window.requestAnimationFrame(tick);
    };

    drawScene();
    frameRef.current = window.requestAnimationFrame((time) => {
      lastTimeRef.current = time;
      tick(time);
    });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [highScore, onClose]);

  const handleAction = () => {
    const state = gameStateRef.current;

    if (!state.startedValue) {
      state.startedValue = true;
      setStarted(true);
    }

    if (state.gameOverValue) {
      state.gameOverValue = false;
      state.startedValue = true;
      state.scoreValue = 0;
      state.dinoY = GROUND_Y - DINO_HEIGHT;
      state.velocityY = -JUMP_FORCE;
      state.obstacles = [];
      state.obstacleSpeed = 5.6;
      state.nextSpawnIn = 72;
      setGameOver(false);
      setScore(0);
      return;
    }

    const isGrounded = state.dinoY >= GROUND_Y - DINO_HEIGHT - 0.5;

    if (isGrounded) {
      state.velocityY = -JUMP_FORCE;
    }
  };

  return (
    <div className="game-overlay">
      <div className="game-panel">
        <div className="game-panel__header">
          <div>
            <p className="game-panel__eyebrow">Break Mode</p>
            <h2 className="game-panel__title">Dino Sprint</h2>
          </div>
          <button type="button" className="game-close-button" onClick={onClose}>
            Close
          </button>
        </div>

        <button type="button" className="game-canvas-shell" onClick={handleAction}>
          <canvas ref={canvasRef} className="game-canvas" />
        </button>

        <div className="game-panel__footer">
          <span>{started ? `Live score ${score}` : "Ready when you are"}</span>
          <span>{gameOver ? "You crashed into a cactus" : "Space / Tap to jump and chase the high score"}</span>
        </div>
      </div>
    </div>
  );
}

export default DinoGame;
