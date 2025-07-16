

"use client";

import { useEffect, useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateSubInterventionAction } from '@/app/actions/sub-interventions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle, Edit, List, ClipboardCheck } from 'lucide-react';
import type { SubIntervention, CustomList, CustomListItem } from '@/types';
import { SearchableSelect } from '../ui/searchable-select';
import { Separator } from '../ui/separator';
import { CreateItemDialog } from '../admin/custom-lists/create-item-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from '../ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

const initialState = {
  message: null,
  errors: {},
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full mt-6">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Αποθήκευση Αλλαγών"}
    </Button>
  );
}

interface EditSubInterventionFormProps {
    interventionMasterId: string;
    projectId: string;
    subIntervention: SubIntervention;
    setOpen: (open: boolean) => void;
    customLists: CustomList[];
    customListItems: CustomListItem[];
}

const DialogChild = ({listId, text}: {listId: string, text: string}) => (
    <>
        <Separator className="my-1"/>
        <CreateItemDialog listId={listId}>
            <div onMouseDown={(e) => e.preventDefault()} className="flex cursor-pointer select-none items-center gap-2 rounded-sm p-2 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                <PlusCircle className="h-4 w-4 mr-2" />
                <span>{text}</span>
            </div>
        </CreateItemDialog>
    </>
);

const parseDescription = (fullDescription: string) => {
    const parts = fullDescription.split(' - ');
    if (parts.length > 1) {
        const energySpec = parts.pop() || '';
        const description = parts.join(' - ');
        return { description, energySpec };
    }
    return { description: fullDescription, energySpec: '' };
};


