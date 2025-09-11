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

    setActiveStep: (step: number) => void;
    setIsSaving: (status: boolean) => void;
    setLastSavedStep: (step: string | null) => void;
    updateInformationBorrower: (payload: Partial<InformationBorrower>) => void;
    updateFacilitiesBorrower: (payload: Facility[]) => void;
    updateAspectsBorrower: (payload: Aspect[]) => void;
    updateReportMeta: (payload: Partial<ReportMeta>) => void;
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

    nextStep: () =>
        set((state) => ({
            activeStep: state.activeStep < state.totalSteps ? state.activeStep + 1 : state.activeStep,
        })),

    prevStep: () =>
        set((state) => ({
            activeStep: state.activeStep > 1 ? state.activeStep - 1 : state.activeStep,
        })),

    resetForm: () => set(initialFormState),
}));
