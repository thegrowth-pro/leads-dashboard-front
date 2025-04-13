"use client";

import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";

export default function PaginationComponent({ currentPage, totalPages, onPageChange }) {
	// Helper function to generate page numbers dynamically with ellipses
	const generatePageNumbers = () => {
		const pages = [];

		if (totalPages > 1) {
			if (currentPage > 1) {
				pages.push(1); // Always show the first page
			}
			if (currentPage > 2) {
				pages.push("..."); // Ellipsis before the current page if needed
			}
			pages.push(currentPage); // Show the current page
			if (currentPage < totalPages - 1) {
				pages.push("..."); // Ellipsis after the current page if needed
			}
			if (totalPages > 1 && currentPage !== totalPages) {
				pages.push(totalPages); // Always show the last page
			}
		}

		return pages;
	};

	const handlePageChange = (page) => {
		if (page >= 1 && page <= totalPages) {
			onPageChange(page);
		}
	};

	const pages = generatePageNumbers();

	return (
		<Pagination className="flex justify-end">
			<PaginationContent>
				<PaginationItem>
					<PaginationPrevious
						// href="#"
						disabled={currentPage === 1}
						className="disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
						onClick={(e) => {
							e.preventDefault();
							handlePageChange(currentPage - 1);
						}}
					/>
				</PaginationItem>

				{pages.map((page, index) => (
					<PaginationItem key={index}>
						{typeof page === "number" ? (
							<PaginationLink
								// href="#"
								className="disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
								isActive={page === currentPage}
								onClick={(e) => {
									e.preventDefault();
									handlePageChange(page);
								}}
							>
								{page}
							</PaginationLink>
						) : (
							<PaginationEllipsis />
						)}
					</PaginationItem>
				))}

				<PaginationItem>
					<PaginationNext
						// href="#"
						className="disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
						disabled={currentPage === totalPages}
						onClick={(e) => {
							e.preventDefault();
							handlePageChange(currentPage + 1);
						}}
					/>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
}
