export type WorldNoteLogoVariant = "icon" | "wordmark";
export type WorldNoteLogoTone = "white" | "black";
export type WorldNoteLogoFormat = "png" | "svg";
type WorldNoteLogoProps = {
    className?: string;
    variant?: WorldNoteLogoVariant;
    tone?: WorldNoteLogoTone;
    format?: WorldNoteLogoFormat;
    alt?: string;
};
export declare function getWorldNoteLogoSrc(variant: WorldNoteLogoVariant, tone: WorldNoteLogoTone, format: WorldNoteLogoFormat): string;
export declare function WorldNoteLogo({ className, variant, tone, format, alt, }: WorldNoteLogoProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=logo.d.ts.map