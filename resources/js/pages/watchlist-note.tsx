import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import summary from '@/routes/summary';
import { Head, router } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';

export default function WatchlistNote() {
    const returnToSummary = () => router.visit(summary.show({ id: 12 }).url);

    return (
        <>
            <Head title="Nota Analisa Watchlist" />
            <div className="min-h-screen">
                <div className="bg-[#FF5F15] p-4 text-white shadow-md">
                    <div className="flex items-center justify-between px-2">
                        <Label className="text-2xl font-bold">Nota Analisa Watchlist</Label>
                        <Button variant={'ghost'} onClick={returnToSummary} className="text-white hover:text-[#FF5F15]">
                            <ArrowLeftIcon className="h-4 w-4" />
                            Kembali ke Summary
                        </Button>
                    </div>
                </div>

                <div className="container mx-auto space-y-6 py-8">
                    <Card>
                        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle className="flex items-center gap-2 text-xl font-bold">Informasi Debitur & Laporan</CardTitle>
                        </CardHeader>
                        <CardContent></CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Penyebab Watchlist</CardTitle>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        </>
    );
}
