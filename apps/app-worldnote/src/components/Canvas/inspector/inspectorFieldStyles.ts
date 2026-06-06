/** Inspector field styles — aliases over @worldnote/ui design tokens. */

import {
  fieldLabelSubtleClassName,
  fieldValueClassName,
  inlineFieldInputClassNames,
  inlineTextareaFieldInputClassNames,
  nameFieldInputClassNames,
  overlayChipClassName,
  overlayChipLabelClassName,
  sectionClassName,
  sectionStackClassName,
  subtitleFieldInputClassNames,
  toolbarActionButtonClassName,
  toolbarIconButtonClassName,
} from "@worldnote/ui";

export const inspectorHeaderActionClassName = toolbarActionButtonClassName;

export const inspectorHeaderIconActionClassName = toolbarIconButtonClassName;

export const inspectorMoreMenuTriggerClassName = toolbarIconButtonClassName;

/** Vertical stack with dividers between inspector sections. */
export const inspectorSectionStackClassName = sectionStackClassName;

/** Single inspector section (Tags, Properties, Connections, …). */
export const inspectorSectionClassName = sectionClassName;

/** Section title on dark inspector surfaces (no dot — see Eyebrow showDot={false}). */
export const inspectorSectionEyebrowClassName =
  "text-wn-h6 font-wn-semibold text-wn-text";

/** Horizontal inset for inspector tab sections (lore editor is full-bleed). */
export const inspectorTabPaddingXClassName = "px-4";

export const inspectorFieldLabelClassName = fieldLabelSubtleClassName;

export const inspectorFieldValueClassName = fieldValueClassName;

export const inspectorInlineInputClassNames = inlineFieldInputClassNames;

export const inspectorNameFieldClassNames = nameFieldInputClassNames;

export const inspectorSubtitleFieldClassNames = subtitleFieldInputClassNames;

export const inspectorTextareaClassNames = inlineTextareaFieldInputClassNames;

export const inspectorImageOverlayChipClassName = overlayChipClassName;

export const inspectorImageOverlayLabelClassName = overlayChipLabelClassName;
