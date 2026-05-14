import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function scrollToPricing() {
  const el = document.getElementById('pricing')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

export function goToPricing() {
  window.location.href = '/#pricing'
}
