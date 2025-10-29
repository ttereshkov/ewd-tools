import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { BreadcrumbItem, Report, User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { AlertCircleIcon, CheckIcon, ClockIcon, EyeIcon, UserIcon, XIcon } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

type Approval = {
    id: number;
    level: string;
    status: 'pending' | 'approved' | 'rejected';
    reviewed_by?: number;
    reviewer?: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
    notes?: string;
};

type ReportWithApprovals = Report & {
    approvals: Approval[];
};

type PageProps = {
    reports: ReportWithApprovals[];
    user: User & {
        division?: {
            id: number;
            name: string;
            code: string;
        };
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Persetujuan Laporan',
        href: '/approvals',
    },
];

const getApprovalLevelLabel = (level: string): string => {
    switch (level) {
        case 'ERO':
            return 'Risk Analyst (ERO)';
        case 'KADEPT_BISNIS':
            return 'Kadept Bisnis';
        case 'KADIV_ERO':
            return 'Kadiv Risk';
        default:
            return level;
    }
};

const getApprovalStatusBadge = (status: string) => {
    switch (status) {
        case 'pending':
            return (
                <Badge variant="outline" className="border-amber-200 bg-amber-50 font-medium text-amber-700">
                    <ClockIcon className="mr-1 h-3 w-3" />
                    Menunggu
                </Badge>
            );
        case 'approved':
            return (
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 font-medium text-emerald-700">
                    <CheckIcon className="mr-1 h-3 w-3" />
                    Disetujui
                </Badge>
            );
        case 'rejected':
            return (
                <Badge variant="outline" className="border-red-200 bg-red-50 font-medium text-red-700">
                    <XIcon className="mr-1 h-3 w-3" />
                    Ditolak
                </Badge>
            );
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

const getReportStatusBadge = (status: string) => {
    switch (status) {
        case 'SUBMITTED':
            return (
                <Badge variant="outline" className="border-blue-200 bg-blue-50 font-medium text-blue-700">
                    Disubmit
                </Badge>
            );
        case 'APPROVED':
            return (
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 font-medium text-emerald-700">
                    Disetujui
                </Badge>
            );
        case 'REJECTED':
            return (
                <Badge variant="outline" className="border-red-200 bg-red-50 font-medium text-red-700">
                    Ditolak
                </Badge>
            );
        case 'DONE':
            return (
                <Badge variant="outline" className="border-slate-200 bg-slate-50 font-medium text-slate-700">
                    Selesai
                </Badge>
            );
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

export default function ApprovalIndex({ reports, user }: PageProps) {
    console.log('Reports data:', reports);
    console.log('User data:', user);

    const [approvalNotes, setApprovalNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

    // Show all reports without filtering
    const filteredReports = useMemo(() => {
        return reports;
    }, [reports]);

    // Get user's approval level
    const userApprovalLevel = useMemo(() => {
        if (user.roles?.some((role) => role.name === 'risk_analyst')) return 'ERO';
        if (user.roles?.some((role) => role.name === 'kadept_bisnis')) return 'KADEPT_BISNIS';
        if (user.roles?.some((role) => role.name === 'kadept_risk')) return 'KADIV_ERO';
        return null;
    }, [user.roles]);

    const handleApprove = useCallback(async () => {
        if (!selectedApproval) {
            toast.error('Tidak ada approval yang dipilih');
            return;
        }

        setIsProcessing(true);
        try {
            await router.post(
                `/approvals/${selectedApproval.id}/approve`,
                {
                    notes: approvalNotes.trim() || null,
                },
                {
                    preserveState: false,
                    onSuccess: () => {
                        toast.success('Laporan berhasil disetujui');
                        setIsApproveDialogOpen(false);
                        setApprovalNotes('');
                        setSelectedApproval(null);
                    },
                    onError: (errors) => {
                        toast.error(errors.message || 'Gagal menyetujui laporan');
                    },
                },
            );
        } catch (error) {
            toast.error('Terjadi kesalahan saat menyetujui laporan');
        } finally {
            setIsProcessing(false);
        }
    }, [selectedApproval, approvalNotes]);

    const handleReject = useCallback(async () => {
        if (!selectedApproval || !rejectionReason.trim()) {
            toast.error('Alasan penolakan harus diisi');
            return;
        }

        setIsProcessing(true);
        try {
            await router.post(
                `/approvals/${selectedApproval.id}/reject`,
                {
                    notes: rejectionReason,
                },
                {
                    preserveState: false,
                    onSuccess: () => {
                        toast.success('Laporan berhasil ditolak');
                        setIsRejectDialogOpen(false);
                        setRejectionReason('');
                        setSelectedApproval(null);
                    },
                    onError: (errors) => {
                        toast.error(errors.message || 'Gagal menolak laporan');
                    },
                },
            );
        } catch (error) {
            toast.error('Terjadi kesalahan saat menolak laporan');
        } finally {
            setIsProcessing(false);
        }
    }, [selectedApproval, rejectionReason]);

    const openApproveDialog = useCallback((approval: Approval) => {
        setSelectedApproval(approval);
        setApprovalNotes('');
        setIsApproveDialogOpen(true);
    }, []);

    const openRejectDialog = useCallback((approval: Approval) => {
        setSelectedApproval(approval);
        setRejectionReason('');
        setIsRejectDialogOpen(true);
    }, []);

    const canUserApprove = useCallback(
        (approval: Approval) => {
            return approval.status === 'pending' && approval.level === userApprovalLevel;
        },
        [userApprovalLevel],
    );

    const pendingCount = useMemo(() => {
        return filteredReports.reduce((count, report) => {
            const userPendingApprovals =
                report.approvals?.filter((approval) => approval.status === 'pending' && approval.level === userApprovalLevel) || [];
            return count + userPendingApprovals.length;
        }, 0);
    }, [filteredReports, userApprovalLevel]);

    // Get reports that user can actually approve (for their level)
    const userActionableReports = useMemo(() => {
        return filteredReports.filter((report) => {
            return report.approvals?.some((approval) => approval.status === 'pending' && approval.level === userApprovalLevel);
        });
    }, [filteredReports, userApprovalLevel]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Persetujuan Laporan" />

            <div className="space-y-8">
                {/* Header Section */}
                <div className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="mb-2 text-3xl font-bold">Persetujuan Laporan</h1>
                            <p className="text-lg text-blue-100">Kelola persetujuan laporan sesuai dengan workflow yang ditetapkan</p>
                        </div>
                        <div className="text-right">
                            <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                                <div className="text-2xl font-bold">{pendingCount}</div>
                                <div className="text-sm text-blue-100">Menunggu Persetujuan</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alert for pending approvals */}
                {pendingCount > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6">
                        <div className="flex items-center">
                            <div className="mr-4 rounded-full bg-amber-100 p-2">
                                <AlertCircleIcon className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="mb-1 font-semibold text-amber-800">Perhatian!</h3>
                                <span className="text-amber-700">
                                    Anda memiliki <strong className="font-bold">{pendingCount}</strong> laporan yang menunggu persetujuan Anda
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Info about user role and level */}
                {userApprovalLevel && (
                    <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                        <div className="flex items-center">
                            <div className="mr-4 rounded-full bg-blue-100 p-2">
                                <UserIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="mb-1 font-semibold text-blue-800">Level Persetujuan Anda</h3>
                                <span className="text-blue-700">
                                    Anda dapat menyetujui laporan pada level:{' '}
                                    <strong className="font-bold">{getApprovalLevelLabel(userApprovalLevel)}</strong>
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reports Table */}
                <Card className="border-0 bg-white shadow-lg">
                    <CardHeader className="border-b bg-slate-50">
                        <CardTitle className="text-slate-800">
                            Laporan Menunggu Persetujuan ({filteredReports.length})
                            {userApprovalLevel && (
                                <span className="ml-2 text-sm font-normal text-slate-600">• {userActionableReports.length} dapat Anda setujui</span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {filteredReports.length === 0 ? (
                            <div className="py-16 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                                    <ClockIcon className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="mb-2 text-lg font-medium text-slate-600">Tidak ada laporan</h3>
                                <p className="text-slate-500">Tidak ada laporan yang menunggu persetujuan saat ini</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Debitur</TableHead>
                                        <TableHead>Divisi</TableHead>
                                        <TableHead>Periode</TableHead>
                                        <TableHead>Pembuat</TableHead>
                                        <TableHead>Status Laporan</TableHead>
                                        <TableHead>Level Persetujuan</TableHead>
                                        <TableHead>Status Persetujuan</TableHead>
                                        <TableHead>Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredReports.map((report) => (
                                        <TableRow key={report.id}>
                                            <TableCell className="font-medium">{report.borrower?.name || 'N/A'}</TableCell>
                                            <TableCell>{report.borrower?.division?.name || 'N/A'}</TableCell>
                                            <TableCell>{report.period?.name || 'N/A'}</TableCell>
                                            <TableCell>{report.creator?.name || 'N/A'}</TableCell>
                                            <TableCell>{getReportStatusBadge(report.status)}</TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    {report.approvals?.map((approval) => (
                                                        <div key={approval.id} className="text-sm">
                                                            {getApprovalLevelLabel(approval.level)}
                                                        </div>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    {report.approvals?.map((approval) => (
                                                        <div key={approval.id}>{getApprovalStatusBadge(approval.status)}</div>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-2">
                                                    <Link href={`/reports/${report.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            <EyeIcon className="mr-1 h-4 w-4" />
                                                            Lihat
                                                        </Button>
                                                    </Link>
                                                    {report.approvals?.map(
                                                        (approval) =>
                                                            canUserApprove(approval) && (
                                                                <div key={approval.id} className="flex gap-1">
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => openApproveDialog(approval)}
                                                                        disabled={isProcessing}
                                                                        className="bg-emerald-600 hover:bg-emerald-700"
                                                                    >
                                                                        <CheckIcon className="mr-1 h-4 w-4" />
                                                                        Setujui
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        onClick={() => openRejectDialog(approval)}
                                                                        disabled={isProcessing}
                                                                    >
                                                                        <XIcon className="mr-1 h-4 w-4" />
                                                                        Tolak
                                                                    </Button>
                                                                </div>
                                                            ),
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Approve Dialog */}
            <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-emerald-600">
                            <CheckIcon className="h-5 w-5" />
                            Setujui Laporan
                        </DialogTitle>
                        <DialogDescription className="text-slate-600">
                            Anda akan menyetujui laporan ini. Anda dapat menambahkan catatan persetujuan (opsional).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="approval-notes" className="text-sm font-medium text-slate-700">
                                Catatan Persetujuan (Opsional)
                            </Label>
                            <Textarea
                                id="approval-notes"
                                placeholder="Masukkan catatan persetujuan..."
                                value={approvalNotes}
                                onChange={(e) => setApprovalNotes(e.target.value)}
                                className="min-h-[100px] resize-none"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)} disabled={isProcessing}>
                            Batal
                        </Button>
                        <Button onClick={handleApprove} disabled={isProcessing} className="bg-emerald-600 hover:bg-emerald-700">
                            {isProcessing ? 'Memproses...' : 'Setujui Laporan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <XIcon className="h-5 w-5" />
                            Tolak Laporan
                        </DialogTitle>
                        <DialogDescription className="text-slate-600">
                            Berikan alasan penolakan untuk laporan ini. Alasan ini akan dikirim kepada pembuat laporan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="rejection-reason" className="text-sm font-medium text-slate-700">
                                Alasan Penolakan <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="rejection-reason"
                                placeholder="Masukkan alasan penolakan..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="min-h-[100px] resize-none"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)} disabled={isProcessing}>
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={handleReject} disabled={isProcessing || !rejectionReason.trim()}>
                            {isProcessing ? 'Memproses...' : 'Tolak Laporan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
