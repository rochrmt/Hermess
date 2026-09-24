// AgentForge brand wordmark: hexagon mark + "AgentForge" letterforms.
// Native 140x24. Ink rides currentColor.

import type { IconProps } from './icons/props.ts'

/** Display options for the AgentForge brand wordmark. */
export interface BrandWordmarkProps extends IconProps {
  /** Whether to include the leading hexagon mark; defaults to true. */
  includeMark?: boolean | undefined
}

/**
 * Render the AgentForge brand wordmark.
 * @param props.size - height in px (default 24; width follows the selected artwork).
 * @param props.className - extra class for layout placement.
 * @param props.includeMark - whether to include the leading hexagon mark.
 * @returns the wordmark svg (aria-hidden decorative brand art).
 */
export function BrandWordmark({ size = 24, className, includeMark = true }: BrandWordmarkProps) {
  const width = includeMark ? 140 : 116
  return (
    <svg
      width={(size * width) / 24}
      height={size}
      className={className}
      viewBox={includeMark ? '0 0 140 24' : '24 0 116 24'}
      fill="none"
      aria-hidden="true"
    >
      {includeMark && (
        <path d="M12 2 L21 7 V17 L12 22 L3 17 V7 Z" fill="currentColor" opacity="0.12" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
      )}
      {includeMark && (
        <path d="M8 10 H16 V12 H13.5 L12 15 H10.5 L9 12 H8 Z" fill="currentColor"/>
      )}
      <text x={includeMark ? '26' : '0'} y="17" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" fill="currentColor" letter-spacing="-0.3">AgentForge</text>
    </svg>
  )
}
