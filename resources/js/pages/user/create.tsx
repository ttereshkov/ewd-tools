import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import users from '@/routes/users';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeftIcon, UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';

type Division = {
    id: number;
    code: string;
    name: string;
    created_at: string;
    updated_at: string;
};

type Role = {
    id: number;
    name: string;
};

interface Props {
    divisions: Division[];
    roles: Role[];
}

interface UserFormData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role_id: number;
    division_id: number | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'User',
        href: users.index().url,
    },
    {
        title: 'Tambah User',
        href: users.create().url,
    },
];

export default function UserCreate({ divisions, roles }: Props) {
    const defaultValues = {
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role_id: 0,
        division_id: null,
    };

    const { data, setData, post, reset, processing, errors, isDirty } = useForm<UserFormData>(defaultValues);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post(users.store().url, {
            onSuccess: () => {
                toast.success('User berhasil ditambahkan.');
                router.visit(users.index().url, {
                    preserveScroll: true,
                });
            },
            onError: (errs) => {
                Object.values(errs).forEach((error) => {
                    toast.error(error as string);
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah User" />
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950 dark:via-green-950 dark:to-teal-950">
                <div className="py-8 px-6">
                    {/* Header Section */}
                    <div className="text-center space-y-4 mb-12">
                        <div className="flex items-center justify-center mb-4">
                            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/25">
                                <UserPlus className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-green-400">
                            Tambah User Baru
                        </h1>
                        <p className="text-emerald-600/80 dark:text-emerald-300/80 max-w-2xl mx-auto">
                            Buat akun pengguna baru dengan informasi yang diperlukan
                        </p>
                    </div>

                    <div className="mx-auto max-w-4xl">
                        <div className="backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/50 shadow-xl shadow-emerald-500/10 dark:shadow-emerald-500/5">
                            <div className="p-8">
                                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-8">
                                    <div>
                                        <h2 className="text-xl font-semibold text-emerald-700 dark:text-emerald-300">Informasi User</h2>
                                        <p className="text-sm text-emerald-600/70 dark:text-emerald-300/70 mt-1">Lengkapi form di bawah untuk menambah user</p>
                                    </div>
                                    <Link href={users.index().url}>
                                        <Button variant={'outline'} className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/50">
                                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                            Kembali
                                        </Button>
                                    </Link>
                                </div>

                                <form onSubmit={submit} className="space-y-8">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-emerald-700 dark:text-emerald-300 font-medium">Nama</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="Masukkan nama user"
                                                className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 dark:border-emerald-800"
                                            />
                                            <InputError message={errors.name} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-emerald-700 dark:text-emerald-300 font-medium">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="Masukkan email user"
                                                className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 dark:border-emerald-800"
                                            />
                                            <InputError message={errors.email} />
                                        </div>
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="password" className="text-emerald-700 dark:text-emerald-300 font-medium">Password</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                placeholder="Masukkan password"
                                                className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 dark:border-emerald-800"
                                            />
                                            <InputError message={errors.password} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="password_confirmation" className="text-emerald-700 dark:text-emerald-300 font-medium">Konfirmasi Password</Label>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                placeholder="Konfirmasi password"
                                                className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 dark:border-emerald-800"
                                            />
                                            <InputError message={errors.password_confirmation} />
                                        </div>
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="role_id" className="text-emerald-700 dark:text-emerald-300 font-medium">Role</Label>
                                            <Select
                                                value={data.role_id ? String(data.role_id) : ''}
                                                onValueChange={(value) => setData('role_id', Number(value))}
                                            >
                                                <SelectTrigger className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 dark:border-emerald-800">
                                                    <SelectValue placeholder="Pilih role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {roles.map((role) => (
                                                        <SelectItem key={role.id} value={String(role.id)}>
                                                            {role.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.role_id} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="division_id" className="text-emerald-700 dark:text-emerald-300 font-medium">Divisi</Label>
                                            <Select
                                                value={data.division_id ? String(data.division_id) : ''}
                                                onValueChange={(value) => setData('division_id', Number(value))}
                                            >
                                                <SelectTrigger className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 dark:border-emerald-800">
                                                    <SelectValue placeholder="Pilih divisi" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {divisions.map((division) => (
                                                        <SelectItem key={division.id} value={String(division.id)}>
                                                            {division.code} - {division.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.division_id} />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-4 pt-6 border-t border-emerald-200/50 dark:border-emerald-800/50">
                                        {isDirty && (
                                            <Button
                                                type="button"
                                                variant={'outline'}
                                                onClick={() => reset()}
                                                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                                            >
                                                Reset
                                            </Button>
                                        )}
                                        <Button
                                            type="submit"
                                            disabled={!isDirty || processing}
                                            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-emerald-500/25"
                                        >
                                            {processing ? 'Menyimpan...' : 'Simpan'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
