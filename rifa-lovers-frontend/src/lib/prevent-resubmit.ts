/**
 * Prevent browser re-submit on page refresh after a form submission.
 * Call this after a successful POST to replace the current history state
 * with a clean GET-equivalent URL.
 */
export function preventResubmit(): void {
  if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
    window.history.replaceState(null, '', window.location.href)
  }
}
