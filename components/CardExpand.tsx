"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useSession } from "next-auth/react";

import type { Card } from "@/lib/cards";
import { categoryLabel } from "@/lib/categories";

import { CARD_DIALOG_CLOSED, CARD_DIALOG_TWEEN } from "./animation";
import { CardEditor } from "./CardEditor";
import { CardMedia } from "./CardMedia";
import { useBodyScrollLock } from "./useBodyScrollLock";

type CardExpandProps = {
  card: Card;
  onClose: () => void;
};

function capitalizeName(name: string): string {
  return name.replace(/(^|[\s'’‘ʼ\p{Dash_Punctuation}])\p{L}/gu, (segment) =>
    segment.toLocaleUpperCase(),
  );
}

export function CardExpand({ card, onClose }: CardExpandProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  const { data: session } = useSession();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useBodyScrollLock();

  const canEdit = Boolean(
    session?.user &&
      (session.user.isAdmin || session.user.id === card.ownerId),
  );

  useEffect(() => {
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  async function handleDelete() {
    if (!window.confirm("Delete this card? This cannot be undone.")) {
      return;
    }
    setDeleting(true);
    try {
      const response = await fetch(`/api/cards/${card.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Delete failed");
      }
      onClose();
      router.refresh();
    } catch {
      setDeleting(false);
      window.alert("Could not delete this card. Please try again.");
    }
  }

  if (editing) {
    return (
      <CardEditor
        mode="edit"
        card={card}
        onClose={() => setEditing(false)}
        onSaved={() => {
          setEditing(false);
          onClose();
          router.refresh();
        }}
      />
    );
  }

  return createPortal(
    <div
      className="fixed inset-0 z-100 grid place-items-center p-[clamp(0.75rem,3vw,2.5rem)] max-sm:p-2"
      role="presentation"
    >
      <motion.div
        className="absolute inset-0 bg-[rgba(17,27,23,0.62)] backdrop-blur-[4px]"
        data-testid="card-dialog-backdrop"
        aria-hidden="true"
        onMouseDown={onClose}
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={reduceMotion ? { duration: 0 } : CARD_DIALOG_TWEEN}
      />
      <motion.article
        className="relative z-1 grid h-[94vh] w-full grid-cols-1 grid-rows-[minmax(230px,42%)_minmax(0,58%)] overflow-hidden rounded-[1.15rem] border-0 bg-[#fbfaf5] shadow-[0_45px_120px_rgba(8,15,12,0.42)] md:h-[min(730px,90vh)] md:w-[min(1120px,96vw)] md:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] md:grid-rows-1 md:rounded-[1.6rem]"
        role="dialog"
        aria-modal="true"
        aria-label={card.alt}
        initial={reduceMotion ? false : CARD_DIALOG_CLOSED}
        animate={{ opacity: 1, scale: 1 }}
        exit={CARD_DIALOG_CLOSED}
        transition={reduceMotion ? { duration: 0 } : CARD_DIALOG_TWEEN}
      >
        <div className="relative min-h-0 bg-[#d5d7cd]">
          <CardMedia
            media={card.media}
            alt={card.alt}
            sizes="(max-width: 767px) 92vw, 45vw"
            mode="player"
          />
        </div>
        <div className="flex min-h-0 flex-col overflow-y-auto px-[clamp(1.5rem,4vw,4rem)] py-[clamp(2rem,4vw,4.5rem)] [overscroll-behavior:contain] max-sm:px-5 max-sm:pt-8 max-sm:pb-12">
          <p className="mb-5 w-fit rounded-full bg-[#e8e8de] px-3 py-1 text-[0.65rem] font-bold tracking-[0.1em] text-[#65736c] uppercase">
            {categoryLabel(card.category)}
          </p>
          <p className="m-0 flex-1 font-serif text-[1.05rem] leading-[1.7] whitespace-pre-wrap text-[#17251f]">
            {card.message}
          </p>
          {card.ownerName ? (
            <p className="mt-4 font-serif text-sm text-[#65736c]">
              From {capitalizeName(card.ownerName)}
            </p>
          ) : null}
          {canEdit ? (
            <div className="mt-8 flex gap-3 border-t border-[rgba(23,37,31,0.12)] pt-5">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="cursor-pointer rounded-full border border-[rgba(23,37,31,0.2)] px-5 py-2 text-xs font-bold tracking-[0.1em] text-[#17251f] uppercase hover:bg-[rgba(23,37,31,0.05)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#f2a65a]"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="cursor-pointer rounded-full border border-[rgba(138,45,22,0.35)] px-5 py-2 text-xs font-bold tracking-[0.1em] text-[#8a2d16] uppercase hover:bg-[rgba(138,45,22,0.06)] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#f2a65a]"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          ) : null}
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
    </div>,
    document.body,
  );
}
