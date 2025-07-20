import { getSession } from "@/lib/session";

const userTypes = {
	ADMIN: "Administrador",
	EXTERNAL: "Cliente",
	INTERNAL: "Empleado",
};

export default async function TopBarUser() {
	const session = await getSession();
	return (
		<div className={`flex items-center gap-2 p-2 text-sidebar-foreground`}>
			<div className={`xxs:hidden sm:flex flex-col items-end`}>
				<p className="text-foreground text-sm font-semibold text-right">
					{session?.email ? session.email : "John Doe"}
				</p>
				<p className="text-foreground text-sm text-right">
					{session?.isAdmin
						? "Administrador"
						: session?.accountType === "EXTERNAL"
						? `${session?.company ? `Vendedor - ${session.company}` : session?.name}`
						: session?.accountType === "INTERNAL"
						? `${session?.pod ? `${session.role} - ${session.pod}` : session?.role}`
						: null}
				</p>
			</div>
			<div className="flex items-center justify-center gap-2 rounded-full w-10 h-10 bg-primary text-white">
				{session?.name
					? session.name
							.trim()
							.split(" ")
							.map((n) => n[0].toUpperCase())
							.join("")
					: session?.email 
						? session.email[0].toUpperCase()
						: "?"}
			</div>
		</div>
	);
}
