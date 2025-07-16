
"use client";

import { useEffect, useState, useActionState } from 'react';
import { updateSubInterventionAction } from '@/app/actions/sub-interventions';
import { useToast } from '@/hooks/use-toast';
import type { SubIntervention, CustomList, CustomListItem } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, List } from 'lucide-react';
import { BaseDataFields } from './BaseDataFields';
import { CostAnalysisFields } from './CostAnalysisFields';
import { SubmitButton } from './SubmitButton';

const initialState = {
  message: null,
  errors: {},
  success: false,
};

const parseDescription = (fullDescription: string) => {
    const parts = fullDescription.split(' - ');
    if (parts.length > 1) {
        const energySpec = parts.pop() || '';
        const description = parts.join(' - ');
        return { description, energySpec };
    }
    return { description: fullDescription, energySpec: '' };
};

export function EditSubInterventionForm({ interventionMasterId, projectId, subIntervention, setOpen, customLists, customListItems }: {
    interventionMasterId: string;
    projectId: string;
    subIntervention: SubIntervention;
    setOpen: (open: boolean) => void;
    customLists: CustomList[];
    customListItems: CustomListItem[];
}) {
    const [state, formAction] = useActionState(updateSubInterventionAction, initialState);
    const { toast } = useToast();
    
    const { description: initialDescription, energySpec: initialEnergySpec } = parseDescription(subIntervention.description);
    
    const [subcategoryCode, setSubcategoryCode] = useState(subIntervention.subcategoryCode);
    const [expenseCategory, setExpenseCategory] = useState(subIntervention.expenseCategory || '');
    const [description, setDescription] = useState(initialDescription);
    const [energySpec, setEnergySpec] = useState(initialEnergySpec);
    const [quantityUnit, setQuantityUnit] = useState(subIntervention.quantityUnit || '');

    useEffect(() => {
        if (state?.success) {
            toast({ title: 'Επιτυχία!', description: state.message });
            setOpen(false);
        } else if (state?.success === false && state.message) {
            const errorMessages = state.errors ? Object.values(state.errors).flat().join('\n') : '';
            toast({
                variant: 'destructive',
                title: 'Σφάλμα',
                description: `${state.message}\n${errorMessages}`,
            });
        }
    }, [state, toast, setOpen]);
    
    const combinedDescription = description && energySpec ? `${description} - ${energySpec}` : description;

    return (
        <form action={formAction} className="pt-4">
            <input type="hidden" name="projectId" value={projectId} />
            <input type="hidden" name="interventionMasterId" value={interventionMasterId} />
            <input type="hidden" name="subInterventionId" value={subIntervention.id} />
            <input type="hidden" name="subcategoryCode" value={subcategoryCode} />
            <input type="hidden" name="expenseCategory" value={expenseCategory} />
            <input type="hidden" name="description" value={combinedDescription} />
            <input type="hidden" name="quantityUnit" value={quantityUnit} />
            <input type="hidden" name="selectedEnergySpec" value={energySpec} />

            <Tabs defaultValue="base-data" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="base-data"><List className="mr-2"/>Βασικά & Εγκεκριμένα</TabsTrigger>
                    <TabsTrigger value="costs"><Edit className="mr-2"/>Ανάλυση Κόστους (Έξοδα)</TabsTrigger>
                </TabsList>
                <TabsContent value="base-data" className="mt-4">
                    <BaseDataFields
                        state={state}
                        subIntervention={subIntervention}
                        customLists={customLists}
                        customListItems={customListItems}
                        initialDescription={initialDescription}
                        subcategoryCode={subcategoryCode}
                        setSubcategoryCode={setSubcategoryCode}
                        expenseCategory={expenseCategory}
                        setExpenseCategory={setExpenseCategory}
                        energySpec={energySpec}
                        setEnergySpec={setEnergySpec}
                        quantityUnit={quantityUnit}
                        setQuantityUnit={setQuantityUnit}
                    />
                </TabsContent>
                <TabsContent value="costs" className="mt-4">
                    <CostAnalysisFields
                        state={state}
                        subIntervention={subIntervention}
                        quantityUnit={quantityUnit}
                    />
                </TabsContent>
            </Tabs>
            <SubmitButton />
        </form>
    );
}
