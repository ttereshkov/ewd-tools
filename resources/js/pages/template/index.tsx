import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import templates from '@/routes/templates';
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
    aspect_versions: Aspect[];
};

type Template = {
    id: number;
    latest_template_version: TemplateVersion;
};

type PageProps = {
    templates: Template[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Template',
        href: templates.index().url,
    },
];

export default function TemplateIndex() {
    const { templates: templateList } = usePage<PageProps>().props;
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
        router.delete(templates.destroy(templateToDelete!).url, {
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
                <div className="max-w-3-xl mx-auto px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    <Card>
                        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle className="text-lg font-bold md:text-2xl">List Template</CardTitle>
                            <Link href={templates.create().url}>
                                <Button>
                                    <PlusIcon className="h-4 w-4" />
                                    Tambah Template
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {templateList.length === 0 ? (
                                <div className="py-8 text-center text-gray-500">
                                    Belum ada template yang terdaftar. Silahkan tambahkan template baru
                                </div>
                            ) : (
                                <Table className="w-full overflow-x-auto">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Judul</TableHead>
                                            <TableHead>Jumlah Aspek</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {templateList.map((template) => (
                                            <TableRow key={template.id}>
                                                <TableCell>{template.latest_template_version.name}</TableCell>
                                                <TableCell>{template.latest_template_version.aspect_versions.length}</TableCell>
                                                <TableCell className="flex justify-end space-x-3 text-right">
                                                    <Link
                                                        href={templates.edit(template.id).url}
                                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                        title="Edit Template"
                                                    >
                                                        <EditIcon className="h-5 w-5" />
                                                    </Link>
                                                    <Link
                                                        href={templates.show(template.id).url}
                                                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                                        title="Show Template"
                                                    >
                                                        <EyeIcon className="h-5 w-5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => openDeleteModal(template.id)}
                                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                        title="Hapus Template"
                                                    >
                                                        <Trash2Icon className="h-5 w-5" />
                                                    </button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
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
