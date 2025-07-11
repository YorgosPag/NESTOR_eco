
"use client";

import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { createTriggerAction } from '@/app/actions/admin';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, PlusCircle } from 'lucide-react';
import type { CustomList, CustomListItem } from '@/types';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Separator } from '@/components/ui/separator';
import { CreateItemDialog } from '@/components/admin/custom-lists/create-item-dialog';

const initialState = {
  message: null,
  errors: {},
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Δημιουργία Trigger"}
    </Button>
  );
}

interface CreateTriggerFormProps {
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

export function CreateTriggerForm({ setOpen, customLists, customListItems }: CreateTriggerFormProps) {
    const [state, formAction] = useFormState(createTriggerAction, initialState);
    const { toast } = useToast();
    const [code, setCode] = useState('');
    const [interventionCategory, setInterventionCategory] = useState('');


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

    const codeList = customLists.find(l => l.key === 'CODE' || l.name?.toLowerCase() === 'Κωδικός'.toLowerCase());
    const codeListItems = codeList ? customListItems.filter(item => item.listId === codeList.id) : [];
    const codeOptions = codeListItems.map(item => ({ value: item.name, label: item.name })).sort((a,b) => a.label.localeCompare(b.label));

    const interventionCategoryList = customLists.find(l => l.key === 'INTERVENTION_CATEGORY' || l.name?.toLowerCase() === 'Κατηγορία Παρέμβασης'.toLowerCase());
    const interventionCategoryItems = interventionCategoryList ? customListItems.filter(item => item.listId === interventionCategoryList.id) : [];
    const interventionCategoryOptions = interventionCategoryItems.map(item => ({ value: item.name, label: item.name })).sort((a,b) => a.label.localeCompare(b.label));


    return (
        <form action={formAction} className="space-y-4 pt-4">
             <input type="hidden" name="code" value={code} />
             <input type="hidden" name="interventionCategory" value={interventionCategory} />
            <div className="space-y-2">
                <Label htmlFor="name">Όνομα Trigger</Label>
                <Input id="name" name="name" placeholder="π.χ., Ειδοποίηση Ολοκλήρωσης" required />
                {state.errors?.name && <p className="text-sm font-medium text-destructive mt-1">{state.errors.name[0]}</p>}
            </div>
             <div className="space-y-2">
                <Label htmlFor="code-select">Κωδικός Παρέμβασης</Label>
                <SearchableSelect
                    value={code}
                    onValueChange={setCode}
                    options={codeOptions}
                    placeholder="Επιλέξτε κωδικό..."
                    searchPlaceholder="Αναζήτηση κωδικού..."
                    emptyMessage='Η λίστα "Κωδικός" είναι κενή.'
                >
                    {codeList && <DialogChild listId={codeList.id} text="Προσθήκη Νέου Κωδικού..."/>}
                </SearchableSelect>
                 {state.errors?.code && <p className="text-sm font-medium text-destructive mt-1">{state.errors.code[0]}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="interventionCategory-select">Κατηγορία Παρέμβασης</Label>
                <SearchableSelect
                    value={interventionCategory}
                    onValueChange={setInterventionCategory}
                    options={interventionCategoryOptions}
                    placeholder="Επιλέξτε κατηγορία..."
                    searchPlaceholder="Αναζήτηση κατηγορίας..."
                    emptyMessage='Η λίστα "Κατηγορία Παρέμβασης" είναι κενή.'
                >
                    {interventionCategoryList && <DialogChild listId={interventionCategoryList.id} text="Προσθήκη Νέας Κατηγορίας..."/>}
                </SearchableSelect>
                 {state.errors?.interventionCategory && <p className="text-sm font-medium text-destructive mt-1">{state.errors.interventionCategory[0]}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Περιγραφή (Προαιρετικό)</Label>
                <Textarea id="description" name="description" rows={3} />
            </div>
            <SubmitButton />
        </form>
    );
}
