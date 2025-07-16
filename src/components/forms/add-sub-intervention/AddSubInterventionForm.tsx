
"use client";

import { useEffect, useState, useActionState } from 'react';
import { addSubInterventionAction } from '@/app/actions/sub-interventions';
import { useToast } from '@/hooks/use-toast';
import type { CustomList, CustomListItem } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, List } from 'lucide-react';
import { BaseDataFields } from './BaseDataFields';
import { CostAnalysisFields } from './CostAnalysisFields';
import { SubmitButton } from '../SubmitButton';
import type { FormState } from './types';


const initialState: FormState = {
  message: null,
  errors: {},
  success: false,
};

interface AddSubInterventionFormProps {
    interventionMasterId: string;
    projectId: string;
    setOpen: (open: boolean) => void;
    customLists: CustomList[];
    customListItems: CustomListItem[];
}

export function AddSubInterventionForm({ interventionMasterId, projectId, setOpen, customLists, customListItems }: AddSubInterventionFormProps) {
    const [state, formAction] = useActionState(addSubInterventionAction, initialState);
    const { toast } = useToast();
    const [subcategoryCode, setSubcategoryCode] = useState('');
    const [description, setDescription] = useState('');
    const [energySpec, setEnergySpec] = useState('');
    const [quantityUnit, setQuantityUnit] = useState('');

    useEffect(() => {
        if (state?.success === true) {
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
    
    const combinedDescription = description && energySpec
            ? `${description} - ${energySpec}`
            : description;

    return (
        <form action={formAction} className="pt-4">
            <input type="hidden" name="projectId" value={projectId} />
            <input type="hidden" name="interventionMasterId" value={interventionMasterId} />
            <input type="hidden" name="subcategoryCode" value={subcategoryCode} />
            <input type="hidden" name="description" value={combinedDescription} />
            <input type="hidden" name="quantityUnit" value={quantityUnit} />
            
            <Tabs defaultValue="base-data" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="base-data"><List className="mr-2"/>Βασικά & Εγκεκριμένα</TabsTrigger>
                    <TabsTrigger value="costs"><Edit className="mr-2"/>Ανάλυση Κόστους (Έξοδα)</TabsTrigger>
                </TabsList>
                <TabsContent value="base-data" className="mt-4">
                   <BaseDataFields
                        state={state}
                        customLists={customLists}
                        customListItems={customListItems}
                        description={description}
                        setDescription={setDescription}
                        subcategoryCode={subcategoryCode}
                        setSubcategoryCode={setSubcategoryCode}
                        energySpec={energySpec}
                        setEnergySpec={setEnergySpec}
                        quantityUnit={quantityUnit}
                        setQuantityUnit={setQuantityUnit}
                   />
                </TabsContent>
                <TabsContent value="costs" className="mt-4">
                    <CostAnalysisFields
                        state={state}
                        quantityUnit={quantityUnit}
                    />
                </TabsContent>
            </Tabs>
            
            <div className="mt-6">
                 <SubmitButton text="Προσθήκη" pendingText="Προσθήκη..." />
            </div>
        </form>
    );
}
