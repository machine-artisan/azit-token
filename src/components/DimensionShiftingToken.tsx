"use client";

import { motion, useAnimation } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Confetti from "react-confetti";

import { TOKEN_ASPECTS, type TokenAspect } from "@/constants/tokenAspects";

const TAILWIND_BG_TO_HEX: Record<string, string> = {
  "bg-green-500": "#22c55e",
  "bg-blue-500": "#3b82f6",
  "bg-red-500": "#ef4444",
};

const TAILWIND_BG_TO_BUTTON: Record<string, { base: string; hover: string; ring: string }> = {
  "bg-green-500": {
    base: "bg-green-500",
    hover: "hover:bg-green-600",
    ring: "focus-visible:ring-green-400",
  },
  "bg-blue-500": {
    base: "bg-blue-500",
    hover: "hover:bg-blue-600",
    ring: "focus-visible:ring-blue-400",
  },
  "bg-red-500": {
    base: "bg-red-500",
    hover: "hover:bg-red-600",
    ring: "focus-visible:ring-red-400",
  },
};

function pickRandomAspect(): TokenAspect {
  return TOKEN_ASPECTS[Math.floor(Math.random() * TOKEN_ASPECTS.length)];
}

export function DimensionShiftingToken() {
  const controls = useAnimation();
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<TokenAspect | null>(null);
  const [isShifting, setIsShifting] = useState(false);

  const [isConfettiActive, setIsConfettiActive] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const confettiTimerRef = useRef<number | null>(null);

  const aspectHex = useMemo(() => {
    if (!result) return null;
    return TAILWIND_BG_TO_HEX[result.tailwindColorClass] ?? null;
  }, [result]);

  const startIdleRotation = useCallback(() => {
    controls.start({
      rotateY: 360,
      transition: {
        duration: 4.5,
        ease: "linear",
        repeat: Infinity,
      },
    });
  }, [controls]);

  useEffect(() => {
    if (!isSpinning && !isShifting) startIdleRotation();
  }, [isSpinning, isShifting, startIdleRotation]);

  useEffect(() => {
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    return () => {
      if (confettiTimerRef.current) {
        window.clearTimeout(confettiTimerRef.current);
      }
    };
  }, []);

  const handleClick = useCallback(async () => {
    if (isSpinning || isShifting) return;
    if (result) return;

    setIsSpinning(true);
    setResult(null);
    await controls.stop();

    // Phase 1: rapid, chaotic spin (1~2s).
    const spinMs = 1300 + Math.floor(Math.random() * 600);
    controls.set({ rotateX: 0, rotateY: 0, rotateZ: 0, scale: 1 });
    await controls.start({
      rotateX: [0, 720, 1440, 2520],
      rotateY: [0, 1260, 2340, 3780],
      rotateZ: [0, 540, 1080, 1800],
      transition: {
        duration: spinMs / 1000,
        ease: [0.2, 0.8, 0.2, 1],
      },
    });

    // Decide result after "calculation".
    const aspect = pickRandomAspect();
    setResult(aspect);

    // Show confetti right when the result is revealed.
    if (confettiTimerRef.current) {
      window.clearTimeout(confettiTimerRef.current);
    }
    setIsConfettiActive(true);
    confettiTimerRef.current = window.setTimeout(() => {
      setIsConfettiActive(false);
      confettiTimerRef.current = null;
    }, 3000);

    // Phase 2: expand into sphere then collapse back into a colored disk.
    setIsShifting(true);
    await controls.start({
      scale: [1, 1.18, 0.96, 1],
      rotateX: [0, 24, 0],
      rotateY: [0, 18, 0],
      transition: {
        duration: 0.9,
        ease: [0.16, 1, 0.3, 1],
      },
    });
    setIsShifting(false);
    setIsSpinning(false);
  }, [controls, isShifting, isSpinning, result]);

  const faceBgClass = result?.tailwindColorClass ?? "bg-zinc-200";
  const buttonTheme = result ? (TAILWIND_BG_TO_BUTTON[result.tailwindColorClass] ?? null) : null;

  const handleSpinAgain = useCallback(() => {
    // Hide confetti immediately.
    setIsConfettiActive(false);
    if (confettiTimerRef.current) {
      window.clearTimeout(confettiTimerRef.current);
      confettiTimerRef.current = null;
    }

    // 1. Reset the result to null
    setResult(null);
    // 2. Ensure spinning state is false so it goes back to the idle animation
    setIsSpinning(false);
    setIsShifting(false);
    controls.stop();
    controls.set({ rotateX: 0, rotateY: 0, rotateZ: 0, scale: 1 });
    startIdleRotation();
  }, [controls, startIdleRotation]);

  const canShowActions = Boolean(result) && !isSpinning && !isShifting;

  const handleGo = useCallback(() => {
    if (!result) return;
    window.location.assign(result.azitUrl);
  }, [result]);

  const tapHintOpacity = !result && !isSpinning && !isShifting ? 1 : 0;

  const buttonAppear = {
    opacity: canShowActions ? 1 : 0,
    y: canShowActions ? 0 : 8,
    pointerEvents: canShowActions ? "auto" : "none",
  } as const;

  const iconAppear = {
    opacity: canShowActions ? 1 : 0,
    scale: canShowActions ? 1 : 0.95,
    pointerEvents: canShowActions ? "auto" : "none",
  } as const;

  return (
    <div className="flex w-full flex-col items-center justify-center gap-6 py-16">
      {isConfettiActive ? (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          run={isConfettiActive}
          style={{ position: "fixed", top: 0, left: 0, zIndex: 50 }}
        />
      ) : null}

      <div
        role="button"
        tabIndex={isSpinning || isShifting || Boolean(result) ? -1 : 0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (isSpinning || isShifting || result) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        aria-label="Dimension shifting token"
        aria-disabled={isSpinning || isShifting || Boolean(result)}
        className={[
          "group relative select-none",
          isSpinning || isShifting || result ? "cursor-not-allowed" : "cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-offset-zinc-50 dark:focus-visible:ring-offset-black focus-visible:ring-zinc-300",
        ].join(" ")}
      >
        <div className="relative h-44 w-44 sm:h-56 sm:w-56" style={{ perspective: 900 }}>
          <motion.button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSpinAgain();
            }}
            aria-label="Spin again"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={iconAppear}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={[
              "absolute right-2 top-2 z-20 grid h-9 w-9 place-items-center rounded-full",
              "bg-white/80 text-zinc-950 shadow-sm backdrop-blur",
              "ring-1 ring-black/10",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 dark:focus-visible:ring-offset-black",
              buttonTheme?.ring ?? "focus-visible:ring-zinc-300",
            ].join(" ")}
          >
            <motion.svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              initial={false}
              animate={{ rotate: canShowActions ? 0 : 0 }}
            >
              <path
                d="M20 12a8 8 0 1 1-2.343-5.657"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M20 4v6h-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          </motion.button>

          <motion.div
            animate={controls}
            className="absolute inset-0"
            style={{
              transformStyle: "preserve-3d",
              willChange: "transform",
            }}
          >
            {/* Coin edge */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                transform: "translateZ(-10px)",
                background:
                  "linear-gradient(90deg, rgba(250,250,250,0.5), rgba(120,120,120,0.45), rgba(250,250,250,0.5))",
                boxShadow: "0 22px 45px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.25)",
              }}
            />

            {/* Front face */}
            <div
              className={[
                "absolute inset-0 rounded-full transition-colors duration-300",
                faceBgClass,
              ].join(" ")}
              style={{
                transform: "translateZ(10px)",
                boxShadow:
                  "inset 0 0 0 1px rgba(255,255,255,0.35), inset 0 -18px 28px rgba(0,0,0,0.25), 0 12px 30px rgba(0,0,0,0.22)",
              }}
            >
              {/* Metallic texture overlay */}
              <div
                className="absolute inset-0 rounded-full opacity-70 mix-blend-overlay"
                style={{
                  background:
                    "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.9), rgba(255,255,255,0) 55%), radial-gradient(circle at 65% 70%, rgba(0,0,0,0.55), rgba(0,0,0,0) 60%), repeating-linear-gradient(90deg, rgba(255,255,255,0.12), rgba(255,255,255,0.12) 2px, rgba(0,0,0,0.06) 4px, rgba(0,0,0,0.06) 6px)",
                }}
              />

              {/* Dimensional shift glow */}
              <motion.div
                className="absolute inset-0 rounded-full"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: isShifting ? 1 : 0,
                  scale: isShifting ? 1.02 : 1,
                }}
                transition={{ duration: 0.2 }}
                style={{
                  background: aspectHex
                    ? `radial-gradient(circle at 40% 35%, ${aspectHex}55, transparent 60%)`
                    : "radial-gradient(circle at 40% 35%, rgba(255,255,255,0.35), transparent 60%)",
                  filter: "blur(1px)",
                }}
              />

              {/* Center label */}
              <div className="relative z-10 flex h-full w-full items-center justify-center">
                <motion.div
                  initial={false}
                  animate={{
                    opacity: result ? 1 : 0,
                    scale: result ? 1 : 0.92,
                  }}
                  transition={{ duration: 0.25 }}
                  className="rounded-full px-4 py-2 text-lg font-semibold tracking-wide text-white drop-shadow sm:text-xl"
                  style={{
                    textShadow: "0 2px 18px rgba(0,0,0,0.35)",
                  }}
                >
                  {result?.colorName}
                </motion.div>
              </div>
            </div>

            {/* Back face */}
            <div
              className="absolute inset-0 rounded-full bg-zinc-300"
              style={{
                transform: "translateZ(-10px) rotateY(180deg)",
                boxShadow:
                  "inset 0 0 0 1px rgba(255,255,255,0.25), inset 0 -14px 24px rgba(0,0,0,0.2)",
              }}
            >
              <div
                className="absolute inset-0 rounded-full opacity-60 mix-blend-overlay"
                style={{
                  background:
                    "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.85), rgba(255,255,255,0) 55%), repeating-linear-gradient(90deg, rgba(255,255,255,0.10), rgba(255,255,255,0.10) 2px, rgba(0,0,0,0.05) 4px, rgba(0,0,0,0.05) 6px)",
                }}
              />
            </div>
          </motion.div>

          {/* Tap hint (mobile-first) */}
          <motion.div
            className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 text-sm font-medium text-zinc-600 dark:text-zinc-300"
            initial={false}
            animate={{ opacity: tapHintOpacity }}
            transition={{ duration: 0.25 }}
          >
            Tap to restore dimension
          </motion.div>
        </div>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <motion.button
          type="button"
          onClick={handleGo}
          initial={{ opacity: 0, y: 8 }}
          animate={buttonAppear}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className={[
            "w-full rounded-full px-6 py-3 text-base font-semibold text-white shadow-lg",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 dark:focus-visible:ring-offset-black",
            buttonTheme?.base ?? "bg-zinc-900",
            buttonTheme?.hover ?? "hover:bg-zinc-800",
            buttonTheme?.ring ?? "focus-visible:ring-zinc-300",
          ].join(" ")}
        >
          {result ? `Go to ${result.colorName} Azit` : "Go to Azit"}
        </motion.button>
      </div>
    </div>
  );
}
