/**
 * Safe access to the saved triage history in localStorage.
 * Corrupted or unavailable storage yields an empty history instead of crashing pages.
 */

const HISTORY_KEY = 'triageHistory'

export function loadHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
    return true
  } catch {
    return false
  }
}

export function addToHistory(entry) {
  return saveHistory([...loadHistory(), entry])
}

/** Newest first */
export function sortNewestFirst(history) {
  return [...history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}
