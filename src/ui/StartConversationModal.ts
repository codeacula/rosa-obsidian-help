import { App, Modal, Notice, Setting } from "obsidian";
import { Personality, ProviderConfig, RosaSettings } from "../types";

export interface StartConversationConfig {
	providerId: string;
	model: string;
	personalityId: string;
	customPrompt?: string;
}

export class StartConversationModal extends Modal {
	private settings: RosaSettings;
	private onStart: (config: StartConversationConfig) => void;

	private selectedProvider: ProviderConfig;
	private selectedModel: string;
	private selectedPersonality: Personality;
	private customPrompt: string = "";

	constructor(
		app: App,
		settings: RosaSettings,
		onStart: (config: StartConversationConfig) => void
	) {
		super(app);
		this.settings = settings;
		this.onStart = onStart;
		this.selectedProvider =
			settings.providers.find(
				(p) => p.provider === settings.defaultProvider
			) || settings.providers[0];
		this.selectedModel = this.selectedProvider?.defaultModel || "";
		this.selectedPersonality =
			settings.personalities.find(
				(p) => p.id === settings.defaultPersonality
			) || settings.personalities[0];
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.createEl("h2", { text: "Start AI Conversation" });

		// Provider selection
		new Setting(contentEl).setName("Provider").addDropdown((drop) => {
			this.settings.providers.forEach((provider, idx) => {
				drop.addOption(idx.toString(), provider.provider);
			});
			drop.setValue(
				this.settings.providers
					.indexOf(this.selectedProvider)
					.toString()
			);
			drop.onChange((val) => {
				this.selectedProvider = this.settings.providers[parseInt(val)];
				this.selectedModel = this.selectedProvider.defaultModel;
				this.display();
			});
		});

		// Model selection
		new Setting(contentEl).setName("Model").addDropdown((drop) => {
			this.selectedProvider.models.forEach((model) => {
				drop.addOption(model, model);
			});
			drop.setValue(this.selectedModel);
			drop.onChange((val) => {
				this.selectedModel = val;
			});
		});

		// Personality selection
		new Setting(contentEl).setName("Personality").addDropdown((drop) => {
			this.settings.personalities.forEach((personality, idx) => {
				drop.addOption(personality.id, personality.name);
			});
			drop.setValue(this.selectedPersonality.id);
			drop.onChange((val) => {
				const found = this.settings.personalities.find(
					(p) => p.id === val
				);
				if (found) this.selectedPersonality = found;
			});
		});

		// Custom prompt
		new Setting(contentEl)
			.setName("Custom System Prompt (optional)")
			.addTextArea((text) => {
				text.setPlaceholder(this.selectedPersonality.systemPrompt);
				text.setValue(this.customPrompt);
				text.onChange((val) => {
					this.customPrompt = val;
				});
			});

		// Start button
		new Setting(contentEl).addButton((btn) =>
			btn
				.setButtonText("Start Conversation")
				.setCta()
				.onClick(() => {
					if (
						!this.selectedProvider ||
						!this.selectedModel ||
						!this.selectedPersonality
					) {
						new Notice(
							"Please select a provider, model, and personality."
						);
						return;
					}
					this.close();
					this.onStart({
						providerId: this.selectedProvider.provider,
						model: this.selectedModel,
						personalityId: this.selectedPersonality.id,
						customPrompt: this.customPrompt.trim() || undefined,
					});
				})
		);
	}

	display() {
		this.onOpen();
	}
}
