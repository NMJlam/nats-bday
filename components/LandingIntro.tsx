"use client";

import { useReducedMotion } from "motion/react";
import {
  type TransitionEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import CountUp from "@/components/CountUp";
import {
  FIELD_NOTES_START_DATE,
  getDaysSinceFieldNotesStart,
} from "@/lib/daysSince";

const INTRO_DURATION_SECONDS = 2.25;
const FINAL_COUNT_HOLD_MILLISECONDS = 300;

export function LandingIntro() {
  const shouldReduceMotion = useReducedMotion();
  const [hasCountFinished, setHasCountFinished] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const totalDays = getDaysSinceFieldNotesStart(new Date());

  const finishExit = useCallback((event: TransitionEvent<HTMLDivElement>) => {
    if (
      event.target === event.currentTarget &&
      event.propertyName === "opacity"
    ) {
      setIsComplete(true);
    }
  }, []);

  useEffect(() => {
    if (!isExiting) {
      document.documentElement.classList.add("landing-intro-active");
    } else {
      document.documentElement.classList.remove("landing-intro-active");
    }

    return () => {
      document.documentElement.classList.remove("landing-intro-active");
    };
  }, [isExiting]);

  useEffect(() => {
    if (!hasCountFinished) return;

    const timeoutId = window.setTimeout(
      () => setIsExiting(true),
      FINAL_COUNT_HOLD_MILLISECONDS,
    );

    return () => window.clearTimeout(timeoutId);
  }, [hasCountFinished]);

  if (isComplete) return null;

  return (
    <div
      className={`landing-intro${isExiting ? " landing-intro--exiting" : ""}`}
      role="status"
      onTransitionEnd={finishExit}
    >
      <span className="sr-only">
        Loading Field Notes. Counting the days since{" "}
        {FIELD_NOTES_START_DATE.accessibleLabel}.
      </span>
      <div className="landing-intro__halo" aria-hidden="true" />
      <div className="landing-intro__content">
        <p className="landing-intro__eyebrow">Days since</p>
        <span aria-hidden="true">
          {hasCountFinished ? (
            <span className="landing-intro__count">
              {totalDays.toLocaleString("en-US")}
            </span>
          ) : (
            <CountUp
              from={0}
              to={totalDays}
              separator=","
              duration={shouldReduceMotion ? 0.01 : INTRO_DURATION_SECONDS}
              className="landing-intro__count"
              onEnd={() => setHasCountFinished(true)}
            />
          )}
        </span>
        <time
          className="landing-intro__date"
          dateTime={FIELD_NOTES_START_DATE.isoDate}
        >
          {FIELD_NOTES_START_DATE.displayLabel}
        </time>
      </div>
    </div>
  );
}
