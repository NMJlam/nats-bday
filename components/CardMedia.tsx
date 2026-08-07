"use client";

import Image from "next/image";
import { useReducedMotion } from "framer-motion";

import type { CardMedia as CardMediaValue } from "@/lib/cards";

type CardMediaProps = {
  media: CardMediaValue;
  alt: string;
  sizes: string;
  mode?: "preview" | "player";
};

export function CardMedia({
  media,
  alt,
  sizes,
  mode = "preview",
}: CardMediaProps) {
  const reduceMotion = useReducedMotion();

  if (media.type === "image") {
    return (
      <Image
        src={media.src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover"
      />
    );
  }

  if (mode === "player") {
    return (
      <video
        src={media.src}
        poster={media.poster}
        controls
        playsInline
        preload="metadata"
        aria-label={`${alt} video`}
        className="absolute inset-0 h-full w-full object-cover"
      >
        Your browser does not support the video tag.
      </video>
    );
  }

  return (
    <video
      src={media.src}
      poster={media.poster}
      autoPlay={reduceMotion === false}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full object-cover"
    >
      Your browser does not support the video tag.
    </video>
  );
}
