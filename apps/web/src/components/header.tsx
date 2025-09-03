import {
	EchoSignIn,
	EchoTokenPurchase,
	Logo,
	useEcho,
} from "@merit-systems/echo-react-sdk";
import { Link } from "@tanstack/react-router";
import { useTheme } from "next-themes";
import { ModeToggle } from "./mode-toggle";

export default function Header() {
	const links = [{ to: "/", label: "Echo" }] as const;

	const { theme } = useTheme();
	const { isAuthenticated } = useEcho();

	console.log(theme);

	return (
		<div>
			<div className="flex flex-row items-center justify-between px-2 py-1">
				<nav className="flex gap-4 text-lg">
					{links.map(({ to, label }) => {
						return (
							<Link key={to} to={to}>
								<div className="flex items-center gap-2">
									<Logo
										width={24}
										height={24}
										variant={theme as "light" | "dark"}
									/>
									{label}
								</div>
							</Link>
						);
					})}
				</nav>
				<div className="flex items-center gap-2">
					{!isAuthenticated && <EchoSignIn />}
					{isAuthenticated && <EchoTokenPurchase />}
					<ModeToggle />
				</div>
			</div>
			<hr />
		</div>
	);
}
