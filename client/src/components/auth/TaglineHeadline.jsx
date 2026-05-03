import { useState, useEffect } from "react";

// Each tagline: [line1, line2, line3 (outlined)]
const TAGLINES = [
  ["CALCULATE", "WITH", "PRECISION."],
  ["QUOTE", "WITH", "CONFIDENCE."],
  ["PRICE", "EVERY", "JOB."],
  ["COST", "WHAT", "MATTERS."],
  ["PLAN", "BEYOND", "MARGINS."],
  ["FASTER", "SMARTER", "QUOTES."],
];

// Milliseconds for each animation phase
const PHASE_DURATION = { enter: 850, hold: 3200, exit: 520 };

function pickNext(current) {
  let next;
  do {
    next = Math.floor(Math.random() * TAGLINES.length);
  } while (next === current);
  return next;
}

export default function TaglineHeadline() {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("enter");

  useEffect(() => {
    const t = setTimeout(() => {
      if (phase === "enter") {
        setPhase("hold");
      } else if (phase === "hold") {
        setPhase("exit");
      } else {
        setIdx((prev) => pickNext(prev));
        setPhase("enter");
      }
    }, PHASE_DURATION[phase]);
    return () => clearTimeout(t);
  }, [phase]);

  const tagline = TAGLINES[idx];

  const wordCls = (n) => {
    if (phase === "enter") return `tagline-enter-${n}`;
    if (phase === "exit") return `tagline-exit-${n}`;
    return "tagline-hold";
  };

  return (
    <h1 className="text-6xl xl:text-7xl font-black leading-[0.9] tracking-tight text-label">
      <span className={`block ${wordCls(1)}`}>{tagline[0]}</span>
      <span className={`block ${wordCls(2)}`}>{tagline[1]}</span>
      <span className={`block auth-outline-text ${wordCls(3)}`}>
        {tagline[2]}
      </span>
    </h1>
  );
}
