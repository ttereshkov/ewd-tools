import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import templates from '@/routes/templates';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon, EyeIcon, Info } from 'lucide-react';

type VisibilityRule = {
    id: number;
    description: string | null;
    source_type: string;
    source_field: string;
    operator: string;
    value: string;
    aspect_id: number;
};

type Aspect = {
    id: number;
    code: string;
    latest_aspect_version: {
        name: string;
        description?: string;
    };
    pivot: {
        weight: number;
    };
};

type TemplateVersion = {
    id: number;
    name: string;
    description?: string;
    version_number: number;
    aspects: Aspect[];
    visibility_rules: VisibilityRule[];
};

type Template = {
    id: number;
    latest_template_version: TemplateVersion;
};

interface Props {
    template: Template;
}

const getOperatorLabel = (operator: string) => {
    const labels: Record<string, string> = {
        '=': 'Sama dengan',
        '!=': 'Tidak sama dengan',
        '>': 'Lebih besar dari',
        '<': 'Lebih kecil dari',
        '>=': 'Lebih besar atau sama dengan',
        '<=': 'Lebih kecil atau sama dengan',
        in: 'Termasuk dalam',
        not_in: 'Tidak termasuk dalam',
    };
    return labels[operator] || operator;
};

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
        latest_template_version: { name, version_number, description, aspects, visibility_rules },
    } = template;

    const getAspectVisibilityRules = (aspectId: number) => {
        return visibility_rules.filter((rule) => rule.aspect_id === aspectId);
    };

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
                                </CardTitle>
                            </div>
                            <Link href={templates.index().url}>
                                <Button>
                                    <ArrowLeftIcon className="h-4 w-4" />
                                    Kembali
                                </Button>
                            </Link>
                        </CardHeader>

                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>Detail Aspek ({aspects.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {aspects.length > 0 ? (
                                    <div className="space-y-6">
                                        {aspects.map((aspect) => (
                                            <Card key={aspect.id} className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <Info className="h-5 w-5 text-gray-500" />
                                                        <span className="text-lg font-semibold">
                                                            {aspect.latest_aspect_version?.name || aspect.code}
                                                        </span>
                                                    </div>
                                                    <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                                        Bobot: {aspect.pivot.weight}%
                                                    </Badge>
                                                </div>
                                                {/* Nested card untuk aturan visibilitas */}
                                                <div className="mt-4 border-t pt-4">
                                                    <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        <EyeIcon className="h-4 w-4" />
                                                        Aturan Visibilitas ({getAspectVisibilityRules(aspect.id).length})
                                                    </h3>
                                                    {getAspectVisibilityRules(aspect.id).length > 0 ? (
                                                        <div className="mt-2 space-y-2">
                                                            {getAspectVisibilityRules(aspect.id).map((rule, ruleIndex) => (
                                                                <div
                                                                    key={ruleIndex}
                                                                    className="rounded-md border bg-gray-50 p-3 text-sm dark:bg-gray-800"
                                                                >
                                                                    <p className="font-semibold">Aturan {ruleIndex + 1}</p>
                                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                        {rule.description || 'Tidak ada deskripsi.'}
                                                                    </p>
                                                                    <p className="mt-1">
                                                                        Jika `<strong>{rule.source_field}</strong>` `
                                                                        <strong>{getOperatorLabel(rule.operator)}</strong>` `
                                                                        <strong>"{rule.value}"</strong>`
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="mt-2 text-sm text-gray-500">Tidak ada aturan visibilitas untuk aspek ini.</p>
                                                    )}
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">Tidak ada aspek yang terlampir pada template ini.</p>
                                )}
                            </CardContent>
                        </Card>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
