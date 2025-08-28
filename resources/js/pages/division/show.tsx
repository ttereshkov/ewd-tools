import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import divisions from "@/routes/divisions";
import { BreadcrumbItem } from "@/types";
import { Head, Link } from "@inertiajs/react";
import { ArrowLeftIcon } from "lucide-react";

type Division = {
    id: number;
    code: string;
    name: string;
    created_at: string;
    updated_at: string;
};

interface Props {
    division: Division
}

export default function DivisionShow({ division }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: "Dashboard",
            href: dashboard().url
        },
        {
            title: "Divisi",
            href: divisions.index().url
        },
        {
            title: `${division.name}`,
            href: "#"
        }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${division.name}`} />
            <div className="py-6 md:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-5xl lg:px-8">
                    <Card>
                        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle>

                            </CardTitle>
                            <Link href={divisions.index().url}>
                                <Button variant={"outline"}>
                                    <ArrowLeftIcon className="h-4 w-4" />
                                    Kembali
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                <div className="space-y-2">
                                    <div className="text-sm text-gray-500">Kode Divisi</div>
                                    <div className="flex items-center font-medium">
                                        { division.code }
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm text-gray-500">Nama Divisi</div>
                                    <div className="flex items-center font-medium">
                                        { division.name }
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    )
}