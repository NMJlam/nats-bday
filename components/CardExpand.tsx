"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import type { ImageLoader } from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

import type { Card } from "@/lib/cards";

import { CARD_LAYOUT_SPRING } from "./animation";

type CardExpandProps = {
  card: Card;
  onClose: () => void;
};

const passthroughImageLoader: ImageLoader = ({ src }) => src;

function markdownImagePath(source: string) {
  return source.startsWith("imgs/")
    ? `/content-imgs/${source.slice("imgs/".length)}`
    : source;
}

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
      className="fixed inset-0 z-100 grid place-items-center bg-[rgba(17,27,23,0.62)] p-[clamp(0.75rem,3vw,2.5rem)] backdrop-blur-[14px] max-sm:p-2"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.24 }}
    >
      <motion.article
        className="relative grid h-[94vh] w-full grid-cols-1 grid-rows-[minmax(230px,42%)_minmax(0,58%)] overflow-hidden rounded-[1.15rem] border border-white/25 bg-[#fbfaf5] shadow-[0_45px_120px_rgba(8,15,12,0.42)] md:h-[min(730px,90vh)] md:w-[min(1120px,96vw)] md:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] md:grid-rows-1 md:rounded-[1.6rem]"
        layoutId={`card-${card.id}`}
        role="dialog"
        aria-modal="true"
        aria-label={card.alt}
        transition={
          reduceMotion ? { duration: 0 } : CARD_LAYOUT_SPRING
        }
      >
        <div className="relative min-h-0 bg-[#d5d7cd] [&_img]:object-cover">
          <Image
            src={card.image}
            alt={card.alt}
            fill
            sizes="(max-width: 767px) 92vw, 45vw"
          />
        </div>
        <div className="overflow-y-auto px-[clamp(1.5rem,4vw,4rem)] py-[clamp(2rem,4vw,4.5rem)] [overscroll-behavior:contain] max-sm:px-5 max-sm:pt-8 max-sm:pb-12">
          <div className="markdown-body" data-theme="light">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                img({ src, alt }) {
                  if (!src || typeof src !== "string") {
                    return null;
                  }

                  const resolvedSource = markdownImagePath(src);
                  const external = /^https?:\/\//.test(resolvedSource);

                  return (
                    <span className="markdown-image">
                      <Image
                        src={resolvedSource}
                        alt={alt ?? ""}
                        width={1200}
                        height={800}
                        sizes="(max-width: 767px) 84vw, 38vw"
                        loader={external ? passthroughImageLoader : undefined}
                        unoptimized={external}
                      />
                    </span>
                  );
                },
              }}
            >
              {card.message}
            </ReactMarkdown>
          </div>
        </div>
        <button
          ref={closeButtonRef}
          className="absolute top-4 right-4 grid size-11 cursor-pointer place-items-center rounded-full border border-[rgba(23,37,31,0.16)] bg-[rgba(251,250,245,0.92)] p-0 text-[1.65rem] leading-none text-[#17251f] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#f2a65a]"
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
