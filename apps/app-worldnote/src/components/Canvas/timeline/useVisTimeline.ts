import { DataSet } from "vis-data";
import { Timeline } from "vis-timeline/standalone";
import type { DataItem, TimelineOptions } from "vis-timeline";
import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";

type VisTimelineGroup = { id: string; content: string };

type UseVisTimelineOptions = {
  isOpen: boolean;
  mountRef: RefObject<HTMLDivElement | null>;
  createOptions: (height: number) => TimelineOptions;
  onReady?: (api: {
    timeline: Timeline;
    items: DataSet<DataItem, "id">;
    groups: DataSet<VisTimelineGroup, "id">;
  }) => void;
};

export function useVisTimeline({
  isOpen,
  mountRef,
  createOptions,
  onReady,
}: UseVisTimelineOptions) {
  const timelineRef = useRef<Timeline | null>(null);
  const itemsRef = useRef<DataSet<DataItem, "id"> | null>(null);
  const groupsRef = useRef<DataSet<VisTimelineGroup, "id"> | null>(null);
  const createOptionsRef = useRef(createOptions);
  const onReadyRef = useRef(onReady);
  const [hostHeight, setHostHeight] = useState(0);
  const [initError, setInitError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  createOptionsRef.current = createOptions;
  onReadyRef.current = onReady;

  useEffect(() => {
    if (!isOpen || !mountRef.current) {
      return;
    }

    const element = mountRef.current;
    const measure = () => {
      setHostHeight(element.clientHeight);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [isOpen, mountRef]);

  useEffect(() => {
    if (!isOpen) {
      timelineRef.current?.destroy();
      timelineRef.current = null;
      itemsRef.current = null;
      groupsRef.current = null;
      setIsReady(false);
      setInitError(null);
      return;
    }

    const mountNode = mountRef.current;
    if (!mountNode || hostHeight <= 0 || timelineRef.current) {
      return;
    }

    let cancelled = false;

    const frame = window.requestAnimationFrame(() => {
      if (cancelled || !mountRef.current || timelineRef.current) {
        return;
      }

      try {
        const items = new DataSet<DataItem, "id">([]);
        const groups = new DataSet<VisTimelineGroup, "id">([]);
        const timeline = new Timeline(
          mountRef.current,
          items,
          groups,
          createOptionsRef.current(hostHeight),
        );

        timelineRef.current = timeline;
        itemsRef.current = items;
        groupsRef.current = groups;
        setInitError(null);
        setIsReady(true);
        onReadyRef.current?.({ timeline, items, groups });
      } catch (error) {
        console.error("Failed to initialize timeline:", error);
        setInitError(
          error instanceof Error
            ? error.message
            : "Could not initialize timeline view.",
        );
        setIsReady(false);
      }
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [hostHeight, isOpen, mountRef]);

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline || hostHeight <= 0) {
      return;
    }
    timeline.setOptions({ height: hostHeight, width: "100%" });
    timeline.redraw();
  }, [hostHeight]);

  return {
    timelineRef,
    itemsRef,
    groupsRef,
    hostHeight,
    initError,
    isReady,
  };
}
