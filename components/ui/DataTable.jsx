"use client";
import { useRouter } from "next/navigation";

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { FilePenLine, Trash2, OctagonAlert } from "lucide-react";

export default function DataTable({ basePath, headers, data }) {
	const router = useRouter();

	const getValue = (obj, key) => {
		return key.split(".").reduce((o, k) => (o ? o[k] : null), obj);
	};

	if (data.length === 0) {
		return (
			<div className="flex gap-2 items-center ">
				<OctagonAlert size={20} />
				<p>No hay datos para mostrar</p>
			</div>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow className="border-b-2 border-gray-300 ">
					{headers.map((header, index) => (
						<TableHead key={index} className={header.className}>
							{header.label}
						</TableHead>
					))}
				</TableRow>
			</TableHeader>
			<TableBody>
				{data?.map((row, index) => (
					<TableRow
						key={index}
						className="border-b border-gray-300 hover:bg-gray-100 cursor-pointer"
						onClick={() => router.push(`${basePath}?edit=true&id=${row.id}`)}
					>
						{headers.map((header, index) =>
							header.key === "actions" ? (
								<TableCell className={header.className} key={index}>
									<div
										className="icon-action-btn  text-blue-500"
										onClick={() => router.push(`${basePath}?edit=true&id=${row.id}`)}
									>
										<FilePenLine size={16} />
									</div>

									<div className="icon-action-btn text-red-500">
										<Trash2 size={16} />
									</div>
								</TableCell>
							) : (
								<TableCell className={header.className} key={index}>
									{getValue(row, header.key)}
								</TableCell>
							)
						)}
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
