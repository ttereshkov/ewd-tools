import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import templates from '@/routes/templates';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';

type Template = {
    id: number;
    latest_template_version: TemplateVersion;
    created_at: string;
    updated_at: string;
};

type TemplateVersion = {
    id: number;
    name: string;
    version_number: number;
    description: string | null;
    aspects: Aspect[];
};

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
};

interface Props {
    template: Template;
}

export default function TemplateShow({ template }: Props) {
    console.log(template);
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Template',
            href: templates.index().url,
        },
        {
            title: `Template ${template.latest_template_version.name}`,
            href: templates.show(template.id).url,
        },
    ];

    const {
        latest_template_version: { name, version_number, description, aspects },
    } = template;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${name}`} />
            <div className="py-6 md:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    <Card>
                        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-lg font-bold md:text-2xl">
                                    <span>{name}</span>
                                    <Badge variant="secondary">V{version_number}</Badge>
                                </CardTitle>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{description || 'Tidak ada deskripsi.'}</p>
                            </div>
                            <Link href={templates.index().url}>
                                <Button variant={'outline'} size={'sm'}>
                                    <ArrowLeftIcon className="h-4 w-4" />
                                    Kembali
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                <h2 className="text-xl font-semibold">Daftar Aspek ({aspects.length})</h2>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
