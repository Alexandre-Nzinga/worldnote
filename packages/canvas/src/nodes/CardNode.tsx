import { CardTypePill } from "./CardTypePill.js";
import {
  Handle,
  type Node,
  type NodeProps,
  Position,
  useNodeId,
  useUpdateNodeInternals,
} from "@xyflow/react";
import { AnimatePresence, motion } from "framer-motion";
import type { DragEventHandler, ReactNode } from "react";
import {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  getNodeViewHandlePositions,
  handleStyleAtTop,
} from "./card-node-layout.js";
import type { CardImageFit, CardImagePosition } from "./card-image-display.js";
import { CardBrandLogo } from "./CardBrandLogo.js";
import { CardImageView } from "./CardImageView.js";
import { CardTypePlaceholder } from "./CardTypePlaceholder.js";
import { socketRightHandleId } from "./handle-ids.js";
import { useImageLuminance } from "./useImageLuminance.js";
import {
  entitySourceHandleClassName,
  socketHandleClassName as nodeSocketHandleClassName,
  socketStyleFor,
} from "./socket-style.js";
import {
  visualConfigFor,
  type WorldNoteCardType,
} from "./card-visual-config.js";

export type { WorldNoteCardType } from "./card-visual-config.js";

export type CardNodeSocket = {
  id: string;
  accepts: readonly string[];
  cardinality: "single" | "many";
};

export type CardNodeScalars = {
  gender?: "male" | "female" | "x";
  birthdate?: string;
  deathdate?: string;
  race?: string;
  appearance?: string;
  personality?: string;
  coordinates?: string;
};

export type CardNodeData = {
  cardId?: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  imageFit?: CardImageFit;
  imagePosition?: CardImagePosition;
  cardType?: WorldNoteCardType;
  sockets?: CardNodeSocket[];
  visibleSockets?: Record<string, boolean>;
  scalars?: CardNodeScalars;
  socketValues?: Record<string, string[]>;
  onUpdate?: (partial: Record<string, unknown>) => void;
  /** Persisted user preference for card display mode. */
  viewMode?: CardViewMode;
  /** Pass-through card custom properties for persisting view toggles. */
  customProperties?: Record<string, unknown>;
  /** Faint border while this card is hovered during a connection drag. */
  connectionHover?: boolean;
  /** One-shot enter animation when a card is newly created. */
  enterAnimation?: boolean;
  /** Starts an HTML5 drag of this card out to external drop targets (WorldWizard). */
  onDragCardStart?: DragEventHandler<HTMLDivElement>;
};

