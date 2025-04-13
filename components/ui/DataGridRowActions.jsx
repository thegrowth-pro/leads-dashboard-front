"use client";
import React from "react";
import { Button } from "./button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu";
import { Edit, Trash2, CircleAlert, EllipsisVertical } from "lucide-react";

const DataGridRowActions = ({
	onEdit,
	onDelete,
	showEdit = true,
	showDelete = true,
	editLabel = "Ver/Editar",
	deleteLabel = "Eliminar",
}) => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="h-8 w-8 p-0 hover:bg-indigo-200 transition-all duration-300 hover:text-indigo-600 hover:scale-110"
				>
					<EllipsisVertical className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{showEdit && (
					<DropdownMenuItem onClick={onEdit}>
						<Edit className="mr-2 h-4 w-4" />
						{editLabel}
					</DropdownMenuItem>
				)}
				{showDelete && (
					<DropdownMenuItem onClick={onDelete} className="text-red-600">
						<Trash2 className="mr-2 h-4 w-4" />
						{deleteLabel}
						<CircleAlert className="ml-auto h-4 w-4" />
					</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default React.memo(DataGridRowActions);