export function EditSubInterventionForm({ interventionMasterId, projectId, subIntervention, setOpen, customLists, customListItems }: EditSubInterventionFormProps) {
    const [state, formAction] = useActionState(updateSubInterventionAction, initialState);
    const { toast } = useToast();
    
    const { description: initialDescription, energySpec: initialEnergySpec } = parseDescription(subIntervention.description);
    
    const [subcategoryCode, setSubcategoryCode] = useState(subIntervention.subcategoryCode);
    const [expenseCategory, setExpenseCategory] = useState(subIntervention.expenseCategory || '');
    const [description, setDescription] = useState(initialDescription);
    const [energySpec, setEnergySpec] = useState(initialEnergySpec);
    const [quantityUnit, setQuantityUnit] = useState(subIntervention.quantityUnit || '');

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
    
    const getListAndOptions = (key: string, name: string) => {
        const list = customLists.find(l => l.key === key || l.name?.toLowerCase() === name.toLowerCase());
        if (!list) return { list: null, options: [] };
        const options = customListItems
            .filter(item => item.listId === list.id)
            .map(item => ({ value: item.name, label: item.name }))
            .sort((a, b) => a.label.localeCompare(b.label));
        return { list, options };
    };

    const { list: codeList, options: codeOptions } = getListAndOptions('CODE', 'Κωδικός');
    const { list: expenseCategoryList, options: expenseCategoryOptions } = getListAndOptions('EXPENSE_CATEGORY', 'Κατηγορία Δαπάνης');
    const { list: descriptionList, options: descriptionOptions } = getListAndOptions('SUB_INTERVENTION_CATEGORY', 'Υπο-Κατηγορία Παρέμβασης');
    const { list: energySpecList, options: energySpecOptions } = getListAndOptions('ENERGY_SPECS', 'Ενεργειακά Χαρακτηριστικά');
    const { list: unitList, options: unitOptions } = getListAndOptions('UNIT_OF_MEASUREMENT', 'Μονάδες Μέτρησης');


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
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                           <div className="space-y-2">
                                <Label htmlFor="description-static">Περιγραφή</Label>
                                <p id="description-static" className="text-sm text-muted-foreground p-2 border rounded-md min-h-[40px] bg-muted">
                                    {initialDescription || "Δεν έχει οριστεί"}
                                </p>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="subcategoryCode-select">Κωδικός Υποκατηγορίας</Label>
                                <SearchableSelect
                                    value={subcategoryCode}
                                    onValueChange={setSubcategoryCode}
                                    options={codeOptions}
                                    placeholder="Επιλέξτε κωδικό..."
                                    searchPlaceholder="Αναζήτηση..."
                                    emptyMessage='Η λίστα "Κωδικός" είναι κενή.'
                                >
                                    {codeList && <DialogChild listId={codeList.id} text="Προσθήκη Νέου Κωδικού..."/>}
                                </SearchableSelect>
                                {state.errors?.subcategoryCode && <p className="text-sm font-medium text-destructive mt-1">{state.errors.subcategoryCode[0]}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="expenseCategory-select">Κατηγορία Δαπάνης</Label>
                                <SearchableSelect
                                    value={expenseCategory}
                                    onValueChange={setExpenseCategory}
                                    options={expenseCategoryOptions}
                                    placeholder="Επιλέξτε κατηγορία δαπάνης..."
                                    searchPlaceholder="Αναζήτηση..."
                                    emptyMessage='Η λίστα "Κατηγορία Δαπάνης" είναι κενή.'
                                >
                                    {expenseCategoryList && <DialogChild listId={expenseCategoryList.id} text="Προσθήκη Νέας Κατ. Δαπάνης..."/>}
                                </SearchableSelect>
                                {state.errors?.expenseCategory && <p className="text-sm font-medium text-destructive mt-1">{state.errors.expenseCategory[0]}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="energySpec-select">Ενεργειακά Χαρακτηριστικά</Label>
                                <SearchableSelect
                                    value={energySpec}
                                    onValueChange={setEnergySpec}
                                    options={energySpecOptions}
                                    placeholder="Επιλέξτε χαρακτηριστικά..."
                                    searchPlaceholder="Αναζήτηση..."
                                    emptyMessage='Η λίστα "Ενεργειακά Χαρακτηριστικά" είναι κενή.'
                                >
                                    {energySpecList && <DialogChild listId={energySpecList.id} text="Προσθήκη Νέου Χαρακτηριστικού..."/>}
                                </SearchableSelect>
                            </div>
                            
                            <Accordion type="single" collapsible defaultValue="approved" className="w-full pt-2">
                                <AccordionItem value="approved">
                                    <AccordionTrigger className="text-base font-semibold text-green-700 dark:text-green-400 hover:no-underline bg-green-500/10 px-4 rounded-md">
                                        <div className="flex items-center gap-2"><ClipboardCheck/>Εγκεκριμένα Στοιχεία</div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-4 px-1">
                                        <div className="space-y-4 rounded-md border p-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="quantity">Εγκεκριμένη Ποσότητα</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input id="quantity" name="quantity" type="number" step="any" placeholder="π.χ., 15.5" className="w-2/3" defaultValue={subIntervention.quantity || ''} />
                                                    <Select value={quantityUnit} onValueChange={setQuantityUnit}>
                                                        <SelectTrigger className="w-1/3">
                                                            <SelectValue placeholder="Μον." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {unitOptions.map(option => (
                                                                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                                            ))}
                                                            {unitList && <DialogChild listId={unitList.id} text="Νέα Μονάδα..."/>}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                {state.errors?.quantity && <p className="text-sm font-medium text-destructive mt-1">{state.errors.quantity[0]}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="cost">Εγκεκριμένη Τιμή Προγράμματος (άνευ ΦΠΑ)</Label>
                                                <div className="relative">
                                                    <Input id="cost" name="cost" type="number" step="0.01" defaultValue={subIntervention.cost} required className="pl-7"/>
                                                    <span className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground">€</span>
                                                </div>
                                                {state.errors?.cost && <p className="text-sm font-medium text-destructive mt-1">{state.errors.cost[0]}</p>}
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="costs" className="mt-4">
                     <Accordion type="single" collapsible defaultValue="costs" className="w-full">
                        <AccordionItem value="costs">
                             <AccordionTrigger className="text-base font-semibold text-red-700 dark:text-red-400 hover:no-underline bg-red-500/10 px-4 rounded-md">
                                <div className="flex items-center gap-2"><Edit/>Στοιχεία Κόστους Υλοποίησης (Έξοδα)</div>
                             </AccordionTrigger>
                             <AccordionContent className="pt-4 px-1">
                                <div className="space-y-4 rounded-md border p-4">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="unitCost">Κόστος Μονάδας Υλοποίησης {quantityUnit && `(€/${quantityUnit})`} (άνευ ΦΠΑ)</Label>
                                            <div className="relative">
                                                <Input id="unitCost" name="unitCost" type="number" step="0.01" defaultValue={subIntervention.unitCost || ''} placeholder="0.00" className="pl-7" />
                                                <span className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground">€</span>
                                            </div>
                                            {state.errors?.unitCost && <p className="text-sm font-medium text-destructive mt-1">{state.errors.unitCost[0]}</p>}
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="implementedQuantity">Υλοποιημένη Ποσότητα {quantityUnit && `(${quantityUnit})`}</Label>
                                            <Input id="implementedQuantity" name="implementedQuantity" type="number" step="any" defaultValue={subIntervention.implementedQuantity || ''} placeholder="0.00" />
                                            {state.errors?.implementedQuantity && <p className="text-sm font-medium text-destructive mt-1">{state.errors.implementedQuantity[0]}</p>}
                                        </div>
                                        <Separator/>
                                        <div>
                                            <Label htmlFor="costOfMaterials">Κόστος Υλικών (άνευ ΦΠΑ)</Label>
                                            <div className="relative mt-2">
                                                <Input id="costOfMaterials" name="costOfMaterials" type="number" step="0.01" defaultValue={subIntervention.costOfMaterials || ''} placeholder="0.00" className="pl-7" />
                                                <span className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground">€</span>
                                            </div>
                                            {state.errors?.costOfMaterials && <p className="text-sm font-medium text-destructive mt-1">{state.errors.costOfMaterials[0]}</p>}
                                        </div>
                                        <div>
                                            <Label htmlFor="costOfLabor">Κόστος Εργασίας (άνευ ΦΠΑ)</Label>
                                            <div className="relative mt-2">
                                                <Input id="costOfLabor" name="costOfLabor" type="number" step="0.01" defaultValue={subIntervention.costOfLabor || ''} placeholder="0.00" className="pl-7" />
                                                <span className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground">€</span>
                                            </div>
                                            {state.errors?.costOfLabor && <p className="text-sm font-medium text-destructive mt-1">{state.errors.costOfLabor[0]}</p>}
                                        </div>
                                    </div>
                                </div>
                             </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </TabsContent>
            </Tabs>
            <SubmitButton />
        </form>
    );
}

    
