import { getBodyTextStyle, getHeadingProps } from "@worldnote/ui";

type HomeHeroProps = {
  greeting: string;
  username: string;
};

export function HomeHero({ greeting, username }: HomeHeroProps) {
  return (
    <>
      <p
        className="mb-2 shrink-0 text-center text-wn-mono-400"
        style={{
          ...getBodyTextStyle("body"),
          fontSize: "20px",
          fontWeight: "var(--font-weight-wn-medium)",
        }}
      >
        Good {greeting}, {username}
      </p>
      <h1
        {...getHeadingProps("h1", {
          tone: "inverse",
          weight: "semibold",
          className: "mx-auto mb-12 shrink-0 text-center whitespace-nowrap",
        })}
      >
        What are you building today?
      </h1>
    </>
  );
}
