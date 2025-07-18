import { App, TFile, TFolder } from "obsidian";
import { Conversation, ConversationMessage, RosaSettings } from "../types";

/**
 * Service for managing AI conversations as notes
 * Each conversation becomes a folder, each message becomes a note
 */
export class ConversationManager {
	private conversations: Map<string, Conversation> = new Map();

	constructor(private app: App, private settings: RosaSettings) {}

	/**
	 * Start a new conversation
	 */
	async startConversation(title?: string): Promise<Conversation> {
		const id = this.generateConversationId();
		const conversationTitle =
			title || `Conversation ${new Date().toLocaleDateString()}`;
		const folderPath = `${
			this.settings.conversationsFolder
		}/${id}-${this.sanitizeFileName(conversationTitle)}`;

		// Create conversation folder
		await this.ensureFolderExists(folderPath);

		const conversation: Conversation = {
			id,
			title: conversationTitle,
			messages: [],
			createdAt: new Date(),
			updatedAt: new Date(),
			folderPath,
			providerId: "",
			model: "",
			personalityId: "",
		};

		this.conversations.set(id, conversation);

		// Create conversation metadata file
		await this.saveConversationMetadata(conversation);

		return conversation;
	}

	/**
	 * Add message to conversation
	 */
	async addMessage(
		conversationId: string,
		role: "user" | "assistant",
		content: string
	): Promise<ConversationMessage> {
		const conversation = this.conversations.get(conversationId);
		if (!conversation) {
			throw new Error(`Conversation ${conversationId} not found`);
		}

		const message: ConversationMessage = {
			id: this.generateMessageId(),
			role,
			content,
			timestamp: new Date(),
		};

		conversation.messages.push(message);
		conversation.updatedAt = new Date();

		// Save message as individual note
		await this.saveMessageAsNote(conversation, message);

		// Update conversation metadata
		await this.saveConversationMetadata(conversation);

		return message;
	}

	/**
	 * Get conversation by ID
	 */
	getConversation(id: string): Conversation | undefined {
		return this.conversations.get(id);
	}

	/**
	 * List all conversations
	 */
	getAllConversations(): Conversation[] {
		return Array.from(this.conversations.values());
	}

	/**
	 * Load conversations from vault
	 */
	async loadConversationsFromVault(): Promise<void> {
		const conversationsFolder = this.app.vault.getAbstractFileByPath(
			this.settings.conversationsFolder
		);

		if (!(conversationsFolder instanceof TFolder)) {
			return;
		}

		for (const child of conversationsFolder.children) {
			if (child instanceof TFolder) {
				try {
					const conversation = await this.loadConversationFromFolder(
						child
					);
					if (conversation) {
						this.conversations.set(conversation.id, conversation);
					}
				} catch (error) {
					console.error(
						`Error loading conversation from ${child.path}:`,
						error
					);
				}
			}
		}
	}

	/**
	 * Save message as individual note file
	 */
	private async saveMessageAsNote(
		conversation: Conversation,
		message: ConversationMessage
	): Promise<void> {
		const messageIndex = conversation.messages.length;
		const fileName = `${messageIndex.toString().padStart(3, "0")}-${
			message.role
		}-${message.timestamp
			.toISOString()
			.slice(0, 19)
			.replace(/[:.]/g, "-")}`;
		const filePath = `${conversation.folderPath}/${fileName}.md`;

		const noteContent = this.formatMessageAsNote(message, conversation);

		await this.app.vault.create(filePath, noteContent);
	}

	/**
	 * Format message content as a note
	 */
	private formatMessageAsNote(
		message: ConversationMessage,
		conversation: Conversation
	): string {
		const metadata = [
			"---",
			`conversation: "${conversation.title}"`,
			`role: ${message.role}`,
			`timestamp: ${message.timestamp.toISOString()}`,
			`message_id: ${message.id}`,
			"---",
			"",
			`# ${message.role === "user" ? "User" : "Rosa"} Message`,
			"",
			message.content,
			"",
			"---",
			"",
			`**Conversation:** [[${conversation.folderPath}/README|${conversation.title}]]`,
			`**Time:** ${message.timestamp.toLocaleString()}`,
		].join("\n");

		return metadata;
	}

