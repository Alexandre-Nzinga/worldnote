import { forwardRef, useMemo, useRef, useState } from "react"
import type { Editor } from "@tiptap/react"

// --- Hooks ---
import { useMenuNavigation } from "@worldnote/shared/hooks/use-menu-navigation"
import { useIsBreakpoint } from "@worldnote/shared/hooks/use-is-breakpoint"
import { useTiptapEditor } from "@worldnote/shared/hooks/use-tiptap-editor"

// --- Icons ---
import { BanIcon } from "@worldnote/shared/components/tiptap-icons/ban-icon"
import { HighlighterIcon } from "@worldnote/shared/components/tiptap-icons/highlighter-icon"

// --- UI Primitives ---
import type { ButtonProps } from "@worldnote/shared/components/tiptap-ui-primitive/button"
import { Button } from "@worldnote/shared/components/tiptap-ui-primitive/button"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@worldnote/shared/components/tiptap-ui-primitive/popover"
import { Separator } from "@worldnote/shared/components/tiptap-ui-primitive/separator"
import {
  Card,
  CardBody,
  CardItemGroup,
} from "@worldnote/shared/components/tiptap-ui-primitive/card"

// --- Tiptap UI ---
import type {
  HighlightColor,
  UseColorHighlightConfig,
} from "@worldnote/shared/components/tiptap-ui/color-highlight-button"
import {
  ColorHighlightButton,
  pickHighlightColorsByValue,
  useColorHighlight,
} from "@worldnote/shared/components/tiptap-ui/color-highlight-button"
import { ButtonGroup } from "@worldnote/shared/components/tiptap-ui-primitive/button-group"

export interface ColorHighlightPopoverContentProps {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * Optional colors to use in the highlight popover.
   * If not provided, defaults to a predefined set of colors.
   */
  colors?: HighlightColor[]
  /**
   * When true, uses the actual color value (colorValue) instead of CSS variable (value).
   * @default false
   */
  useColorValue?: boolean
}

export interface ColorHighlightPopoverProps
  extends Omit<ButtonProps, "type"> {
  editor?: UseColorHighlightConfig["editor"]
  hideWhenUnavailable?: UseColorHighlightConfig["hideWhenUnavailable"]
  onApplied?: UseColorHighlightConfig["onApplied"]
  /**
   * Optional colors to use in the highlight popover.
   * If not provided, defaults to a predefined set of colors.
   */
  colors?: HighlightColor[]
  /**
   * When true, uses the actual color value (colorValue) instead of CSS variable (value).
   * @default false
   */
  useColorValue?: boolean
}

export const ColorHighlightPopoverButton = forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ className, children, ...props }, ref) => (
  <Button
    type="button"
    className={className}
    variant="ghost"
    data-appearance="default"
    tabIndex={-1}
    aria-label="Highlight text"
    tooltip="Highlight"
    ref={ref}
    {...props}
  >
    {children ?? <HighlighterIcon className="tiptap-button-icon" />}
  </Button>
))

ColorHighlightPopoverButton.displayName = "ColorHighlightPopoverButton"

export function ColorHighlightPopoverContent({
  editor,
  colors = pickHighlightColorsByValue([
    "var(--tt-color-highlight-green)",
    "var(--tt-color-highlight-blue)",
    "var(--tt-color-highlight-red)",
    "var(--tt-color-highlight-purple)",
    "var(--tt-color-highlight-yellow)",
  ]),
  useColorValue = false,
}: ColorHighlightPopoverContentProps) {
  const { handleRemoveHighlight } = useColorHighlight({ editor })
  const isMobile = useIsBreakpoint()
  const containerRef = useRef<HTMLDivElement>(null)

  const menuItems = useMemo(
    () => [...colors, { label: "Remove highlight", value: "none" }],
    [colors]
  )

  const { selectedIndex } = useMenuNavigation({
    containerRef,
    items: menuItems,
    orientation: "both",
    onSelect: (item) => {
      if (!containerRef.current) return false
      const highlightedElement = containerRef.current.querySelector(
        '[data-highlighted="true"]'
      )
      if (highlightedElement instanceof HTMLElement) highlightedElement.click()
      if (item.value === "none") handleRemoveHighlight()
      return true
    },
    autoSelectFirstItem: false,
  })

  return (
    <Card
      ref={containerRef}
      tabIndex={0}
      style={isMobile ? { boxShadow: "none", border: 0 } : {}}
    >
      <CardBody style={isMobile ? { padding: 0 } : {}}>
        <CardItemGroup orientation="horizontal">
          <ButtonGroup>
            {colors.map((color, index) => (
              <ButtonGroup key={color.value}>
                <ColorHighlightButton
                  editor={editor}
                  highlightColor={
                    useColorValue ? color.colorValue : color.value
                  }
                  tooltip={color.label}
                  aria-label={`${color.label} highlight color`}
                  tabIndex={index === selectedIndex ? 0 : -1}
                  data-highlighted={selectedIndex === index}
                  useColorValue={useColorValue}
                />
              </ButtonGroup>
            ))}
          </ButtonGroup>
          <Separator />
          <ButtonGroup>
            <Button
              onClick={handleRemoveHighlight}
              aria-label="Remove highlight"
              tooltip="Remove highlight"
              tabIndex={selectedIndex === colors.length ? 0 : -1}
              type="button"
              role="menuitem"
              variant="ghost"
              data-highlighted={selectedIndex === colors.length}
            >
              <BanIcon className="tiptap-button-icon" />
            </Button>
          </ButtonGroup>
        </CardItemGroup>
      </CardBody>
    </Card>
  )
}

export function ColorHighlightPopover({
  editor: providedEditor,
  colors = pickHighlightColorsByValue([
    "var(--tt-color-highlight-green)",
    "var(--tt-color-highlight-blue)",
    "var(--tt-color-highlight-red)",
    "var(--tt-color-highlight-purple)",
    "var(--tt-color-highlight-yellow)",
  ]),
  hideWhenUnavailable = false,
  useColorValue = false,
  onApplied,
  ...props
}: ColorHighlightPopoverProps) {
  const { editor } = useTiptapEditor(providedEditor)
  const [isOpen, setIsOpen] = useState(false)
  const { isVisible, canColorHighlight, isActive, label, Icon } =
    useColorHighlight({
      editor,
      hideWhenUnavailable,
      onApplied,
    })

  if (!isVisible) return null

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <ColorHighlightPopoverButton
          disabled={!canColorHighlight}
          data-active-state={isActive ? "on" : "off"}
          data-disabled={!canColorHighlight}
          aria-pressed={isActive}
          aria-label={label}
          tooltip={label}
          {...props}
        >
          <Icon className="tiptap-button-icon" />
        </ColorHighlightPopoverButton>
      </PopoverTrigger>
      <PopoverContent aria-label="Highlight colors">
        <ColorHighlightPopoverContent
          editor={editor}
          colors={colors}
          useColorValue={useColorValue}
        />
      </PopoverContent>
    </Popover>
  )
}

export default ColorHighlightPopover
