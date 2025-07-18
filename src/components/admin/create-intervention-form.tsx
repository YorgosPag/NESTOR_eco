
"use client";

import { useEffect, useState } from 'react';
import { useActionState, useFormStatus } from 'react-dom';
import { createMasterInterventionAction } from '@/app/actions/master-interventions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle } from 'lucide-react';
import { type CustomList, type CustomListItem } from '@/types';
import { SearchableSelect } from '../ui/searchable-select';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { CreateItemDialog } from './custom-lists/create-item-dialog';

const initialState = {
  message: null,
  errors: {},
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Δημιουργία Παρέμβασης"}
    </Button>
  );
}

interface CreateInterventionFormProps {
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

export function CreateInterventionForm({ setOpen, customLists, customListItems }: CreateInterventionFormProps) {
    const [state, formAction] = useActionState(createMasterInterventionAction, initialState);
    const { toast } = useToast();

    const [info, setInfo] = useState('');
    const [energySpecsOptions, setEnergySpecsOptions] = useState('');
    const [expenseCategory, setExpenseCategory] = useState('');
    const [interventionCategory, setInterventionCategory] = useState('');
    const [code, setCode] = useState('');
    const [interventionSubcategory, setInterventionSubcategory] = useState('');
    const [unit, setUnit] = useState('');


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

    const getListAndOptions = (listKey: string, legacyName: string) => {
        const list = customLists.find(l => l.key === listKey || (legacyName && l.name?.toLowerCase() === legacyName.toLowerCase()));
        if (!list) return { list: null, options: [] };
        const options = customListItems
            .filter(item => item.listId === list.id)
            .map(item => ({ value: item.name, label: item.name }))
            .sort((a, b) => a.label.localeCompare(b.label));
        return { list, options };
    };

    const { list: infoList, options: infoOptions } = getListAndOptions('INFO', 'info');
    const { list: energySpecsList, options: energySpecsOptionsList } = getListAndOptions('ENERGY_SPECS', 'Ενεργειακά Χαρακτηριστικά');
    const { list: expenseCategoryList, options: expenseCategoryOptions } = getListAndOptions('EXPENSE_CATEGORY', 'Κατηγορία Δαπάνης');
    const { list: interventionCategoryList, options: interventionCategoryOptions } = getListAndOptions('INTERVENTION_CATEGORY', 'Κατηγορία Παρέμβασης');
    const { list: codeList, options: codeOptions } = getListAndOptions('CODE', 'Κωδικός');
    const { list: subcategoryList, options: interventionSubcategoryOptions } = getListAndOptions('SUB_INTERVENTION_CATEGORY', 'Υπο-Κατηγορία Παρέμβασης');
    const { list: unitList, options: unitOptions } = getListAndOptions('UNIT_OF_MEASUREMENT', 'Μονάδες Μέτρησης');


    return (
        <form action={formAction} className="space-y-4 pt-4">
             <input type="hidden" name="info" value={info} />
             <input type="hidden" name="energySpecsOptions" value={energySpecsOptions} />
             <input type="hidden" name="expenseCategory" value={expenseCategory} />
             <input type="hidden" name="interventionCategory" value={interventionCategory} />
             <input type="hidden" name="code" value={code} />
             <input type="hidden" name="interventionSubcategory" value={interventionSubcategory} />
             <input type="hidden" name="unit" value={unit} />
            
            <div className="space-y-2">
                <Label htmlFor="info-select">Info</Label>
                <SearchableSelect
                    value={info}
                    onValueChange={setInfo}
                    options={infoOptions}
                    placeholder="Επιλέξτε info..."
                    searchPlaceholder="Αναζήτηση..."
                    emptyMessage='Η λίστα "info" είναι κενή.'
                >
                    {infoList && <DialogChild listId={infoList.id} text="Προσθήκη Νέου Info..."/>}
                </SearchableSelect>
                {state.errors?.info && <p className="text-sm font-medium text-destructive mt-1">{state.errors.info[0]}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="energySpecsOptions-select">Ενεργειακά Χαρακτηριστικά</Label>
                <SearchableSelect
                    value={energySpecsOptions}
                    onValueChange={setEnergySpecsOptions}
                    options={energySpecsOptionsList}
                    placeholder="Επιλέξτε χαρακτηριστικά..."
                    searchPlaceholder="Αναζήτηση..."
                    emptyMessage='Η λίστα "Ενεργειακά Χαρακτηριστικά" είναι κενή.'
                >
                    {energySpecsList && <DialogChild listId={energySpecsList.id} text="Προσθήκη Νέου Χαρακτηριστικού..."/>}
                </SearchableSelect>
                {state.errors?.energySpecsOptions && <p className="text-sm font-medium text-destructive mt-1">{state.errors.energySpecsOptions[0]}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="expenseCategory-select">Κατηγορία Δαπάνης</Label>
                <SearchableSelect
                    value={expenseCategory}
                    onValueChange={setExpenseCategory}
                    options={expenseCategoryOptions}
                    placeholder="Επιλέξτε κατηγορία..."
                    searchPlaceholder="Αναζήτηση..."
                    emptyMessage='Η λίστα "Κατηγορία Δαπάνης" είναι κενή.'
                >
                     {expenseCategoryList && <DialogChild listId={expenseCategoryList.id} text="Προσθήκη Νέας Κατ. Δαπάνης..."/>}
                </SearchableSelect>
                {state.errors?.expenseCategory && <p className="text-sm font-medium text-destructive mt-1">{state.errors.expenseCategory[0]}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="interventionCategory-select">Κατηγορία Παρέμβασης</Label>
                <SearchableSelect
                    value={interventionCategory}
                    onValueChange={setInterventionCategory}
                    options={interventionCategoryOptions}
                    placeholder="Επιλέξτε κατηγορία..."
                    searchPlaceholder="Αναζήτηση..."
                    emptyMessage='Η λίστα "Κατηγορία Παρέμβασης" είναι κενή.'
                >
                    {interventionCategoryList && <DialogChild listId={interventionCategoryList.id} text="Προσθήκη Νέας Κατ. Παρέμβασης..."/>}
                </SearchableSelect>
                {state.errors?.interventionCategory && <p className="text-sm font-medium text-destructive mt-1">{state.errors.interventionCategory[0]}</p>}
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="code-select">Κωδικός</Label>
                <SearchableSelect
                    value={code}
                    onValueChange={setCode}
                    options={codeOptions}
                    placeholder="Επιλέξτε κωδικό..."
                    searchPlaceholder="Αναζήτηση..."
                    emptyMessage='Η λίστα "Κωδικός" είναι κενή.'
                >
                     {codeList && <DialogChild listId={codeList.id} text="Προσθήκη Νέου Κωδικού..."/>}
                </SearchableSelect>
                {state.errors?.code && <p className="text-sm font-medium text-destructive mt-1">{state.errors.code[0]}</p>}
            </div>
            
             <div className="space-y-2">
                <Label htmlFor="unit-select">Μονάδα Μέτρησης</Label>
                <SearchableSelect
                    value={unit}
                    onValueChange={setUnit}
                    options={unitOptions}
                    placeholder="Επιλέξτε μονάδα..."
                    searchPlaceholder="Αναζήτηση..."
                    emptyMessage='Η λίστα "Μονάδες Μέτρησης" είναι κενή.'
                >
                    {unitList && <DialogChild listId={unitList.id} text="Προσθήκη Νέας Μονάδας..."/>}
                </SearchableSelect>
                {state.errors?.unit && <p className="text-sm font-medium text-destructive mt-1">{state.errors.unit[0]}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="maxUnitPrice">Μέγιστο Κόστος/Μονάδα</Label>
                <Input id="maxUnitPrice" name="maxUnitPrice" type="number" step="0.01" placeholder="π.χ., 320.50" required />
                {state.errors?.maxUnitPrice && <p className="text-sm font-medium text-destructive mt-1">{state.errors.maxUnitPrice[0]}</p>}
            </div>

             <div className="space-y-2">
                <Label htmlFor="maxAmount">Μέγιστο Ποσό Παρέμβασης</Label>
                <Input id="maxAmount" name="maxAmount" type="number" step="0.01" placeholder="π.χ., 10000.00" required />
                {state.errors?.maxAmount && <p className="text-sm font-medium text-destructive mt-1">{state.errors.maxAmount[0]}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="interventionSubcategory-select">Υπο-Κατηγορία Παρέμβασης</Label>
                <SearchableSelect
                    value={interventionSubcategory}
                    onValueChange={setInterventionSubcategory}
                    options={interventionSubcategoryOptions}
                    placeholder="Επιλέξτε υπο-κατηγορία..."
                    searchPlaceholder="Αναζήτηση..."
                    emptyMessage='Η λίστα "Υπο-Κατηγορία Παρέμβασης" είναι κενή.'
                >
                    {subcategoryList && <DialogChild listId={subcategoryList.id} text="Προσθήκη Νέας Υπο-κατηγορίας..."/>}
                </SearchableSelect>
                {state.errors?.interventionSubcategory && <p className="text-sm font-medium text-destructive mt-1">{state.errors.interventionSubcategory[0]}</p>}
            </div>

            <SubmitButton />
        </form>
    );
}
