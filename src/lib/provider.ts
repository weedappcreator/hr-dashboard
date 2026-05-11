import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import {
  LanguageModelV1,
  LanguageModelV1StreamPart,
  LanguageModelV1Message,
} from "@ai-sdk/provider";
import { createOpencode, type Session } from "@opencode-ai/sdk";

export type ProviderType = "opencode" | "anthropic" | "ollama" | "gemini";

export interface ProviderInfo {
  name: string;
  model: string;
  provider: ProviderType;
}

const PROVIDER_MODELS: Record<ProviderType, string> = {
  opencode: "anthropic/claude-sonnet-4-5",
  anthropic: "claude-sonnet-4-5",
  ollama: "qwen2.5-coder:7b",
  gemini: "gemini-2.0-flash",
};

let opencodeClient: Awaited<ReturnType<typeof createOpencode>> | null = null;

async function initOpenCodeClient() {
  if (opencodeClient) return opencodeClient;
  
  try {
    opencodeClient = await createOpencode();
    return opencodeClient;
  } catch (error) {
    console.error("[Provider] Failed to initialize OpenCode client:", error);
    return null;
  }
}

export class OpenCodeLanguageModel implements LanguageModelV1 {
  readonly specificationVersion = "v1" as const;
  readonly provider = "opencode";
  readonly modelId: string;
  readonly defaultObjectGenerationMode = "tool" as const;

  private client: Awaited<ReturnType<typeof createOpencode>> | null = null;
  private session: Session | null = null;

  constructor(modelId: string) {
    this.modelId = modelId;
  }

  private async ensureClient() {
    if (!this.client) {
      this.client = await initOpenCodeClient();
    }
    return this.client;
  }

  private async ensureSession() {
    if (!this.session) {
      const client = await this.ensureClient();
      if (!client) throw new Error("[Provider] Failed to initialize OpenCode client");
      this.session = await (client as any).session.create({ body: { title: "UIGen Session" } });
    }
    return this.session;
  }

