import DataPagination from '@/components/data-pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import templateRoutes from '@/routes/templates';
import { type BreadcrumbItem, type MaybePaginated } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { EditIcon, EyeIcon, PlusIcon, SearchIcon, Trash2Icon, XIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';

type Aspect = {
    id: number;
    code: number;
    latest_aspect_version: {
        name: string;
    };
};

type TemplateVersion = {
    id: number;
    name: string;
    description: string;
    version_number: number;
    aspects: Aspect[];
};

type Template = {
    id: number;
    latest_template_version: TemplateVersion;
};

type PageProps = {
    templates: MaybePaginated<Template>;
    filters?: { q?: string | null };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Template',
        href: templateRoutes.index().url,
    },
];

export default function TemplateIndex() {
    const { templates } = usePage<PageProps>().props;
    const templateList: Template[] = Array.isArray(templates) ? templates : (templates?.data ?? []);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);

    // Initialize search from URL
    const initialQ = useMemo(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            return params.get('q') ?? '';
        } catch {
            return '';
        }
    }, []);
    const [q, setQ] = useState<string>(initialQ);

    const openDeleteModal = (id: number) => {
        setTemplateToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setTemplateToDelete(null);
    };

    const handleDelete = (id: number) => {
        router.delete(templateRoutes.destroy(templateToDelete!).url, {
            onSuccess: () => {
                toast.success('Template berhasil dihapus');
            },
            onError: (errs) => {
                Object.values(errs).forEach((error) => {
                    toast.error(error as string);
                });
            },
            onFinish: () => {
                closeDeleteModal();
            },
        });
    };

    const applySearch = () => {
        const options = q ? { q } : undefined;
        router.get(templateRoutes.index(options as any).url, {}, { preserveState: true, preserveScroll: true });
    };

    const resetSearch = () => {
        setQ('');
        router.get(templateRoutes.index().url, {}, { preserveState: true, preserveScroll: true });
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="List Template" />
            <div className="py-6 md:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    <div className="space-y-6">
                        {/* Data Table */}
                        <Card className="border bg-background">
                            <CardHeader className="border-b bg-muted/30">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex w-full items-center gap-2">
                                        <Input
                                            placeholder="Cari template..."
                                            value={q}
                                            onChange={(e) => setQ(e.target.value)}
                                            className="min-w-0 flex-1"
                                        />
                                        <Button variant="secondary" onClick={applySearch} aria-label="Cari">
                                            <SearchIcon className="h-4 w-4" />
                                        </Button>
                                        {q && (
                                            <Button variant="ghost" onClick={resetSearch} aria-label="Reset filter">
                                                <XIcon className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                    <Link href={templateRoutes.create().url}>
                                        <Button variant="outline" size="sm" className="whitespace-nowrap">
                                            <PlusIcon className="mr-2 h-4 w-4" />
                                            Tambah Template
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {templateList.length === 0 ? (
                                    <div className="py-14 text-center">
                                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                                            <PlusIcon className="h-7 w-7 text-muted-foreground" />
                                        </div>
                                        <h3 className="mb-2 text-base font-medium text-foreground">Belum ada template</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Belum ada template yang terdaftar. Silakan tambahkan template baru.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <div className="min-w-[720px]">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Judul</TableHead>
                                                        <TableHead>Jumlah Aspek</TableHead>
                                                        <TableHead>Aksi</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {templateList.map((template) => (
                                                        <TableRow key={template.id}>
                                                            <TableCell className="font-medium">{template.latest_template_version.name}</TableCell>
                                                            <TableCell>{template.latest_template_version.aspects.length}</TableCell>
                                                            <TableCell>
                                                                <div className="flex flex-wrap gap-2">
                                                                    <Link href={templateRoutes.show(template.id).url}>
                                                                        <Button variant="outline" size="sm" className="whitespace-nowrap">
                                                                            <EyeIcon className="mr-1 h-4 w-4" />
                                                                            Lihat
                                                                        </Button>
                                                                    </Link>
                                                                    <Link href={templateRoutes.edit(template.id).url}>
                                                                        <Button variant="outline" size="sm" className="whitespace-nowrap">
                                                                            <EditIcon className="mr-1 h-4 w-4" />
                                                                            Edit
                                                                        </Button>
                                                                    </Link>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="whitespace-nowrap"
                                                                        onClick={() => openDeleteModal(template.id)}
                                                                    >
                                                                        <Trash2Icon className="mr-1 h-4 w-4" />
                                                                        Hapus
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                {!Array.isArray(templates) && templates?.links ? <DataPagination paginationData={templates as any} /> : null}
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-sm animate-in fade-in zoom-in">
                        <CardHeader className="items-center text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <Trash2Icon className="h-6 w-6 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-sm text-muted-foreground">
                                Apakah anda yakin ingin menghapus data ini?
                                <br />
                                Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
                            </p>
                        </CardContent>
                        <CardFooter className="flex flex-col-reverse gap-3 px-6 sm:flex-row sm:justify-end">
                            <Button variant="outline" onClick={closeDeleteModal}>
                                Batal
                            </Button>
                            <Button
                                variant="outline"
                                className="hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => templateToDelete && handleDelete(templateToDelete)}
                            >
                                Ya, Hapus
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </AppLayout>
    );
}
