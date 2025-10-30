import DataPagination from '@/components/data-pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import templateRoutes from '@/routes/templates';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { EditIcon, EyeIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
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
    templates: {
        current_page: number;
        data: Template[];
        first_page_url: string;
        from: number;
        last_page: number;
        last_page_url: string;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        next_page_url: string | null;
        path: string;
        per_page: number;
        prev_page_url: string | null;
        to: number;
        total: number;
    };
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
    const templateList = templates.data;
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);
    console.log(templateList);

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
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="List Template" />
            <div className="py-6 md:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    <div className="space-y-6">
                        {/* Header Section */}
                        <div className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 p-8 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="mb-2 text-3xl font-bold">Manajemen Template</h1>
                                    <p className="text-lg text-indigo-100">Kelola template evaluasi dan aspek penilaian</p>
                                </div>
                                <div className="text-right">
                                    <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                                        <div className="text-2xl font-bold">{templateList.length}</div>
                                        <div className="text-sm text-indigo-100">Total Template</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Section */}
                        <div className="flex justify-end">
                            <Link href={templateRoutes.create().url}>
                                <Button className="bg-emerald-600 hover:bg-emerald-700">
                                    <PlusIcon className="mr-2 h-4 w-4" />
                                    Tambah Template
                                </Button>
                            </Link>
                        </div>

                        {/* Data Table */}
                        <Card className="border-0 bg-white shadow-lg">
                            <CardHeader className="border-b bg-slate-50">
                                <CardTitle className="text-slate-800">Daftar Template ({templateList.length})</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {templateList.length === 0 ? (
                                    <div className="py-16 text-center">
                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                                            <PlusIcon className="h-8 w-8 text-slate-400" />
                                        </div>
                                        <h3 className="mb-2 text-lg font-medium text-slate-600">Belum ada template</h3>
                                        <p className="text-slate-500">Belum ada template yang terdaftar. Silahkan tambahkan template baru</p>
                                    </div>
                                ) : (
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
                                                        <div className="flex gap-2">
                                                            <Link href={templateRoutes.show(template.id).url}>
                                                                <Button variant="outline" size="sm">
                                                                    <EyeIcon className="mr-1 h-4 w-4" />
                                                                    Lihat
                                                                </Button>
                                                            </Link>
                                                            <Link href={templateRoutes.edit(template.id).url}>
                                                                <Button variant="outline" size="sm">
                                                                    <EditIcon className="mr-1 h-4 w-4" />
                                                                    Edit
                                                                </Button>
                                                            </Link>
                                                            <Button variant="destructive" size="sm" onClick={() => openDeleteModal(template.id)}>
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
                                <DataPagination paginationData={templates} />
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <Card className="w-full max-w-sm animate-in fade-in zoom-in">
                        <CardHeader className="items-center text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                                <Trash2Icon className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Apakah anda yakin ingin menghapus data ini?
                                <br />
                                Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
                            </p>
                        </CardContent>
                        <CardFooter className="flex flex-col-reverse gap-3 px-6 sm:flex-row sm:justify-end">
                            <Button variant="outline" onClick={closeDeleteModal}>
                                Batal
                            </Button>
                            <Button variant="destructive" onClick={() => templateToDelete && handleDelete(templateToDelete)}>
                                Ya, Hapus
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </AppLayout>
    );
}