  private extractText(messages: LanguageModelV1Message[]): string {
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role === "user") {
        const content = msg.content;
        if (Array.isArray(content)) {
          return content.filter((p: any) => p.type === "text").map((p: any) => p.text).join(" ");
        } else if (typeof content === "string") {
          return content;
        }
      }
    }
    return "";
  }

  async doGenerate(options: Parameters<LanguageModelV1["doGenerate"]>[0]): Promise<Awaited<ReturnType<LanguageModelV1["doGenerate"]>>> {
    const session = await this.ensureSession();
    const text = this.extractText(options.prompt);

    const result = await session.prompt({
      body: { parts: [{ type: "text", text }] },
    });

    return {
      text: result.data.info.content?.[0]?.text || "",
      toolCalls: [],
      finishReason: "stop",
      usage: { promptTokens: 100, completionTokens: 100 },
      warnings: [],
      rawCall: { rawPrompt: options.prompt, rawSettings: {} },
    };
  }

  async doStream(options: Parameters<LanguageModelV1["doStream"]>[0]): Promise<Awaited<ReturnType<LanguageModelV1["doStream"]>>> {
    const session = await this.ensureSession();
    const text = this.extractText(options.prompt);
    const self = this;

    const stream = new ReadableStream<LanguageModelV1StreamPart>({
      async start(controller) {
        try {
          const result = await session.prompt({ body: { parts: [{ type: "text", text }] } });
          const response = result.data.info.content?.[0]?.text || "";
          controller.enqueue({ type: "text-delta", textDelta: response });
          controller.enqueue({ type: "finish", finishReason: "stop", usage: { promptTokens: 100, completionTokens: 100 } });
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return { stream, warnings: [], rawCall: { rawPrompt: options.prompt, rawSettings: {} }, rawResponse: { headers: {} } };
  }
}

export function getProviderInfo(): ProviderInfo {
  const env = process.env.LLM_PROVIDER as ProviderType;

  switch (env) {
    case "gemini":
      return { name: "Google Gemini", model: PROVIDER_MODELS.gemini, provider: "gemini" };
    case "anthropic":
      return { name: "Anthropic", model: PROVIDER_MODELS.anthropic, provider: "anthropic" };
    case "ollama":
      return { name: "Ollama (Local)", model: PROVIDER_MODELS.ollama, provider: "ollama" };
    case "opencode":
    default:
      return { name: "OpenCode", model: PROVIDER_MODELS.opencode, provider: "opencode" };
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getMockModel(): MockLanguageModel {
  return new MockLanguageModel("mock-claude-sonnet-4-0");
}

export function getLanguageModel(): LanguageModelV1 {
  const info = getProviderInfo();
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();
  const opencodeKey = process.env.OPENCODE_API_KEY?.trim();
  const ollamaUrl = process.env.OLLAMA_BASE_URL?.trim();
  const geminiKey = process.env.GEMINI_API_KEY?.trim();

  console.log(`[Provider] Using: ${info.name} (${info.model})`);

  switch (info.provider) {
    case "gemini":
      if (geminiKey) {
        return google(info.model, { apiKey: geminiKey });
      }
      console.warn("[Provider] No GEMINI_API_KEY, falling back to OpenCode");

    case "opencode":
      if (opencodeKey) {
        return new OpenCodeLanguageModel(info.model);
      }
      console.warn("[Provider] No OPENCODE_API_KEY, falling back to Anthropic");

    case "anthropic":
      if (anthropicKey) {
        return anthropic(info.model);
      }
      console.warn("[Provider] No ANTHROPIC_API_KEY, falling back to Ollama");

    case "ollama":
      return openai(ollamaUrl || "http://localhost:11434/v1", { compatibility: "strict" });
  }

  console.log("[Provider] No provider available, using mock");
  return getMockModel();
}

class MockLanguageModel implements LanguageModelV1 {
  readonly specificationVersion = "v1" as const;
  readonly provider = "mock";
  readonly modelId: string;
  readonly defaultObjectGenerationMode = "tool" as const;

  constructor(modelId: string) {
    this.modelId = modelId;
  }

  private extractUserPrompt(messages: LanguageModelV1Message[]): string {
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role === "user") {
        const content = msg.content;
        if (Array.isArray(content)) {
          return content.filter((p: any) => p.type === "text").map((p: any) => p.text).join(" ");
        } else if (typeof content === "string") {
          return content;
        }
      }
    }
    return "";
  }

  private async *generateMockStream(messages: LanguageModelV1Message[], userPrompt: string): AsyncGenerator<LanguageModelV1StreamPart> {
    const toolMessageCount = messages.filter((m) => m.role === "tool").length;
    const promptLower = userPrompt.toLowerCase();
    let componentType = "counter";
    let componentName = "Counter";

    if (promptLower.includes("form")) {
      componentType = "form";
      componentName = "ContactForm";
    } else if (promptLower.includes("card")) {
      componentType = "card";
      componentName = "Card";
    }

    if (toolMessageCount === 1) {
      const text = `I'll create a ${componentName} component for you.`;
      for (const char of text) {
        yield { type: "text-delta", textDelta: char };
        await delay(25);
      }
      yield { type: "tool-call", toolCallType: "function", toolCallId: `call_1`, toolName: "str_replace_editor", args: JSON.stringify({ command: "create", path: `/components/${componentName}.jsx`, file_text: this.getComponentCode(componentType) }) };
      yield { type: "finish", finishReason: "tool-calls", usage: { promptTokens: 50, completionTokens: 30 } };
      return;
    }

    if (toolMessageCount === 2) {
      const text = `Now let me enhance the component with better styling.`;
      for (const char of text) {
        yield { type: "text-delta", textDelta: char };
        await delay(25);
      }
      yield { type: "tool-call", toolCallType: "function", toolCallId: `call_2`, toolName: "str_replace_editor", args: JSON.stringify({ command: "str_replace", path: `/components/${componentName}.jsx`, old_str: this.getOldStringForReplace(componentType), new_str: this.getNewStringForReplace(componentType) }) };
      yield { type: "finish", finishReason: "tool-calls", usage: { promptTokens: 50, completionTokens: 30 } };
      return;
    }

    if (toolMessageCount === 0) {
      const text = `This is a static response. You can place an Anthropic API key in the .env file to use the Anthropic API for component generation. Let me create an App.jsx file to display the component.`;
      for (const char of text) {
        yield { type: "text-delta", textDelta: char };
        await delay(15);
      }
      yield { type: "tool-call", toolCallType: "function", toolCallId: `call_3`, toolName: "str_replace_editor", args: JSON.stringify({ command: "create", path: "/App.jsx", file_text: this.getAppCode(componentName) }) };
      yield { type: "finish", finishReason: "tool-calls", usage: { promptTokens: 50, completionTokens: 30 } };
      return;
    }

    if (toolMessageCount >= 3) {
      const text = `Perfect! I've created: 1. **${componentName}.jsx** - A fully-featured ${componentType} component 2. **App.jsx** - The main app file that displays the component. The component is now ready to use.`;
      for (const char of text) {
        yield { type: "text-delta", textDelta: char };
        await delay(30);
      }
      yield { type: "finish", finishReason: "stop", usage: { promptTokens: 50, completionTokens: 50 } };
      return;
    }
  }

  private getComponentCode(componentType: string): string {
    switch (componentType) {
      case "form":
        return `import React, { useState } from 'react';
const ContactForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); console.log('Form submitted:', formData); };
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Message</label><textarea name="message" value={formData.message} onChange={handleChange} required rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
        <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">Send Message</button>
      </form>
    </div>
  );
};
export default ContactForm;`;
      case "card":
        return `import React from 'react';
const Card = ({ title = "Welcome to Our Service", description = "Discover amazing features and capabilities that will transform your experience.", imageUrl, actions }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {imageUrl && <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />}
      <div className="p-6"><h3 className="text-xl font-semibold mb-2">{title}</h3><p className="text-gray-600 mb-4">{description}</p>{actions && <div className="mt-4">{actions}</div>}</div>
    </div>
  );
};
export default Card;`;
      default:
        return `import { useState } from 'react';
const Counter = () => {
  const [count, setCount] = useState(0);
  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(0);
  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Counter</h2>
      <div className="text-4xl font-bold mb-6">{count}</div>
      <div className="flex gap-4">
        <button onClick={decrement} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">Decrease</button>
        <button onClick={reset} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">Reset</button>
        <button onClick={increment} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">Increase</button>
      </div>
    </div>
  );
};
export default Counter;`;
    }
  }

  private getOldStringForReplace(componentType: string): string {
    switch (componentType) {
      case "form": return "    console.log('Form submitted:', formData);";
      case "card": return '      <div className="p-6">';
      default: return "  const increment = () => setCount(count + 1);";
    }
  }

  private getNewStringForReplace(componentType: string): string {
    switch (componentType) {
      case "form": return "    console.log('Form submitted:', formData);\n    alert('Thank you!');";
      case "card": return '      <div className="p-6 hover:bg-gray-50 transition-colors">';
      default: return "  const increment = () => setCount(prev => prev + 1);";
    }
  }

  private getAppCode(componentName: string): string {
    if (componentName === "Card") {
      return `import Card from '@/components/Card';
export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <Card title="Amazing Product" description="This is a fantastic product!" actions={<button className="bg-blue-500 text-white px-4 py-2 rounded">Learn More</button>} />
    </div>
  );
}`;
    }
    return `import ${componentName} from '@/components/${componentName}';
export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <${componentName} />
    </div>
  );
}`;
  }

  async doGenerate(options: Parameters<LanguageModelV1["doGenerate"]>[0]): Promise<Awaited<ReturnType<LanguageModelV1["doGenerate"]>>> {
    const userPrompt = this.extractUserPrompt(options.prompt);
    const parts: LanguageModelV1StreamPart[] = [];
    for await (const part of this.generateMockStream(options.prompt, userPrompt)) {
      parts.push(part);
    }
    const textParts = parts.filter((p) => p.type === "text-delta").map((p: any) => p.textDelta).join("");
    const toolCalls = parts.filter((p) => p.type === "tool-call").map((p: any) => ({ toolCallType: "function" as const, toolCallId: p.toolCallId, toolName: p.toolName, args: p.args }));
    const finishPart = parts.find((p) => p.type === "finish") as any;
    return { text: textParts, toolCalls, finishReason: (finishPart?.finishReason || "stop") as any, usage: { promptTokens: 100, completionTokens: 200 }, warnings: [], rawCall: { rawPrompt: options.prompt, rawSettings: { maxTokens: options.maxTokens, temperature: options.temperature } } };
  }

  async doStream(options: Parameters<LanguageModelV1["doStream"]>[0]): Promise<Awaited<ReturnType<LanguageModelV1["doStream"]>>> {
    const userPrompt = this.extractUserPrompt(options.prompt);
    const self = this;
    const stream = new ReadableStream<LanguageModelV1StreamPart>({
      async start(controller) {
        try {
          const generator = self.generateMockStream(options.prompt, userPrompt);
          for await (const chunk of generator) {
            controller.enqueue(chunk);
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });
    return { stream, warnings: [], rawCall: { rawPrompt: options.prompt, rawSettings: {} }, rawResponse: { headers: {} } };
  }
}
