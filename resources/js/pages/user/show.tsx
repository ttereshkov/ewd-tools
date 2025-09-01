import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import divisions from "@/routes/divisions";
import users from "@/routes/users";
import { BreadcrumbItem } from "@/types";
import { Head, Link } from "@inertiajs/react";
import { ArrowLeftIcon } from "lucide-react";

type User = {
    id: number;
    name: string;
    email: string;
    division_id: number | null;
    division: Division;
    password: string;
    password_confirmation: string;
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
    user: User;
    division: Division;
}

export default function UserShow({ user, division}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: "Dashboard",
            href: dashboard().url
        },
        {
            title: "User",
            href: users.index().url
        },
        {
            title: `${user.name}`,
            href: users.show(user.id).url
        }
    ]

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${user.name}`} />
            <div className="py-6 md:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-5xl lg:px-8">
                    <Card>
                        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <Link href={users.index().url}>
                                <Button variant={"outline"}>
                                    <ArrowLeftIcon />
                                    Kembali
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                <div className="space-y-2">
                                    <div className="text-sm text-gray-500">Nama</div>
                                    <div className="flex items-center font-medium">
                                        {user.name}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm text-gray-500">Email</div>
                                    <div className="flex items-center font-medium">
                                        {user.email}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm text-gray-500">Division</div>
                                    <div className="flex items-center font-medium">
                                        {user.division?.name || "-"}
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