"use client";

import clsx from "clsx";
import { landingCopy } from "@/components/landing/shared/copy";
import {
  Reveal,
  RevealItem,
  SectionHeader,
  SectionShell,
} from "@/components/landing/shared/Reveal";
import { BentoCard, bentoSpanClass } from "@/components/landing/bento/BentoCard";

/** Feature gallery — uneven bento grid showcasing core app systems. */
export function BentoGrid() {
  const { bento } = landingCopy;

  return (
    <SectionShell id="features">
      <Reveal>
        <SectionHeader title={bento.sectionTitle} subtitle={bento.sectionSubtitle} />
      </Reveal>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:auto-rows-[minmax(220px,1fr)]">
        {bento.cards.map((card) => (
          <RevealItem
            key={card.id}
            className={clsx(bentoSpanClass[card.span], "h-full")}
          >
            <BentoCard title={card.title} description={card.description} />
          </RevealItem>
        ))}
      </div>
    </SectionShell>
  );
}
