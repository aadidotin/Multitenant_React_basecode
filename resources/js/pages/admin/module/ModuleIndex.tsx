import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import {
    PlusCircle,
    Search,
    Pencil,
    Trash2,
    Eye,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/AppLayout';
import type { PaginatedData } from '@/types/pagination';
import {
    index as ModuleIndex,
    show as ModuleShow,
    create as ModuleCreate,
    edit as ModuleEdit,
    destroy as ModuleDestroy,
} from '@/routes/central/modules';

interface Module {
    id: number;
    name: string;
    slug: string;
    group: string | null;
    icon: string | null;
    is_active: boolean;
    sort_order: number;
    actions_count: number;
}

interface Props {
    modules: PaginatedData<Module>;
    groups: string[];
    filters: { search?: string; group?: string };
}

function ModulesIndex({ modules, groups, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [deleteTarget, setDeleteTarget] = useState<Module | null>(null);

    const applyFilters = (overrides: Record<string, string | undefined>) => {
        router.get(
            ModuleIndex.url(),
            // route('admin.modules.index'),
            { search, group: filters.group, ...overrides },
            { preserveState: true, replace: true },
        );
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        // router.delete(route('admin.modules.destroy', deleteTarget.id), {
        router.delete(ModuleDestroy.url(deleteTarget.id), {
            onSuccess: () => toast(`"${deleteTarget.name}" deleted.`),
            onFinish: () => setDeleteTarget(null),
        });
    };

    const columns: ColumnDef<Module>[] = [
        {
            accessorKey: 'name',
            header: 'Module',
            cell: ({ row }: { row: any }) => (
                <div className="flex items-center gap-2">
                    <span className="font-medium">{row.original.name}</span>
                    {row.original.group && (
                        <Badge variant="outline" className="text-xs">
                            {row.original.group}
                        </Badge>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'slug',
            header: 'Slug',
            cell: ({ getValue }: { getValue: () => unknown }) => (
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                    {getValue() as string}
                </code>
            ),
        },
        {
            accessorKey: 'actions_count',
            header: 'Actions',
            cell: ({ getValue }) => (
                <Badge variant="secondary">
                    {getValue() as number} actions
                </Badge>
            ),
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ getValue }) =>
                getValue() ? (
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600">
                        <CheckCircle className="h-4 w-4" /> Active
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                        <XCircle className="h-4 w-4" /> Inactive
                    </span>
                ),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" asChild>
                        <Link
                            // href={route('admin.modules.show', row.original.id)}
                            href={ModuleShow.url(row.original.id)}
                        >
                            <Eye className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={ModuleEdit.url(row.original.id)}>
                            <Pencil className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(row.original)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    const table = useReactTable({
        data: modules.data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <>
            <Head title="Modules" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Modules
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage system modules and their allowed actions.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={ModuleCreate.url()}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Module
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex gap-3">
                    <div className="relative max-w-sm flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search modules…"
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === 'Enter' && applyFilters({ search })
                            }
                        />
                    </div>
                    <Select
                        value={filters.group ?? 'all'}
                        onValueChange={(v) =>
                            applyFilters({ group: v === 'all' ? undefined : v })
                        }
                    >
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder="All groups" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All groups</SelectItem>
                            {groups.map((g) => (
                                <SelectItem key={g} value={g}>
                                    {g}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((hg) => (
                                <TableRow key={hg.id}>
                                    {hg.headers.map((h) => (
                                        <TableHead key={h.id}>
                                            {flexRender(
                                                h.column.columnDef.header,
                                                h.getContext(),
                                            )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        No modules found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        Showing {modules.from}–{modules.to} of {modules.total}
                    </span>
                    <div className="flex gap-2">
                        {modules.links.map((link, i) => (
                            <Button
                                key={i}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation */}
            <AlertDialog
                open={!!deleteTarget}
                onOpenChange={() => setDeleteTarget(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete "{deleteTarget?.name}"?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will soft-delete the module and its actions.
                            This action can be undone from the database if
                            needed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
                            onClick={handleDelete}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

ModulesIndex.layout = (page: React.ReactNode) => <AppLayout children={page} />;

export default ModulesIndex;
