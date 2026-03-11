import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import type { Client } from "@/types/database";
import { ExternalLink, User } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface ClientsTableProps {
  clients: Client[];
  isLoading?: boolean;
  /** 全体のクライアント数（0件時のメッセージ出し分け用） */
  totalCount?: number;
  onAddClick?: () => void;
}

export function ClientsTable({
  clients,
  isLoading,
  totalCount = 0,
  onAddClick,
}: ClientsTableProps) {
  const columns = useMemo<ColumnDef<Client>[]>(
    () => [
      {
        accessorKey: "name",
        header: "名前",
        cell: ({ row }) => (
          <TableCell className="font-medium">
            {row.original.name || "（名前未設定）"}
          </TableCell>
        ),
      },
      {
        accessorKey: "company_name",
        header: "会社名",
        cell: ({ row }) => (
          <TableCell className="text-muted-foreground">
            {row.original.company_name || "—"}
          </TableCell>
        ),
      },
      {
        accessorKey: "representative",
        header: "代表者",
        cell: ({ row }) => (
          <TableCell className="text-muted-foreground">
            {row.original.representative || "—"}
          </TableCell>
        ),
      },
      {
        accessorKey: "billing_email",
        header: "メール",
        cell: ({ row }) => (
          <TableCell className="text-muted-foreground text-sm">
            {row.original.billing_email || "—"}
          </TableCell>
        ),
      },
      {
        accessorKey: "phone",
        header: "電話",
        cell: ({ row }) => (
          <TableCell className="text-muted-foreground text-sm">
            {row.original.phone || "—"}
          </TableCell>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">操作</span>,
        cell: ({ row }) => {
          const client = row.original;
          return (
            <TableCell className="w-10 px-2 py-2">
              <Link
                to={`/clients/${client.id}`}
                className="inline-flex items-center justify-center rounded p-1.5 text-primary hover:bg-muted hover:text-primary"
                title="詳細"
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
              </Link>
            </TableCell>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: clients,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="px-4 py-3">名前</TableHead>
              <TableHead className="px-4 py-3">会社名</TableHead>
              <TableHead className="px-4 py-3">代表者</TableHead>
              <TableHead className="px-4 py-3">メール</TableHead>
              <TableHead className="px-4 py-3">電話</TableHead>
              <TableHead className="w-10 px-2 py-3" aria-label="操作" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell className="px-4 py-3">
                  <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="h-5 w-20 animate-pulse rounded bg-muted" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="h-5 w-40 animate-pulse rounded bg-muted" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="h-5 w-28 animate-pulse rounded bg-muted" />
                </TableCell>
                <TableCell className="px-2 py-3" />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (clients.length === 0) {
    const hasAny = totalCount > 0;
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-16">
        <User className="h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          {hasAny
            ? "検索に一致するクライアントがありません"
            : "まだクライアントがありません"}
        </p>
        {!hasAny && onAddClick && (
          <Button className="mt-4" onClick={onAddClick}>
            最初のクライアントを追加
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-muted/50">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="px-4 py-3">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="group border-border/50 transition-colors hover:bg-muted/50"
            >
              {row.getVisibleCells().map((cell) =>
                flexRender(cell.column.columnDef.cell, cell.getContext())
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