/** Six-dot grip used to drag a card out of the canvas. */
function CardDragGrip({
  onDragStart,
}: {
  onDragStart: DragEventHandler<HTMLDivElement>;
}) {
  return (
    <div
      className="nodrag nopan absolute -left-2 -top-2 z-20 flex h-7 w-7 cursor-grab items-center justify-center rounded-full border border-wn-mono-600 bg-wn-mono-900 text-wn-mono-300 opacity-80 shadow-md transition-opacity hover:border-wn-azure-500 hover:text-wn-mono-50 group-hover/card:opacity-100 active:cursor-grabbing"
      draggable
      onMouseDown={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onTouchStart={(event) => event.stopPropagation()}
      onDragStart={onDragStart}
      title="Drag into WorldWizard"
      aria-label="Drag card into WorldWizard"
    >
      <svg
        width="10"
        height="14"
        viewBox="0 0 10 14"
        fill="currentColor"
        role="img"
      >
        <title>Drag handle</title>
        <circle cx="2" cy="2" r="1.4" />
        <circle cx="8" cy="2" r="1.4" />
        <circle cx="2" cy="7" r="1.4" />
        <circle cx="8" cy="7" r="1.4" />
        <circle cx="2" cy="12" r="1.4" />
        <circle cx="8" cy="12" r="1.4" />
      </svg>
    </div>
  );
}

const connectHoverRingClass = "ring-1 ring-inset ring-wn-mono-50/50";

const cardBorderTransitionClass =
  "transition-[border-color,box-shadow] duration-150";
const cardSolidBorderBaseClass = `border-[5px] ${cardBorderTransitionClass}`;
const cardSolidBorderDefaultClass = `${cardSolidBorderBaseClass} border-wn-mono-600`;
const cardSolidBorderHighlightClass = `${cardSolidBorderBaseClass} border-wn-mono-50`;
const cardSolidBorderHoverClass = "group-hover/card:border-wn-mono-50";
const cardImageFrameHighlightClass = "ring-2 ring-inset ring-wn-mono-50";
const cardImageFrameHoverClass =
  "group-hover/card:ring-2 group-hover/card:ring-inset group-hover/card:ring-wn-mono-50";

function cardChromeBorderClass({
  hasSolidBorder,
  isSelected,
  connectionHover,
}: {
  hasSolidBorder: boolean;
  isSelected: boolean;
  connectionHover: boolean;
}): string {
  if (!hasSolidBorder) {
    if (isSelected) {
      return cardImageFrameHighlightClass;
    }
    if (connectionHover) {
      return connectHoverRingClass;
    }
    return cardImageFrameHoverClass;
  }

  if (isSelected) {
    return cardSolidBorderHighlightClass;
  }
  if (connectionHover) {
    return `${cardSolidBorderDefaultClass} ${connectHoverRingClass}`;
  }
  return `${cardSolidBorderDefaultClass} ${cardSolidBorderHoverClass}`;
}

const cardEnterVariants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 420,
      damping: 38,
      mass: 0.85,
    },
  },
};

const viewCrossfadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export type CardFlowNode = Node<CardNodeData, "worldnoteCard">;

export type CardViewMode = "visual" | "node";

const cardRadiusStyle = { borderRadius: "var(--radius-wn-card)" } as const;

const BORDER_WIDTH_PX = 5;

const NODE_VIEW_WIDTH = "w-[260px]";

/** Invisible in visual view; React Flow still measures handles for edge routing. */
const visualHandleClassName =
  "!h-2.5 !w-2.5 !min-h-0 !min-w-0 !border-2 !opacity-0 !pointer-events-none";

const visualSocketHandleClassName = `${visualHandleClassName} !border-wn-azure-400 !bg-wn-azure-200`;

const visualOutputHandleClassName = `${visualHandleClassName} !border-wn-mono-400 !bg-wn-mono-200`;

const nodeFieldClassName =
  "w-full rounded-xl border border-wn-mono-700 bg-wn-mono-900 px-3 py-2 text-sm text-wn-mono-50 placeholder:text-wn-mono-500 outline-none transition-colors hover:border-wn-mono-600 focus:border-wn-mono-500";

function formatSocketId(socketId: string): string {
  return socketId.replace(/_/g, " ");
}

function formatSocketValue(names: string[] | undefined): string {
  if (!names || names.length === 0) {
    return "";
  }
  return names.join(", ");
}

type CardSocketHandlesProps = {
  sockets: CardNodeSocket[];
  visibleSockets: Record<string, boolean>;
};

function CardSocketHandles({
  sockets,
  visibleSockets,
}: CardSocketHandlesProps) {
  const visible = sockets.filter(
    (socket) => visibleSockets[socket.id] ?? false,
  );

  return (
    <>
      {visible.map((socket, index) => {
        const topPercent =
          visible.length === 1
            ? 50
            : ((index + 1) / (visible.length + 1)) * 100;
        const rowStyle = { top: `${topPercent}%` };
        return (
          <Fragment key={socket.id}>
            <Handle
              type="target"
              position={Position.Left}
              id={socket.id}
              title={`${formatSocketId(socket.id)} (${socket.accepts.join(", ")})`}
              className={visualSocketHandleClassName}
              style={rowStyle}
            />
            <Handle
              type="target"
              position={Position.Right}
              id={socketRightHandleId(socket.id)}
              title={`${formatSocketId(socket.id)} (${socket.accepts.join(", ")})`}
              className={visualSocketHandleClassName}
              style={rowStyle}
            />
          </Fragment>
        );
      })}
      <Handle
        type="source"
        position={Position.Right}
        id="entity"
        title="Entity output"
        className={visualOutputHandleClassName}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="entity__left"
        title="Entity output"
        className={visualOutputHandleClassName}
      />
    </>
  );
}

