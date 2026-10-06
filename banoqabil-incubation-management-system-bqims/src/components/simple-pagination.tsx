"use client"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"

interface Props {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
}: Props) {
  // Generate smart page range
  const getPageNumbers = () => {
    const delta = 2 // Pages to show on each side of current page
    const range: (number | string)[] = []
    
    // Always show first page
    range.push(1)
    
    // Calculate range around current page
    const rangeStart = Math.max(2, currentPage - delta)
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta)
    
    // Add left ellipsis if needed
    if (rangeStart > 2) {
      range.push('ellipsis-left')
    }
    
    // Add middle pages
    for (let i = rangeStart; i <= rangeEnd; i++) {
      range.push(i)
    }
    
    // Add right ellipsis if needed
    if (rangeEnd < totalPages - 1) {
      range.push('ellipsis-right')
    }
    
    // Always show last page (if more than 1 page)
    if (totalPages > 1) {
      range.push(totalPages)
    }
    
    return range
  }

  const pageNumbers = getPageNumbers()

  return (
    <Pagination>
      <PaginationContent>
        {/* Previous */}
        <PaginationItem>
          <PaginationPrevious
            className={currentPage === 1 ? "pointer-events-none opacity-40 cursor-not-allowed" : "cursor-pointer"}
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          />
        </PaginationItem>

        {/* Page Numbers with Smart Ellipsis */}
        {pageNumbers.map((page) => {
          if (typeof page === 'string') {
            return (
              <PaginationItem key={page}>
                <PaginationEllipsis />
              </PaginationItem>
            )
          }
          
          return (
            <PaginationItem key={page}>
              <PaginationLink
                className={page === currentPage ? "bg-black text-white cursor-default" : "cursor-pointer"}
                isActive={page === currentPage}
                onClick={() => page !== currentPage && onPageChange(page)}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        })}

        {/* Next */}
        <PaginationItem>
          <PaginationNext
            className={
              currentPage === totalPages
                ? "pointer-events-none opacity-40 cursor-not-allowed"
                : "cursor-pointer"
            }
            onClick={() =>
              currentPage < totalPages && onPageChange(currentPage + 1)
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
} 