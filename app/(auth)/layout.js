export default function RootLayout({ children }) {
	return (
		<div className="flex h-screen w-full">
			<main className="flex flex-col flex-1 overflow-auto  bg-background">
				{children}
			</main>
		</div>
	);
}
