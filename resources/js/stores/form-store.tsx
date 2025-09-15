import axios from 'axios';
import { toast } from 'react-toastify';
import { create } from 'zustand';

interface InformationBorrower {
    borrowerId: number | null;
    borrowerGroup: string;
    purpose: string;
    economicSector: string;
    businessField: string;
    borrowerBusiness: string;
    collectibility: number;
    restructuring: boolean;
}

interface Facility {
    id: number | null;
    name: string;
    limit: number;
    outstanding: number;
    interestRate: number;
    principalArrears: number;
    interestArrears: number;
    pdo: number;
    maturityDate: Date | string;
}

interface Aspect {
    questionId: number;
    selectedOptionId: number | null;
    notes: string;
    aspectName?: string;
}

interface ReportMeta {
    template_id: number | null;
    period_id: number | null;
}

interface FormStoreState {
    activeStep: number;
    totalSteps: number;
    isSaving: boolean;
    lastSavedStep: string | null;
    informationBorrower: InformationBorrower;
    facilitiesBorrower: Facility[];
    aspectsBorrower: Aspect[];
    reportMeta: ReportMeta;
    aspectGroups: any[];

    setActiveStep: (step: number) => void;
    setIsSaving: (status: boolean) => void;
    setLastSavedStep: (step: string | null) => void;
    updateInformationBorrower: (payload: Partial<InformationBorrower>) => void;
    updateFacilitiesBorrower: (payload: Facility[]) => void;
    updateAspectsBorrower: (payload: Aspect[]) => void;
    updateReportMeta: (payload: Partial<ReportMeta>) => void;
    setAspectGroups: (groups: any[]) => void;
    nextStep: () => void;
    prevStep: () => void;
    resetForm: () => void;
}

const initialFormState = {
    activeStep: 1,
    totalSteps: 3,
    isSaving: false,
    lastSavedStep: null,
    informationBorrower: {
        borrowerId: null,
        borrowerGroup: '',
        purpose: '',
        economicSector: '',
        businessField: '',
        borrowerBusiness: '',
        collectibility: 1,
        restructuring: false,
    },
    facilitiesBorrower: [],
    aspectsBorrower: [],
    reportMeta: {
        template_id: null,
        period_id: null,
    },
    aspectGroups: [],
};

export const useFormStore = create<FormStoreState>((set, get) => ({
    ...initialFormState,

    setActiveStep: (step) => set({ activeStep: step }),
    setIsSaving: (status) => set({ isSaving: status }),
    setLastSavedStep: (step) => set({ lastSavedStep: step }),

    updateInformationBorrower: (payload) =>
        set((state) => ({
            informationBorrower: { ...state.informationBorrower, ...payload },
        })),

    updateFacilitiesBorrower: (payload) => set({ facilitiesBorrower: payload }),

    updateAspectsBorrower: (payload) => set({ aspectsBorrower: payload }),

    updateReportMeta: (payload) =>
        set((state) => ({
            reportMeta: { ...state.reportMeta, ...payload },
        })),

    setAspectGroups: (groups) => set({ aspectGroups: groups }),

    nextStep: async () => {
        const { activeStep, totalSteps, informationBorrower, facilitiesBorrower } = get();

        if (activeStep < totalSteps) {
            const toastId = toast.loading('Memuat data...');
            try {
                const response = await axios.post('/forms/save-step', {
                    informationBorrower,
                    facilitiesBorrower,
                });

                set({
                    aspectGroups: response.data.aspect_groups,
                    reportMeta: { ...get().reportMeta, template_id: response.data.template_id },
                });

                toast.update(toastId, { render: 'Berhasil!', type: 'success', isLoading: false, autoClose: 1500 });
                set({ activeStep: activeStep + 1 });
            } catch (error) {
                console.error('Gagal memperbarui data langkah:', error);
                toast.update(toastId, { render: 'Gagal memuat data!', type: 'error', isLoading: false, autoClose: 3000 });
            }
        }
    },

    prevStep: () =>
        set((state) => ({
            activeStep: state.activeStep > 1 ? state.activeStep - 1 : state.activeStep,
        })),

    resetForm: () => set(initialFormState),
}));
