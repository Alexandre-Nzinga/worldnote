import type { Editor } from "@tiptap/core";
import { getHeadingProps } from "@worldnote/ui";
import { useCallback, useEffect, useRef, useState } from "react";

const OUTLINE_HEADING_SELECTOR =
  ".inspector-lore-editor-prose h1, .inspector-lore-editor-prose h2";

/** Beyond this length, allow up to two lines instead of truncating on one. */
const OUTLINE_TWO_LINE_MIN_LENGTH = 36;

type OutlineHeadingLevel = 1 | 2;

type OutlineHeading = {
  id: string;
  text: string;
  level: OutlineHeadingLevel;
  index: number;
};

function isOutlineHeadingLevel(level: unknown): level is OutlineHeadingLevel {
  return level === 1 || level === 2;
}

function collectOutlineHeadings(editor: Editor): OutlineHeading[] {
  const items: OutlineHeading[] = [];
  let index = 0;
  editor.state.doc.descendants((node) => {
    if (
      node.type.name === "heading" &&
      isOutlineHeadingLevel(node.attrs.level)
    ) {
      const text =
        node.textContent.trim() ||
        (node.attrs.level === 1 ? "Untitled section" : "Untitled subsection");
      items.push({
        id: `h${node.attrs.level}-${index}`,
        text,
        level: node.attrs.level,
        index,
      });
      index += 1;
    }
  });
  return items;
}

function getOutlineHeadingElements(scrollEl: HTMLElement): NodeListOf<Element> {
  return scrollEl.querySelectorAll(OUTLINE_HEADING_SELECTOR);
}

function getActiveHeadingIndex(scrollEl: HTMLElement): number {
  const headings = getOutlineHeadingElements(scrollEl);
  if (headings.length === 0) {
    return -1;
  }

  const containerTop = scrollEl.getBoundingClientRect().top;
  const threshold = containerTop + 56;
  let active = 0;

  headings.forEach((heading, index) => {
    if (heading.getBoundingClientRect().top <= threshold) {
      active = index;
    }
  });

  return active;
}

function scrollToHeadingIndex(scrollEl: HTMLElement, index: number) {
  const headings = getOutlineHeadingElements(scrollEl);
  const target = headings[index];
  if (!(target instanceof HTMLElement)) {
    return;
  }
  const containerTop = scrollEl.getBoundingClientRect().top;
  const targetTop = target.getBoundingClientRect().top;
  scrollEl.scrollTo({
    top: scrollEl.scrollTop + (targetTop - containerTop) - 12,
    behavior: "smooth",
  });
}

type DocumentOutlineProps = {
  editor: Editor | null;
  scrollElement: HTMLElement | null;
};

export function DocumentOutline({ editor, scrollElement }: DocumentOutlineProps) {
  const navRef = useRef<HTMLElement>(null);
  const scrollElementRef = useRef(scrollElement);
  scrollElementRef.current = scrollElement;
  const [headings, setHeadings] = useState<OutlineHeading[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const refreshHeadings = useCallback(() => {
    if (!editor) {
      setHeadings([]);
      setActiveIndex(-1);
      return;
    }
    setHeadings(collectOutlineHeadings(editor));
    const scrollEl = scrollElementRef.current;
    if (scrollEl) {
      setActiveIndex(getActiveHeadingIndex(scrollEl));
    }
  }, [editor]);

  useEffect(() => {
    refreshHeadings();
    if (!editor) {
      return;
    }
    const onUpdate = () => refreshHeadings();
    editor.on("update", onUpdate);
    return () => {
      editor.off("update", onUpdate);
    };
  }, [editor, refreshHeadings, scrollElement]);

  useEffect(() => {
    if (!scrollElement) {
      setActiveIndex(-1);
      return;
    }

    const updateActive = () => {
      setActiveIndex(getActiveHeadingIndex(scrollElement));
    };

    updateActive();
    scrollElement.addEventListener("scroll", updateActive, { passive: true });
    return () => {
      scrollElement.removeEventListener("scroll", updateActive);
    };
  }, [scrollElement]);

  useEffect(() => {
    if (activeIndex < 0 || !navRef.current) {
      return;
    }
    const activeButton = navRef.current.querySelector(
      `[data-outline-index="${activeIndex}"]`,
    );
    activeButton?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIndex]);

  const handleHeadingClick = (index: number) => {
    if (!scrollElement) {
      return;
    }
    scrollToHeadingIndex(scrollElement, index);
    setActiveIndex(index);
  };

  return (
    <nav
      ref={navRef}
      className="scrollbar-wn flex h-full min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5"
      aria-label="Document outline"
    >
      <div className="my-auto flex w-full flex-col">
        <h2
          {...getHeadingProps("h6", {
            tone: "inverse",
            weight: "semibold",
            className: "m-0 mb-4 text-center",
          })}
        >
          Content
        </h2>
        {headings.length === 0 ? (
          <p className="m-0 text-center text-sm text-wn-mono-500">
            Start writing to build an outline.
          </p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {headings.map((heading) => {
              const isActive = heading.index === activeIndex;
              const isH2 = heading.level === 2;
              return (
                <li
                  key={heading.id}
                  className={isH2 ? "pl-3" : undefined}
                >
                  <button
                    type="button"
                    data-outline-index={heading.index}
                    title={heading.text}
                    className={[
                      "inspector-outline-item min-w-0 w-full rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
                      isActive
                        ? "inspector-outline-item--active font-medium text-wn-mono-50"
                        : "text-wn-mono-400 hover:bg-wn-mono-800/60 hover:text-wn-mono-200",
                    ].join(" ")}
                    onClick={() => handleHeadingClick(heading.index)}
                  >
                    <span
                      className={
                        heading.text.length >= OUTLINE_TWO_LINE_MIN_LENGTH
                          ? "line-clamp-2 break-words leading-snug"
                          : "block truncate whitespace-nowrap"
                      }
                    >
                      {heading.text}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </nav>
  );
}
