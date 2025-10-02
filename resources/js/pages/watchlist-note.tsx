import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { WatchlistNotePageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { Tooltip } from '@radix-ui/react-tooltip';
import { ArrowLeftIcon, Calendar, FileText, MessageSquare, Pencil, Trash2, User } from 'lucide-react';
import React, { useMemo, useState } from 'react';

type ActionItemStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';
type ActionItemType = 'previous_period' | 'current_progress' | 'next_period';

interface ActionItem {
    id: number;
    action_description: string;
    progress_notes: string;
    people_in_charge: string;
    notes: string;
    due_date: string;
    status: ActionItemStatus;
    item_type: ActionItemType;
}

const dummyData = {
    report: {
        id: 101,
        borrower: { name: 'PT. Sejahtera Abadi' },
        period: { name: 'Q3 2025' },
        creator: { name: 'Rhaditya Bwo' },
    },
    monitoringNote: {
        id: 202,
        watchlist_reason: 'Adanya penurunan penjualan kuartalan yang signifikan sebesar 20% akibat kondisi pasar yang melemah.',
        account_strategy:
            'Melakukan restrukturisasi kredit dengan perpanjangan tenor dan memberikan grace period selama 3 bulan untuk memulihkan cash flow.',
    },
    actionItems: {
        previous_period: [
            {
                id: 1,
                action_description: 'Follow up pembayaran invoice #123',
                progress_notes: 'Sudah dibayar lunas pada 1 September 2025.',
                people_in_charge: 'Andi',
                notes: '',
                due_date: '2025-09-01',
                status: 'completed',
                item_type: 'previous_period',
            },
            {
                id: 2,
                action_description: 'Negosiasi ulang kontrak dengan supplier B',
                progress_notes: '',
                people_in_charge: 'Budi',
                notes: 'Masih dalam tahap diskusi alot.',
                due_date: '2025-08-25',
                status: 'overdue',
                item_type: 'previous_period',
            },
        ],
        current_progress: [],
        next_period: [
            {
                id: 3,
                action_description: 'Evaluasi performa penjualan setiap 2 minggu',
                progress_notes: '',
                people_in_charge: 'Citra',
                notes: '',
                due_date: '2025-10-15',
                status: 'pending',
                item_type: 'next_period',
            },
        ],
    },
};

// --- Helper Functions ---
const formatDate = (date: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getStatusBadgeClass = (status: ActionItemStatus) => {
    switch (status) {
        case 'completed':
            return 'bg-green-100 text-green-800';
        case 'in_progress':
            return 'bg-blue-100 text-blue-800';
        case 'overdue':
            return 'bg-red-100 text-red-800';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getItemTypeLabel = (type: ActionItemType) => {
    switch (type) {
        case 'previous_period':
            return 'Progress Periode Sebelumnya';
        case 'current_progress':
            return 'Progress Saat Ini';
        case 'next_period':
            return 'Rencana Periode Berikutnya';
        default:
            return type;
    }
};

// --- Komponen Utama ---
export default function WatchlistNote({ watchlist, report_data, monitoring_note, action_items }: WatchlistNotePageProps) {
    const [report] = useState(report_data);
    const [monitoringNote, setMonitoringNote] = useState(monitoring_note);
    const [actionItems, setActionItems] = useState(action_items);
    const [editingItemId, setEditingItemId] = useState<number | null>(null);

    // Handler for monitoring note changes
    const handleMonitoringNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setMonitoringNote((prev) => ({ ...prev, [id]: value }));
    };

    const previousPeriodCompletionStatus = useMemo(() => {
        const items = actionItems.previous_period;
        if (items.length === 0) return { completed: 0, total: 0, percentage: 100 };
        const completedItems = items.filter((item) => item.progress_notes?.trim() !== '');
        const percentage = Math.round((completedItems.length / items.length) * 100);
        return { completed: completedItems.length, total: items.length, percentage };
    }, [actionItems.previous_period]);

    const nawCompletionStatus = useMemo(() => {
        const hasWatchlistReason = !!monitoringNote.watchlist_reason?.trim();
        const hasAccountStrategy = !!monitoringNote.account_strategy?.trim();
        const hasPreviousProgress = previousPeriodCompletionStatus.percentage === 100;
        const hasNextPlan = actionItems.next_period.length > 0;
        const completedItems = [hasWatchlistReason, hasAccountStrategy, hasPreviousProgress, hasNextPlan].filter(Boolean).length;
        const totalItems = 4;
        const percentage = Math.round((completedItems / totalItems) * 100);
        return { percentage, completedItems, totalItems, isComplete: percentage === 100 };
    }, [monitoringNote, previousPeriodCompletionStatus, actionItems.next_period]);

    const handleSaveOrAddActionItem = (itemToSave: ActionItem) => {
        const list = actionItems[itemToSave.item_type] as ActionItem[];
        const itemIndex = list.findIndex((i) => i.id === itemToSave.id);
        if (itemIndex > -1) {
            const updatedList = [...list];
            updatedList[itemIndex] = itemToSave;
            setActionItems((prev) => ({ ...prev, [itemToSave.item_type]: updatedList }));
            alert('Action Item berhasil diperbarui!');
        } else {
            const newItem = { ...itemToSave, id: Date.now() };
            setActionItems((prev) => ({ ...prev, [itemToSave.item_type]: [...list, newItem] }));
            alert('Action Item berhasil ditambahkan!');
        }
        setEditingItemId(null);
    };

    const handleDeleteActionItem = (itemToDelete: ActionItem) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus item ini?')) {
            const list = actionItems[itemToDelete.item_type] as ActionItem[];
            setActionItems((prev) => ({
                ...prev,
                [itemToDelete.item_type]: list.filter((item) => item.id !== itemToDelete.id),
            }));
            alert('Item berhasil dihapus!');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            report_id: report.id,
            monitoring_note: monitoringNote,
            action_items: actionItems,
        };
    };

    const returnToSummary = () => window.history.back();

    return (
        <>
            <Head title="Nota Analisa Watchlist" />
            <div className="min-h-screen bg-gray-50">
                <header className="bg-[#FF5F15] p-4 text-white shadow-md">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-2xl font-bold">Nota Analisa Watchlist</h1>
                            <Badge className={nawCompletionStatus.isComplete ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                                Progress: {nawCompletionStatus.percentage}%
                            </Badge>
                        </div>
                        <Button variant={'ghost'} onClick={returnToSummary} className="text-white hover:bg-white hover:text-[#FF5F15]">
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Kembali ke Summary
                        </Button>
                    </div>
                </header>

                <main className="container mx-auto space-y-6 py-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl font-bold">Informasi Debitur & Laporan</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div>
                                <Label className="text-sm text-gray-500">Debitur</Label>
                                <p className="font-semibold">{report.borrower?.name}</p>
                            </div>
                            <div>
                                <Label className="text-sm text-gray-500">Periode</Label>
                                <p className="font-semibold">{report.period?.name}</p>
                            </div>
                            <div>
                                <Label className="text-sm text-gray-500">Klasifikasi Final</Label>
                                <div className="mt-1">
                                    <Badge className="bg-red-100 text-red-800">WATCHLIST</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Penyebab Watchlist & Account Strategy</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>
                                    Alasan Masuk/Keluar Watchlist <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    id="watchlist_reason"
                                    value={monitoringNote.watchlist_reason}
                                    onChange={handleMonitoringNoteChange}
                                    className="mt-1 bg-gray-100"
                                    required
                                />
                            </div>
                            <div>
                                <Label>
                                    Account Strategy <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    id="account_strategy"
                                    value={monitoringNote.account_strategy}
                                    onChange={handleMonitoringNoteChange}
                                    className="mt-1 bg-gray-100"
                                    required
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Action Plan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <section>
                                <h3 className="text-lg font-semibold">{getItemTypeLabel('previous_period')}</h3>
                                <div className="mt-4 space-y-4">
                                    {actionItems.previous_period.map((item) =>
                                        editingItemId === item.id ? (
                                            <ActionItemForm
                                                key={item.id}
                                                item={item}
                                                onSave={handleSaveOrAddActionItem}
                                                onCancel={() => setEditingItemId(null)}
                                            />
                                        ) : (
                                            <ActionItemDisplay
                                                key={item.id}
                                                item={item}
                                                onEdit={() => setEditingItemId(item.id)}
                                                onDelete={() => handleDeleteActionItem(item)}
                                            />
                                        ),
                                    )}
                                </div>
                            </section>

                            <section>
                                <h3 className="text-lg font-semibold">{getItemTypeLabel('next_period')}</h3>
                                <div className="mt-4">
                                    <ActionItemForm itemType="next_period" onSave={handleSaveOrAddActionItem} />
                                </div>
                                <div className="mt-4 space-y-4">
                                    {actionItems.next_period.map((item) =>
                                        editingItemId === item.id ? (
                                            <ActionItemForm
                                                key={item.id}
                                                item={item}
                                                onSave={handleSaveOrAddActionItem}
                                                onCancel={() => setEditingItemId(null)}
                                            />
                                        ) : (
                                            <ActionItemDisplay
                                                key={item.id}
                                                item={item}
                                                onEdit={() => setEditingItemId(item.id)}
                                                onDelete={() => handleDeleteActionItem(item)}
                                            />
                                        ),
                                    )}
                                </div>
                            </section>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </>
    );
}

function ActionItemDisplay({ item, onEdit, onDelete }: { item: ActionItem; onEdit: () => void; onDelete: () => void }) {
    return (
        <div className="rounded-lg border p-4 transition-all hover:shadow-sm">
            {/* Bagian Header (Judul, Status, Tombol) */}
            <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                    <h4 className="font-semibold text-gray-800">{item.action_description}</h4>
                    <div className="mt-1">
                        <Badge className={getStatusBadgeClass(item.status)}>{item.status.replace('_', ' ').toUpperCase()}</Badge>
                    </div>
                </div>
                <div className="flex flex-shrink-0 gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button onClick={onEdit} variant="ghost" size="icon">
                                    <Pencil className="h-4 w-4 text-gray-600" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{item.item_type === 'previous_period' && !item.progress_notes?.trim() ? 'Isi Progress' : 'Edit Item'}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button onClick={onDelete} variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Hapus Item</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            {/* Bagian Detail (Progress, PIC, Tanggal, Catatan) - Tampilan Baru */}
            <div className="mt-4 border-t pt-4">
                {item.progress_notes ? (
                    <div className="mb-3 flex items-start gap-3 text-sm text-gray-700">
                        <MessageSquare className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                        <div>
                            <p className="font-semibold text-gray-800">Progress Notes</p>
                            <p className="text-gray-600">{item.progress_notes}</p>
                        </div>
                    </div>
                ) : (
                    item.item_type === 'previous_period' && (
                        <div className="mb-3 flex items-center gap-3 rounded-md bg-red-50 p-2 text-sm text-red-700">
                            <MessageSquare className="h-4 w-4 flex-shrink-0" />
                            <p className="font-medium">Progress notes belum diisi - Wajib dilengkapi.</p>
                        </div>
                    )
                )}

                <div className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                    <div className="flex items-center gap-3">
                        <User className="h-4 w-4 flex-shrink-0 text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">PIC</p>
                            <p className="font-medium text-gray-800">{item.people_in_charge || '-'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 flex-shrink-0 text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Due Date</p>
                            <p className="font-medium text-gray-800">{formatDate(item.due_date)}</p>
                        </div>
                    </div>
                </div>

                {item.notes && (
                    <div className="mt-3 flex items-start gap-3 border-t pt-3 text-sm text-gray-700">
                        <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                        <div>
                            <p className="font-semibold text-gray-800">Catatan Tambahan</p>
                            <p className="text-gray-600">{item.notes}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ActionItemForm({
    item,
    itemType,
    onSave,
    onCancel,
}: {
    item?: ActionItem;
    itemType?: ActionItemType;
    onSave: (item: ActionItem) => void;
    onCancel?: () => void;
}) {
    const initialFormState: ActionItem = item || {
        id: 0,
        action_description: '',
        progress_notes: '',
        people_in_charge: '',
        notes: '',
        due_date: '',
        status: 'pending',
        item_type: itemType || 'next_period',
    };

    const [formState, setFormState] = useState(initialFormState);
    const isEditing = !!item;
    const isPreviousPeriod = formState.item_type === 'previous_period';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value: ActionItemStatus) => {
        setFormState((prev) => ({ ...prev, status: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formState);
        if (!isEditing) {
            setFormState(initialFormState);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-orange-200 bg-orange-50 p-4">
            <h4 className="font-semibold text-gray-800">{isEditing ? 'Edit Action Item' : 'Tambah Rencana Baru'}</h4>

            <div className="space-y-4">
                <div>
                    <Label htmlFor="action_description">Deskripsi Action</Label>
                    <Textarea
                        id="action_description"
                        name="action_description"
                        value={formState.action_description}
                        onChange={handleChange}
                        required
                        disabled={isPreviousPeriod && isEditing}
                        className="mt-1"
                    />
                </div>

                {isPreviousPeriod && (
                    <div>
                        <Label htmlFor="progress_notes">Progress Notes (Wajib)</Label>
                        <Textarea
                            id="progress_notes"
                            name="progress_notes"
                            value={formState.progress_notes}
                            onChange={handleChange}
                            required
                            className="mt-1"
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                        <Label htmlFor="people_in_charge">PIC</Label>
                        <Input
                            id="people_in_charge"
                            name="people_in_charge"
                            value={formState.people_in_charge}
                            onChange={handleChange}
                            disabled={isPreviousPeriod && isEditing}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="due_date">Due Date</Label>
                        <Input
                            id="due_date"
                            name="due_date"
                            type="date"
                            value={formState.due_date}
                            onChange={handleChange}
                            disabled={isPreviousPeriod && isEditing}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <Select name="status" value={formState.status} onValueChange={handleSelectChange}>
                            <SelectTrigger id="status" className="mt-1">
                                <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div>
                    <Label htmlFor="notes">Catatan Tambahan</Label>
                    <Textarea
                        id="notes"
                        name="notes"
                        value={formState.notes}
                        onChange={handleChange}
                        disabled={isPreviousPeriod && isEditing}
                        className="mt-1"
                    />
                </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t pt-4">
                {onCancel && (
                    <Button type="button" variant="ghost" onClick={onCancel}>
                        Batal
                    </Button>
                )}
                <Button type="submit" className="bg-green-600 text-white hover:bg-green-700">
                    Simpan
                </Button>
            </div>
        </form>
    );
}
