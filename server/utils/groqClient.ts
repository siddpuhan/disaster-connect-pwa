import { Groq } from "groq-sdk";
import { GROQ_API_KEY } from "../config/env.js";
import { logger } from "./logger.js";

if (!GROQ_API_KEY) {
  logger.warn("GROQ-CLIENT", "GROQ_API_KEY is not set. AI capabilities will be disabled.");
}

export const groq = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY }) : null;

/**
 * Executes a Groq API call function with exponential backoff retries and timeout.
 * @param apiCallFn - The async function to execute.
 * @param maxRetries - Maximum number of retry attempts. Default is 3.
 * @param timeoutMs - Timeout in milliseconds. Default is 20000ms (20s).
 */
export async function withGroqRetry<T>(
  apiCallFn: (signal?: AbortSignal) => Promise<T>,
  maxRetries = 3,
  timeoutMs = 20000
): Promise<T> {
  let attempt = 0;
  
  while (true) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    try {
      attempt++;
      const result = await apiCallFn(controller.signal);
      clearTimeout(timeoutId);
      return result;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      const isAbort = error.name === "AbortError" || error.message?.includes("aborted");
      const statusCode = error.status || error.statusCode;
      const isRateLimit = statusCode === 429 || error.message?.toLowerCase().includes("rate limit") || error.message?.toLowerCase().includes("429");
      const isServerError = statusCode >= 500;
      const isNetworkError = !statusCode && !isAbort;
      
      const shouldRetry = (isRateLimit || isServerError || isNetworkError || isAbort) && attempt < maxRetries;
      
      if (!shouldRetry) {
        logger.error("GROQ-CLIENT", `Call failed after ${attempt} attempts. Error: ${error.message}`);
        throw error;
      }
      
      let delay = 1000 * Math.pow(2, attempt - 1);
      if (isRateLimit) {
        let seconds = 5;
        const retryHeader = error.headers?.get?.('retry-after');
        if (retryHeader) {
          seconds = parseFloat(retryHeader) || 5;
        } else if (error.message) {
          const match = error.message.match(/try again in (?:(\d+)m)?([\d.]+)\s*s/i) || error.message.match(/retry in (?:(\d+)m)?([\d.]+)\s*s/i);
          if (match) {
            const mins = match[1] ? parseInt(match[1], 10) : 0;
            const secs = parseFloat(match[2]);
            seconds = mins * 60 + secs;
          }
        }
        delay = Math.min(Math.ceil(seconds + 1) * 1000, 30000);
        logger.warn("GROQ-CLIENT", `Rate limited. Retrying in ${delay}ms...`);
      } else if (isAbort) {
        logger.warn("GROQ-CLIENT", `Request timed out after ${timeoutMs}ms. Retrying in ${delay}ms...`);
      } else {
        logger.warn("GROQ-CLIENT", `Attempt ${attempt} failed: ${error.message}. Retrying in ${delay}ms...`);
      }
      
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