/** Blurred, saturated copy of the card image shows through the padding as a color gradient border. */
type CardImageBorderFrameProps = {
  imageUrl?: string;
  widthClass?: string;
  className?: string;
  connectionHover?: boolean;
  isSelected?: boolean;
  children: ReactNode;
};

function CardImageBorderFrame({
  imageUrl,
  widthClass,
  className = "",
  connectionHover = false,
  isSelected = false,
  children,
}: CardImageBorderFrameProps) {
  const hasImageBorder = Boolean(imageUrl);
  const borderClass = cardChromeBorderClass({
    hasSolidBorder: !hasImageBorder,
    isSelected,
    connectionHover,
  });

  return (
    <div
      className={`relative shadow-lg ${widthClass ?? ""} ${className} ${borderClass} ${
        hasImageBorder ? "" : "overflow-hidden rounded-wn-card"
      }`}
      style={
        hasImageBorder
          ? { ...cardRadiusStyle, padding: BORDER_WIDTH_PX }
          : cardRadiusStyle
      }
    >
      {hasImageBorder ? (
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={cardRadiusStyle}
          aria-hidden
        >
          <img
            src={imageUrl}
            alt=""
            className="absolute left-1/2 top-1/2 h-[150%] w-[150%] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover opacity-95 saturate-150 blur-2xl"
          />
        </div>
      ) : null}
      <div
        className="relative overflow-hidden bg-wn-mono-900"
        style={cardRadiusStyle}
      >
        {children}
      </div>
    </div>
  );
}

type OverlayMediaCardProps = {
  data: CardNodeData;
  widthClass: string;
  aspectClass: string;
  badgeLabel: string;
  badgeClassName: string;
  badgeTextColor?: string;
  titleClassName?: string;
  isSelected?: boolean;
  onToggleView: () => void;
};

/** Full-bleed image card with bottom gradient, title, subtitle, and type badge. */
function OverlayMediaCard({
  data,
  widthClass,
  aspectClass,
  badgeLabel,
  badgeClassName,
  badgeTextColor,
  titleClassName = "text-lg font-semibold leading-tight",
  isSelected = false,
  onToggleView,
}: OverlayMediaCardProps) {
  const { isDark } = useImageLuminance(data.imageUrl);
  const titleColorClass = isDark === false ? "text-black" : "text-white"; // default to white on unknown
  const subtitleColorClass =
    isDark === false ? "text-black/70" : "text-white/80";

  return (
    <CardImageBorderFrame
      imageUrl={data.imageUrl}
      widthClass={widthClass}
      className="shadow-sm"
      connectionHover={data.connectionHover}
      isSelected={isSelected}
    >
      <div
        className={`relative w-full overflow-hidden bg-wn-mono-800 ${aspectClass}`}
      >
        {data.imageUrl ? (
          <CardImageView
            src={data.imageUrl}
            fit={data.imageFit}
            position={data.imagePosition}
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <CardTypePlaceholder
            cardType={data.cardType}
            className="absolute inset-0 h-full w-full"
          />
        )}
        <CardBrandLogo onClick={onToggleView} />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
          <div className="min-w-0 flex-1">
            <div className={`truncate ${titleColorClass} ${titleClassName}`}>
              {data.title}
            </div>
            {data.subtitle ? (
              <div className={`truncate pt-0.5 text-xs ${subtitleColorClass}`}>
                {data.subtitle}
              </div>
            ) : null}
          </div>
          <CardTypePill
            className={badgeClassName}
            textClassName={badgeTextColor}
          >
            {badgeLabel}
          </CardTypePill>
        </div>
      </div>
    </CardImageBorderFrame>
  );
}

