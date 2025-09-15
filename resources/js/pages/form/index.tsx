import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Stepper } from '@/components/ui/stepper';
import { useFormStore } from '@/stores/form-store';
import { router } from '@inertiajs/react';
import { Building2, Calculator, ListChecks } from 'lucide-react';
import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import FormAspect from './aspect-form';
import FormFacility from './facility-form';
import FormInformation from './information-form';

interface FormProps {
    borrowers?: any[];
    borrower_id?: number | null;
    period: any;
    aspect_groups: any[];
    template_id?: number | null;
    borrower_data?: any;
    facility_data?: any;
}

interface StepperStep {
    id: number;
    title: string;
    component: React.ComponentType<any>;
    icon: React.ElementType;
    required: boolean;
    props: any;
}

export default function FormIndex({
    borrowers = [],
    borrower_id = null,
    period,
    aspect_groups,
    template_id = null,
    borrower_data = {},
    facility_data = {},
}: FormProps) {
    const { activeStep, totalSteps, nextStep, prevStep, aspectGroups: storeAspectGroups, setAspectGroups } = useFormStore();

    useEffect(() => {
        setAspectGroups(aspect_groups);
    }, []);

    console.log(storeAspectGroups);

    const steps: StepperStep[] = [
        {
            id: 1,
            title: 'Informasi Debitur',
            component: FormInformation,
            icon: Building2,
            required: true,
            props: { borrowers },
        },
        {
            id: 2,
            title: 'Fasilitas Debitur',
            component: FormFacility,
            icon: Calculator,
            required: true,
            props: {},
        },
        {
            id: 3,
            title: 'Penilaian Aspek',
            component: FormAspect,
            icon: ListChecks,
            required: true,
            props: { aspect_groups: storeAspectGroups },
        },
    ];

    const handleSubmit = () => {
        const { informationBorrower, facilitiesBorrower, aspectsBorrower, reportMeta } = useFormStore.getState();

        const finalReportMeta = {
            ...reportMeta,
            template_id: template_id || reportMeta.template_id,
            period_id: period.id,
        };

        const formData = {
            informationBorrower,
            facilitiesBorrower,
            aspectsBorrower,
            reportMeta: finalReportMeta,
        };

        router.post('/forms', formData, {
            onStart: () => {
                console.log(formData);
                toast.info('Mengirim data...', { autoClose: false, theme: 'colored' });
            },
            onSuccess: () => {
                toast.dismiss();
                toast.success('Data berhasil disimpan!');
            },
            onError: (errors) => {
                toast.dismiss();
                Object.values(errors).forEach((error) => {
                    toast.error(error, { theme: 'colored' });
                });
            },
        });
    };

    const currentStepData = steps[activeStep - 1];

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            <div className="bg-[#2E3192] p-4 text-white shadow-md dark:bg-[#1A1D68] dark:text-gray-200">
                <Label className="pl-2 text-2xl font-bold">Form Penilaian Debitur</Label>
            </div>

            <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <Stepper steps={steps} currentStep={activeStep - 1} />
            </div>

            {currentStepData && (
                <div className="container mx-auto mb-4 sm:mb-6">
                    <currentStepData.component {...currentStepData.props} />
                </div>
            )}

            <div className="mx-auto mt-6 flex max-w-4xl flex-col justify-end gap-4 sm:flex-row lg:max-w-6xl lg:gap-6 lg:px-8">
                {activeStep > 1 && (
                    <Button variant={'outline'} className="w-full min-w-24 sm:w-auto lg:min-w-32 lg:px-8 lg:py-3" onClick={prevStep}>
                        Kembali
                    </Button>
                )}
                {activeStep < totalSteps && (
                    <Button className="w-full min-w-24 sm:w-auto lg:min-w-32 lg:px-8 lg:py-3" onClick={nextStep}>
                        Next
                    </Button>
                )}
                {activeStep === totalSteps && (
                    <Button className="w-full min-w-24 sm:w-auto lg:min-w-32 lg:px-8 lg:py-3" onClick={handleSubmit}>
                        Submit
                    </Button>
                )}
            </div>
        </div>
    );
}
