import { cardTypeIconFor } from "@worldnote/canvas";
import type { Link, SocketDescriptor, WorldCard } from "@worldnote/shared";
import { CARD_TYPE_LABELS } from "@worldnote/shared";
import { CardReferenceComboBox, Eyebrow, MaterialSymbol } from "@worldnote/ui";
import { useMemo } from "react";
import { useSettings } from "../../../hooks/useSettings.js";
import { useVault } from "../../../hooks/useVault.js";
import { getRecentLinkTargetIds } from "../../../services/links/recentLinkTargets.js";
import type { CardTypeBadgeOverrides } from "../../../services/settings/settings.js";
import { resolveCardBadgeStyle } from "../../../services/settings/cardTypeBadgeSettings.js";
import {
  inspectorFieldLabelClassName,
  inspectorSectionClassName,
  inspectorSectionEyebrowClassName,
} from "./inspectorFieldStyles.js";
import type { ParentConflict } from "../../../services/familyTree/buildFamilyGraph.js";
import { ParentConflictWarning } from "./ParentConflictWarning.js";
import {
  currentSocketLinks,
  eligibleCardsForSocket,
  recentEligibleForSocket,
  toCardReferenceOption,
} from "./socketEditing.js";

type SocketEntry = { id: string; descriptor: SocketDescriptor };

type SocketConnectionsEditorProps = {
  card: WorldCard;
  cardsById: Record<string, WorldCard>;
  links: Link[];
  socketEntries: SocketEntry[];
  formatSocketId: (id: string) => string;
  disabled?: boolean;
  onCreateSocketLink: (socketId: string, targetCardId: string) => void;
  onRemoveSocketLink: (linkId: string) => void;
  onCreateAndLinkCard: (
    socketId: string,
    cardType: WorldCard["card_type"],
    name: string,
  ) => void;
  parentConflicts?: ParentConflict[];
};

