// src/components/ui/Table.jsx
import React from 'react';
import { cn } from '../../utils/cn';

export const Table = ({ className, ...props }) => (
  <div className="w-full overflow-auto">
    <table
      className={cn('min-w-full divide-y divide-gray-300', className)}
      {...props}
    />
  </div>
);

export const TableHeader = ({ className, ...props }) => (
  <thead className={cn('bg-gray-50', className)} {...props} />
);

export const TableBody = ({ className, ...props }) => (
  <tbody
    className={cn('divide-y divide-gray-200 bg-white', className)}
    {...props}
  />
);

export const TableFooter = ({ className, ...props }) => (
  <tfoot
    className={cn('bg-gray-50 divide-y divide-gray-200', className)}
    {...props}
  />
);

export const TableRow = ({ className, ...props }) => (
  <tr
    className={cn(
      'transition-colors hover:bg-gray-50',
      className
    )}
    {...props}
  />
);

export const TableHead = ({ className, ...props }) => (
  <th
    className={cn(
      'py-3.5 px-3 text-left text-sm font-semibold text-gray-900 first:pl-4',
      className
    )}
    {...props}
  />
);

export const TableCell = ({ className, ...props }) => (
  <td
    className={cn(
      'whitespace-nowrap py-4 px-3 text-sm text-gray-500 first:pl-4',
      className
    )}
    {...props}
  />
);

export const TableCaption = ({ className, ...props }) => (
  <caption
    className={cn('mt-4 text-sm text-gray-500', className)}
    {...props}
  />
);

export const DataTable = ({
  data = [],
  columns = [],
  onRowClick,
  emptyState,
  isLoading,
  className,
  ...props
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return emptyState;
  }

  return (
    <div className={cn('overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg', className)}>
      <Table {...props}>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead
                key={column.key || index}
                className={column.className}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.title}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow
              key={row.id || rowIndex}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={onRowClick ? 'cursor-pointer' : undefined}
            >
              {columns.map((column, colIndex) => (
                <TableCell
                  key={column.key || colIndex}
                  className={column.cellClassName}
                >
                  {column.render
                    ? column.render(row, rowIndex)
                    : row[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DataTable;