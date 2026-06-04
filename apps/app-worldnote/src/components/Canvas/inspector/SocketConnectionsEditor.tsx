import type { Link, SocketDescriptor, WorldCard } from "@worldnote/shared";
import { CARD_TYPE_LABELS } from "@worldnote/shared";
import { CardReferenceComboBox, MaterialSymbol } from "@worldnote/ui";
import { useMemo } from "react";
import {
  inspectorFieldLabelClassName,
  inspectorConnectionsSectionLabelClassName,
} from "./inspectorFieldStyles.js";
import {
  currentSocketLinks,
  eligibleCardsForSocket,
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
};

function SocketFieldEditor({
  card,
  socketId,
  descriptor,
  label,
  cardsById,
  links,
  disabled,
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

  const eligibleOptions = useMemo(
    () =>
      eligibleCardsForSocket(descriptor, cardsById, {
        excludeCardIds: excludeIds,
      }),
    [descriptor, cardsById, excludeIds],
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
        options={eligibleOptions}
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
            <li
              key={entry.linkId}
              className="flex items-center justify-between gap-2 rounded-lg bg-wn-mono-900 px-2.5 py-1.5"
            >
              <span className="min-w-0 truncate text-sm text-wn-mono-100">
                {entry.targetName}
              </span>
              <button
                type="button"
                className="shrink-0 rounded-lg p-1 text-wn-mono-500 transition-colors hover:bg-wn-mono-800 hover:text-wn-red-400 disabled:opacity-40"
                aria-label={`Remove ${entry.targetName}`}
                disabled={disabled}
                onClick={() => onRemoveSocketLink(entry.linkId)}
              >
                <MaterialSymbol name="close" className="text-base" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <CardReferenceComboBox
        id={`socket-${socketId}-add`}
        label={label}
        hideLabel
        options={eligibleOptions}
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
}: SocketConnectionsEditorProps) {
  if (socketEntries.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-3">
      <span className={inspectorConnectionsSectionLabelClassName}>
        Connections
      </span>
      <div className="flex flex-col gap-3">
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
            onCreateSocketLink={onCreateSocketLink}
            onRemoveSocketLink={onRemoveSocketLink}
            onCreateAndLinkCard={onCreateAndLinkCard}
          />
        ))}
      </div>
    </section>
  );
}
