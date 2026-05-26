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
import type { ReactNode } from "react";
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
import { socketRightHandleId } from "./handle-ids.js";
import {
  entitySourceHandleClassName,
  socketHandleClassName as nodeSocketHandleClassName,
  socketStyleFor,
} from "./socket-style.js";

/** Mirrors WorldCard card_type slugs (kept in canvas to avoid a shared package dependency). */
export type WorldNoteCardType =
  | "character"
  | "location"
  | "item"
  | "vehicle"
  | "flora"
  | "fauna"
  | "building"
  | "structure"
  | "species";

type CardVisualConfig = {
  label: string;
  badgeClassName: string;
  widthClass: string;
  aspectClass: string;
  titleClassName?: string;
  badgeTextColor?: string;
};

const CARD_VISUAL_CONFIG: Record<WorldNoteCardType, CardVisualConfig> = {
  character: {
    label: "Character",
    badgeClassName: "bg-wn-mono-300",
    widthClass: "w-[250px]",
    aspectClass: "aspect-3/4",
    titleClassName: "text-xl font-semibold leading-tight",
  },
  location: {
    label: "Location",
    badgeClassName: "bg-wn-mono-800",
    badgeTextColor: "text-wn-mono-50",
    widthClass: "w-[280px]",
    aspectClass: "aspect-5/3",
  },
  item: {
    label: "Item",
    badgeClassName: "bg-wn-amber-200",
    widthClass: "w-[260px]",
    aspectClass: "aspect-5/3",
  },
  vehicle: {
    label: "Vehicle",
    badgeClassName: "bg-wn-indigo-200",
    widthClass: "w-[280px]",
    aspectClass: "aspect-5/3",
  },
  flora: {
    label: "Flora",
    badgeClassName: "bg-wn-lime-300",
    widthClass: "w-[260px]",
    aspectClass: "aspect-5/3",
  },
  fauna: {
    label: "Fauna",
    badgeClassName: "bg-wn-rose-300",
    widthClass: "w-[260px]",
    aspectClass: "aspect-5/3",
  },
  building: {
    label: "Building",
    badgeClassName: "bg-wn-mono-300",
    widthClass: "w-[280px]",
    aspectClass: "aspect-5/3",
  },
  structure: {
    label: "Structure",
    badgeClassName: "bg-wn-mono-400",
    widthClass: "w-[280px]",
    aspectClass: "aspect-5/3",
  },
  species: {
    label: "Species",
    badgeClassName: "bg-wn-azure-200",
    widthClass: "w-[260px]",
    aspectClass: "aspect-5/3",
  },
};

const DEFAULT_VISUAL_CONFIG = CARD_VISUAL_CONFIG.location;

function visualConfigFor(cardType: WorldNoteCardType | undefined): CardVisualConfig {
  if (cardType && cardType in CARD_VISUAL_CONFIG) {
    return CARD_VISUAL_CONFIG[cardType];
  }
  return DEFAULT_VISUAL_CONFIG;
}

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
};

const connectHoverRingClass = "ring-1 ring-inset ring-wn-mono-50/50";

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
  children: ReactNode;
};

function CardImageBorderFrame({
  imageUrl,
  widthClass,
  className = "",
  connectionHover = false,
  children,
}: CardImageBorderFrameProps) {
  const hasImageBorder = Boolean(imageUrl);
  const hoverRing = connectionHover ? connectHoverRingClass : "";

  return (
    <div
      className={`relative shadow-lg ${widthClass ?? ""} ${className} ${hoverRing} ${
        hasImageBorder
          ? ""
          : "overflow-hidden rounded-wn-card border-[5px] border-wn-mono-600"
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
  onToggleView,
}: OverlayMediaCardProps) {
  return (
    <CardImageBorderFrame
      imageUrl={data.imageUrl}
      widthClass={widthClass}
      className="text-wn-mono-50 shadow-sm"
      connectionHover={data.connectionHover}
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
        ) : null}
        <CardBrandLogo onClick={onToggleView} />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-wn-mono-950 via-wn-mono-950/60 to-wn-mono-950/15"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
          <div className="min-w-0 flex-1">
            <div className={`truncate text-wn-mono-50 ${titleClassName}`}>
              {data.title}
            </div>
            {data.subtitle ? (
              <div className="truncate pt-0.5 text-xs text-wn-mono-300">
                {data.subtitle}
              </div>
            ) : null}
          </div>
          <CardTypePill className={badgeClassName} textClassName={badgeTextColor}>
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
  onToggleView: () => void;
};

function CardNodeView({
  data,
  badgeLabel,
  badgeClassName,
  badgeTextColor,
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

  return (
    <div className={`group relative ${NODE_VIEW_WIDTH} text-wn-mono-50`}>
      <div
        data-card-connect-target
        className={`overflow-hidden rounded-wn-card border-[5px] border-wn-mono-600 bg-wn-mono-900 shadow-lg ${
          data.connectionHover ? connectHoverRingClass : ""
        }`}
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
  onToggleView: () => void;
};

function CardNodeBody({ data, viewMode, onToggleView }: CardNodeBodyProps) {
  const visual = visualConfigFor(data.cardType);

  if (viewMode === "node") {
    return (
      <CardNodeView
        data={data}
        badgeLabel={visual.label}
        badgeClassName={visual.badgeClassName}
        badgeTextColor={visual.badgeTextColor}
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
      onToggleView={onToggleView}
    />
  );
}

function CardNodeInner({ data }: NodeProps<CardFlowNode>) {
  const [viewMode, setViewMode] = useState<CardViewMode>(data.viewMode ?? "visual");
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
      className="group relative"
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
