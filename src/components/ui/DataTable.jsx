import { useEffect, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import EmptyState from './EmptyState'

export default function DataTable({
  columns,
  data,
  sorting,
  onSortingChange,
  onRowClick,
  pageSize = 12,
  emptyTitle,
  emptyCopy,
  selectedRowId,
}) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize,
  })

  useEffect(() => {
    setPagination((current) => ({
      ...current,
      pageIndex: 0,
    }))
  }, [data.length])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const rows = table.getRowModel().rows

  if (!data.length) {
    return (
      <EmptyState
        copy={emptyCopy}
        title={emptyTitle}
      />
    )
  }

  return (
    <div className="data-table-shell">
      <div className="data-table-scroll">
        <table className="data-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sortDirection = header.column.getIsSorted()

                  return (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          className="table-sort-button"
                          onClick={header.column.getToggleSortingHandler()}
                          type="button"
                        >
                          <span>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                          </span>
                          <span className="table-sort-indicator">
                            {sortDirection === 'asc'
                              ? '↑'
                              : sortDirection === 'desc'
                                ? '↓'
                                : '↕'}
                          </span>
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr
                aria-selected={row.original.id === selectedRowId}
                className={`data-table-row ${
                  onRowClick ? 'is-clickable' : ''
                } ${
                  row.original.id === selectedRowId ? 'is-selected' : ''
                }`}
                key={row.id}
                onKeyDown={
                  onRowClick
                    ? (event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        onRowClick(row.original)
                      }
                    }
                    : undefined
                }
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-pagination">
        <span>
          Showing{' '}
          <strong>
            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
          </strong>
          {' '}to{' '}
          <strong>
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              data.length,
            )}
          </strong>
          {' '}of{' '}
          <strong>{data.length}</strong>
        </span>

        <div className="table-pagination-actions">
          <button
            className="ghost-button button-small"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            type="button"
          >
            Previous
          </button>
          <button
            className="ghost-button button-small"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            type="button"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
