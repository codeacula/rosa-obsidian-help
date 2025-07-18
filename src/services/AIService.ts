import { ConversationMessage } from "../types";

/**
 * Abstract base class for AI service providers
 */
export abstract class AIProvider {
	abstract sendMessage(
		messages: ConversationMessage[],
		systemPrompt?: string
	): Promise<string>;

	abstract isConfigured(): boolean;
}

/**
 * OpenAI API integration
 */
export class OpenAIProvider extends AIProvider {
	constructor(
		private apiKey: string,
		private model: string = "gpt-4",
		private maxTokens: number = 2000,
		private temperature: number = 0.7
	) {
		super();
	}

	async sendMessage(
		messages: ConversationMessage[],
		systemPrompt?: string
	): Promise<string> {
		if (!this.isConfigured()) {
			throw new Error("OpenAI API key not configured");
		}

		const apiMessages = this.convertToOpenAIFormat(messages, systemPrompt);

		try {
			const response = await fetch(
				"https://api.openai.com/v1/chat/completions",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${this.apiKey}`,
					},
					body: JSON.stringify({
						model: this.model,
						messages: apiMessages,
						max_tokens: this.maxTokens,
						temperature: this.temperature,
					}),
				}
			);

			if (!response.ok) {
				throw new Error(`OpenAI API error: ${response.status}`);
			}

			const data = await response.json();
			return data.choices[0]?.message?.content || "No response received";
		} catch (error) {
			console.error("OpenAI API error:", error);
			throw new Error(
				`Failed to get AI response: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
		}
	}

	isConfigured(): boolean {
		return !!this.apiKey && this.apiKey.length > 0;
	}

	private convertToOpenAIFormat(
		messages: ConversationMessage[],
		systemPrompt?: string
	) {
		const apiMessages = [];

		if (systemPrompt) {
			apiMessages.push({
				role: "system",
				content: systemPrompt,
			});
		}

		messages.forEach((msg) => {
			apiMessages.push({
				role: msg.role,
				content: msg.content,
			});
		});

		return apiMessages;
	}
}

/**
 * Anthropic Claude API integration
 */
export class AnthropicProvider extends AIProvider {
	constructor(
		private apiKey: string,
		private model: string = "claude-3-sonnet-20240229",
		private maxTokens: number = 2000,
		private temperature: number = 0.7
	) {
		super();
	}

	async sendMessage(
		messages: ConversationMessage[],
		systemPrompt?: string
	): Promise<string> {
		if (!this.isConfigured()) {
			throw new Error("Anthropic API key not configured");
		}

		try {
			const response = await fetch(
				"https://api.anthropic.com/v1/messages",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"x-api-key": this.apiKey,
						"anthropic-version": "2023-06-01",
					},
					body: JSON.stringify({
						model: this.model,
						max_tokens: this.maxTokens,
						temperature: this.temperature,
						system:
							systemPrompt ||
							"You are Rosa, a helpful AI assistant integrated into Obsidian.",
						messages: this.convertToAnthropicFormat(messages),
					}),
				}
			);

			if (!response.ok) {
				throw new Error(`Anthropic API error: ${response.status}`);
			}

			const data = await response.json();
			return data.content[0]?.text || "No response received";
		} catch (error) {
			console.error("Anthropic API error:", error);
			throw new Error(
				`Failed to get AI response: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
		}
	}

	isConfigured(): boolean {
		return !!this.apiKey && this.apiKey.length > 0;
	}

	private convertToAnthropicFormat(messages: ConversationMessage[]) {
		return messages.map((msg) => ({
			role: msg.role,
			content: msg.content,
		}));
	}
}

/**
 * AI Service that manages different providers
 */
export class AIService {
	private provider: AIProvider;
	private systemPrompt: string;

	constructor(
		provider: AIProvider,
		systemPrompt: string = "You are Rosa, a helpful AI assistant integrated into Obsidian. You help users organize their notes, thoughts, and knowledge. Be concise but helpful."
	) {
		this.provider = provider;
		this.systemPrompt = systemPrompt;
	}

	async sendMessage(messages: ConversationMessage[]): Promise<string> {
		return await this.provider.sendMessage(messages, this.systemPrompt);
	}

	isConfigured(): boolean {
		return this.provider.isConfigured();
	}

	updateSystemPrompt(prompt: string): void {
		this.systemPrompt = prompt;
	}

	setProvider(provider: AIProvider): void {
		this.provider = provider;
	}
}
