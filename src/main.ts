import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	WorkspaceLeaf,
} from "obsidian";
import { RosaSettings } from "./types";
import { ROSA_CHAT_VIEW_TYPE, RosaChatView } from "./ui/RosaChatView";

const DEFAULT_SETTINGS: RosaSettings = {
	maxTokens: 2000,
	temperature: 0.7,

	// Note Organization
	projectsFolder: "Projects",
	peopleFolder: "People",
	thoughtsFolder: "Thoughts",
	tasksFolder: "Tasks",
	conversationsFolder: "Conversations",
	templatesFolder: "Templates",

	// Auto-formatting
	autoCreateFolders: true,
	useTimestamps: true,
	autoLinkNotes: true,

	// Conversation Settings
	conversationAsFolder: true,
	messageAsNote: true,
	includeMetadata: true,
	providers: [],
	defaultProvider: "",
	personalities: [],
	defaultPersonality: "",
};

export default class RosaPlugin extends Plugin {
	settings: RosaSettings;

	async onload() {
		await this.loadSettings();

		// Register custom chat view
		this.registerView(
			ROSA_CHAT_VIEW_TYPE,
			(leaf: WorkspaceLeaf) => new RosaChatView(leaf)
		);
		// Open Rosa Chat View in main pane by default
		const mainLeaf = this.app.workspace.getLeaf(true);
		mainLeaf.setViewState({ type: ROSA_CHAT_VIEW_TYPE, active: true });
		this.app.workspace.revealLeaf(mainLeaf);

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"dice",
			"Sample Plugin",
			(evt: MouseEvent) => {
				// Called when the user clicks the icon.
				new Notice("This is a notice!");
			}
		);
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("Status Bar Text");

		// Start AI Conversation command
		this.addCommand({
			id: "rosa-start-conversation",
			name: "Start AI Conversation",
			callback: () => {
				Promise.all([
					import("./ui/StartConversationModal"),
					import("./ui/ConversationModal"),
				]).then(
					([{ StartConversationModal }, { ConversationModal }]) => {
						new StartConversationModal(
							this.app,
							this.settings,
							(config) => {
								// Find provider and personality objects
								const provider =
									this.settings.providers.find(
										(p) => p.provider === config.providerId
									) || this.settings.providers[0];
								const personality =
									this.settings.personalities.find(
										(p) => p.id === config.personalityId
									) || this.settings.personalities[0];
								new ConversationModal(this.app, this.settings, {
									provider,
									model: config.model,
									personality,
									customPrompt: config.customPrompt,
								}).open();
							}
						).open();
					}
				);
			},
		});

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "open-sample-modal-simple",
			name: "Open sample modal (simple)",
			callback: () => {
				new SampleModal(this.app).open();
			},
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: "sample-editor-command",
			name: "Sample editor command",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection("Sample Editor Command");
			},
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: "open-sample-modal-complex",
			name: "Open sample modal (complex)",
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new RosaSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, "click", (evt: MouseEvent) => {
			console.log("click", evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		);

		// Add command to open chat view
		this.addCommand({
			id: "rosa-open-chat-view",
			name: "Open Rosa Chat View",
			callback: () => {
				const leaf = this.app.workspace.getLeaf(true);
				leaf.setViewState({ type: ROSA_CHAT_VIEW_TYPE, active: true });
				this.app.workspace.revealLeaf(leaf);
			},
		});
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText("Woah!");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class RosaSettingTab extends PluginSettingTab {
	plugin: RosaPlugin;

	constructor(app: App, plugin: RosaPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: "AI Providers" });
		this.plugin.settings.providers.forEach((provider, idx) => {
			new Setting(containerEl)
				.setName(
					`${provider.provider} (${
						provider.apiKey ? "Configured" : "Missing Key"
					})`
				)
				.setDesc(`Default Model: ${provider.defaultModel}`)
				.addText((text) =>
					text
						.setPlaceholder("API Key")
						.setValue(provider.apiKey)
						.onChange(async (value) => {
							provider.apiKey = value;
							await this.plugin.saveSettings();
						})
				)
				.addText((text) =>
					text
						.setPlaceholder("Default Model")
						.setValue(provider.defaultModel)
						.onChange(async (value) => {
							provider.defaultModel = value;
							await this.plugin.saveSettings();
						})
				)
				.addExtraButton((btn) =>
					btn
						.setIcon("cross")
						.setTooltip("Remove Provider")
						.onClick(async () => {
							this.plugin.settings.providers.splice(idx, 1);
							await this.plugin.saveSettings();
							this.display();
						})
				);
		});
		new Setting(containerEl).addButton((btn) =>
			btn.setButtonText("Add Provider").onClick(async () => {
				this.plugin.settings.providers.push({
					provider: "openai",
					apiKey: "",
					models: ["gpt-4"],
					defaultModel: "gpt-4",
				});
				await this.plugin.saveSettings();
				this.display();
			})
		);

		containerEl.createEl("h2", { text: "Personalities" });
		this.plugin.settings.personalities.forEach((personality, idx) => {
			new Setting(containerEl)
				.setName(personality.name)
				.setDesc(personality.description)
				.addText((text) =>
					text
						.setPlaceholder("Name")
						.setValue(personality.name)
						.onChange(async (value) => {
							personality.name = value;
							await this.plugin.saveSettings();
						})
				)
				.addText((text) =>
					text
						.setPlaceholder("System Prompt")
						.setValue(personality.systemPrompt)
						.onChange(async (value) => {
							personality.systemPrompt = value;
							await this.plugin.saveSettings();
						})
				)
				.addExtraButton((btn) =>
					btn
						.setIcon("cross")
						.setTooltip("Remove Personality")
						.onClick(async () => {
							this.plugin.settings.personalities.splice(idx, 1);
							await this.plugin.saveSettings();
							this.display();
						})
				);
		});

		new Setting(containerEl).addButton((btn) =>
			btn.setButtonText("Add Personality").onClick(async () => {
				this.plugin.settings.personalities.push({
					id: Date.now().toString(),
					name: "New Personality",
					description: "",
					systemPrompt: "You are Rosa, a helpful AI assistant.",
				});
				await this.plugin.saveSettings();
				this.display();
			})
		);
	}
}
