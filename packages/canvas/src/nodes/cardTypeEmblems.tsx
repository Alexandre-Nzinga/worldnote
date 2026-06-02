import type { ReactNode } from "react";

import type { WorldNoteCardType } from "./card-visual-config.js";

const EMBLEM_COLOR = "var(--color-wn-mono-300)";

type EmblemProps = {
  color?: string;
};

function EmblemWrap({
  children,
  color = EMBLEM_COLOR,
}: {
  children: ReactNode;
  color?: string;
}) {
  return (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth={26}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color }}
    >
      {children}
    </g>
  );
}

function Filled({
  children,
  color = EMBLEM_COLOR,
}: { children: ReactNode; color?: string }) {
  return (
    <g fill="currentColor" stroke="none" style={{ color }}>
      {children}
    </g>
  );
}

export function CharacterEmblem({ color }: EmblemProps) {
  return (
    <EmblemWrap color={color}>
      <circle cx="256" cy="206" r="78" />
      <path d="M128 408c22-78 76-120 128-120s106 42 128 120" />
    </EmblemWrap>
  );
}

export function LocationEmblem({ color }: EmblemProps) {
  return (
    <EmblemWrap color={color}>
      <path d="M256 472s152-126 152-252c0-84-68-152-152-152s-152 68-152 152c0 126 152 252 152 252Z" />
      <circle cx="256" cy="220" r="54" />
    </EmblemWrap>
  );
}

export function ItemEmblem({ color }: EmblemProps) {
  return (
    <EmblemWrap color={color}>
      <path d="M256 72 384 200 256 328 128 200 256 72Z" />
      <path d="M256 328v112" />
      <path d="M200 384h112" />
    </EmblemWrap>
  );
}

export function VehicleEmblem({ color }: EmblemProps) {
  return (
    <EmblemWrap color={color}>
      <circle cx="176" cy="360" r="56" />
      <circle cx="336" cy="360" r="56" />
      <path d="M136 360h240" />
      <path d="M156 300l52-108h144l52 108" />
    </EmblemWrap>
  );
}

export function FloraEmblem({ color }: EmblemProps) {
  // Leaf + veins, inspired by the provided SVG silhouette but simplified for consistency.
  return (
    <EmblemWrap color={color}>
      <path d="M132 360c44-156 168-252 292-252-10 140-102 268-252 316-52 16-90 10-104-14-10-16-6-30 64-50" />
      <path d="M156 368c104-92 198-176 278-260" />
      <path d="M250 284c18-18 44-26 70-22" />
      <path d="M220 332c18-22 42-34 70-36" />
    </EmblemWrap>
  );
}

export function FaunaEmblem({ color }: EmblemProps) {
  return (
    <EmblemWrap color={color}>
      <circle cx="160" cy="224" r="34" />
      <circle cx="224" cy="176" r="34" />
      <circle cx="288" cy="176" r="34" />
      <circle cx="352" cy="224" r="34" />
      <path d="M176 360c0-56 36-104 80-104s80 48 80 104c0 52-38 84-80 84s-80-32-80-84Z" />
    </EmblemWrap>
  );
}

export function BuildingEmblem({ color }: EmblemProps) {
  return (
    <EmblemWrap color={color}>
      <path d="M144 228 256 140l112 88v232H144V228Z" />
      <path d="M212 460V316h88v144" />
    </EmblemWrap>
  );
}

export function StructureEmblem({ color }: EmblemProps) {
  return (
    <EmblemWrap color={color}>
      <path d="M144 440V236" />
      <path d="M368 440V236" />
      <path d="M116 236h280" />
      <path d="M176 236c0-64 36-116 80-116s80 52 80 116" />
    </EmblemWrap>
  );
}

export function SpeciesEmblem({ color }: EmblemProps) {
  return (
    <EmblemWrap color={color}>
      <circle cx="200" cy="216" r="62" />
      <circle cx="312" cy="240" r="52" />
      <path d="M120 412c18-70 60-108 104-108s86 38 104 108" />
      <path d="M268 414c12-56 44-86 76-86s64 30 76 86" />
    </EmblemWrap>
  );
}

export function PlanetEmblem({ color }: EmblemProps) {
  return (
    <EmblemWrap color={color}>
      <circle cx="256" cy="260" r="108" />
      <path d="M116 260c60-56 136-88 220-88 52 0 96 10 132 28" />
      <path d="M92 316c72 44 150 68 236 68 44 0 86-6 124-18" />
    </EmblemWrap>
  );
}

