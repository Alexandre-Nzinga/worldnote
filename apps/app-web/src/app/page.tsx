"use client";

import { headingClass } from "@worldnote/ui";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-24">
      <div className="max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-wn-mono-500">
          WorldNote
        </p>
        <h1 className={`${headingClass.h1} mt-4 text-balance`}>
          Building better worlds
        </h1>
        <p className="mt-4 text-lg text-wn-mono-400">Website for WorldNote.</p>
      </div>
    </div>
  );
}

