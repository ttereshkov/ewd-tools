import InputError from '@/components/input-error';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormStore } from '@/stores/form-store';
import { Head, useForm } from '@inertiajs/react';
import { useEffect } from 'react';

interface Borrower {
    id: number;
    name: string;
}

interface FormProps {
    borrowers: Borrower[];
    borrower_id: number | null;
}

interface BorrowerData {
    borrower_id: number | null;
    borrower_group: string;
    purpose: string;
    economic_sector: string;
    business_field: string;
    borrower_business: string;
    collectibility: number;
    restructuring: boolean;
}

const purposeOptions = [
    { value: 'kie', label: 'KIE' },
    { value: 'kmke', label: 'KMKE' },
    { value: 'both', label: 'KIE & KMKE' },
];

const collectibilityOptions = [
    { value: 1, label: '1 - Lancar' },
    { value: 2, label: '2 - Dalam Perhatian Khusus' },
    { value: 3, label: '3 - Kurang Lancar' },
    { value: 4, label: '4 - Diragukan' },
    { value: 5, label: '5 - Macet' },
];

export default function FormInformation({ borrowers, borrower_id }: FormProps) {
    const { informationBorrower, updateInformationBorrower } = useFormStore();

    const initialInformationBorrower: BorrowerData = {
        borrower_id: informationBorrower.borrowerId || null,
        borrower_group: informationBorrower.borrowerGroup || '',
        purpose: informationBorrower.purpose || '',
        economic_sector: informationBorrower.economicSector || '',
        business_field: informationBorrower.businessField || '',
        borrower_business: informationBorrower.borrowerBusiness || '',
        collectibility: informationBorrower.collectibility || 1,
        restructuring: informationBorrower.restructuring || false,
    };

    const { data, setData, post, errors } = useForm(initialInformationBorrower);

    useEffect(() => {
        updateInformationBorrower({
            borrowerId: data.borrower_id,
            borrowerGroup: data.borrower_group,
            purpose: data.purpose,
            economicSector: data.economic_sector,
            businessField: data.business_field,
            borrowerBusiness: data.borrower_business,
            collectibility: data.collectibility,
            restructuring: data.restructuring,
        });
    }, [data, updateInformationBorrower]);

    return (
        <>
            <Head title="Informasi Debitur" />

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold text-gray-900">Informasi Debitur</CardTitle>
                        <p className="text-sm text-gray-600">Pilih debitur dan lengkapi informasi detail untuk memulai penilaian.</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="borrower_id" className="text-sm font-medium text-gray-700">
                                Nama Debitur <span className="text-red-500">*</span>
                            </Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih debitur..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {borrowers?.map((borrower) => (
                                        <SelectItem key={borrower.id} value={borrower.id.toString()}>
                                            {borrower.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.borrower_id} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="borrower_group" className="text-sm font-medium text-gray-700">
                                Grup Debitur
                            </Label>
                            <Input id="borrower_group" value={data.borrower_group} placeholder="Masukkan grup debitur..." />
                            <InputError message={data.borrower_group} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="purpose" className="text-sm font-medium text-gray-700">
                                Tujuan Kredit <span className="text-red-500">*</span>
                            </Label>
                            <Select onValueChange={(value) => setData('purpose', value)} value={data.purpose}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih tujuan kredit..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {purposeOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.purpose} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="economic_sector" className="text-sm font-medium text-gray-700">
                                Sektor Ekonomi
                            </Label>
                            <Input
                                id="economic_sector"
                                value={data.economic_sector}
                                onChange={(e) => setData('economic_sector', e.target.value)}
                                type="text"
                                placeholder="Masukkan sektor ekonomi..."
                                className="w-full"
                            />
                            <InputError message={errors.economic_sector} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="business_field" className="text-sm font-medium text-gray-700">
                                Bidang Usaha
                            </Label>
                            <Input
                                id="business_field"
                                value={data.business_field}
                                onChange={(e) => setData('business_field', e.target.value)}
                                type="text"
                                placeholder="Masukkan bidang usaha..."
                                className="w-full"
                            />
                            <InputError message={errors.business_field} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="borrower_business" className="text-sm font-medium text-gray-700">
                                Jenis Usaha Debitur
                            </Label>
                            <Input
                                id="borrower_business"
                                value={data.borrower_business}
                                onChange={(e) => setData('borrower_business', e.target.value)}
                                type="text"
                                placeholder="Masukkan jenis usaha debitur..."
                                className="w-full"
                            />
                            <InputError message={errors.borrower_business} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="collectibility" className="text-sm font-medium text-gray-700">
                                Kolektibilitas<span className="text-red-500">*</span>
                            </Label>
                            <Select onValueChange={(value) => setData('collectibility', Number(value))} value={data.collectibility.toString()}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih kolektibilitas..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {collectibilityOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value.toString()}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.collectibility} />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="restructuring"
                                checked={data.restructuring}
                                onCheckedChange={(checked) => setData('restructuring', checked as boolean)}
                            />
                            <Label htmlFor="restructuring" className="text-sm font-medium text-gray-700">
                                Restrukturisasi
                            </Label>
                        </div>
                        <InputError message={errors.restructuring} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
