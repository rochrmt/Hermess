// AgentForge hexagon logo. Native 24x24, rendered 24x24 by default;
// hero usage scales to 34x34. Color rides currentColor for the outline;
// the inner forge shape uses a fixed sky-blue fill.

import type { IconProps } from './icons/props.ts'

/**
 * Render the AgentForge hexagon logo.
 * @param props.size - width in px (default 24; height keeps 1:1 ratio).
 * @param props.className - extra class for layout placement.
 * @returns the logo svg (aria-hidden; pair with the wordmark for accessibility).
 */
export function FishLogo({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path d="M12 2 L21 7 V17 L12 22 L3 17 V7 Z" fill="currentColor" opacity="0.12" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M8 10 H16 V12 H13.5 L12 15 H10.5 L9 12 H8 Z" fill="currentColor"/>
      <path d="M9 7 H15 V9 H9 Z" fill="currentColor" opacity="0.7"/>
    </svg>
  )
}
