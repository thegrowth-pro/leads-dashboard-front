import * as React from "react";
import { Send } from "lucide-react"; // Puedes reemplazar "Send" por cualquier otro ícono de Lucide
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef(({ className, send, ...props }, ref) => {
	return (
		<div className="relative">
			<input
				ref={ref}
				{...props}
				className={cn(
					// Nota que agregamos un padding-right extra (pr-10) para que el texto no quede debajo del botón
					"w-full rounded-md border border-input bg-transparent px-3 py-2 pr-10 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none",
					className
				)}
				style={{
					display: "flex",
					flexDirection: "column-reverse",
				}}
			/>
			<button
				type="button"
				className="absolute bottom-2 right-2 rounded-sm flex items-center justify-center p-1  text-primary hover:text-primary/80"
			>
				<Send className="h-4 w-4" onClick={send} />
			</button>
		</div>
	);
});

Textarea.displayName = "Textarea";

export { Textarea };
