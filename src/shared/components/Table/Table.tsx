import { useState, type ReactNode } from "react";
import { Text, TextSize, TextWeight } from "../Text/index.ts";
import "./Table.css";

export type TableColumn<T> = {
  id: string;
  header: string;
  /** Ancho fijo (ej. `180px`) o automático (`auto`) para la columna. */
  width?: string;
  render: (item: T) => ReactNode;
};

type TableProps<T> = {
  columns: TableColumn<T>[];
  data: T[];
  getRowId: (item: T) => string;
  minWidth?: number;
  onRowClick?: (item: T) => void;
  renderExpandedRow?: (item: T) => ReactNode;
};

export function Table<T>({
  columns,
  data,
  getRowId,
  minWidth = 900,
  onRowClick,
  renderExpandedRow,
}: TableProps<T>) {
  const [expandedRowKey, setExpandedRowKey] = useState<string | null>(null);
  const canExpandRows = Boolean(renderExpandedRow);
  const isRowInteractive = canExpandRows || Boolean(onRowClick);

  function toggleRow(rowKey: string) {
    setExpandedRowKey((currentRowKey) =>
      currentRowKey === rowKey ? null : rowKey,
    );
  }

  return (
    <div className="table-wrapper">
      <table className="table" style={{ minWidth }}>
        <colgroup>
          {columns.map((column) => (
            <col
              key={column.id}
              style={column.width ? { width: column.width } : undefined}
            />
          ))}
        </colgroup>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                style={column.width ? { width: column.width } : undefined}
              >
                <Text as="span" size={TextSize.Small} weight={TextWeight.Bold}>
                  {column.header}
                </Text>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => {
            const rowKey = getRowId(item);
            const isExpanded = rowKey === expandedRowKey;

            return (
              <TableRows
                key={rowKey}
                item={item}
                rowKey={rowKey}
                columns={columns}
                expandedContent={renderExpandedRow?.(item)}
                isExpanded={isExpanded}
                canExpandRows={canExpandRows}
                isRowInteractive={isRowInteractive}
                onToggle={toggleRow}
                onRowClick={onRowClick}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

type TableRowsProps<T> = {
  item: T;
  rowKey: string;
  columns: TableColumn<T>[];
  expandedContent?: ReactNode;
  isExpanded: boolean;
  canExpandRows: boolean;
  isRowInteractive: boolean;
  onToggle: (rowKey: string) => void;
  onRowClick?: (item: T) => void;
};

function TableRows<T>({
  item,
  rowKey,
  columns,
  expandedContent,
  isExpanded,
  canExpandRows,
  isRowInteractive,
  onToggle,
  onRowClick,
}: TableRowsProps<T>) {
  function handleRowClick() {
    if (canExpandRows) {
      onToggle(rowKey);
    }

    onRowClick?.(item);
  }

  return (
    <>
      <tr
        className={`table__data-row${isRowInteractive ? " table__data-row--actionable" : ""}${isExpanded ? " table__data-row--expanded" : ""}`}
        onClick={isRowInteractive ? handleRowClick : undefined}
        onKeyDown={
          isRowInteractive
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleRowClick();
                }
              }
            : undefined
        }
        tabIndex={isRowInteractive ? 0 : undefined}
        aria-expanded={canExpandRows ? isExpanded : undefined}
      >
        {columns.map((column) => (
          <td key={column.id}>{column.render(item)}</td>
        ))}
      </tr>
      {isExpanded && (
        <tr className="table__actions-row">
          <td className="table__actions-cell" colSpan={columns.length}>
            <div className="table__actions-content">{expandedContent}</div>
          </td>
        </tr>
      )}
    </>
  );
}
