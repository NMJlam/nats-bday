"use client";

import { useCallback, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";

import type { Card } from "@/lib/cards";

import { CardExpand } from "./CardExpand";
import { CardMedia } from "./CardMedia";

type CardGridProps = {
  cards: Card[];
  revealOnScroll?: boolean;
};

export function CardGrid({ cards, revealOnScroll = false }: CardGridProps) {
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [deletedCardIds, setDeletedCardIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [revealed, setRevealed] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const reduceMotion = useReducedMotion();

  // Once revealed (or when the reveal doesn't apply), keep the list in the
  // "shown" state so cards added later — e.g. after router.refresh() following a
  // new submission — inherit "shown" instead of being stranded at opacity 0.
  const shown = revealed || reduceMotion || !revealOnScroll;

  const closeCard = useCallback(() => {
    setActiveCard(null);
    window.requestAnimationFrame(() =>
      triggerRef.current?.focus({ preventScroll: true }),
    );
  }, []);
  const removeDeletedCard = useCallback((cardId: string) => {
    setDeletedCardIds((current) => new Set(current).add(cardId));
    setActiveCard(null);
    triggerRef.current = null;
  }, []);
  const visibleCards = cards.filter((card) => !deletedCardIds.has(card.id));
  const expandedCard = activeCard ? (
    <CardExpand
      key={activeCard.id}
      card={activeCard}
      onClose={closeCard}
      onDeleted={removeDeletedCard}
    />
  ) : null;

  return (
    <>
      {visibleCards.length > 0 ? (
        <motion.ul
          className="m-0 grid list-none grid-cols-1 gap-[clamp(1rem,2vw,1.75rem)] p-0 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Card gallery"
          initial="hidden"
          animate={shown ? "shown" : "hidden"}
          onViewportEnter={
            revealOnScroll && !reduceMotion
              ? () => setRevealed(true)
              : undefined
          }
          viewport={{ once: true, amount: 0.08 }}
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
          {visibleCards.map((card) => (
            <motion.li
              key={card.id}
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
                  triggerRef.current = event.currentTarget;
                  setActiveCard(card);
                }}
              >
                <div
                  className="relative aspect-4/3 overflow-hidden rounded-[1.4rem] bg-[#d5d7cd] shadow-[0_18px_45px_rgba(30,52,42,0.11)] transition-[box-shadow,transform] duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_24px_56px_rgba(30,52,42,0.2)] [&_img]:object-cover"
                >
                  <CardMedia
                    media={card.media}
                    alt={card.alt}
                    sizes="(max-width: 639px) 92vw, (max-width: 1023px) 45vw, 30vw"
                  />
                </div>
              </button>
            </motion.li>
          ))}
        </motion.ul>
      ) : (
        <p className="py-20 text-center font-serif text-xl text-[#65736c]">
          No cards in this collection yet.
        </p>
      )}

      {reduceMotion ? expandedCard : <AnimatePresence>{expandedCard}</AnimatePresence>}
    </>
  );
}
