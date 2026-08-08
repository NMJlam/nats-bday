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
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  function acceptFile(selected: File): boolean {
    setError(null);

    const kind = mediaKindFromMime(selected.type);
    if (!kind) {
      setError(
        `Unsupported file type. Please use ${SUPPORTED_LABEL}. (HEIC photos and .MOV videos are not supported — export to JPG/MP4 first.)`,
      );
      return false;
    }

    if (selected.size > maxBytesFor(kind)) {
      const limitMb = Math.round(maxBytesFor(kind) / (1024 * 1024));
      setError(`That ${kind} is too large. Max ${limitMb} MB.`);
      return false;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    const url = URL.createObjectURL(selected);
    objectUrlRef.current = url;
    setFile(selected);
    setPreviewUrl(url);
    setPreviewKind(kind);
    return true;
  }

  function openFilePicker() {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected) {
      return;
    }

    acceptFile(selected);
    event.target.value = "";
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const selected = event.dataTransfer.files[0];
    if (selected) {
      acceptFile(selected);
    }
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
        className="relative z-1 grid h-[94vh] w-full grid-cols-1 grid-rows-[minmax(230px,42%)_minmax(0,58%)] overflow-hidden rounded-[1.15rem] bg-[#fbfaf5] shadow-[0_45px_120px_rgba(8,15,12,0.42)] md:h-[min(730px,90vh)] md:w-[min(1120px,96vw)] md:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] md:grid-rows-1 md:rounded-[1.6rem]"
        role="dialog"
        aria-modal="true"
        aria-label={mode === "create" ? "Add a card" : "Edit card"}
      >
        <div
          className="relative min-h-0 overflow-hidden border-2 border-dashed border-[rgba(23,37,31,0.22)] bg-[#d5d7cd]"
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_ATTR}
            onChange={handleFileChange}
            className="sr-only"
            tabIndex={-1}
          />
          {previewUrl ? (
            <div className="relative h-full min-h-[226px] w-full">
              {previewKind === "video" ? (
                <video
                  src={previewUrl}
                  controls
                  playsInline
                  className="h-full w-full object-contain"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Selected media preview"
                  className="h-full w-full object-contain"
                />
              )}
              <button
                type="button"
                onClick={openFilePicker}
                className="absolute top-4 left-4 cursor-pointer rounded-full bg-[rgba(251,250,245,0.92)] px-4 py-2 text-[0.7rem] font-bold tracking-[0.04em] whitespace-nowrap text-[#17251f] shadow-sm focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#f2a65a]"
              >
                drop or click to replace
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={openFilePicker}
              className="flex h-full min-h-[226px] w-full cursor-pointer flex-col items-center justify-center gap-3 px-6 text-center text-[#17251f] focus-visible:outline-3 focus-visible:outline-offset-[-6px] focus-visible:outline-[#f2a65a]"
            >
              <span className="font-serif text-xl">
                Drag a file here or click
              </span>
              <span className="text-[0.65rem] font-bold tracking-[0.08em] text-[#65736c] uppercase">
                Supported: {SUPPORTED_LABEL}
              </span>
            </button>
          )}
        </div>

        <div className="flex min-h-0 flex-col overflow-y-auto px-[clamp(1.5rem,4vw,4rem)] py-[clamp(2rem,4vw,4.5rem)] [overscroll-behavior:contain] max-sm:px-5 max-sm:pt-8 max-sm:pb-12">
          <h2 className="sr-only">
            {mode === "create" ? "Add a card" : "Edit card"}
          </h2>

          <label className="mb-5 w-fit">
            <span className="sr-only">Category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as CategoryId)}
              className="cursor-pointer appearance-none rounded-full border-0 bg-[#e8e8de] px-3 py-1.5 pr-8 text-[0.65rem] font-bold tracking-[0.1em] text-[#65736c] uppercase focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#f2a65a]"
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

          <label className="relative flex min-h-48 flex-1">
            <span className="sr-only">Message</span>
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Write something nice… 🎂"
              className="min-h-48 w-full resize-none border-0 bg-transparent pr-12 font-serif text-[1.05rem] leading-[1.7] text-[#17251f] outline-none placeholder:text-[#8a968f] focus-visible:rounded-lg focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#f2a65a]"
            />
            <button
              type="button"
              onClick={() => setShowEmoji((open) => !open)}
              aria-label="Add emoji"
              aria-expanded={showEmoji}
              className="absolute right-1 bottom-1 cursor-pointer rounded-full border border-[rgba(23,37,31,0.16)] bg-white/90 px-2 py-1 text-base leading-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#f2a65a]"
            >
              <span aria-hidden="true">😀</span>
            </button>
          </label>

          {showEmoji ? (
            <div className="mt-4 max-w-full overflow-x-auto">
              <EmojiPicker
                onEmojiClick={(emojiData) => insertEmoji(emojiData.emoji)}
                width={320}
                height={360}
              />
            </div>
          ) : null}

          {error ? (
            <p className="mt-5 rounded-[0.75rem] bg-[#fbe6e0] px-3 py-2 text-sm text-[#8a2d16]">
              {error}
            </p>
          ) : null}

          <div className="mt-8 flex justify-end gap-3 border-t border-[rgba(23,37,31,0.12)] pt-5">
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
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 grid size-11 cursor-pointer place-items-center rounded-full border border-[rgba(23,37,31,0.16)] bg-[rgba(251,250,245,0.92)] p-0 text-[1.65rem] leading-none text-[#17251f] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#f2a65a]"
        >
          <span aria-hidden="true">×</span>
        </button>
      </form>
    </div>,
    document.body,
  );
}
