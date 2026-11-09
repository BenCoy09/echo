import type { Config } from "tailwindcss";

// Design tokens. Ink + bone + brass; verdigris = verified, rust = refused.
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    colors: {
      transparent: "transparent", current: "currentColor",
      ink: { DEFAULT: "#0B0E0D", 2: "#111513", 3: "#171C1A", line: "#242B28" },
      bone: { DEFAULT: "#ECE7DA", dim: "#A9A89D", mute: "#6F746D" },
      brass: { DEFAULT: "#D6A24A", deep: "#9C7430" },
      verdigris: "#6FBF9F",
      rust: "#D9653F",
    },
    fontFamily: {
      display: ["var(--font-display)", "Georgia", "serif"],
      sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      mono: ["var(--font-mono)", "ui-monospace", "monospace"],
    },
    fontSize: {
      // size / line-height / tracking
      xs: ["0.75rem", { lineHeight: "1.1rem", letterSpacing: "0.02em" }],
      sm: ["0.875rem", { lineHeight: "1.35rem" }],
      base: ["1rem", { lineHeight: "1.6rem" }],
      lg: ["1.25rem", { lineHeight: "1.8rem" }],
      "2xl": ["1.75rem", { lineHeight: "2.1rem", letterSpacing: "-0.01em" }],
      "4xl": ["2.75rem", { lineHeight: "1.05", letterSpacing: "-0.025em" }],
      "6xl": ["4.5rem", { lineHeight: "0.98", letterSpacing: "-0.035em" }],
    },
    spacing: { 0: "0", px: "1px", 1: "4px", 2: "8px", 3: "12px", 4: "16px", 5: "24px", 6: "32px", 7: "48px", 8: "64px", 9: "96px", 10: "144px" },
    extend: { borderRadius: { DEFAULT: "2px", md: "4px" }, maxWidth: { page: "1120px" } },
  },
  plugins: [],
} satisfies Config;
