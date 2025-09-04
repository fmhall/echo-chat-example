import {
	EchoChatProvider,
	useChat,
	useEchoModelProviders,
} from "@merit-systems/echo-react-sdk";
import { type ModelMessage, streamText } from "ai";
import { useState } from "react";
import ASCIIText from "@/components/ASCIIText";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
	Conversation,
	ConversationContent,
	ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
	Message,
	MessageContent,
	MessageAvatar,
} from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import {
	PromptInput,
	PromptInputTextarea,
	PromptInputToolbar,
	PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Loader } from "@/components/ai-elements/loader";
import { Suggestions, Suggestion } from "@/components/ai-elements/suggestion";
import { Actions, Action } from "@/components/ai-elements/actions";
import { CopyIcon, ThumbsUpIcon, ThumbsDownIcon } from "lucide-react";

export function Chat() {
	const { messages, sendMessage, status, stop } = useChat();
	const [input, setInput] = useState("");

	return (
		<Card className="flex h-[500px] w-full flex-col">
			<CardContent className="flex flex-1 flex-col p-0">
				{/* Messages Container */}
				<Conversation className="flex-1">
					<ConversationContent>
						{messages.length === 0 ? (
							<div className="flex flex-col items-center justify-center space-y-6 p-8">
								<div className="relative aspect-video w-full max-w-4xl">
									<ASCIIText
										text="Echo"
										textFontSize={100}
										textColor="red"
										planeBaseHeight={12}
									/>
								</div>
								<div className="w-full max-w-2xl">
									<h3 className="text-lg font-semibold text-center mb-4">
										How can I help you today?
									</h3>
									<Suggestions>
										<Suggestion
											suggestion="What is Echo?"
											onClick={(suggestion) => {
												setInput(suggestion);
											}}
										>
											What is Echo?
										</Suggestion>
										<Suggestion
											suggestion="Tell me a joke"
											onClick={(suggestion) => {
												setInput(suggestion);
											}}
										>
											Tell me a joke
										</Suggestion>
										<Suggestion
											suggestion="Help me with coding"
											onClick={(suggestion) => {
												setInput(suggestion);
											}}
										>
											Help me with coding
										</Suggestion>
										<Suggestion
											suggestion="Explain AI concepts"
											onClick={(suggestion) => {
												setInput(suggestion);
											}}
										>
											Explain AI concepts
										</Suggestion>
									</Suggestions>
								</div>
							</div>
						) : (
							messages.map((message) => (
								<Message key={message.id} from={message.role}>
									<MessageAvatar
										src={message.role === "user" ? "" : ""}
										name={message.role === "user" ? "You" : "Echo"}
									/>
									<MessageContent>
										<Response>
											{message.parts
												.filter((part) => part.type === "text")
												.map((part) => part.text)
												.join("")}
										</Response>
										{message.role === "assistant" && (
											<Actions className="mt-2">
												<Action
													tooltip="Copy message"
													onClick={() => {
														const text = message.parts
															.filter((part) => part.type === "text")
															.map((part) => part.text)
															.join("");
														navigator.clipboard.writeText(text);
													}}
												>
													<CopyIcon className="h-4 w-4" />
												</Action>
												<Action
													tooltip="Good response"
													onClick={() => {
														console.log("Thumbs up for message:", message.id);
													}}
												>
													<ThumbsUpIcon className="h-4 w-4" />
												</Action>
												<Action
													tooltip="Poor response"
													onClick={() => {
														console.log("Thumbs down for message:", message.id);
													}}
												>
													<ThumbsDownIcon className="h-4 w-4" />
												</Action>
											</Actions>
										)}
									</MessageContent>
								</Message>
							))
						)}

						{/* Loading indicator */}
						{(status === "submitted" || status === "streaming") && (
							<Message from="assistant">
								<MessageAvatar src="" name="Echo" />
								<MessageContent>
									<div className="flex items-center space-x-2 text-muted-foreground">
										<Loader size={16} />
										<span className="text-sm">Echo is thinking...</span>
									</div>
								</MessageContent>
							</Message>
						)}
					</ConversationContent>
					<ConversationScrollButton />
				</Conversation>

				{/* Input Form */}
				<PromptInput
					onSubmit={(e) => {
						e.preventDefault();
						if (input.trim()) {
							sendMessage({ text: input });
							setInput("");
						}
					}}
					className="m-4"
				>
					<PromptInputTextarea
						value={input}
						onChange={(e) => setInput(e.target.value)}
						disabled={status !== "ready"}
						placeholder="Type your message..."
					/>
					<PromptInputToolbar>
						<PromptInputSubmit
							status={status}
							disabled={status !== "ready" || !input.trim()}
							onClick={status === "streaming" ? stop : undefined}
						/>
					</PromptInputToolbar>
				</PromptInput>
			</CardContent>
		</Card>
	);
}

export default function ChatProvider() {
	const { openai } = useEchoModelProviders();

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
		<EchoChatProvider chatFn={chatFn}>
			<Chat />
		</EchoChatProvider>
	);
}
