"use client";
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "./table";
import { cn } from "@/lib/utils";
import DataGridRowActions from "./DataGridRowActions";
import DataGridCell from "./DataGridCell";
import PaginationComponent from "./PaginationComponent";

const Skeleton = ({ className }) => <div className={cn("animate-pulse bg-gray-200 rounded-lg", className)} />;

const BaseDataGrid = ({
	columns,
	data,
	isLoading,
	onRowClick,
	onEdit,
	onDelete,
	showActions = true,
	children,
	className,
	user,
	onUpdate,
	onReschedule,
	pagination = false,
	currentPage = 1,
	totalPages = 1,
	onPageChange,
}) => {
	return (
		<div className={cn("flex flex-col gap-3 w-full", className)}>
			{children}
			<div className="relative min-h-[200px] w-full">
				<div className="w-full overflow-x-auto rounded-lg border">
					<div className="min-w-full inline-block align-middle">
						<Table>
							<TableHeader className="bg-gray-100">
								<TableRow>
									{columns.map((col) => (
										<TableHead
											className={cn(
												"whitespace-nowrap",
												col.type === "button" ? "text-center" : "",
												col.hideOnMobile && "hidden lg:table-cell",
												col.className
											)}
											key={col.accessor}
										>
											{col.header}
										</TableHead>
									))}
									{showActions && <TableHead className="w-[50px]"></TableHead>}
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoading ? (
									// Skeleton loading rows
									[...Array(5)].map((_, rowIndex) => (
										<TableRow key={`skeleton-${rowIndex}`} className="cursor-default">
											{columns.map((col) => (
												<TableCell
													key={`skeleton-${rowIndex}-${col.accessor}`}
													className={cn(
														"whitespace-nowrap py-4",
														col.type === "button" ? "text-center" : "",
														col.hideOnMobile && "hidden lg:table-cell",
														col.className
													)}
												>
													<Skeleton className="h-4 w-3/4" />
												</TableCell>
											))}
											{showActions && <TableCell className="w-[50px]"></TableCell>}
										</TableRow>
									))
								) : data.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={columns.length + (showActions ? 1 : 0)}
											className="text-center"
										>
											<div className="text-center text-gray-400 flex flex-col gap-2 items-center py-4 max-w-96 self-center">
												<p className="text-sm">No hay datos para mostrar</p>
											</div>
										</TableCell>
									</TableRow>
								) : (
									data.map((item) => (
										<TableRow
											className="cursor-pointer hover:bg-indigo-100 transition-colors"
											key={item.id}
											onClick={() => onRowClick?.(item.id)}
										>
											{columns.map((col) => {
												const value = col.accessor
													.split(".")
													.reduce((o, i) => (o ? o[i] : ""), item);
												return (
													<TableCell
														key={col.accessor}
														className={cn(
															"whitespace-nowrap",
															col.type === "button" ? "text-center" : "",
															col.hideOnMobile && "hidden lg:table-cell",
															col.className
														)}
													>
														<DataGridCell
															column={col}
															value={value}
															item={item}
															user={user}
															onUpdate={onUpdate}
															onReschedule={onReschedule}
														/>
													</TableCell>
												);
											})}
											{showActions && (
												<TableCell
													className="whitespace-nowrap"
													onClick={(e) => e.stopPropagation()}
												>
													<DataGridRowActions
														onEdit={() => onEdit?.(item.id)}
														onDelete={() => onDelete?.(item.id)}
														showDelete={user?.accountType !== "EXTERNAL"}
														editLabel={
															user?.accountType === "EXTERNAL" ? "Ver/Comentar" : "Editar"
														}
													/>
												</TableCell>
											)}
										</TableRow>
									))
								)}
							</TableBody>
							{pagination && !isLoading && data.length > 0 && (
								<TableFooter className="bg-gray-100">
									<TableRow>
										<TableCell
											className="text-right"
											colSpan={columns.length + (showActions ? 1 : 0)}
										>
											<PaginationComponent
												currentPage={currentPage}
												totalPages={totalPages}
												onPageChange={onPageChange}
											/>
										</TableCell>
									</TableRow>
								</TableFooter>
							)}
						</Table>
					</div>
				</div>
			</div>
		</div>
	);
};

export default React.memo(BaseDataGrid);
