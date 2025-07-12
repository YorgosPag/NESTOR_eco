
"use client";

import { useEffect, useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateStageAction } from '@/app/actions/projects';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, PlusCircle } from 'lucide-react';
import type { Stage, Contact } from '@/types';
import { Separator } from '../ui/separator';
import { CreateContactDialog } from '../contacts/create-contact-dialog';
import { SearchableSelect } from '../ui/searchable-select';

const initialState = {
  message: null,
  errors: {},
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Αποθήκευση Αλλαγών"}
    </Button>
  );
}

interface EditStageFormProps {
    stage: Stage;
    projectId: string;
    contacts: Contact[];
    setOpen: (open: boolean) => void;
}

export function EditStageForm({ stage, projectId, contacts, setOpen }: EditStageFormProps) {
    const [state, formAction] = useActionState(updateStageAction, initialState);
    const { toast } = useToast();
    const [assigneeContactId, setAssigneeContactId] = useState(stage.assigneeContactId);
    const [supervisorContactId, setSupervisorContactId] = useState(stage.supervisorContactId);


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

    const formattedDeadline = stage.deadline.substring(0, 10);

     const contactOptions = [
        { value: 'none', label: 'Καμία ανάθεση' },
        ...contacts.map(contact => ({
            value: contact.id,
            label: `${contact.firstName} ${contact.lastName} (${contact.role})`
        })).sort((a,b) => a.label.localeCompare(b.label))
    ];

    return (
        <form action={formAction} className="space-y-4 pt-4">
            <input type="hidden" name="projectId" value={projectId} />
            <input type="hidden" name="stageId" value={stage.id} />
             <input type="hidden" name="assigneeContactId" value={assigneeContactId} />
             <input type="hidden" name="supervisorContactId" value={supervisorContactId} />


            <div className="space-y-2">
                <Label htmlFor="title">Τίτλος Σταδίου</Label>
                <Input id="title" name="title" defaultValue={stage.title} required />
                {state.errors?.title && <p className="text-sm font-medium text-destructive mt-1">{state.errors.title[0]}</p>}
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="deadline">Προθεσμία</Label>
                <Input id="deadline" name="deadline" type="date" defaultValue={formattedDeadline} required />
                 {state.errors?.deadline && <p className="text-sm font-medium text-destructive mt-1">{state.errors.deadline[0]}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="assigneeContactId-select">Ανάδοχος Εργασίας (Εργολάβος/Συνεργείο)</Label>
                <SearchableSelect
                    value={assigneeContactId}
                    onValueChange={setAssigneeContactId}
                    options={contactOptions}
                    placeholder="Επιλέξτε ανάδοχο..."
                    searchPlaceholder="Αναζήτηση επαφής..."
                    emptyMessage="Δεν βρέθηκε επαφή."
                >
                    <Separator className="my-1"/>
                    <CreateContactDialog customLists={[]} customListItems={[]}>
                        <div onMouseDown={(e) => e.preventDefault()} className="flex cursor-pointer select-none items-center gap-2 rounded-sm p-2 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            <span>Δημιουργία Νέας Επαφής</span>
                        </div>
                    </CreateContactDialog>
                </SearchableSelect>
            </div>

            <div className="space-y-2">
                <Label htmlFor="supervisorContactId-select">Επιβλέπων (Μηχανικός Εταιρείας)</Label>
                <SearchableSelect
                    value={supervisorContactId}
                    onValueChange={setSupervisorContactId}
                    options={contactOptions}
                    placeholder="Επιλέξτε επιβλέποντα..."
                    searchPlaceholder="Αναζήτηση επαφής..."
                    emptyMessage="Δεν βρέθηκε επαφή."
                >
                    <Separator className="my-1"/>
                    <CreateContactDialog customLists={[]} customListItems={[]}>
                        <div onMouseDown={(e) => e.preventDefault()} className="flex cursor-pointer select-none items-center gap-2 rounded-sm p-2 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            <span>Δημιουργία Νέας Επαφής</span>
                        </div>
                    </CreateContactDialog>
                </SearchableSelect>
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Σημειώσεις</Label>
                <Textarea id="notes" name="notes" defaultValue={stage.notes} placeholder="Προσθέστε σημειώσεις..." rows={3} />
                 {state.errors?.notes && <p className="text-sm font-medium text-destructive mt-1">{state.errors.notes[0]}</p>}
            </div>
            
            <SubmitButton />
        </form>
    );
}
