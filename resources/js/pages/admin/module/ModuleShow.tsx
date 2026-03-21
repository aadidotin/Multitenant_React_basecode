// resources/js/Pages/Admin/Modules/Show.tsx
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ChevronLeft,
    Plus,
    Pencil,
    Trash2,
    Save,
    X,
    Loader2,
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
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/AppLayout';
import { index as ModuleIndex, edit as ModuleEdit } from '@/routes/central/modules';
import {
    store as ModuleActionStore,
    update as ModuleActionUpdate,
    destroy as ModuleActionDestroy,
} from '@/routes/central/modules/actions';

interface Action {
    id: number;
    name: string;
    key: string;
    description: string | null;
    is_active: boolean;
    sort_order: number;
}

interface Module {
    id: number;
    name: string;
    slug: string;
    group: string | null;
    is_active: boolean;
    actions: Action[];
}

interface Props {
    module: Module;
}

// ── Inline row form ────────────────────────────────────────────────────────────
function ActionRow({ module, action }: { module: Module; action: Action }) {
    const [editing, setEditing] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const { data, setData, put, processing } = useForm({
        name: action.name,
        key: action.key,
        description: action.description ?? '',
        is_active: action.is_active,
        sort_order: action.sort_order,
    });

    const save = () => {
        put(ModuleActionUpdate.url({ module: module.id, action: action.id }), {
            onSuccess: () => {
                setEditing(false);
                toast('Action updated.');
            },
        });
    };

    const destroy = () => {
        router.delete(
            ModuleActionDestroy.url({ module: module.id, action: action.id }),
            {
                onSuccess: () => toast('Action deleted.'),
            },
        );
    };

    if (editing) {
        return (
            <TableRow className="bg-muted/40">
                <TableCell>
                    <Input
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="h-8"
                    />
                </TableCell>
                <TableCell>
                    <Input
                        value={data.key}
                        onChange={(e) => setData('key', e.target.value)}
                        className="h-8 font-mono text-sm"
                    />
                </TableCell>
                <TableCell>
                    <Input
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        className="h-8"
                    />
                </TableCell>
                <TableCell>
                    <Switch
                        checked={data.is_active}
                        onCheckedChange={(v) => setData('is_active', v)}
                    />
                </TableCell>
                <TableCell>
                    <div className="flex gap-1">
                        <Button
                            size="icon"
                            variant="default"
                            className="h-7 w-7"
                            onClick={save}
                            disabled={processing}
                        >
                            {processing ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                <Save className="h-3 w-3" />
                            )}
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => setEditing(false)}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                </TableCell>
            </TableRow>
        );
    }

    return (
        <>
            <TableRow>
                <TableCell className="font-medium">{action.name}</TableCell>
                <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                        {action.key}
                    </code>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                    {action.description ?? '—'}
                </TableCell>
                <TableCell>
                    {action.is_active ? (
                        <Badge
                            variant="outline"
                            className="border-emerald-300 text-emerald-600"
                        >
                            Active
                        </Badge>
                    ) : (
                        <Badge
                            variant="outline"
                            className="text-muted-foreground"
                        >
                            Inactive
                        </Badge>
                    )}
                </TableCell>
                <TableCell>
                    <div className="flex gap-1">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => setEditing(true)}
                        >
                            <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive"
                            onClick={() => setDeleteOpen(true)}
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                </TableCell>
            </TableRow>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete "{action.name}"?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will be removed from all subscription
                            packages.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="text-destructive-foreground bg-destructive"
                            onClick={destroy}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

// ── Add action row ─────────────────────────────────────────────────────────────
function AddActionRow({ module }: { module: Module }) {
    const [open, setOpen] = useState(false);
    const { data, setData, post, reset, processing } = useForm({
        name: '',
        key: '',
        description: '',
        is_active: true,
        sort_order: 0,
    });

    const autoKey = (name: string) =>
        name
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '');

    const save = () => {
        post(ModuleActionStore.url({ module: module.id }), {
            onSuccess: () => {
                reset();
                setOpen(false);
                toast('Action added.');
            },
        });
    };

    if (!open) {
        return (
            <TableRow>
                <TableCell colSpan={5}>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpen(true)}
                    >
                        <Plus className="mr-1 h-4 w-4" /> Add Action
                    </Button>
                </TableCell>
            </TableRow>
        );
    }

    return (
        <TableRow className="bg-primary/5">
            <TableCell>
                <Input
                    placeholder="Name"
                    value={data.name}
                    onChange={(e) => {
                        setData('name', e.target.value);
                        setData('key', autoKey(e.target.value));
                    }}
                    className="h-8"
                />
            </TableCell>
            <TableCell>
                <Input
                    placeholder="key"
                    value={data.key}
                    onChange={(e) => setData('key', e.target.value)}
                    className="h-8 font-mono text-sm"
                />
            </TableCell>
            <TableCell>
                <Input
                    placeholder="Description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    className="h-8"
                />
            </TableCell>
            <TableCell>
                <Switch
                    checked={data.is_active}
                    onCheckedChange={(v) => setData('is_active', v)}
                />
            </TableCell>
            <TableCell>
                <div className="flex gap-1">
                    <Button
                        size="icon"
                        className="h-7 w-7"
                        onClick={save}
                        disabled={processing}
                    >
                        {processing ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                            <Save className="h-3 w-3" />
                        )}
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => {
                            reset();
                            setOpen(false);
                        }}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────────
function ModuleShow({ module }: Props) {
    return (
        <>
            <Head title={module.name} />

            <div className="max-w-3xl space-y-6">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={ModuleIndex.url()}>
                        <ChevronLeft className="mr-1 h-4 w-4" /> Back
                    </Link>
                </Button>

                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {module.name}
                        </h1>
                        <div className="mt-1 flex items-center gap-2">
                            <code className="font-mono text-xs text-muted-foreground">
                                {module.slug}
                            </code>
                            {module.group && (
                                <Badge variant="outline">{module.group}</Badge>
                            )}
                            {module.is_active ? (
                                <Badge className="border-emerald-200 bg-emerald-100 text-emerald-700">
                                    Active
                                </Badge>
                            ) : (
                                <Badge variant="secondary">Inactive</Badge>
                            )}
                        </div>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link href={ModuleEdit.url(module.id)}>
                            <Pencil className="mr-1 h-4 w-4" /> Edit Module
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Actions</CardTitle>
                        <CardDescription>
                            Actions define what operations are possible on this
                            module. They are assigned per subscription package.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Key</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {module.actions.map((action) => (
                                    <ActionRow
                                        key={action.id}
                                        module={module}
                                        action={action}
                                    />
                                ))}
                                <AddActionRow module={module} />
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ModuleShow.layout = (page: React.ReactNode) => <AppLayout children={page} />;

export default ModuleShow;
