"use client";

import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const SLIDE_DURATION_MILLISECONDS = 5_000;

type LandingSlide = {
  src: string;
};

export function LandingSlideshow({ slides }: { slides: LandingSlide[] }) {
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion || slides.length < 2) return;

    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % slides.length);
    }, SLIDE_DURATION_MILLISECONDS);

    return () => window.clearInterval(intervalId);
  }, [shouldReduceMotion, slides.length]);

  return (
    <div className="landing-slideshow" aria-hidden="true">
      {slides.map((slide, index) => (
        <div
          className="landing-slideshow__slide"
          data-active={index === activeIndex}
          key={slide.src}
        >
          <Image
            alt=""
            fill
            preload={index === 0}
            sizes="100vw"
            src={slide.src}
          />
        </div>
      ))}
    </div>
  );
}
