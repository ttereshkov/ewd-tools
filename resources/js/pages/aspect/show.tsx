import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import aspects from '@/routes/aspects';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';

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
    question_options: Option[];
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

interface Props {
    aspect: Aspect;
}

export default function AspectShow({ aspect }: Props) {
    console.log(aspect);
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Aspek',
            href: aspects.index().url,
        },
        {
            title: `Aspek ${aspect.latest_aspect_version.name}`,
            href: aspects.show(aspect.id).url,
        },
    ];

    const {
        latest_aspect_version: { name, version_number, description, question_versions },
    } = aspect;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${name}`} />
            <div className="py-6 md:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    <Card>
                        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <Link href={aspects.index().url}>
                                <Button variant={'outline'}>
                                    <ArrowLeftIcon className="h-4 w-4" />
                                    Kembali
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                {description && (
                                    <>
                                        <div>
                                            <p className="font-semibold">Deskripsi</p>
                                            <p>{description}</p>
                                        </div>
                                        <Separator />
                                    </>
                                )}

                                {question_versions && question_versions.length > 0 ? (
                                    <div className="grid gap-4">
                                        <h3 className="text-lg font-bold">Daftar Pertanyaan</h3>
                                        {question_versions.map((question, index) => (
                                            <div key={index} className="space-y-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="font-semibold">
                                                        ({index + 1}) {question.question_text}
                                                    </span>
                                                    <Badge variant={'secondary'}>Bobot: {question.weight}</Badge>
                                                    {question.is_mandatory && <Badge variant="destructive">Wajib</Badge>}
                                                </div>
                                                <ul className="list-inside list-disc">
                                                    {question.question_options.map((option, optionIndex) => (
                                                        <li key={optionIndex}>
                                                            {option.option_text} (Skor: {option.score})
                                                        </li>
                                                    ))}
                                                </ul>
                                                {question.visibility_rules.length > 0 && (
                                                    <div className="text-sm text-muted-foreground">
                                                        <p className="font-semibold">Aturan Visibilitas:</p>
                                                        <ul>
                                                            {question.visibility_rules.map((rule, ruleIndex) => (
                                                                <li key={ruleIndex}>{rule.description}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {index < question_versions.length - 1 && <Separator />}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p></p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
