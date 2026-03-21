import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/AppLayout';
import {
    index as ModuleIndex,
    store as ModuleStore,
    update as ModuleUpdate,
} from '@/routes/central/modules';

interface Module {
    id?: number;
    name: string;
    slug: string;
    description: string;
    icon: string;
    group: string;
    is_active: boolean;
    sort_order: number;
}

interface Props {
    module?: Module;
}

function ModuleForm({ module }: Props) {
    const isEditing = !!module;

    const { data, setData, post, put, processing, errors } = useForm({
        name: module?.name ?? '',
        slug: module?.slug ?? '',
        description: module?.description ?? '',
        icon: module?.icon ?? '',
        group: module?.group ?? '',
        is_active: module?.is_active ?? true,
        sort_order: module?.sort_order ?? 0,
        seed_default_actions: !isEditing,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing && module?.id) {
            put(ModuleUpdate.url(module.id));
        } else {
            post(ModuleStore.url());
        }
    };

    const autoSlug = (name: string) =>
        name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');

    return (
        <>
            <Head title={isEditing ? 'Edit Module' : 'New Module'} />

            <div className="max-w-2xl space-y-6">
                {/* Back */}
                <Button variant="ghost" size="sm" asChild>
                    <Link href={ModuleIndex.url()}>
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Back to Modules
                    </Link>
                </Button>

                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {isEditing ? `Edit "${module!.name}"` : 'Create Module'}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {isEditing
                            ? 'Update module details and its available actions.'
                            : 'A new module with default CRUD actions will be created.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Module Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => {
                                        setData('name', e.target.value);
                                        if (!isEditing) {
                                            setData(
                                                'slug',
                                                autoSlug(e.target.value),
                                            );
                                        }
                                    }}
                                    placeholder="e.g. Contacts"
                                />
                                {errors.name && (
                                    <p className="text-xs text-destructive">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Slug */}
                            <div className="space-y-1.5">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    value={data.slug}
                                    onChange={(e) =>
                                        setData('slug', e.target.value)
                                    }
                                    placeholder="auto-generated"
                                    className="font-mono text-sm"
                                />
                                {errors.slug && (
                                    <p className="text-xs text-destructive">
                                        {errors.slug}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Group */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="group">Group</Label>
                                    <Input
                                        id="group"
                                        value={data.group}
                                        onChange={(e) =>
                                            setData('group', e.target.value)
                                        }
                                        placeholder="e.g. CRM, Billing"
                                    />
                                </div>

                                {/* Icon */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="icon">
                                        Icon (Lucide name)
                                    </Label>
                                    <Input
                                        id="icon"
                                        value={data.icon}
                                        onChange={(e) =>
                                            setData('icon', e.target.value)
                                        }
                                        placeholder="e.g. Users"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    rows={3}
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    placeholder="What does this module do?"
                                />
                            </div>

                            {/* Sort order */}
                            <div className="w-32 space-y-1.5">
                                <Label htmlFor="sort_order">Sort Order</Label>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    min={0}
                                    value={data.sort_order}
                                    onChange={(e) =>
                                        setData(
                                            'sort_order',
                                            Number(e.target.value),
                                        )
                                    }
                                />
                            </div>

                            <Separator />

                            {/* Active toggle */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">
                                        Active
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Inactive modules are hidden from package
                                        assignment.
                                    </p>
                                </div>
                                <Switch
                                    checked={data.is_active}
                                    onCheckedChange={(v) =>
                                        setData('is_active', v)
                                    }
                                />
                            </div>

                            {/* Seed actions (create only) */}
                            {!isEditing && (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">
                                            Seed default CRUD actions
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Automatically adds Create, Read,
                                            Update, Delete, Export.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={data.seed_default_actions}
                                        onCheckedChange={(v) =>
                                            setData('seed_default_actions', v)
                                        }
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {isEditing ? 'Save Changes' : 'Create Module'}
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={ModuleIndex.url()}>Cancel</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

ModuleForm.layout = (page: React.ReactNode) => <AppLayout children={page} />;

export default ModuleForm;
