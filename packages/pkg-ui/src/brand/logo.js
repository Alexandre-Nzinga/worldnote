import { jsx as _jsx } from "react/jsx-runtime";
const logoSources = {
    icon: {
        white: {
            // Keep png key for compatibility, but source the official SVG asset.
            png: new URL("./assets/logo-icon-white.svg", import.meta.url).href,
            svg: new URL("./assets/logo-icon-white.svg", import.meta.url).href,
        },
        black: {
            // Keep png key for compatibility, but source the official SVG asset.
            png: new URL("./assets/logo-icon-black.svg", import.meta.url).href,
            svg: new URL("./assets/logo-icon-black.svg", import.meta.url).href,
        },
    },
    wordmark: {
        white: {
            // Keep png key for compatibility, but source the official SVG asset.
            png: new URL("./assets/logo-wordmark-white.svg", import.meta.url).href,
            svg: new URL("./assets/logo-wordmark-white.svg", import.meta.url).href,
        },
        black: {
            // Keep png key for compatibility, but source the official SVG asset.
            png: new URL("./assets/logo-wordmark-black.svg", import.meta.url).href,
            svg: new URL("./assets/logo-wordmark-black.svg", import.meta.url).href,
        },
    },
};
export function getWorldNoteLogoSrc(variant, tone, format) {
    return logoSources[variant][tone][format];
}
export function WorldNoteLogo({ className = "", variant = "icon", tone = "white", format = "svg", alt, }) {
    return (_jsx("img", { src: getWorldNoteLogoSrc(variant, tone, format), alt: alt ?? `WorldNote ${variant} (${tone})`, className: className, loading: "lazy", decoding: "async" }));
}
