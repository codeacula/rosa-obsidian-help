// @ts-ignore
import { defineComponent, h, ref } from "vue";

export default defineComponent({
	name: "ChatApp",
	setup() {
		const messages = ref<string[]>([]);
		const input = ref("");

		function sendMessage() {
			const text = input.value.trim();
			if (!text) return;
			messages.value.push(`You: ${text}`);
			input.value = "";
			// TODO: replace with real AI call
			setTimeout(() => {
				messages.value.push(`Rosa: Echo - ${text}`);
			}, 500);
		}

		return () =>
			h("div", { class: "rosa-chat-app" }, [
				h(
					"div",
					{ class: "messages" },
					messages.value.map((msg: string, idx: number) =>
						h("div", { key: idx, class: "message" }, msg)
					)
				),
				h("div", { class: "input-row" }, [
					h("textarea", {
						class: "input-box",
						placeholder: "Type a message...",
						value: input.value,
						onInput: (e: Event) => {
							input.value = (
								e.target as HTMLTextAreaElement
							).value;
						},
						onKeydown: (e: KeyboardEvent) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								sendMessage();
							}
						},
					}),
					h(
						"button",
						{ class: "send-btn", onClick: sendMessage },
						"Send"
					),
				]),
			]);
	},
});
