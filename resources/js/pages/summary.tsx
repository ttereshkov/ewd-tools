import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { watchlistNote } from '@/routes/forms/summary';
import { Head, router } from '@inertiajs/react';

interface Report {
    id: number;
    borrower: Borrower;
}

interface Borrower {
    id: number;
    name: string;
    division_id: number;
    division: Division;
    detail: BorrowerDetail;
    created_at: string;
    updated_at: string;
}

interface Division {
    id: number;
    code: string;
    name: string;
    created_at: string;
    updated_at: string;
}

interface BorrowerDetail {
    id: number;
    borrower_id: number;
    borrower_group: string;
    borrower_business: string;
    business_field: string;
    collectibility: number;
    economic_sector: string;
    purpose: 'kie' | 'kmke' | 'both';
    restructuring: boolean;
    created_at: string;
    updated_at: string;
}

interface SummaryProps {
    reportData: Report;
}

export default function Summary({ reportData }: SummaryProps) {
    const { borrower, summary, aspects, creator, period } = reportData;
    console.log('REPORT:', reportData);

    const getClassificationVariant = (classification: string | undefined | null) => {
        if (!classification) return 'default';
        return classification.toLowerCase() === 'watchlist' ? 'destructive' : 'default';
    };
    return (
        <>
            <Head title={`SAW - ${borrower.name}`} />
            <div className="min-h-screen">
                <div className="bg-[#2E3192] p-4 text-white shadow-md dark:bg-[#1A1D68] dark:text-gray-200">
                    <div className="flex items-center justify-between px-2">
                        <Label className="text-2xl font-bold">Summary Early Warning</Label>
                        <div className="flex items-center space-x-4">
                            <div>
                                <Button className="bg-orange-600 text-white hover:bg-orange-700" onClick={() => router.visit(watchlistNote().url)}>
                                    📝 Buka NAW
                                </Button>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-blue-100">Dibuat oleh:</p>
                                <p className="font-semibold">{creator.name}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto space-y-6 py-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Debitur & Laporan</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
                            <div>
                                <p className="font-semibold">Nama Debitur</p>
                                <p>{borrower.name}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Grup</p>
                                <p>{borrower.detail?.borrower_group || '-'}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Tujuan Kredit</p>
                                <p className="uppercase">{borrower.detail?.purpose || '-'}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Periode</p>
                                <p>{period.name}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Tanggal Submit</p>
                                <p>{new Date(reportData.submitted_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Hasil Akhir Penilaian</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <p className="font-semibold">Klasifikasi Final</p>
                                <Badge variant={getClassificationVariant(summary.final_classification)} className="text-lg">
                                    {summary.final_classification?.toUpperCase() || 'N/A'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Rincian Klasifikasi Aspek</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Aspek</TableHead>
                                        <TableHead className="text-right">Klasifikasi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {aspects.map((aspect) => (
                                        <TableRow key={aspect.id}>
                                            <TableCell className="font-medium">{aspect.aspect_version.name}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant={getClassificationVariant(aspect.classification)}>
                                                    {aspect.classification?.toUpperCase() || 'N/A'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
