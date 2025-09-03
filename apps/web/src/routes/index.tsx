import { createFileRoute } from "@tanstack/react-router";
import ChatProvider from "@/components/chat";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	return (
		<div className="flex h-full flex-col items-center justify-start space-y-8 p-6">
			<div className="w-full max-w-2xl">
				<ChatProvider />
			</div>
		</div>
	);
}