type SocketRowProps = {
  socket: CardNodeSocket;
  value: string;
};

/** Socket label row; border handles are aligned via measured row centers. */
function SocketRow({ socket, value }: SocketRowProps) {
  return (
    <div data-socket-row className="flex h-9 items-center">
      <input
        type="text"
        readOnly
        value={value}
        placeholder={formatSocketId(socket.id)}
        className={`${nodeFieldClassName} nodrag w-full cursor-default`}
        aria-label={formatSocketId(socket.id)}
      />
    </div>
  );
}

type CardNodeViewProps = {
  data: CardNodeData;
  badgeLabel: string;
  badgeClassName: string;
  badgeTextColor?: string;
  isSelected?: boolean;
  onToggleView: () => void;
};

function CardNodeView({
  data,
  badgeLabel,
  badgeClassName,
  badgeTextColor,
  isSelected = false,
  onToggleView,
}: CardNodeViewProps) {
  const nodeId = useNodeId();
  const updateNodeInternals = useUpdateNodeInternals();
  const socketValues = data.socketValues ?? {};
  const sockets = data.sockets ?? [];

  const { rowTops, entityTop } = useMemo(
    () =>
      getNodeViewHandlePositions(sockets.length, {
        hasSubtitle: Boolean(data.subtitle),
      }),
    [data.subtitle, sockets.length],
  );

  const entityHandleStyle = useMemo(
    () => handleStyleAtTop(entityTop),
    [entityTop],
  );

  useLayoutEffect(() => {
    if (!nodeId) {
      return;
    }
    const layoutVersion = `${rowTops.join(",")}:${entityTop}`;
    updateNodeInternals(nodeId);
    void layoutVersion;
  }, [entityTop, nodeId, rowTops, updateNodeInternals]);

  const borderClass = cardChromeBorderClass({
    hasSolidBorder: true,
    isSelected,
    connectionHover: Boolean(data.connectionHover),
  });

  return (
    <div className={`relative ${NODE_VIEW_WIDTH} text-wn-mono-50`}>
      <div
        data-card-connect-target
        className={`overflow-hidden rounded-wn-card bg-wn-mono-900 shadow-lg ${borderClass}`}
        style={cardRadiusStyle}
      >
        <div className="relative border-b border-wn-mono-800 px-4 pb-3 pt-12">
          <CardBrandLogo onClick={onToggleView} />
          <div className="min-w-0 pr-16">
            <div className="truncate text-base font-semibold leading-tight text-wn-mono-50">
              {data.title}
            </div>
            {data.subtitle ? (
              <div className="truncate pt-0.5 text-xs text-wn-mono-400">
                {data.subtitle}
              </div>
            ) : null}
          </div>
          <CardTypePill
            className={`absolute right-4 top-12 ${badgeClassName}`}
            textClassName={badgeTextColor}
          >
            {badgeLabel}
          </CardTypePill>
        </div>

        <div data-socket-list className="flex flex-col gap-1.5 px-4 py-3">
          {sockets.length === 0 ? (
            <p className="text-xs text-wn-mono-500">
              No link sockets for this card type.
            </p>
          ) : (
            sockets.map((socket) => (
              <SocketRow
                key={socket.id}
                socket={socket}
                value={formatSocketValue(socketValues[socket.id])}
              />
            ))
          )}
        </div>
      </div>
      {sockets.map((socket, index) => {
        const occupied = (socketValues[socket.id]?.length ?? 0) > 0;
        const socketStyle = socketStyleFor(socket.accepts, socket.cardinality);
        const handleClass = nodeSocketHandleClassName(occupied, socketStyle);
        const title = `${formatSocketId(socket.id)} — drop a card here (${socket.accepts.join(", ")})`;
        const rowStyle = handleStyleAtTop(rowTops[index] ?? 0);

        return (
          <Fragment key={socket.id}>
            <Handle
              type="target"
              position={Position.Left}
              id={socket.id}
              title={title}
              className={handleClass}
              style={rowStyle}
            />
            <Handle
              type="target"
              position={Position.Right}
              id={socketRightHandleId(socket.id)}
              title={title}
              className={handleClass}
              style={rowStyle}
            />
          </Fragment>
        );
      })}
      <Handle
        type="source"
        position={Position.Right}
        id="entity"
        title="Drag from here to plug this card into another card's socket"
        className={entitySourceHandleClassName}
        style={entityHandleStyle}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="entity__left"
        title="Drag from here to plug this card into another card's socket"
        className={entitySourceHandleClassName}
        style={entityHandleStyle}
      />
    </div>
  );
}