function LinkedCardRow({
  name,
  cardType,
  badgeOverrides,
  onRemove,
  disabled,
}: {
  name: string;
  cardType?: WorldCard["card_type"];
  badgeOverrides?: CardTypeBadgeOverrides;
  onRemove: () => void;
  disabled?: boolean;
}) {
  const badge = cardType
    ? resolveCardBadgeStyle(cardType, badgeOverrides)
    : null;
  const typeIcon = cardType ? cardTypeIconFor(cardType) : null;

  return (
    <li className="flex items-center justify-between gap-2 rounded-lg bg-wn-mono-900 px-2.5 py-1.5">
      <div className="flex min-w-0 items-center gap-2">
        {typeIcon && badge ? (
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${badge.badgeClassName}`}
            aria-hidden
          >
            <MaterialSymbol
              name={typeIcon}
              className={`text-sm ${badge.badgeTextColor ?? "text-wn-mono-50"}`}
            />
          </span>
        ) : null}
        <span className="min-w-0 truncate text-sm text-wn-mono-100">{name}</span>
      </div>
      <button
        type="button"
        className="shrink-0 rounded-lg p-1 text-wn-mono-500 transition-colors hover:bg-wn-mono-800 hover:text-wn-red-400 disabled:opacity-40"
        aria-label={`Remove ${name}`}
        disabled={disabled}
        onClick={onRemove}
      >
        <MaterialSymbol name="close" className="text-base" />
      </button>
    </li>
  );
}

function SocketFieldEditor({
  card,
  socketId,
  descriptor,
  label,
  cardsById,
  links,
  disabled,
  recentCardIds,
  badgeOverrides,
  onCreateSocketLink,
  onRemoveSocketLink,
  onCreateAndLinkCard,
}: {
  card: WorldCard;
  socketId: string;
  descriptor: SocketDescriptor;
  label: string;
  cardsById: Record<string, WorldCard>;
  links: Link[];
  disabled?: boolean;
  recentCardIds: string[];
  badgeOverrides?: CardTypeBadgeOverrides;
  onCreateSocketLink: (socketId: string, targetCardId: string) => void;
  onRemoveSocketLink: (linkId: string) => void;
  onCreateAndLinkCard: (
    socketId: string,
    cardType: WorldCard["card_type"],
    name: string,
  ) => void;
}) {
  const linked = useMemo(
    () => currentSocketLinks(card.id, socketId, links, cardsById),
    [card.id, socketId, links, cardsById],
  );

  const excludeIds = useMemo(() => {
    const ids = new Set<string>([card.id]);
    for (const entry of linked) {
      ids.add(entry.targetCardId);
    }
    return ids;
  }, [card.id, linked]);

  const eligibleItems = useMemo(
    () =>
      eligibleCardsForSocket(descriptor, cardsById, {
        excludeCardIds: excludeIds,
        badgeOverrides,
      }),
    [descriptor, cardsById, excludeIds, badgeOverrides],
  );

  const eligibleOptions = useMemo(
    () => eligibleItems.map(toCardReferenceOption),
    [eligibleItems],
  );

  const recentSuggestions = useMemo(
    () =>
      recentEligibleForSocket(recentCardIds, eligibleItems).map(
        toCardReferenceOption,
      ),
    [eligibleItems, recentCardIds],
  );

  const createOptions = useMemo(
    () =>
      descriptor.accepts.map((cardType) => ({
        label: `Create "{name}" as ${CARD_TYPE_LABELS[cardType]}`,
        onCreate: (name: string) =>
          onCreateAndLinkCard(socketId, cardType, name),
      })),
    [descriptor.accepts, onCreateAndLinkCard, socketId],
  );

  if (descriptor.cardinality === "single") {
    const current = linked[0];
    return (
      <CardReferenceComboBox
        id={`socket-${socketId}`}
        label={label}
        labelClassName={inspectorFieldLabelClassName}
        options={eligibleOptions}
        recentSuggestions={recentSuggestions}
        value={current?.targetCardId ?? null}
        disabled={disabled}
        placeholder="Search cards…"
        createOptions={createOptions}
        onSelect={(targetCardId) => onCreateSocketLink(socketId, targetCardId)}
        onClear={
          current
            ? () => onRemoveSocketLink(current.linkId)
            : undefined
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <span className={inspectorFieldLabelClassName}>{label}</span>
      {linked.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {linked.map((entry) => (
            <LinkedCardRow
              key={entry.linkId}
              name={entry.targetName}
              cardType={entry.targetCardType}
              badgeOverrides={badgeOverrides}
              disabled={disabled}
              onRemove={() => onRemoveSocketLink(entry.linkId)}
            />
          ))}
        </ul>
      ) : null}
      <CardReferenceComboBox
        id={`socket-${socketId}-add`}
        label={label}
        hideLabel
        options={eligibleOptions}
        recentSuggestions={recentSuggestions}
        value={null}
        disabled={disabled}
        placeholder="Search cards to add…"
        createOptions={createOptions}
        onSelect={(targetCardId) => onCreateSocketLink(socketId, targetCardId)}
      />
    </div>
  );
}

export function SocketConnectionsEditor({
  card,
  cardsById,
  links,
  socketEntries,
  formatSocketId,
  disabled = false,
  onCreateSocketLink,
  onRemoveSocketLink,
  onCreateAndLinkCard,
  parentConflicts = [],
}: SocketConnectionsEditorProps) {
  const vaultPath = useVault((state) => state.currentVaultPath);
  const badgeOverrides = useSettings(
    (state) => state.settings?.cardTypeBadgeColors,
  );
  const recentCardIds = useMemo(
    () => getRecentLinkTargetIds(vaultPath),
    [vaultPath],
  );

  if (socketEntries.length === 0) {
    return null;
  }

  return (
    <section className={inspectorSectionClassName}>
      <Eyebrow
        as="h3"
        showDot={false}
        className={inspectorSectionEyebrowClassName}
      >
        Connections
      </Eyebrow>
      <div className="flex flex-col gap-3">
        <ParentConflictWarning
          conflicts={parentConflicts}
          cardsById={cardsById}
        />
        {socketEntries.map(({ id, descriptor }) => (
          <SocketFieldEditor
            key={id}
            card={card}
            socketId={id}
            descriptor={descriptor}
            label={formatSocketId(id)}
            cardsById={cardsById}
            links={links}
            disabled={disabled}
            recentCardIds={recentCardIds}
            badgeOverrides={badgeOverrides}
            onCreateSocketLink={onCreateSocketLink}
            onRemoveSocketLink={onRemoveSocketLink}
            onCreateAndLinkCard={onCreateAndLinkCard}
          />
        ))}
      </div>
    </section>
  );
}