	/**
	 * Save conversation metadata
	 */
	private async saveConversationMetadata(
		conversation: Conversation
	): Promise<void> {
		const metadataPath = `${conversation.folderPath}/README.md`;
		const metadata = [
			"---",
			`title: "${conversation.title}"`,
			`conversation_id: ${conversation.id}`,
			`created: ${conversation.createdAt.toISOString()}`,
			`updated: ${conversation.updatedAt.toISOString()}`,
			`message_count: ${conversation.messages.length}`,
			"---",
			"",
			`# ${conversation.title}`,
			"",
			"## Conversation Summary",
			"",
			`- **Started:** ${conversation.createdAt.toLocaleString()}`,
			`- **Last Updated:** ${conversation.updatedAt.toLocaleString()}`,
			`- **Messages:** ${conversation.messages.length}`,
			"",
			"## Messages",
			"",
			...conversation.messages.map(
				(msg, index) =>
					`${index + 1}. [[${index.toString().padStart(3, "0")}-${
						msg.role
					}-${msg.timestamp
						.toISOString()
						.slice(0, 19)
						.replace(/[:.]/g, "-")}|${
						msg.role === "user" ? "User" : "Rosa"
					} - ${msg.timestamp.toLocaleTimeString()}]]`
			),
		].join("\n");

		// Check if file exists and update or create
		const existingFile = this.app.vault.getAbstractFileByPath(metadataPath);
		if (existingFile instanceof TFile) {
			await this.app.vault.modify(existingFile, metadata);
		} else {
			await this.app.vault.create(metadataPath, metadata);
		}
	}

	/**
	 * Load conversation from folder
	 */
	private async loadConversationFromFolder(
		folder: TFolder
	): Promise<Conversation | null> {
		const readmePath = `${folder.path}/README.md`;
		const readmeFile = this.app.vault.getAbstractFileByPath(readmePath);

		if (!(readmeFile instanceof TFile)) {
			return null;
		}

		const content = await this.app.vault.read(readmeFile);
		const frontmatter = this.parseFrontmatter(content);

		if (!frontmatter.conversation_id) {
			return null;
		}

		// Load messages from folder
		const messages: ConversationMessage[] = [];
		for (const child of folder.children) {
			if (child instanceof TFile && child.name !== "README.md") {
				const message = await this.loadMessageFromFile(child);
				if (message) {
					messages.push(message);
				}
			}
		}

		// Sort messages by timestamp
		messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

		return {
			id: frontmatter.conversation_id,
			title: frontmatter.title || folder.name,
			messages,
			createdAt: new Date(frontmatter.created),
			updatedAt: new Date(frontmatter.updated),
			folderPath: folder.path,
			providerId: frontmatter.provider_id || "",
			model: frontmatter.model || "",
			personalityId: frontmatter.personality_id || "",
		};
	}

	/**
	 * Load message from file
	 */
	private async loadMessageFromFile(
		file: TFile
	): Promise<ConversationMessage | null> {
		try {
			const content = await this.app.vault.read(file);
			const frontmatter = this.parseFrontmatter(content);
			const messageContent = content
				.replace(/^---[\s\S]*?---\n\n/, "")
				.replace(/\n---[\s\S]*$/, "");

			return {
				id: frontmatter.message_id || file.name,
				role: frontmatter.role as "user" | "assistant",
				content: messageContent.trim(),
				timestamp: new Date(frontmatter.timestamp),
			};
		} catch (error) {
			console.error(`Error loading message from ${file.path}:`, error);
			return null;
		}
	}

	/**
	 * Parse frontmatter from markdown content
	 */
	private parseFrontmatter(content: string): Record<string, string> {
		const match = content.match(/^---\n([\s\S]*?)\n---/);
		if (!match) return {};

		const frontmatter: Record<string, string> = {};
		const lines = match[1].split("\n");

		for (const line of lines) {
			const colonIndex = line.indexOf(":");
			if (colonIndex > 0) {
				const key = line.slice(0, colonIndex).trim();
				const value = line
					.slice(colonIndex + 1)
					.trim()
					.replace(/^"(.*)"$/, "$1");
				frontmatter[key] = value;
			}
		}

		return frontmatter;
	}

	/**
	 * Generate unique conversation ID
	 */
	private generateConversationId(): string {
		return Date.now().toString(36) + Math.random().toString(36).substr(2);
	}

	/**
	 * Generate unique message ID
	 */
	private generateMessageId(): string {
		return Date.now().toString(36) + Math.random().toString(36).substr(2);
	}

	/**
	 * Sanitize filename for folder/file creation
	 */
	private sanitizeFileName(name: string): string {
		return name.replace(/[<>:"/\\|?*]/g, "-").replace(/\s+/g, "-");
	}

	/**
	 * Ensure folder exists
	 */
	private async ensureFolderExists(folderPath: string): Promise<TFolder> {
		const folder = this.app.vault.getAbstractFileByPath(folderPath);

		if (folder instanceof TFolder) {
			return folder;
		}

		return await this.app.vault.createFolder(folderPath);
	}
}
