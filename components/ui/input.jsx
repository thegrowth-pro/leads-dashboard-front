import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type, size, label, ...props }, ref) => {
	return (
		<div className="flex flex-col flex-1 justify-start gap-1 w-full">
			{label && (
				<label
					className={cn("text-sm font-medium text-muted-foreground", size === "sm" ? "text-xs" : "text-sm")}
				>
					{label}
				</label>
			)}

			<input
				type={type}
				className={cn(
					"rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
					size === "sm" ? "h-7 md:text-xs placeholder:text-xs" : "h-9 md:text-sm placeholder:text-sm",
					className
				)}
				ref={ref}
				{...props}
			/>
		</div>
	);
});
Input.displayName = "Input";

export { Input };
