import OpenAI from "openai";

export interface LLMResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class LLMService {
  static async generateResponse(
    provider: string,
    apiKey: string,
    model: string,
    messages: LLMMessage[],
    context?: string
  ): Promise<LLMResponse> {
    try {
      switch (provider.toLowerCase()) {
        case 'openai':
          return await this.callOpenAI(apiKey, model, messages, context);
        case 'openrouter':
          return await this.callOpenRouter(apiKey, model, messages, context);
        case 'gemini':
          return await this.callGemini(apiKey, model, messages, context);
        case 'grok':
          return await this.callGrok(apiKey, model, messages, context);
        case 'custom':
          return await this.callCustom(apiKey, model, messages, context);
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    } catch (error: any) {
      throw new Error(`LLM API error: ${error.message}`);
    }
  }

  private static async callOpenAI(
    apiKey: string,
    model: string,
    messages: LLMMessage[],
    context?: string
  ): Promise<LLMResponse> {
    const openai = new OpenAI({ apiKey });

    // Inject context if provided
    const systemMessage = context 
      ? `You are a helpful assistant that answers questions based ONLY on the provided context. If the answer is not in the context, say "I don't have information about that in the provided documents."\n\nContext:\n${context}`
      : "You are a helpful assistant.";

    const finalMessages = [
      { role: 'system' as const, content: systemMessage },
      ...messages.filter(m => m.role !== 'system')
    ];

    const response = await openai.chat.completions.create({
      model: model || "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: finalMessages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return {
      content: response.choices[0].message.content || "",
      usage: response.usage ? {
        prompt_tokens: response.usage.prompt_tokens,
        completion_tokens: response.usage.completion_tokens,
        total_tokens: response.usage.total_tokens,
      } : undefined,
    };
  }

  private static async callOpenRouter(
    apiKey: string,
    model: string,
    messages: LLMMessage[],
    context?: string
  ): Promise<LLMResponse> {
    const openai = new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
    });

    const systemMessage = context 
      ? `You are a helpful assistant that answers questions based ONLY on the provided context. If the answer is not in the context, say "I don't have information about that in the provided documents."\n\nContext:\n${context}`
      : "You are a helpful assistant.";

    const finalMessages = [
      { role: 'system' as const, content: systemMessage },
      ...messages.filter(m => m.role !== 'system')
    ];

    try {
      const response = await openai.chat.completions.create({
        model: model || "anthropic/claude-3-haiku",
        messages: finalMessages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      return {
        content: response.choices[0].message.content || "",
        usage: response.usage ? {
          prompt_tokens: response.usage.prompt_tokens,
          completion_tokens: response.usage.completion_tokens,
          total_tokens: response.usage.total_tokens,
        } : undefined,
      };
    } catch (error: any) {
      if (error.message?.includes('404') || error.message?.includes('No endpoints found')) {
        throw new Error(`Model "${model}" not found on OpenRouter. Please check the model name or try a different model like "anthropic/claude-3-haiku" or "openai/gpt-4o".`);
      }
      throw error;
    }
  }

  private static async callGemini(
    apiKey: string,
    model: string,
    messages: LLMMessage[],
    context?: string
  ): Promise<LLMResponse> {
    // Simple Gemini API implementation
    const prompt = context 
      ? `You are a helpful assistant that answers questions based ONLY on the provided context. If the answer is not in the context, say "I don't have information about that in the provided documents."\n\nContext:\n${context}\n\nUser: ${messages[messages.length - 1]?.content || ""}`
      : messages[messages.length - 1]?.content || "";

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-pro'}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated";

    return {
      content,
      usage: {
        prompt_tokens: prompt.length / 4, // Rough estimate
        completion_tokens: content.length / 4,
        total_tokens: (prompt.length + content.length) / 4,
      },
    };
  }

  private static async callGrok(
    apiKey: string,
    model: string,
    messages: LLMMessage[],
    context?: string
  ): Promise<LLMResponse> {
    const openai = new OpenAI({ 
      baseURL: "https://api.x.ai/v1", 
      apiKey 
    });

    const systemMessage = context 
      ? `You are a helpful assistant that answers questions based ONLY on the provided context. If the answer is not in the context, say "I don't have information about that in the provided documents."\n\nContext:\n${context}`
      : "You are a helpful assistant.";

    const finalMessages = [
      { role: 'system' as const, content: systemMessage },
      ...messages.filter(m => m.role !== 'system')
    ];

    const response = await openai.chat.completions.create({
      model: model || "grok-2-1212",
      messages: finalMessages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return {
      content: response.choices[0].message.content || "",
      usage: response.usage ? {
        prompt_tokens: response.usage.prompt_tokens,
        completion_tokens: response.usage.completion_tokens,
        total_tokens: response.usage.total_tokens,
      } : undefined,
    };
  }

  private static async callCustom(
    apiKey: string,
    model: string,
    messages: LLMMessage[],
    context?: string
  ): Promise<LLMResponse> {
    // For custom endpoints, we'll assume OpenAI-compatible format
    const openai = new OpenAI({
      apiKey,
      baseURL: process.env.CUSTOM_LLM_BASE_URL || "http://localhost:8000/v1",
    });

    const systemMessage = context 
      ? `You are a helpful assistant that answers questions based ONLY on the provided context. If the answer is not in the context, say "I don't have information about that in the provided documents."\n\nContext:\n${context}`
      : "You are a helpful assistant.";

    const finalMessages = [
      { role: 'system' as const, content: systemMessage },
      ...messages.filter(m => m.role !== 'system')
    ];

    const response = await openai.chat.completions.create({
      model: model || "custom-model",
      messages: finalMessages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return {
      content: response.choices[0].message.content || "",
      usage: response.usage ? {
        prompt_tokens: response.usage.prompt_tokens,
        completion_tokens: response.usage.completion_tokens,
        total_tokens: response.usage.total_tokens,
      } : undefined,
    };
  }
}
