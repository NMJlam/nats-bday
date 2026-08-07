"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import styles from "./FoldText.module.css";

gsap.registerPlugin(ScrollTrigger);

type SplitMode = "char" | "word" | "line";
type Hinge = "top" | "bottom" | "left" | "right";
type Trigger = "mount" | "hover" | "scroll" | "loop";

type FoldTextProps = {
  text?: string;
  splitBy?: SplitMode;
  hinge?: Hinge;
  duration?: number;
  stagger?: number;
  ease?: string;
  perspective?: number;
  creaseShading?: number;
  trigger?: Trigger;
  fontSize?: string | number;
  fontWeight?: string | number;
  color?: string;
  className?: string;
  style?: CSSProperties;
};

const HINGE_CONFIG = {
  top: { origin: "50% 0%", rotateX: -92, rotateY: 0, shadeDirection: "180deg" },
  bottom: { origin: "50% 100%", rotateX: 92, rotateY: 0, shadeDirection: "0deg" },
  left: { origin: "0% 50%", rotateX: 0, rotateY: 92, shadeDirection: "90deg" },
  right: { origin: "100% 50%", rotateX: 0, rotateY: -92, shadeDirection: "270deg" },
} as const;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const renderWhitespace = (value: string, key: string) =>
  value.split(/(\n)/).map((part, index) => {
    if (part === "\n") return <br key={`${key}-br-${index}`} />;
    if (!part) return null;

    return (
      <span className={styles.foldTextWhitespace} key={`${key}-space-${index}`}>
        {part.replace(/ /g, "\u00A0")}
      </span>
    );
  });

export default function FoldText({
  text = "Design unfolds",
  splitBy = "char",
  hinge = "top",
  duration = 0.65,
  stagger = 0.045,
  ease = "power3.out",
  perspective = 700,
  creaseShading = 0.55,
  trigger = "mount",
  fontSize = 80,
  fontWeight = 800,
  color = "#f7f2e8",
  className = "",
  style = {},
}: FoldTextProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const timelineRef = useRef<ReturnType<typeof gsap.timeline> | null>(null);
  const hingeConfig = HINGE_CONFIG[hinge];
  const safeCrease = clamp(creaseShading, 0, 1);
  const safePerspective = Math.max(120, perspective);

  const segments = useMemo(() => {
    const renderSegment = (content: ReactNode, key: string, split = splitBy) => (
      <span
        className={styles.foldTextSegment}
        data-fold-split={split}
        key={key}
        style={{ "--fold-perspective": `${safePerspective}px` } as CSSProperties}
      >
        <span
          className={styles.foldTextPiece}
          data-fold-piece
          data-fold-hinge={hinge}
          style={
            {
              "--fold-crease": 0,
              "--fold-shade-direction": hingeConfig.shadeDirection,
              transformOrigin: hingeConfig.origin,
            } as CSSProperties
          }
        >
          {content || "\u00A0"}
        </span>
      </span>
    );

    if (splitBy === "line") {
      return text.split("\n").map((line, index) => (
        <span className={styles.foldTextLine} key={`line-${index}`}>
          {renderSegment(line || "\u00A0", `segment-line-${index}`, "line")}
        </span>
      ));
    }

    if (splitBy === "word") {
      return text.split(/(\s+)/).flatMap((part, index) => {
        if (!part) return [];
        if (/^\s+$/.test(part)) return renderWhitespace(part, `ws-${index}`);
        return renderSegment(part, `segment-word-${index}`);
      });
    }

    return Array.from(text).map((char, index) => {
      if (char === "\n") return <br key={`br-${index}`} />;
      return renderSegment(
        char === " " ? "\u00A0" : char,
        `segment-char-${index}`,
      );
    });
  }, [
    hinge,
    hingeConfig.origin,
    hingeConfig.shadeDirection,
    safePerspective,
    splitBy,
    text,
  ]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const pieces = Array.from(
      root.querySelectorAll<HTMLElement>("[data-fold-piece]"),
    );
    if (!pieces.length) return undefined;

    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      gsap.set(pieces, {
        "--fold-crease": 0,
        opacity: 1,
        rotateX: 0,
        rotateY: 0,
        transformOrigin: hingeConfig.origin,
      });

      return () => gsap.killTweensOf(pieces);
    }

    const fromVars = {
      "--fold-crease": safeCrease,
      force3D: true,
      opacity: 0,
      rotateX: hingeConfig.rotateX,
      rotateY: hingeConfig.rotateY,
      transformOrigin: hingeConfig.origin,
    };
    const toVars = {
      "--fold-crease": 0,
      clearProps: "willChange",
      duration,
      ease,
      opacity: 1,
      rotateX: 0,
      rotateY: 0,
      stagger,
    };

    const killTimeline = () => {
      timelineRef.current?.kill();
      timelineRef.current = null;
      gsap.killTweensOf(pieces);
    };

    const play = (repeat: boolean) => {
      killTimeline();
      timelineRef.current = gsap.timeline({
        repeat: repeat ? -1 : 0,
        repeatDelay: repeat ? 0.75 : 0,
      });
      timelineRef.current.fromTo(pieces, fromVars, toVars);
    };

    let scrollTrigger: ScrollTrigger | undefined;
    let hoverHandler: (() => void) | undefined;

    if (trigger === "hover") {
      gsap.set(pieces, {
        "--fold-crease": 0,
        opacity: 1,
        rotateX: 0,
        rotateY: 0,
        transformOrigin: hingeConfig.origin,
      });
      hoverHandler = () => play(false);
      root.addEventListener("mouseenter", hoverHandler);
    } else if (trigger === "scroll") {
      gsap.set(pieces, fromVars);
      scrollTrigger = ScrollTrigger.create({
        trigger: root,
        start: "top 82%",
        once: true,
        onEnter: () => play(false),
      });
    } else if (trigger === "loop") {
      play(true);
    } else {
      play(false);
    }

    return () => {
      if (hoverHandler) root.removeEventListener("mouseenter", hoverHandler);
      scrollTrigger?.kill();
      killTimeline();
    };
  }, [
    duration,
    ease,
    hingeConfig.origin,
    hingeConfig.rotateX,
    hingeConfig.rotateY,
    safeCrease,
    stagger,
    text,
    trigger,
  ]);

  const rootStyle = {
    "--fold-text-color": color,
    "--fold-text-font-size":
      typeof fontSize === "number" ? `${fontSize}px` : fontSize,
    "--fold-text-font-weight": fontWeight,
    ...style,
  } as CSSProperties;

  return (
    <span
      ref={rootRef}
      className={`${styles.foldText} ${className}`.trim()}
      style={rootStyle}
    >
      <span className={styles.foldTextSrOnly}>{text}</span>
      <span className={styles.foldTextVisual} aria-hidden="true">
        {segments}
      </span>
    </span>
  );
}
