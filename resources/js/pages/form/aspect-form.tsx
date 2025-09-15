import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useFormStore } from '@/stores/form-store';
import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface QuestionOption {
    id: number;
    option_text: string;
    score: number;
}

interface Question {
    id: number;
    is_mandatory: boolean;
    options: QuestionOption;
    question_id: number;
    question_text: string;
    version_number: number;
    visibility_rules: any[];
    weight: number;
    value?: number | null;
    notes?: string;
}

interface Aspect {
    id: number;
    name: string;
    description: string;
    template_visibility_rules: any[];
    aspects: Question[];
}

interface FormAspectProps {
    aspect_groups: Aspect[];
    reportId: number;
}

export default function FormAspect({ aspect_groups }: FormAspectProps) {
    const { aspectsBorrower, informationBorrower, facilitiesBorrower, updateAspectsBorrower } = useFormStore();

    const [localAspectGroups, setLocalAspectGroups] = useState<Aspect[]>([]);
    const initializeAspectGroups = useCallback(
        (groups: Aspect[]) => {
            return (groups || []).map((group) => ({
                ...group,
                aspects: (group.aspects || []).map((aspect) => {
                    const existingAspect = aspectsBorrower.find((a) => a.questionId === aspect.id);
                    return {
                        ...aspect,
                        value: existingAspect?.selectedOptionId || null,
                        notes: existingAspect?.notes || '',
                    };
                }),
            }));
        },
        [aspectsBorrower],
    );

    useEffect(() => {
        setLocalAspectGroups(initializeAspectGroups(aspect_groups));
    }, [aspect_groups, initializeAspectGroups]);

    const compareValues = useCallback((sourceValue: any, operator: string, targetValue: any): boolean => {
        try {
            switch (operator) {
                case '=':
                    return sourceValue == targetValue;
                case '!=':
                    return sourceValue != targetValue;
                case '>':
                    return parseFloat(sourceValue) > parseFloat(targetValue);
                case '<':
                    return parseFloat(sourceValue) < parseFloat(targetValue);
                case '>=':
                    return parseFloat(sourceValue) >= parseFloat(targetValue);
                case '<=':
                    return parseFloat(sourceValue) <= parseFloat(targetValue);
                case 'in': {
                    const values = String(targetValue)
                        .split(',')
                        .map((v) => v.trim());
                    return values.includes(String(sourceValue));
                }
                case 'not_in': {
                    const notValues = String(targetValue)
                        .split(',')
                        .map((v) => v.trim());
                    return !notValues.includes(String(sourceValue));
                }
                case 'contains':
                    return String(sourceValue).includes(String(targetValue));
                case 'not_contains':
                    return !String(sourceValue).includes(String(targetValue));
                default:
                    console.warn(`Unknown operator: ${operator}`);
                    return false;
            }
        } catch (e) {
            console.error('Error comparing values:', { sourceValue, operator, targetValue, error: e });
            return false;
        }
    }, []);

    const isVisible = useCallback(
        (entity: any): boolean => {
            if (!entity.visibility_rules || entity.visibility_rules.length === 0) {
                return true;
            }

            return entity.visibility_rules.every((rule: any) => {
                let sourceValue;
                const sourceField = rule.source_field;

                try {
                    if (rule.source_type === 'borrower_detail') {
                        sourceValue = informationBorrower?.[sourceField as keyof typeof informationBorrower];
                    } else if (rule.source_type === 'borrower_facility') {
                        sourceValue =
                            facilitiesBorrower?.reduce(
                                (total, facility) => total + (parseFloat(facility[sourceField as keyof typeof facility] as string) || 0),
                                0,
                            ) || 0;
                    } else if (rule.source_type === 'answer') {
                        const sourceAspect = aspectsBorrower.find((a) => a.questionId?.toString() === sourceField);
                        sourceValue = sourceAspect?.selectedOptionId;
                    }

                    if (sourceValue === undefined || sourceValue === null) {
                        if (['>', '<', '>=', '<='].includes(rule.operator)) {
                            sourceValue = 0;
                        } else {
                            console.warn(`Visibility check failed: Source value for '${sourceField}' is undefined/null.`, { rule });
                            return false;
                        }
                    }
                    return compareValues(sourceValue, rule.operator, rule.value);
                } catch (error) {
                    console.error('Error in visibility check:', error, { rule });
                    return false;
                }
            });
        },
        [informationBorrower, facilitiesBorrower, aspectsBorrower, compareValues],
    );

    const isTemplateVisible = useCallback(
        (templateRules: any[]): boolean => {
            if (!templateRules || templateRules.length === 0) {
                return true;
            }

            return templateRules.every((rule: any) => {
                let sourceValue;
                const sourceField = rule.source_field;

                try {
                    if (rule.source_type === 'borrower_detail') {
                        sourceValue = informationBorrower?.[sourceField as keyof typeof informationBorrower];
                    } else if (rule.source_type === 'borrower_facility') {
                        sourceValue =
                            facilitiesBorrower?.reduce(
                                (total, facility) => total + (parseFloat(facility[sourceField as keyof typeof facility] as string) || 0),
                                0,
                            ) || 0;
                    } else if (rule.source_type === 'answer') {
                        const answeredAspect = aspectsBorrower?.find((aspect) => aspect.questionId?.toString() === rule.source_field);
                        sourceValue = answeredAspect?.selectedOptionId;
                    }

                    if (sourceValue === undefined || sourceValue === null) {
                        if (['>', '<', '>=', '<='].includes(rule.operator)) {
                            sourceValue = 0;
                        } else {
                            return false;
                        }
                    }

                    return compareValues(sourceValue, rule.operator, rule.value);
                } catch (error) {
                    console.error('Error in template visibility check:', error);
                    return false;
                }
            });
        },
        [informationBorrower, facilitiesBorrower, aspectsBorrower, compareValues],
    );

    const visibleAspectGroups = useMemo(() => {
        if (!localAspectGroups || localAspectGroups.length === 0) {
            return [];
        }

        return localAspectGroups
            .filter((group) => {
                if (group.template_visibility_rules && group.template_visibility_rules.length > 0) {
                    if (!isTemplateVisible(group.template_visibility_rules)) {
                        return false;
                    }
                }
                const visibleAspects = group.aspects?.filter((aspect) => isVisible(aspect)) || [];
                return visibleAspects.length > 0;
            })
            .map((group) => ({
                ...group,
                aspects: group.aspects.filter((aspect) => isVisible(aspect)),
            }));
    }, [localAspectGroups, isVisible, isTemplateVisible]);

    const completionProgress = useMemo(() => {
        const totalQuestions = visibleAspectGroups.reduce((total, group) => total + group.aspects.length, 0);
        if (totalQuestions === 0) return 0;
        const answeredQuestions = visibleAspectGroups.reduce(
            (total, group) =>
                total +
                group.aspects.filter((aspect) => {
                    const typedAspect = aspect as Question & { value: number | null };
                    return typedAspect.value !== null && typedAspect.value !== undefined;
                }).length,
            0,
        );
        return Math.round((answeredQuestions / totalQuestions) * 100);
    }, [visibleAspectGroups]);

    const getOptionsForQuestion = useCallback((aspect: Question) => {
        return Array.isArray(aspect.options) && aspect.options.length > 0
            ? aspect.options
            : [
                  { id: 1, option_text: 'Ya', score: 1 },
                  { id: 0, option_text: 'Tidak', score: 0 },
              ];
    }, []);

    const updateAspectInStore = useCallback(
        (questionId: number, selectedOptionId: number | null, notes: string) => {
            setLocalAspectGroups((prevGroups) => {
                const updatedGroups = prevGroups.map((group) => ({
                    ...group,
                    aspects: group.aspects.map((aspect) =>
                        aspect.id === questionId ? { ...aspect, value: selectedOptionId, notes: notes } : aspect,
                    ),
                }));

                const aspectsData = updatedGroups.flatMap((group) =>
                    group.aspects.map((aspect) => ({
                        questionId: aspect.id,
                        selectedOptionId: aspect.value,
                        notes: aspect.notes,
                        aspectName: group.name,
                    })),
                );
                updateAspectsBorrower(
                    aspectsData.map((aspect) => ({
                        questionId: aspect.questionId,
                        aspectName: aspect.aspectName,
                        notes: aspect.notes || '',
                        selectedOptionId: aspect.selectedOptionId ?? null,
                    })),
                );
                return updatedGroups;
            });
        },
        [updateAspectsBorrower],
    );

    return (
        <>
            <Head title="Penilaian Aspek" />
            <div className="space-y-6">
                <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Progress Pengisian</span>
                    <span className="text-sm text-gray-500">{completionProgress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                    <div className="h-2 rounded-full bg-blue-600 transition-all duration-300" style={{ width: `${completionProgress}%` }}></div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <Card>
                    <CardContent>
                        {visibleAspectGroups.length === 0 && (
                            <div className="mb-4 rounded border border-yellow-200 bg-yellow-50 p-4">
                                <p className="text-yellow-800">
                                    Tidak ada aspek yang ditampilkan. Periksa data borrower dan facility untuk memastikan template visibility rules
                                    terpenuhi.
                                </p>
                                <details className="mt-2">
                                    <summary className="cursor-pointer text-sm text-yellow-600">Debug Info</summary>
                                    <pre className="mt-2 rounded bg-white p-2 text-xs">
                                        {JSON.stringify(
                                            {
                                                aspectGroups: aspect_groups?.length || 0,
                                                borrowerData: informationBorrower,
                                                facilityData: facilitiesBorrower,
                                            },
                                            null,
                                            2,
                                        )}
                                    </pre>
                                </details>
                            </div>
                        )}

                        {visibleAspectGroups.map((group) => (
                            <div key={group.id} className="mb-8">
                                <div className="mb-4 rounded bg-gray-200 p-2">
                                    <h2 className="font-bold">
                                        {group.id}. {group.name}
                                    </h2>
                                    {group.description && <p className="mt-1 text-sm text-gray-600">{group.description}</p>}
                                </div>

                                <div className="overflow-x-auto">
                                    <Table className="w-full border-collapse">
                                        <TableHeader>
                                            <TableRow className="text-white">
                                                <TableHead className="w-16 border border-gray-300 p-2 text-center">NO</TableHead>
                                                <TableHead className="border border-gray-300 p-2 text-left">ASPEK</TableHead>
                                                <TableHead className="w-32 border border-gray-300 p-2 text-center">NILAI</TableHead>
                                                <TableHead className="w-64 border border-gray-300 p-2 text-center">KETERANGAN</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {group.aspects.map((aspect) => (
                                                <TableRow key={aspect.id}>
                                                    <TableCell className="border border-gray-300 p-2 text-center">
                                                        {aspect.id}
                                                        {aspect.is_mandatory && <span className="ml-1 text-red-500">*</span>}
                                                    </TableCell>
                                                    <TableCell className="border border-gray-300 p-2">{aspect.question_text}</TableCell>
                                                    <TableCell className="border border-gray-300 p-2">
                                                        <Select
                                                            value={aspect.value ? String(aspect.value) : ''}
                                                            onValueChange={(value) =>
                                                                updateAspectInStore(aspect.id, Number(value), aspect.notes || '')
                                                            }
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Pilih nilai" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {getOptionsForQuestion(aspect).map((option) => (
                                                                    <SelectItem key={option.id} value={String(option.id)}>
                                                                        {option.option_text}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell className="border border-gray-300 p-2">
                                                        <Textarea
                                                            value={aspect.notes}
                                                            onChange={(e) => updateAspectInStore(aspect.id, aspect.value || null, e.target.value)}
                                                            placeholder="Masukkan keterangan..."
                                                            className="min-h-[60px]"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
