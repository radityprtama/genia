"use client";

import React from "react";
import { useTheme } from "next-themes";
import { cn } from "../../lib/utils";

/**
 * Prevent hydration mismatch when reading theme on first render
 */
function useMounted() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted;
}

/**
 * Centralized Genia logo resolver
 *
 * INVERTED MAPPING:
 * - dark theme  -> LIGHT logo
 * - light theme -> DARK logo
 */
function useGeniaLogoSrc() {
  const mounted = useMounted();
  const { resolvedTheme } = useTheme();

  const lightLogo =
    "https://pub-07f684470f2a43e6a8d941be05aaadcc.r2.dev/geniaLogo/genialight.svg";
  const darkLogo =
    "https://pub-07f684470f2a43e6a8d941be05aaadcc.r2.dev/geniaLogo/geniadark.svg";

  // During SSR / first paint, default to dark logo to avoid flash
  if (!mounted) return darkLogo;

  // INVERTED:
  // dark theme -> light logo
  // light theme -> dark logo
  return resolvedTheme === "dark" ? lightLogo : darkLogo;
}

/**
 * Full wordmark logo (used in navbar, footer, header)
 */
export const Logo = ({
  className,
}: {
  className?: string;
  uniColor?: boolean;
  uniColor?: boolean; // kept for API compatibility
}) => {
  const src = useGeniaLogoSrc();

  return (
    <img
      src={src}
      alt="Genia"
      width={121}
      height={70}
      className={cn("h-5 w-auto", className)}
    />
  );
};

/**
 * Icon-sized logo (used in compact places, buttons, etc.)
 * NOTE: This still uses the same wordmark.
 * If later you add a real icon file, we can split this.
 */
export const LogoIcon = ({
  className,
}: {
  className?: string;
  uniColor?: boolean; // kept for compatibility
}) => {
  const src = useGeniaLogoSrc();

  return (
    <img
      src={src}
      alt="Genia"
      width={18}
      height={18}
      className={cn("size-5", className)}
    />
  );
};

/**
 * Stroke version (for places that previously used outline SVG)
 * For now, mapped to the same logo asset.
 */
export const LogoStroke = ({ className }: { className?: string }) => {
  const src = useGeniaLogoSrc();

  return (
    <img
      src={src}
      alt="Genia"
      width={71}
      height={25}
      className={cn("h-6 w-auto", className)}
    />
  );
};
