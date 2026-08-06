"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";

import type { Card } from "@/lib/cards";

import { CardExpand } from "./CardExpand";

type CardGridProps = {
  cards: Card[];
};

export function CardGrid({ cards }: CardGridProps) {
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const reduceMotion = useReducedMotion();

  const closeCard = useCallback(() => {
    setActiveCard(null);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  return (
    <LayoutGroup>
      {cards.length > 0 ? (
        <motion.ul
          className="card-grid"
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
          {cards.map((card) => (
            <motion.li
              key={card.id}
              variants={{
                hidden: reduceMotion
                  ? { opacity: 1 }
                  : { opacity: 0, scale: 0.94, y: 26 },
                shown: { opacity: 1, scale: 1, y: 0 },
              }}
              transition={{ duration: reduceMotion ? 0 : 0.48, ease: "easeOut" }}
            >
              <button
                className="card-tile"
                type="button"
                aria-label={`Open ${card.alt}`}
                onClick={(event) => {
                  triggerRef.current = event.currentTarget;
                  setActiveCard(card);
                }}
              >
                <motion.div
                  className="card-tile__image"
                  layoutId={`card-${card.id}`}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 260, damping: 28 }
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
          ))}
        </motion.ul>
      ) : (
        <p className="empty-gallery">No cards in this collection yet.</p>
      )}

      {reduceMotion ? (
        activeCard ? (
          <CardExpand key={activeCard.id} card={activeCard} onClose={closeCard} />
        ) : null
      ) : (
        <AnimatePresence>
          {activeCard ? (
            <CardExpand key={activeCard.id} card={activeCard} onClose={closeCard} />
          ) : null}
        </AnimatePresence>
      )}
    </LayoutGroup>
  );
}
