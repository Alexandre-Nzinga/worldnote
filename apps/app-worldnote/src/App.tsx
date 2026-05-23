import { useCallback, useState } from "react";
import { Canvas } from "./components/Canvas/index.js";
import { Home } from "./components/Home.js";

export default function App() {
  const [started, setStarted] = useState(false);

  const onCreateWorld = useCallback(() => setStarted(true), []);

  if (!started) {
    return <Home onWorldReady={onCreateWorld} />;
  }

  return <Canvas onBack={() => setStarted(false)} />;
}
