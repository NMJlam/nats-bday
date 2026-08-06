"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { Card } from "@/lib/cards";

type CardExpandProps = {
  card: Card;
  onClose: () => void;
};

export function CardExpand({ card, onClose }: CardExpandProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <motion.div
      className="card-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.24 }}
    >
      <motion.article
        className="expanded-card"
        layoutId={`card-${card.id}`}
        role="dialog"
        aria-modal="true"
        aria-label={card.alt}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 260, damping: 28 }
        }
      >
        <div className="expanded-card__image">
          <Image
            src={card.image}
            alt={card.alt}
            fill
            priority
            sizes="(max-width: 767px) 92vw, 45vw"
          />
        </div>
        <div className="expanded-card__message">
          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {card.message}
            </ReactMarkdown>
          </div>
        </div>
        <button
          ref={closeButtonRef}
          className="card-close"
          type="button"
          onClick={onClose}
          aria-label="Close card"
        >
          <span aria-hidden="true">×</span>
        </button>
      </motion.article>
    </motion.div>,
    document.body,
  );
}
