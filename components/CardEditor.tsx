"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { upload } from "@vercel/blob/client";

import type { Card } from "@/lib/cards";
import { CATEGORIES, type CategoryId } from "@/lib/categories";
import {
  ACCEPT_ATTR,
  SUPPORTED_LABEL,
  maxBytesFor,
  mediaKindFromMime,
  type MediaKind,
} from "@/lib/media";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

type CardEditorProps = {
  mode: "create" | "edit";
  card?: Card;
  onClose: () => void;
  onSaved: (card?: Card) => void;
};

function altFromFilename(name: string): string {
  return (
    name
      .replace(/\.[^.]+$/, "")
      .replace(/[-_]+/g, " ")
      .trim() || "card"
  );
}

export function CardEditor({ mode, card, onClose, onSaved }: CardEditorProps) {
  const [category, setCategory] = useState<CategoryId | "">(
    card?.category ?? "",
  );
  const [message, setMessage] = useState(card?.message ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    card?.media.src ?? null,
  );
  const [previewKind, setPreviewKind] = useState<MediaKind | null>(
    card?.media.type ?? null,
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, [onClose]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const selected = event.target.files?.[0];
    if (!selected) {
      return;
    }

    const kind = mediaKindFromMime(selected.type);
    if (!kind) {
      setError(
        `Unsupported file type. Please use ${SUPPORTED_LABEL}. (HEIC photos and .MOV videos are not supported — export to JPG/MP4 first.)`,
      );
      event.target.value = "";
      return;
    }

    if (selected.size > maxBytesFor(kind)) {
      const limitMb = Math.round(maxBytesFor(kind) / (1024 * 1024));
      setError(`That ${kind} is too large. Max ${limitMb} MB.`);
      event.target.value = "";
      return;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    const url = URL.createObjectURL(selected);
    objectUrlRef.current = url;
    setFile(selected);
    setPreviewUrl(url);
    setPreviewKind(kind);
  }

  function insertEmoji(emoji: string) {
    const el = textareaRef.current;
    if (!el) {
      setMessage((current) => current + emoji);
      return;
    }
    const start = el.selectionStart ?? message.length;
    const end = el.selectionEnd ?? message.length;
    const next = message.slice(0, start) + emoji + message.slice(end);
    setMessage(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + emoji.length;
      el.setSelectionRange(pos, pos);
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!category) {
      setError("Please choose a category.");
      return;
    }
    if (mode === "create" && !file) {
      setError("Please add an image or video.");
      return;
    }

    setSubmitting(true);
    try {
      let mediaUrl = card?.media.src;
      let mediaType: MediaKind | undefined = card?.media.type;

      if (file) {
        const kind = mediaKindFromMime(file.type) ?? "image";
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
          clientPayload: kind,
        });
        mediaUrl = blob.url;
        mediaType = kind;
      }

      if (!mediaUrl || !mediaType) {
        throw new Error("Media is required.");
      }

      const alt = file ? altFromFilename(file.name) : card?.alt ?? "card";

      const response =
        mode === "create"
          ? await fetch("/api/cards", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                category,
                message,
                mediaType,
                mediaUrl,
                alt,
              }),
            })
          : await fetch(`/api/cards/${card!.id}`, {
              method: "PATCH",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                category,
                message,
                alt,
                ...(file ? { mediaType, mediaUrl, posterUrl: null } : {}),
              }),
            });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Something went wrong. Please try again.");
      }

      const payload = await response.json().catch(() => ({}));
      onSaved(payload.card);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-100 grid place-items-center p-[clamp(0.75rem,3vw,2.5rem)] max-sm:p-2"
      role="presentation"
    >
      <div
        className="absolute inset-0 bg-[rgba(17,27,23,0.62)] backdrop-blur-[4px]"
        aria-hidden="true"
        onMouseDown={onClose}
      />
      <form
        onSubmit={handleSubmit}
        className="relative z-1 grid max-h-[94vh] w-full max-w-[560px] gap-4 overflow-y-auto rounded-[1.4rem] bg-[#fbfaf5] p-[clamp(1.25rem,4vw,2.5rem)] shadow-[0_45px_120px_rgba(8,15,12,0.42)] [overscroll-behavior:contain]"
        role="dialog"
        aria-modal="true"
        aria-label={mode === "create" ? "Add a card" : "Edit card"}
      >
        <div className="flex items-center justify-between">
          <h2 className="m-0 font-serif text-2xl text-[#17251f]">
            {mode === "create" ? "Add a card" : "Edit card"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 cursor-pointer place-items-center rounded-full border border-[rgba(23,37,31,0.16)] bg-white/80 text-xl leading-none text-[#17251f] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#f2a65a]"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <label className="grid gap-2 text-xs font-bold tracking-[0.1em] text-[#65736c] uppercase">
          Photo or video
          <input
            type="file"
            accept={ACCEPT_ATTR}
            onChange={handleFileChange}
            className="text-sm font-normal tracking-normal normal-case text-[#17251f] file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-[#17251f] file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:text-white"
          />
          <span className="text-[0.65rem] font-normal tracking-normal normal-case text-[#8a968f]">
            Supported: {SUPPORTED_LABEL}
          </span>
        </label>

        {previewUrl ? (
          <div className="overflow-hidden rounded-[1rem] bg-[#d5d7cd]">
            {previewKind === "video" ? (
              <video
                src={previewUrl}
                controls
                playsInline
                className="max-h-64 w-full object-contain"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Selected media preview"
                className="max-h-64 w-full object-contain"
              />
            )}
          </div>
        ) : null}

        <label className="grid gap-2 text-xs font-bold tracking-[0.1em] text-[#65736c] uppercase">
          Category
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as CategoryId)}
            className="rounded-[0.75rem] border border-[rgba(23,37,31,0.2)] bg-white px-3 py-2 text-sm font-normal tracking-normal normal-case text-[#17251f] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#f2a65a]"
          >
            <option value="" disabled>
              Choose a group…
            </option>
            {CATEGORIES.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-xs font-bold tracking-[0.1em] text-[#65736c] uppercase">
          Message
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={5}
              placeholder="Write something nice… 🎂"
              className="w-full resize-y rounded-[0.75rem] border border-[rgba(23,37,31,0.2)] bg-white px-3 py-2 text-sm font-normal tracking-normal normal-case text-[#17251f] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#f2a65a]"
            />
            <button
              type="button"
              onClick={() => setShowEmoji((open) => !open)}
              aria-label="Add emoji"
              aria-expanded={showEmoji}
              className="absolute right-2 bottom-2 cursor-pointer rounded-full border border-[rgba(23,37,31,0.16)] bg-white/90 px-2 py-1 text-base leading-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#f2a65a]"
            >
              <span aria-hidden="true">😀</span>
            </button>
          </div>
        </label>

        {showEmoji ? (
          <div className="justify-self-start">
            <EmojiPicker
              onEmojiClick={(emojiData) => insertEmoji(emojiData.emoji)}
              width={320}
              height={360}
            />
          </div>
        ) : null}

        {error ? (
          <p className="m-0 rounded-[0.75rem] bg-[#fbe6e0] px-3 py-2 text-sm text-[#8a2d16]">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full px-5 py-2.5 text-xs font-bold tracking-[0.1em] text-[#65736c] uppercase hover:text-[#17251f] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#f2a65a]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="cursor-pointer rounded-full bg-[#17251f] px-6 py-2.5 text-xs font-bold tracking-[0.1em] text-white uppercase transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#f2a65a]"
          >
            {submitting
              ? "Saving…"
              : mode === "create"
                ? "Add card"
                : "Save changes"}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
