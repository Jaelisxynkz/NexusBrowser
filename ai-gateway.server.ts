import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Generic OpenAI-compatible provider for Nexus Assistant.
 * Points at a user-configured local inference server (Ollama, LM Studio…).
 */
export function createLocalAiProvider(baseUrl: string, apiKey?: string) {
  return createOpenAICompatible({
    name: "nexus-local",
    baseURL: baseUrl,
    ...(apiKey ? { headers: { Authorization: `Bearer ${apiKey}` } } : {}),
  });
}

