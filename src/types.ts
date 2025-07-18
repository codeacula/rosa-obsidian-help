// Core types and interfaces for Rosa plugin

export interface ProviderConfig {
	provider: "openai" | "anthropic" | "gemini" | "local";
	apiKey: string;
	models: string[];
	defaultModel: string;
	maxTokens?: number;
	temperature?: number;
}

export interface Personality {
	id: string;
	name: string;
	description: string;
	systemPrompt: string;
}

export interface RosaSettings {
	// AI Providers
	providers: ProviderConfig[];
	defaultProvider: string; // provider id

	// AI Settings
	maxTokens: number;
	temperature: number;

	// Personalities
	personalities: Personality[];
	defaultPersonality: string; // personality id

	// Note Organization
	projectsFolder: string;
	peopleFolder: string;
	thoughtsFolder: string;
	tasksFolder: string;
	conversationsFolder: string;
	templatesFolder: string;

	// Auto-formatting
	autoCreateFolders: boolean;
	useTimestamps: boolean;
	autoLinkNotes: boolean;

	// Conversation Settings
	conversationAsFolder: boolean;
	messageAsNote: boolean;
	includeMetadata: boolean;
}

export interface ConversationMessage {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: Date;
	metadata?: Record<string, unknown>;
}

export interface Conversation {
	id: string;
	title: string;
	messages: ConversationMessage[];
	createdAt: Date;
	updatedAt: Date;
	folderPath: string;
	providerId: string;
	model: string;
	personalityId: string;
}

export interface NoteTemplate {
	name: string;
	content: string;
	variables: string[];
	folder?: string;
}

export interface QuickAction {
	id: string;
	name: string;
	description: string;
	icon?: string;
	hotkey?: string;
	command: () => Promise<void>;
}

export interface ProcessingRule {
	name: string;
	pattern: RegExp;
	action: (content: string) => string;
	enabled: boolean;
}