export function OrganizationEmblem({ color }: EmblemProps) {
  return (
    <EmblemWrap color={color}>
      <circle cx="176" cy="200" r="44" />
      <circle cx="336" cy="200" r="44" />
      <circle cx="256" cy="336" r="44" />
      <path d="M212 228l40 60" />
      <path d="M300 228l-40 60" />
      <path d="M220 200h72" />
    </EmblemWrap>
  );
}

export function PolityEmblem({ color }: EmblemProps) {
  return (
    <EmblemWrap color={color}>
      <path d="M160 120v320" />
      <path d="M160 140c62-44 132-44 212 0v144c-80-44-150-44-212 0V140Z" />
      <path d="M144 440h224" />
    </EmblemWrap>
  );
}

export function EventEmblem({ color }: EmblemProps) {
  return (
    <EmblemWrap color={color}>
      <path d="M128 388h256" />
      <path d="M168 388V196" />
      <path d="M168 208h140" />
      <path d="M308 208l-20 36h40l-20 36" />
    </EmblemWrap>
  );
}

export function FamilyEmblem({ color }: EmblemProps) {
  return (
    <EmblemWrap color={color}>
      <path d="M256 440V316" />
      <path d="M256 316c-64 0-112-42-112-96 0-54 44-96 96-96 42 0 76 26 88 64 8 26 38 44 72 44" />
      <path d="M176 260c0 32-24 56-56 56" />
      <path d="M336 284c0 32 24 56 56 56" />
    </EmblemWrap>
  );
}

export function GroupEmblem({ color }: EmblemProps) {
  return (
    <EmblemWrap color={color}>
      <circle cx="172" cy="216" r="52" />
      <circle cx="340" cy="216" r="52" />
      <path d="M256 360c0-52-34-92-84-92s-84 40-84 92" />
      <path d="M424 360c0-52-34-92-84-92s-84 40-84 92" />
    </EmblemWrap>
  );
}

export function StarEmblem({ color }: EmblemProps) {
  return (
    <EmblemWrap color={color}>
      <path d="M256 104l44 112 116 8-90 76 28 112-98-64-98 64 28-112-90-76 116-8 44-112Z" />
    </EmblemWrap>
  );
}

export function MoonEmblem({ color }: EmblemProps) {
  return (
    <EmblemWrap color={color}>
      <path d="M312 120c-56 22-96 76-96 140s40 118 96 140c-120 0-196-86-196-140S192 120 312 120Z" />
    </EmblemWrap>
  );
}

export function AsteroidEmblem({ color }: EmblemProps) {
  return (
    <EmblemWrap color={color}>
      <path d="M164 332c-20-34-12-84 24-120 42-42 108-52 148-20 38 30 44 94 6 140-44 54-142 70-178 0Z" />
      <path d="M244 244h1" />
      <path d="M292 292h1" />
      <path d="M220 304h1" />
    </EmblemWrap>
  );
}

export function SatelliteEmblem({ color }: EmblemProps) {
  return (
    <EmblemWrap color={color}>
      <path d="M220 276l72-72" />
      <path d="M204 220l-56-56 56-56 56 56-56 56Z" />
      <path d="M308 364l-56-56 56-56 56 56-56 56Z" />
      <path d="M320 184c56 16 96 68 96 132" />
      <path d="M356 164c72 26 124 92 124 168" />
    </EmblemWrap>
  );
}

export function LawEmblem({ color }: EmblemProps) {
  return (
    <EmblemWrap color={color}>
      <path d="M256 136v260" />
      <path d="M160 176h192" />
      <path d="M160 176l-60 112h120l-60-112Z" />
      <path d="M352 176l-60 112h120l-60-112Z" />
      <path d="M196 396h120" />
    </EmblemWrap>
  );
}

export function ReligionEmblem({ color }: EmblemProps) {
  return (
    <EmblemWrap color={color}>
      <circle cx="256" cy="260" r="74" />
      <path d="M256 96v56" />
      <path d="M256 368v56" />
      <path d="M92 260h56" />
      <path d="M364 260h56" />
      <path d="M148 152l40 40" />
      <path d="M324 328l40 40" />
      <path d="M364 152l-40 40" />
      <path d="M188 328l-40 40" />
    </EmblemWrap>
  );
}

