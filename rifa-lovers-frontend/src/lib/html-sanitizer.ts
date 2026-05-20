const DANGEROUS_TAGS = /<(script|iframe|object|embed|form|input|textarea|button|select|option)[\s>]/gi
const DANGEROUS_ATTRS = /\s(on\w+|style|formaction|action|href\s*=\s*["']?javascript:)/gi

export function hasDangerousHtml(html: string): boolean {
  return DANGEROUS_TAGS.test(html) || DANGEROUS_ATTRS.test(html)
}

export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/<form[\s\S]*?<\/form>/gi, '')
    .replace(/\s+on\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\s+on\w+\s*=\s*'[^']*'/gi, '')
    .replace(/\s+on\w+\s*=\s*[^\s>]+/gi, '')
    .replace(/javascript:/gi, 'blocked:')
    .replace(/data:/gi, 'blocked:')
}
