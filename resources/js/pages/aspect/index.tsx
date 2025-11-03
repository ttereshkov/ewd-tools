import DataPagination from '@/components/data-pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import aspectRoutes from '@/routes/aspects';
import { type BreadcrumbItem, type MaybePaginated } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { EditIcon, EyeIcon, PlusIcon, SearchIcon, Trash2Icon, XIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';

type Aspect = {
    id: number;
    code: string;
    latest_aspect_version: AspectVersion;
    created_at: string;
    updated_at: string;
};

type AspectVersion = {
    id: number;
    name: string;
    version_number: string;
    description?: string;
    question_versions: QuestionVersion[];
};

type QuestionVersion = {
    question_text: string;
    weight: number;
    is_mandatory: boolean;
    options: Option[];
    visibility_rules: VisibilityRule[];
};

type Option = {
    option_text: string;
    score: number;
};

type VisibilityRule = {
    description: string;
    source_type: string;
    source_field: string;
    operator: string;
    value: string;
};

type PageProps = {
    aspects: MaybePaginated<Aspect>;
    filters?: { q?: string | null };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Aspek',
        href: aspectRoutes.index().url,
    },
];

export default function AspectIndex() {
    const pageProps = usePage<PageProps>().props as any;
    const aspects = pageProps.aspects as MaybePaginated<Aspect>;
    const aspectList: Aspect[] = Array.isArray(aspects) ? aspects : (aspects?.data ?? []);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [aspectToDelete, setAspectToDelete] = useState<number | null>(null);

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
        setAspectToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setAspectToDelete(null);
    };

    const handleDelete = (id: number) => {
        router.delete(aspectRoutes.destroy(aspectToDelete!).url, {
            onSuccess: () => {
                toast.success('Aspek berhasil dihapus');
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
        router.get(aspectRoutes.index(options as any).url, {}, { preserveState: true, preserveScroll: true });
    };

    const resetSearch = () => {
        setQ('');
        router.get(aspectRoutes.index().url, {}, { preserveState: true, preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="List Aspek" />
            <div className="py-6 md:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    <div className="space-y-6">
                        {/* Header Section */}
                        <div className="rounded-xl border bg-card p-6 sm:p-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="mb-2 text-2xl font-bold sm:text-3xl">Manajemen Aspek</h1>
                                    <p className="text-sm text-muted-foreground sm:text-base">Kelola aspek penilaian dan pertanyaan evaluasi</p>
                                </div>
                                <div className="text-right">
                                    <div className="rounded-lg border p-3 sm:p-4">
                                        <div className="text-xl font-bold sm:text-2xl">{aspectList.length}</div>
                                        <div className="text-xs text-muted-foreground sm:text-sm">Total Aspek</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Data Table */}
                        <Card>
                            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex w-full items-center gap-2">
                                    <Input
                                        placeholder="Cari nama atau kode aspek..."
                                        value={q}
                                        onChange={(e) => setQ(e.target.value)}
                                        className="min-w-0 flex-1"
                                    />
                                    <Button variant="secondary" onClick={applySearch} aria-label="Cari">
                                        <SearchIcon className="h-4 w-4" />
                                    </Button>
                                    {q && (
                                        <Button variant="ghost" onClick={resetSearch} aria-label="Reset pencarian">
                                            <XIcon className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                                <Link href={aspectRoutes.create().url}>
                                    <Button>
                                        <PlusIcon className="h-4 w-4" />
                                        Tambah Aspek
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent className="overflow-x-auto p-0">
                                {aspectList.length === 0 ? (
                                    <div className="py-16 text-center">
                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                            <PlusIcon className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="mb-2 text-lg font-medium">Belum ada aspek</h3>
                                        <p className="text-muted-foreground">Belum ada aspek yang terdaftar. Silahkan tambahkan aspek baru.</p>
                                    </div>
                                ) : (
                                    <Table className="min-w-[720px]">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nama</TableHead>
                                                <TableHead>Kode</TableHead>
                                                <TableHead>Versi</TableHead>
                                                <TableHead>Jumlah Pertanyaan</TableHead>
                                                <TableHead className="text-right">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {aspectList.map((aspect) => (
                                                <TableRow key={aspect.id}>
                                                    <TableCell className="font-medium">{aspect.latest_aspect_version.name}</TableCell>
                                                    <TableCell>{aspect.code}</TableCell>
                                                    <TableCell>v{aspect.latest_aspect_version.version_number}</TableCell>
                                                    <TableCell>{aspect.latest_aspect_version.question_versions.length}</TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap justify-end gap-2">
                                                            <Link href={aspectRoutes.show(aspect.id).url}>
                                                                <Button variant="outline" size="sm" className="whitespace-nowrap">
                                                                    <EyeIcon className="mr-1 h-4 w-4" />
                                                                    Lihat
                                                                </Button>
                                                            </Link>
                                                            <Link href={aspectRoutes.edit(aspect.id).url}>
                                                                <Button variant="outline" size="sm" className="whitespace-nowrap">
                                                                    <EditIcon className="mr-1 h-4 w-4" />
                                                                    Edit
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="whitespace-nowrap text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                                                onClick={() => openDeleteModal(aspect.id)}
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
                                )}
                            </CardContent>
                            <CardFooter>
                                {!Array.isArray(aspects) && aspects?.links ? <DataPagination paginationData={aspects as any} /> : null}
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
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
                                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => aspectToDelete && handleDelete(aspectToDelete)}
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
