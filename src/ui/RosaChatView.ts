import { ItemView, WorkspaceLeaf } from "obsidian";
// @ts-ignore
import { createApp } from "vue";
// Import Vue SFC
// @ts-ignore
import ChatApp from "./vue/ChatApp.vue";

export const ROSA_CHAT_VIEW_TYPE = "rosa-chat-view";

export class RosaChatView extends ItemView {
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
		const container = this.containerEl.children[1];
		container.empty();
		// Create mount point
		const mountPoint = container.createDiv({ cls: "rosa-vue-chat" });
		// Mount Vue app
		createApp(ChatApp).mount(mountPoint);
	}

	async onClose() {
		// Cleanup if needed
	}
}
