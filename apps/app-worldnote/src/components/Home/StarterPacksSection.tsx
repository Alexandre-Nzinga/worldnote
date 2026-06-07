import { getBodyTextStyle, getHeadingProps, springSnappy } from "@worldnote/ui";
import { motion } from "framer-motion";
import {
  STARTER_PACKS,
  type StarterPack,
} from "../../services/starterPacks/index.js";
import { StarterPackCard } from "./StarterPackCard.js";

type StarterPacksSectionProps = {
  isBusy: boolean;
  onStartPack: (pack: StarterPack) => void;
};

export function StarterPacksSection({
  isBusy,
  onStartPack,
}: StarterPacksSectionProps) {
  return (
    <section className="mt-10 shrink-0">
      <div className="mb-4 flex flex-col gap-1">
        <h2 {...getHeadingProps("h4", { tone: "inverse" })}>Starter packs</h2>
        <p className="text-wn-mono-400" style={getBodyTextStyle("small")}>
          Pre-built worlds with content ready to use
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STARTER_PACKS.map((pack, index) => (
          <motion.div
            key={pack.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              ...springSnappy,
              delay: Math.min(index, 5) * 0.04,
            }}
          >
            <StarterPackCard
              pack={pack}
              disabled={isBusy}
              onStart={onStartPack}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
