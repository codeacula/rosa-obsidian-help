import { App, Modal, Setting } from "obsidian";
import {
	Conversation,
	ConversationMessage,
	Personality,
	ProviderConfig,
	RosaSettings,
} from "../types";

export interface ConversationModalConfig {
	provider: ProviderConfig;
	model: string;
	personality: Personality;
	customPrompt?: string;
	conversation?: Conversation;
}

export class ConversationModal extends Modal {
	private settings: RosaSettings;
	private config: ConversationModalConfig;
	private messages: ConversationMessage[];
	private inputValue: string = "";
	private isLoading: boolean = false;

	constructor(
		app: App,
		settings: RosaSettings,
		config: ConversationModalConfig
	) {
		super(app);
		this.settings = settings;
		this.config = config;
		this.messages = config.conversation
			? [...config.conversation.messages]
			: [];
	}

	onOpen() {
		this.render();
	}

	render() {
		const { contentEl } = this;
		contentEl.empty();

		// Header
		contentEl.createEl("h2", {
			text:
				this.config.conversation?.title || this.config.personality.name,
		});
		contentEl.createEl("div", {
			text: `Provider: ${this.config.provider.provider} | Model: ${this.config.model}`,
		});
		contentEl.createEl("div", {
			text: `Personality: ${this.config.personality.name}`,
		});
		if (this.config.customPrompt) {
			contentEl.createEl("div", {
				text: `Custom Prompt: ${this.config.customPrompt}`,
			});
		}
		contentEl.createEl("hr");

		// Message list
		const msgList = contentEl.createDiv({ cls: "rosa-conversation-list" });
		this.messages.forEach((msg) => {
			const msgDiv = msgList.createDiv({
				cls: `rosa-msg rosa-msg-${msg.role}`,
			});
			msgDiv.createEl("strong", {
				text:
					msg.role === "user"
						? "You:"
						: this.config.personality.name + ":",
			});
			msgDiv.createSpan({ text: " " + msg.content });
			msgDiv.createEl("div", {
				text: new Date(msg.timestamp).toLocaleTimeString(),
				cls: "rosa-msg-time",
			});
		});

		// Input area
		const inputDiv = contentEl.createDiv({ cls: "rosa-input-row" });
		const input = inputDiv.createEl("textarea", { cls: "rosa-input" });
		input.value = this.inputValue;
		input.rows = 2;
		input.placeholder = "Type your message...";
		input.oninput = (e) => {
			this.inputValue = (e.target as HTMLTextAreaElement).value;
		};
		input.onkeydown = (e) => {
			if (e.key === "Enter" && !e.shiftKey) {
				e.preventDefault();
				this.sendMessage();
			}
		};

		// Send button
		new Setting(inputDiv).addButton((btn) =>
			btn
				.setButtonText(this.isLoading ? "Sending..." : "Send")
				.setDisabled(this.isLoading)
				.onClick(() => this.sendMessage())
		);
	}

	async sendMessage() {
		if (!this.inputValue.trim() || this.isLoading) return;
		const userMsg: ConversationMessage = {
			id: Date.now().toString(),
			role: "user",
			content: this.inputValue.trim(),
			timestamp: new Date(),
		};
		this.messages.push(userMsg);
		this.inputValue = "";
		this.isLoading = true;
		this.render();

		// TODO: Call AI provider here and get response
		// For now, fake a response after 1s
		setTimeout(() => {
			const aiMsg: ConversationMessage = {
				id: Date.now().toString() + "-ai",
				role: "assistant",
				content: "[AI reply goes here]", // Replace with real response
				timestamp: new Date(),
			};
			this.messages.push(aiMsg);
			this.isLoading = false;
			this.render();
		}, 1000);
	}
}
