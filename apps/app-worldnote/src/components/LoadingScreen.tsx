import { WorldNoteLogo } from "@worldnote/ui";
import { motion } from "framer-motion";

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-wn-mono-950">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <WorldNoteLogo
          variant="icon"
          tone="white"
          className="h-16 w-16 opacity-80"
          alt="WorldNote"
        />
      </motion.div>

      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-wn-mono-400">Loading world…</p>
        <motion.div
          className="flex gap-1"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="h-1 w-1 rounded-full bg-wn-mono-400" />
          <div className="h-1 w-1 rounded-full bg-wn-mono-400" />
          <div className="h-1 w-1 rounded-full bg-wn-mono-400" />
        </motion.div>
      </div>
    </div>
  );
}
