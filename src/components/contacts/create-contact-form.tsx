"use client";

import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { createContactAction } from '@/app/actions/contacts';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle } from 'lucide-react';
import type { CustomList, CustomListItem } from '@/types';
import { SearchableSelect } from '../ui/searchable-select';
import { Separator } from '../ui/separator';
import { CreateItemDialog } from '../admin/custom-lists/create-item-dialog';

const initialState = {
  message: null,
  errors: {},
  success: false,
};

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

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Δημιουργία Επαφής"}
    </Button>
  );
}

export function CreateContactForm({ setOpen, customLists, customListItems }: { setOpen: (open: boolean) => void, customLists: CustomList[], customListItems: CustomListItem[] }) {
    const [state, formAction] = useFormState(createContactAction, initialState);
    const { toast } = useToast();
    const [role, setRole] = useState('');
    
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

    const contactRolesList = customLists.find(l => l.key === 'CONTACT_ROLES' || l.name === 'Ρόλοι Επαφών');
    const contactRoleOptions = contactRolesList
        ? customListItems
            .filter(item => item.listId === contactRolesList.id)
            .map(item => ({ value: item.name, label: item.name }))
            .sort((a,b) => a.label.localeCompare(b.label))
        : [];

    return (
        <form action={formAction} className="space-y-4 pt-4">
            <input type="hidden" name="role" value={role} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                  <Label htmlFor="firstName">Όνομα</Label>
                  <Input id="firstName" name="firstName" placeholder="π.χ., Γιάννης" required />
                  {state.errors?.firstName && <p className="text-sm font-medium text-destructive mt-1">{state.errors.firstName[0]}</p>}
              </div>
              <div className="space-y-2">
                  <Label htmlFor="lastName">Επώνυμο</Label>
                  <Input id="lastName" name="lastName" placeholder="π.χ., Παπαδάκης" required />
                  {state.errors?.lastName && <p className="text-sm font-medium text-destructive mt-1">{state.errors.lastName[0]}</p>}
              </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="email@example.com" />
                {state.errors?.email && <p className="text-sm font-medium text-destructive mt-1">{state.errors.email[0]}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="mobilePhone">Κινητό Τηλέφωνο</Label>
                <Input id="mobilePhone" name="mobilePhone" type="tel" placeholder="π.χ., 6912345678" />
                {state.errors?.mobilePhone && <p className="text-sm font-medium text-destructive mt-1">{state.errors.mobilePhone[0]}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="role-select">Ρόλος</Label>
                <SearchableSelect
                    value={role}
                    onValueChange={setRole}
                    options={contactRoleOptions}
                    placeholder="Επιλέξτε ρόλο..."
                    searchPlaceholder="Αναζήτηση ρόλου..."
                    emptyMessage="Δεν βρέθηκε ρόλος."
                >
                    {contactRolesList && <DialogChild listId={contactRolesList.id} text="Προσθήκη Νέου Ρόλου..."/>}
                </SearchableSelect>
                 {state.errors?.role && <p className="text-sm font-medium text-destructive mt-1">{state.errors.role[0]}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="specialty">Επάγγελμα/Ειδικότητα (Προαιρετικό)</Label>
                <Input id="specialty" name="specialty" placeholder="π.χ., Υδραυλικός" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="company">Επιχείρηση/Οργανισμός (Προαιρετικό)</Label>
                <Input id="company" name="company" placeholder="π.χ., Υδραυλικές Εγκαταστάσεις Α.Ε." />
            </div>
            <SubmitButton />
        </form>
    );
}
