import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import borrowers from "@/routes/borrowers";
import { BreadcrumbItem } from "@/types";
import { Head, Link } from "@inertiajs/react";
import { ArrowLeftIcon } from "lucide-react";

type Borrower = {
    id: number;
    name: string;
    division_id: number | null;
    division: Division;
    created_at: string;
    updated_at: string;
};

type Division = {
    id: number;
    code: string;
    name: string;
    created_at: string;
    updated_at: string;
};

interface Props {
    borrower: Borrower,
    divisions: Division[]
};

export default function ShowBorrower({ borrower, divisions }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: "Dashboard",
            href: dashboard().url
        },
        {
            title: "Debitur",
            href: borrowers.index().url
        },
        {
            title: `Edit - ${borrower.name}`,
            href: borrowers.edit(borrower.id).url
        }
    ];

    const defaultValues = { name: borrower.name || "", }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${borrower.name}`}/>
            <div className="py-6 md:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-5xl lg:px-8">
                    <Card>
                        <CardHeader className="flex flex-col gap-4 sm:flex-roww sm:items-center sm:justify-betwwee">
                            <Link href={borrowers.index().url}>
                                <Button variant={"outline"}>
                                    <ArrowLeftIcon className="h-4 w-4"/>
                                    Kembali
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                <div className="space-y-2">
                                    <div className="text-sm text-gray-500">Nama Debitur</div>
                                    <div className="flex items-center font-medium">
                                        {borrower.name}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Divisi</div>
                                    <div className="flex items-center font-medium">
                                        {borrower.division.code}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}