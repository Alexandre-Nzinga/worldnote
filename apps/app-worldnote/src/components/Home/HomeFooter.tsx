export function HomeFooter() {
  return (
    <footer className="mt-12 flex shrink-0 items-center justify-center pb-4 text-wn-mono-500">
      <div
        className="flex items-center gap-2"
        style={{ fontSize: "13px", fontWeight: "var(--font-weight-wn-medium)" }}
      >
        <span>WorldNote</span>
        <span className="font-mono">v{__APP_VERSION__}</span>
      </div>
    </footer>
  );
}
