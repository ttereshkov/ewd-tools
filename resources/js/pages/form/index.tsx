import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Stepper } from '@/components/ui/stepper';
import { useFormStore } from '@/stores/form-store';
import { Building2, Calculator, ListChecks } from 'lucide-react';
import React from 'react';
import FormAspect from './aspect-form';
import FormFacility from './facility-form';
import FormInformation from './information-form';

interface FormProps {
    borrowers?: any[];
    borrower_id?: number | null;
}

interface StepperStep {
    id: number;
    title: string;
    component: React.ComponentType<any>;
    icon: React.ElementType;
    required: boolean;
    props: any;
}

export default function FormIndex({ borrowers = [], borrower_id = null }: FormProps) {
    const { activeStep, totalSteps, nextStep, prevStep } = useFormStore();

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
            props: {},
        },
    ];

    const currentStepData = steps[activeStep - 1];

    return (
        <div className="min-h-screen">
            <div className="bg-[#2E3192] p-4 text-white shadow-md dark:bg-[#1A1D68] dark:text-gray-200">
                <Label className="pl-2 text-2xl font-bold">Form Penilaian Debitur</Label>
            </div>

            <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Stepper */}
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
                    <Button className="w-full min-w-24 sm:w-auto lg:min-w-32 lg:px-8 lg:py-3" onClick={() => console.log('Form submitted!')}>
                        Submit
                    </Button>
                )}
            </div>
        </div>
    );
}
