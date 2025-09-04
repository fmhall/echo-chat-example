import {
	EchoChatProvider,
	useChat,
	useEcho,
	useEchoModelProviders,
} from "@merit-systems/echo-react-sdk";
import { type ModelMessage, streamText } from "ai";
import { useState } from "react";
import ASCIIText from "@/components/ASCIIText";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { cn } from "@/lib/utils";

export function Chat() {
	const { messages, sendMessage, status, stop } = useChat();
	const [input, setInput] = useState("");

	return (
		<Card className="flex h-[500px] w-full flex-col">
			<CardContent className="flex flex-1 flex-col space-y-4">
				{/* Messages Container */}
				<div className="flex-1 space-y-3 overflow-y-auto pr-2">
					{messages.length === 0 ? (
						<div className="relative aspect-video w-full max-w-4xl">
							<ASCIIText
								text="Echo"
								textFontSize={100}
								textColor="red"
								planeBaseHeight={12}
							/>
						</div>
					) : (
						messages.map((message) => (
							<div
								key={message.id}
								className={cn(
									"flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
									message.role === "user"
										? "ml-auto bg-primary text-primary-foreground"
										: "bg-muted",
								)}
							>
								<div className="font-medium text-xs opacity-70">
									{message.role === "user" ? "You" : "Echo"}
								</div>
								<div>
									{message.parts.map((part, partIndex) =>
										part.type === "text" ? (
											<span key={`${message.id}-part-${partIndex}`}>
												{part.text}
											</span>
										) : null,
									)}
								</div>
							</div>
						))
					)}

					{/* Loading indicator */}
					{(status === "submitted" || status === "streaming") && (
						<div className="flex items-center space-x-2 text-muted-foreground">
							{status === "submitted" && <Spinner className="h-4 w-4" />}
							<span className="text-sm">Echo is thinking...</span>
							<Button
								variant="outline"
								size="sm"
								onClick={() => stop()}
								className="h-6 px-2 text-xs"
							>
								Stop
							</Button>
						</div>
					)}
				</div>

				{/* Input Form */}
				<form
					onSubmit={(e) => {
						e.preventDefault();
						if (input.trim()) {
							sendMessage({ text: input });
							setInput("");
						}
					}}
					className="flex space-x-2"
				>
					<Input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						disabled={status !== "ready"}
						placeholder="Type your message..."
						className="flex-1"
					/>
					<Button
						type="submit"
						disabled={status !== "ready" || !input.trim()}
						className="px-6"
					>
						Send
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}

export default function ChatProvider() {
	const { openai } = useEchoModelProviders();
	const { token } = useEcho();
	const chatFn = async ({
		modelMessages,
		abortSignal,
	}: {
		modelMessages: ModelMessage[];
		abortSignal: AbortSignal | undefined;
	}) => {
		const result = streamText({
			model: await openai("gpt-4o"),
			messages: modelMessages,
			abortSignal,
		});
		return result.toUIMessageStream();
	};
	return (
		<EchoChatProvider chatFn={chatFn} key={token}>
			<Chat />
		</EchoChatProvider>
	);
}
