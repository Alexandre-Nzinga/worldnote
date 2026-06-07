import { DataSet } from "vis-data";
import { Timeline } from "vis-timeline/standalone";
import type { DataItem, TimelineOptions } from "vis-timeline";
import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";

type VisTimelineGroup = {
  id: string;
  content: string;
  nestedGroups?: string[];
};

type HostSize = {
  width: number;
  height: number;
};

type UseVisTimelineOptions = {
  isOpen: boolean;
  mountRef: RefObject<HTMLDivElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  createOptions: (size: HostSize) => TimelineOptions;
  onReady?: (api: {
    timeline: Timeline;
    items: DataSet<DataItem, "id">;
    groups: DataSet<VisTimelineGroup, "id">;
  }) => void;
};

export function useVisTimeline({
  isOpen,
  mountRef,
  containerRef,
  createOptions,
  onReady,
}: UseVisTimelineOptions) {
  const timelineRef = useRef<Timeline | null>(null);
  const itemsRef = useRef<DataSet<DataItem, "id"> | null>(null);
  const groupsRef = useRef<DataSet<VisTimelineGroup, "id"> | null>(null);
  const createOptionsRef = useRef(createOptions);
  const onReadyRef = useRef(onReady);
  const [hostSize, setHostSize] = useState<HostSize>({ width: 0, height: 0 });
  const [initError, setInitError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  createOptionsRef.current = createOptions;
  onReadyRef.current = onReady;

  useEffect(() => {
    if (!isOpen || !containerRef.current) {
      return;
    }

    const element = containerRef.current;
    const measure = () => {
      setHostSize({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [containerRef, isOpen]);

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
    if (
      !mountNode ||
      hostSize.height <= 0 ||
      hostSize.width <= 0 ||
      timelineRef.current
    ) {
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
          createOptionsRef.current(hostSize),
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
  }, [hostSize, isOpen, mountRef]);

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline || hostSize.height <= 0 || hostSize.width <= 0) {
      return;
    }
    timeline.setOptions({
      height: hostSize.height,
      width: hostSize.width,
    });
    timeline.redraw();
  }, [hostSize.height, hostSize.width]);

  return {
    timelineRef,
    itemsRef,
    groupsRef,
    hostSize,
    initError,
    isReady,
  };
}
