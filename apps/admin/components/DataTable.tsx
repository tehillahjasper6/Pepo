/**
 * Data table component for admin panel
 */
interface Column {
  key: string;
  label: string;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
  width?: string;
}

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  loading?: boolean;
  pagination?: PaginationProps;
  onPageChange?: (page: number) => void;
  emptyMessage?: string;
}

export function DataTable({
  columns,
  data,
  loading,
  pagination,
  onPageChange,
  emptyMessage = 'No data available',
}: DataTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 1;
  const currentPage = pagination?.page || 1;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-3 text-left text-sm font-semibold text-gray-700 ${col.width || ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50 transition">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-sm text-gray-900">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-600">
            Showing {(currentPage - 1) * pagination.limit + 1} to{' '}
            {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total}
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => onPageChange?.(i + 1)}
                className={`px-3 py-2 rounded-lg ${
                  currentPage === i + 1
                    ? 'bg-primary-500 text-white'
                    : 'border hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
