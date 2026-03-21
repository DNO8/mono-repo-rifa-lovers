import type { ComponentType, SVGProps } from 'react'

export type LucideIconComponent = ComponentType<
  SVGProps<SVGSVGElement> & { size?: number | string }
>

export type IconMap = Record<string, LucideIconComponent>
