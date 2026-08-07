"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

import { CardEditor } from "./CardEditor";

const buttonClass =
  "cursor-pointer rounded-full border border-[rgba(23,37,31,0.2)] bg-[rgba(251,250,245,0.7)] px-4 py-1.5 text-[0.65rem] font-bold tracking-[0.07em] text-[#17251f] uppercase transition-colors hover:bg-white focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#f2a65a] sm:text-[0.72rem]";

export function AuthNav() {
  const { data: session, status } = useSession();
  const [showEditor, setShowEditor] = useState(false);
  const router = useRouter();

  if (status === "loading") {
    return null;
  }

  if (!session?.user) {
    return (
      <button
        type="button"
        className={buttonClass}
        onClick={() => signIn("google")}
      >
        Sign in
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        className={buttonClass}
        onClick={() => setShowEditor(true)}
      >
        Add a card
      </button>
      <button
        type="button"
        className="cursor-pointer text-[0.6rem] font-bold tracking-[0.07em] text-[#65736c] uppercase hover:text-[#17251f] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#f2a65a] sm:text-[0.68rem]"
        onClick={() => signOut()}
        aria-label={`Sign out ${session.user.name ?? ""}`.trim()}
      >
        Sign out
      </button>
      {showEditor ? (
        <CardEditor
          mode="create"
          onClose={() => setShowEditor(false)}
          onSaved={() => {
            setShowEditor(false);
            router.refresh();
          }}
        />
      ) : null}
    </>
  );
}
