import Groq from 'groq-sdk';

/**
 * LLM Helper for analyzing customer support messages
 * Using Groq API for AI-powered categorization and urgency scoring
 */

export const CATEGORIES = ["Billing Issue", "Technical Problem", "Feature Request", "General Inquiry"];
export const URGENCY_LEVELS = ["High", "Medium", "Low"];

const SYSTEM_PROMPT = `You triage customer support messages. Respond with a single JSON object and nothing else:
{"category": string, "urgency": string, "reasoning": string}

category must be exactly one of:
- "Billing Issue": payments, charges, invoices, refunds, subscriptions
- "Technical Problem": bugs, errors, outages, things not working
- "Feature Request": suggestions or requests for new functionality
- "General Inquiry": questions, feedback, thanks, or anything that fits none of the above

urgency must be exactly one of, judged by business impact and NOT by tone, punctuation, capitalization, politeness or length:
- "High": outage, data loss, security issue, money lost or wrongly charged, work fully blocked, or a hard deadline
- "Medium": a problem with a workaround, or a billing/technical issue that is not blocking
- "Low": questions, feature ideas, feedback, praise

reasoning must be 1-2 plain sentences explaining both choices.`;

// Created lazily so a missing API key surfaces as an error on Analyze, not a blank app
let groq = null;
function getClient() {
  if (!groq) {
    groq = new Groq({
      apiKey: import.meta.env.VITE_GROQ_API_KEY,
      dangerouslyAllowBrowser: true // Required for browser-based calls (not recommended for production!)
    });
  }
  return groq;
}

function parseAnalysis(content) {
  const data = JSON.parse(content);
  const category = CATEGORIES.find(c => c === data.category);
  const urgency = URGENCY_LEVELS.find(u => u === data.urgency);
  if (!category || !urgency || typeof data.reasoning !== 'string' || !data.reasoning.trim()) {
    throw new Error('Model returned an invalid analysis');
  }
  return { category, urgency, reasoning: data.reasoning.trim() };
}

/**
 * Categorize a customer support message and rate its urgency using Groq AI
 *
 * @param {string} message - The customer support message
 * @returns {Promise<{category: string, urgency: string, reasoning: string}>}
 * @throws if the API call fails or the response is invalid after one retry
 */
export async function analyzeMessage(message) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await getClient().chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Customer message:\n"""\n${message}\n"""` }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
      });
      return parseAnalysis(response.choices[0].message.content);
    } catch (error) {
      lastError = error;
      // Retry only when the model's output was bad; API/auth errors won't fix themselves
      if (!(error instanceof SyntaxError) && error.message !== 'Model returned an invalid analysis') break;
    }
  }
  console.error('Message analysis failed:', lastError);
  throw lastError;
}
