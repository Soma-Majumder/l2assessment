/**
 * Recommendation Templates - Maps category and urgency to recommended actions
 */

const actionTemplates = {
  "Billing Issue": {
    High: "Escalate to the billing team now and reply to the customer within the hour.",
    Medium: "Review the account's recent charges and reply with next steps.",
    Low: "Point the user to the billing portal."
  },
  "Technical Problem": {
    High: "Escalate to engineering now and acknowledge the customer while the issue is investigated.",
    Medium: "Collect steps to reproduce and open a support ticket for engineering.",
    Low: "Suggest basic troubleshooting, such as refreshing or restarting the browser."
  },
  "General Inquiry": {
    High: "Route to a support agent for a same-day personal reply.",
    Medium: "Reply with a direct answer and a link to the relevant FAQ.",
    Low: "Respond with the FAQ link."
  },
  "Feature Request": {
    High: "Route to the product team with the business context and reply to the customer.",
    Medium: "Thank the user and log the request for the product team.",
    Low: "Thank the user and log the request for the product team."
  }
}

/**
 * Get recommended action for a given category and urgency
 *
 * @param {string} category - The message category
 * @param {string} urgency - The urgency level
 * @returns {string} - Recommended next step
 */
export function getRecommendedAction(category, urgency) {
  const byUrgency = actionTemplates[category]
  if (!byUrgency) return "Review manually."
  return byUrgency[urgency] || byUrgency.Medium
}

/**
 * Get all available categories
 *
 * @returns {string[]} - List of categories
 */
export function getAvailableCategories() {
  return Object.keys(actionTemplates)
}

/**
 * Determines if message should be escalated
 * High urgency issues that affect service or billing go to a human right away.
 *
 * @param {string} category - The message category
 * @param {string} urgency - The urgency level
 * @returns {boolean} - Whether to escalate
 */
export function shouldEscalate(category, urgency) {
  return urgency === 'High' && (category === 'Technical Problem' || category === 'Billing Issue')
}