type CardNodeBodyProps = {
  data: CardNodeData;
  viewMode: CardViewMode;
  isSelected: boolean;
  onToggleView: () => void;
};

function CardNodeBody({
  data,
  viewMode,
  isSelected,
  onToggleView,
}: CardNodeBodyProps) {
  const visual = visualConfigFor(data.cardType);

  if (viewMode === "node") {
    return (
      <CardNodeView
        data={data}
        badgeLabel={visual.label}
        badgeClassName={visual.badgeClassName}
        badgeTextColor={visual.badgeTextColor}
        isSelected={isSelected}
        onToggleView={onToggleView}
      />
    );
  }

  return (
    <OverlayMediaCard
      data={data}
      widthClass={visual.widthClass}
      aspectClass={visual.aspectClass}
      badgeLabel={visual.label}
      badgeClassName={visual.badgeClassName}
      badgeTextColor={visual.badgeTextColor}
      titleClassName={visual.titleClassName}
      isSelected={isSelected}
      onToggleView={onToggleView}
    />
  );
}

function CardNodeInner({ data, selected = false }: NodeProps<CardFlowNode>) {
  const [viewMode, setViewMode] = useState<CardViewMode>(
    data.viewMode ?? "visual",
  );
  const [enterDone, setEnterDone] = useState(!data.enterAnimation);
  const sockets = data.sockets ?? [];
  const visibleSockets = data.visibleSockets ?? {};

  useEffect(() => {
    if (!data.enterAnimation) {
      setEnterDone(true);
    }
  }, [data.enterAnimation]);

  useEffect(() => {
    if (data.viewMode) {
      setViewMode(data.viewMode);
    }
  }, [data.viewMode]);

  const onToggleView = useCallback(() => {
    setViewMode((current) => {
      const next: CardViewMode = current === "visual" ? "node" : "visual";
      data.onUpdate?.({
        custom_properties: {
          ...(data.customProperties ?? {}),
          view_mode: next,
        },
      });
      return next;
    });
  }, [data.customProperties, data.onUpdate]);

  const handles =
    viewMode === "visual" ? (
      <CardSocketHandles sockets={sockets} visibleSockets={visibleSockets} />
    ) : null;

  const shouldEnter = Boolean(data.enterAnimation && !enterDone);

  return (
    <motion.div
      className="group/card relative"
      variants={cardEnterVariants}
      initial={shouldEnter ? "hidden" : false}
      animate="visible"
      onAnimationComplete={() => {
        if (data.enterAnimation && !enterDone) {
          setEnterDone(true);
          data.onUpdate?.({ enterAnimation: false });
        }
      }}
    >
      {handles}
      {data.onDragCardStart ? (
        <CardDragGrip onDragStart={data.onDragCardStart} />
      ) : null}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={viewMode}
          variants={viewCrossfadeVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.15 }}
        >
          <CardNodeBody
            data={data}
            viewMode={viewMode}
            isSelected={selected}
            onToggleView={onToggleView}
          />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

export const CardNode = memo(CardNodeInner);
CardNode.displayName = "CardNode";

export const cardNodeDefaults = {
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
} as const;
