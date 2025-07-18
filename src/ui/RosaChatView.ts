import { ItemView, WorkspaceLeaf } from "obsidian";
import { createApp, App as VueApp } from "vue";
import ChatApp from "./vue/ChatApp.vue";

export const ROSA_CHAT_VIEW_TYPE = "rosa-chat-view";

export class RosaChatView extends ItemView {
	public newvueApp: VueApp | null = null;
	private vueRootEl: HTMLElement | null = null;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return ROSA_CHAT_VIEW_TYPE;
	}

	getDisplayText() {
		return "Rosa Chat";
	}

	getIcon() {
		return "message-circle";
	}

	async onOpen() {
		// Defensive: ensure container exists
		const container = this.containerEl.children[1] as
			| HTMLElement
			| undefined;
		if (!container) return;

		container.empty();

		// Create and store a reference to the Vue root element
		this.vueRootEl = container.createEl("div");

		this.newvueApp = createApp(ChatApp);
		this.newvueApp.mount(this.vueRootEl);
	}

	async onClose() {
		if (this.newvueApp) {
			this.newvueApp.unmount();
			this.newvueApp = null;
		}
		// Optionally, clean up the Vue root element
		if (this.vueRootEl && this.vueRootEl.parentElement) {
			this.vueRootEl.parentElement.removeChild(this.vueRootEl);
			this.vueRootEl = null;
		}
	}
}
