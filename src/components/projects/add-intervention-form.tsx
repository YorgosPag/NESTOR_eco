
"use client";

import { useEffect, useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { addInterventionAction } from '@/app/actions/projects';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle } from 'lucide-react';
import { SearchableSelect } from '../ui/searchable-select';
import type { CustomList, CustomListItem } from '@/types';
import { Separator } from '../ui/separator';
import { CreateItemDialog } from '../admin/custom-lists/create-item-dialog';

const initialState = {
  message: null,
  errors: {},
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full mt-4">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Προσθήκη Παρέμβασης"}
    </Button>
  );
}

interface AddInterventionFormProps {
    projectId: string;
    setOpen: (open: boolean) => void;
    customLists: CustomList[];
    customListItems: CustomListItem[];
}

export function AddInterventionForm({ projectId, setOpen, customLists, customListItems }: AddInterventionFormProps) {
  const [state, formAction] = useActionState(addInterventionAction, initialState);
  const { toast } = useToast();
  const [interventionName, setInterventionName] = useState('');

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
  
  const interventionTitlesList = customLists.find(l => l.key === 'INTERVENTION_TITLES' || l.name?.toLowerCase() === 'τίτλοι παρεμβάσεων'.toLowerCase());
  const interventionTitleOptions = interventionTitlesList ? customListItems.filter(item => item.listId === interventionTitlesList.id).map(item => ({ value: item.name, label: item.name })).sort((a, b) => a.label.localeCompare(b.label)) : [];

  return (
    <form action={formAction} className="space-y-4 pt-4">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="interventionName" value={interventionName} />
      
      <div className="space-y-2">
          <Label htmlFor="interventionName-select">Τίτλος Παρέμβασης</Label>
          <SearchableSelect
            value={interventionName}
            onValueChange={setInterventionName}
            options={interventionTitleOptions}
            placeholder="Επιλέξτε τίτλο..."
            searchPlaceholder="Αναζήτηση τίτλου..."
            emptyMessage='Η λίστα "τίτλοι παρεμβάσεων" είναι κενή.'
          >
            {interventionTitlesList && (
              <>
                <Separator className="my-1"/>
                <CreateItemDialog listId={interventionTitlesList.id}>
                    <div onMouseDown={(e) => e.preventDefault()} className="flex cursor-pointer select-none items-center gap-2 rounded-sm p-2 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        <span>Προσθήκη Νέου Τίτλου...</span>
                    </div>
                </CreateItemDialog>
              </>
            )}
          </SearchableSelect>
          {state.errors?.interventionName && <p className="text-sm font-medium text-destructive mt-1">{state.errors.interventionName[0]}</p>}
      </div>
      
      <SubmitButton />
    </form>
  );
}
