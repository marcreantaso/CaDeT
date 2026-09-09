// AI Service — Provider abstraction for Gemini / OpenAI

export interface AIProvider {
  generateCompletion(prompt: string, context: Record<string, unknown>): Promise<AIResponse>;
}

export interface AIResponse {
  content: string;
  usage?: { promptTokens: number; completionTokens: number };
}

// Gemini Provider (placeholder — requires API key)
export class GeminiProvider implements AIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateCompletion(prompt: string, context: Record<string, unknown>): Promise<AIResponse> {
    // In production, call the Gemini API
    // For now, return a structured mock response
    console.log('[GeminiProvider] Generating completion...', { promptLength: prompt.length, contextKeys: Object.keys(context) });

    return {
      content: `AI analysis based on ${Object.keys(context).length} context signals. This is a placeholder response — configure GEMINI_API_KEY for real completions.`,
      usage: { promptTokens: prompt.length, completionTokens: 50 },
    };
  }
}

// OpenAI Provider (placeholder — requires API key)
export class OpenAIProvider implements AIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateCompletion(prompt: string, context: Record<string, unknown>): Promise<AIResponse> {
    console.log('[OpenAIProvider] Generating completion...', { promptLength: prompt.length, contextKeys: Object.keys(context) });

    return {
      content: `AI analysis based on ${Object.keys(context).length} context signals. This is a placeholder response — configure OPENAI_API_KEY for real completions.`,
      usage: { promptTokens: prompt.length, completionTokens: 50 },
    };
  }
}

// Factory
export function createAIProvider(): AIProvider {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (geminiKey) return new GeminiProvider(geminiKey);
  if (openaiKey) return new OpenAIProvider(openaiKey);

  // Fallback mock provider
  return {
    async generateCompletion(prompt: string, context: Record<string, unknown>): Promise<AIResponse> {
      return {
        content: `[Mock AI] Analysis based on ${Object.keys(context).length} signals from prompt of ${prompt.length} chars.`,
        usage: { promptTokens: 0, completionTokens: 0 },
      };
    },
  };
}
