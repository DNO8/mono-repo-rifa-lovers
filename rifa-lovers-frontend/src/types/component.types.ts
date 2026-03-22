/**
 * Shared component prop contracts — base interfaces for UI components.
 * Enables Liskov Substitution: any component implementing these
 * interfaces can be swapped without breaking consumers.
 */

import type { LucideIconComponent } from './ui.types'

export interface ActionButtonProps {
  label: string
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: LucideIconComponent
  className?: string
}

export interface CardBaseProps {
  className?: string
  children?: React.ReactNode
}

export interface SectionBaseProps {
  id?: string
  className?: string
  children?: React.ReactNode
}

export interface ModalBaseProps {
  open: boolean
  onClose: () => void
  title?: string
  children?: React.ReactNode
}

export interface FormFieldProps {
  label: string
  name: string
  error?: string
  required?: boolean
  className?: string
}

export interface ListItemProps<T> {
  item: T
  isActive?: boolean
  onClick?: (item: T) => void
  className?: string
}
