import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { IconMap } from '@/types/ui.types'
import type { FAQ } from '@/types/domain.types'

interface FAQItemProps {
  faq: FAQ
  iconMap: IconMap
}

export function FAQItem({ faq, iconMap }: FAQItemProps) {
  const [open, setOpen] = useState(false)
  const IconComponent = iconMap[faq.icon]

  const toggle = () => setOpen((prev) => !prev)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggle()
    }
  }

  return (
    <Card
      variant="glass-light"
      className="p-0 overflow-hidden cursor-pointer glass-hover"
      role="button"
      tabIndex={0}
      aria-expanded={open}
      onClick={toggle}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center gap-3 p-5">
        {IconComponent && (
          <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <IconComponent className="size-4.5 text-primary" />
          </div>
        )}
        <span className="flex-1 font-semibold text-text-primary text-[15px]">
          {faq.question}
        </span>
        <ChevronDown
          className={cn(
            'size-4.5 text-text-tertiary transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </div>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-out',
          open ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <p className="px-5 pb-5 text-sm text-text-secondary leading-relaxed">
          {faq.answer}
        </p>
      </div>
    </Card>
  )
}
