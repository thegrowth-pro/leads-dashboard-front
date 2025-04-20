"use client";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Rocket } from "lucide-react";
import { formatNumber } from "@/lib/utils";

const columns = [
	{ header: "Nombre", accessor: "name", left: true },
	{ header: "Generadas", accessor: "total" },
	{ header: "Realizadas", accessor: "held" },
	{ header: "% Realizadas", accessor: "heldPercentage" },
	{ header: "Válidas", accessor: "validated" },
	{ header: "% Válidas (r)", accessor: "validatedPercentageR" },
	{ header: "% Válidas (b)", accessor: "validatedPercentageB" },
];

const RankingTable = ({ label, data, isLoading }) => {
	if (isLoading || !data) {
		return (
			<div className="text-center text-gray-400 flex flex-col gap-2 items-center py-4 w-full flex-1">
				<Rocket className="size-6 animate-bounce " />
				<p>Cargando...</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4 w-full flex-1">
			<h2 className="text-lg font-semibold">{label}</h2>
			{data?.length === 0 ? (
				<div className="text-center text-gray-400 flex flex-col gap-2 items-center py-4 max-w-96 self-center">
					{isLoading ? (
						<p>Cargando...</p>
					) : (
						<p className="text-sm">No se encontraron {label.toLowerCase()}, ajusta los filtros</p>
					)}
				</div>
			) : (
				<Table>
					<TableHeader className="bg-gray-100">
						<TableRow className="hover:bg-gray-100">
							<TableHead className={`text-center text-xs font-semibold`}>#</TableHead>
							{columns.map((col) => (
								<TableHead
									className={`${
										col.left ? "text-left" : "text-center"
									} text-xs font-semibold min-w-24`}
									key={col.header}
								>
									{col.header}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.map((row, rank) => (
							<TableRow key={row.id} className="hover:bg-gray-50">
								<TableCell className={`text-center`}>{rank + 1}</TableCell>

								{columns.map((col) => (
									<TableCell
										key={col.header}
										className={`${col.left ? "text-left" : "text-center"} text-xs`}
									>
										{col.accessor === "rank"
											? rank + 1
											: col.accessor === "heldPercentage"
											? `${
													row.total === 0
														? "-"
														: formatNumber((100 * row.held) / row.total) + "%"
											  }`
											: col.accessor === "validatedPercentageR"
											? `${
													row.held === 0
														? "-"
														: formatNumber((100 * row.validated) / row.held) + "%"
											  }`
											: col.accessor === "validatedPercentageB"
											? row.total === 0
												? "0%"
												: `${
														row.validated === 0
															? "-"
															: formatNumber((100 * row.validated) / row.total) + "%"
												  }`
											: row[col.accessor]}
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</div>
	);
};

export default RankingTable;