export function LanguageEmblem({ color }: EmblemProps) {
  return (
    <EmblemWrap color={color}>
      <path d="M128 160h256c40 0 72 32 72 72v36c0 40-32 72-72 72H252l-92 72v-72H128c-40 0-72-32-72-72v-36c0-40 32-72 72-72Z" />
      <path d="M184 240h144" />
      <path d="M184 284h96" />
    </EmblemWrap>
  );
}

export function CultureEmblem({ color }: EmblemProps) {
  return (
    <EmblemWrap color={color}>
      <path d="M164 160c0-40 40-72 92-72s92 32 92 72c0 44-36 76-92 76s-92-32-92-76Z" />
      <path d="M152 392c0-88 44-140 104-140s104 52 104 140" />
      <path d="M220 190c10 14 24 22 36 22s26-8 36-22" />
    </EmblemWrap>
  );
}

export function SpellEmblem({ color }: EmblemProps) {
  return (
    <EmblemWrap color={color}>
      <path d="M256 100v96" />
      <path d="M256 324v96" />
      <path d="M100 260h96" />
      <path d="M316 260h96" />
      <path d="M144 148l68 68" />
      <path d="M368 148l-68 68" />
      <path d="M144 372l68-68" />
      <path d="M368 372l-68-68" />
      <path d="M256 196l26 64 68 4-52 44 16 66-58-38-58 38 16-66-52-44 68-4 26-64Z" />
    </EmblemWrap>
  );
}

export function DiseaseEmblem({ color }: EmblemProps) {
  return (
    <EmblemWrap color={color}>
      <path d="M256 104c56 88 104 152 104 214 0 66-46 118-104 118s-104-52-104-118c0-62 48-126 104-214Z" />
      <path d="M220 320h72" />
      <path d="M256 284v72" />
    </EmblemWrap>
  );
}

export function DisasterEmblem({ color }: EmblemProps) {
  return (
    <EmblemWrap color={color}>
      <path d="M256 108 444 432H68L256 108Z" />
      <path d="M256 212v120" />
      <path d="M256 372h1" />
    </EmblemWrap>
  );
}

export function CombatStyleEmblem({ color }: EmblemProps) {
  return (
    <EmblemWrap color={color}>
      <path d="M148 144l216 216" />
      <path d="M364 144 148 360" />
      <path d="M176 176l-44-44" />
      <path d="M336 176l44-44" />
      <path d="M176 328l-44 44" />
      <path d="M336 328l44 44" />
    </EmblemWrap>
  );
}

export function GenericEmblem({ color }: EmblemProps) {
  return (
    <Filled color={color}>
      <path d="M256 92c92 0 168 76 168 168s-76 168-168 168S88 352 88 260 164 92 256 92Zm0 70c-38 0-68 24-68 56 0 18 10 32 24 42 18 12 26 20 26 44v10h36v-12c0-34-12-50-32-64-10-6-18-12-18-22 0-12 14-22 32-22 20 0 34 10 40 30l36-12c-12-34-44-50-76-50Zm0 186a22 22 0 1 0 0 44 22 22 0 0 0 0-44Z" />
    </Filled>
  );
}

export const CARD_TYPE_EMBLEMS: Record<WorldNoteCardType, ReactNode> = {
  character: <CharacterEmblem />,
  location: <LocationEmblem />,
  item: <ItemEmblem />,
  vehicle: <VehicleEmblem />,
  flora: <FloraEmblem />,
  fauna: <FaunaEmblem />,
  building: <BuildingEmblem />,
  structure: <StructureEmblem />,
  species: <SpeciesEmblem />,
  planet: <PlanetEmblem />,
  organization: <OrganizationEmblem />,
  polity: <PolityEmblem />,
  event: <EventEmblem />,
  family: <FamilyEmblem />,
  group: <GroupEmblem />,
  star: <StarEmblem />,
  moon: <MoonEmblem />,
  asteroid: <AsteroidEmblem />,
  satellite: <SatelliteEmblem />,
  law: <LawEmblem />,
  religion: <ReligionEmblem />,
  language: <LanguageEmblem />,
  culture: <CultureEmblem />,
  spell: <SpellEmblem />,
  disease: <DiseaseEmblem />,
  disaster: <DisasterEmblem />,
  combat_style: <CombatStyleEmblem />,
};
