"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";

import type { Card } from "@/lib/cards";

import { CARD_LAYOUT_TWEEN } from "./animation";
import { CardExpand } from "./CardExpand";

type CardGridProps = {
  cards: Card[];
};

export function CardGrid({ cards }: CardGridProps) {
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [closingCardId, setClosingCardId] = useState<string | null>(null);
  const closingElevationTimeoutRef = useRef<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const reduceMotion = useReducedMotion();

  const cancelClosingElevationReset = useCallback(() => {
    if (closingElevationTimeoutRef.current !== null) {
      window.clearTimeout(closingElevationTimeoutRef.current);
      closingElevationTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => cancelClosingElevationReset, [cancelClosingElevationReset]);

  const closeCard = useCallback(() => {
    cancelClosingElevationReset();
    setActiveCard((current) => {
      if (reduceMotion) {
        setClosingCardId(null);
      } else if (current) {
        setClosingCardId(current.id);
      }

      return null;
    });
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, [cancelClosingElevationReset, reduceMotion]);
  const expandedCard = activeCard ? (
    <CardExpand key={activeCard.id} card={activeCard} onClose={closeCard} />
  ) : null;

  return (
    <LayoutGroup>
      {cards.length > 0 ? (
        <motion.ul
          className="m-0 grid list-none grid-cols-1 gap-[clamp(1rem,2vw,1.75rem)] p-0 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Card gallery"
          initial="hidden"
          animate="shown"
          variants={{
            hidden: {},
            shown: {
              transition: {
                staggerChildren: reduceMotion ? 0 : 0.075,
                delayChildren: reduceMotion ? 0 : 0.08,
              },
            },
          }}
        >
          {cards.map((card) => {
            const closingStyle =
              card.id === closingCardId ? { zIndex: 50 } : undefined;

            return (
              <motion.li
                key={card.id}
                className="relative"
                style={closingStyle}
                variants={{
                  hidden: reduceMotion
                    ? { opacity: 1 }
                    : { opacity: 0, scale: 0.94, y: 26 },
                  shown: { opacity: 1, scale: 1, y: 0 },
                }}
                transition={{
                  duration: reduceMotion ? 0 : 0.48,
                  ease: "easeOut",
                }}
              >
                <button
                  className="group block w-full cursor-zoom-in rounded-[1.4rem] border-0 bg-transparent p-0 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#f2a65a]"
                  type="button"
                  aria-label={`Open ${card.alt}`}
                  onClick={(event) => {
                    cancelClosingElevationReset();
                    setClosingCardId(null);
                    triggerRef.current = event.currentTarget;
                    setActiveCard(card);
                  }}
                >
                  <motion.div
                    className="relative aspect-4/3 overflow-hidden rounded-[1.4rem] bg-[#d5d7cd] shadow-[0_18px_45px_rgba(30,52,42,0.11)] transition-[box-shadow,transform] duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_24px_56px_rgba(30,52,42,0.2)] [&_img]:object-cover"
                    layoutId={`card-${card.id}`}
                    style={closingStyle}
                    onLayoutAnimationComplete={() => {
                      if (card.id !== closingCardId) {
                        return;
                      }

                      cancelClosingElevationReset();
                      closingElevationTimeoutRef.current = window.setTimeout(
                        () => {
                          setClosingCardId((current) =>
                            current === card.id ? null : current,
                          );
                          closingElevationTimeoutRef.current = null;
                        },
                        CARD_LAYOUT_TWEEN.duration * 1000,
                      );
                    }}
                    transition={
                      reduceMotion ? { duration: 0 } : CARD_LAYOUT_TWEEN
                    }
                  >
                    <Image
                      src={card.image}
                      alt={card.alt}
                      fill
                      sizes="(max-width: 639px) 92vw, (max-width: 1023px) 45vw, 30vw"
                    />
                  </motion.div>
                </button>
              </motion.li>
            );
          })}
        </motion.ul>
      ) : (
        <p className="py-20 text-center font-serif text-xl text-[#65736c]">
          No cards in this collection yet.
        </p>
      )}

      {reduceMotion ? expandedCard : <AnimatePresence>{expandedCard}</AnimatePresence>}
    </LayoutGroup>
  );
}
