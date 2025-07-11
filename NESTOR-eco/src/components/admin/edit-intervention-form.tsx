
"use client";

import { useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateMasterInterventionAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import type { MasterIntervention } from '@/types';
import { expenseCategories, units } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

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

interface EditInterventionFormProps {
    intervention: MasterIntervention;
    setOpen: (open: boolean) => void;
}

export function EditInterventionForm({ intervention, setOpen }: EditInterventionFormProps) {
    const [state, formAction] = useActionState(updateMasterInterventionAction, initialState);
    const { toast } = useToast();

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

    return (
        <form action={formAction} className="space-y-4 pt-4">
            <input type="hidden" name="id" value={intervention.id} />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="id">ID Παρέμβασης</Label>
                    <Input id="id" name="id" defaultValue={intervention.id} required disabled />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="expenseCategory">Κατηγορία Δαπάνης</Label>
                    <Select name="expenseCategory" defaultValue={intervention.expenseCategory} required>
                      <SelectTrigger><SelectValue placeholder="Επιλέξτε..." /></SelectTrigger>
                      <SelectContent>
                        {expenseCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {state.errors?.expenseCategory && <p className="text-sm font-medium text-destructive mt-1">{state.errors.expenseCategory[0]}</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="interventionCategory">Κατηγορία Παρέμβασης (Κύριος Τίτλος)</Label>
                    <Input id="interventionCategory" name="interventionCategory" defaultValue={intervention.interventionCategory} required />
                    {state.errors?.interventionCategory && <p className="text-sm font-medium text-destructive mt-1">{state.errors.interventionCategory[0]}</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="interventionSubcategory">Υποκατηγορία Παρέμβασης (Προαιρετικό)</Label>
                    <Input id="interventionSubcategory" name="interventionSubcategory" defaultValue={intervention.interventionSubcategory} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="maxUnitPrice">Μέγ. Κόστος/Μονάδα (€)</Label>
                    <Input id="maxUnitPrice" name="maxUnitPrice" type="number" step="0.01" defaultValue={intervention.maxUnitPrice} required />
                    {state.errors?.maxUnitPrice && <p className="text-sm font-medium text-destructive mt-1">{state.errors.maxUnitPrice[0]}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="maxAmount">Μέγ. Επιλέξιμη Δαπάνη (€)</Label>
                    <Input id="maxAmount" name="maxAmount" type="number" step="0.01" defaultValue={intervention.maxAmount} required />
                    {state.errors?.maxAmount && <p className="text-sm font-medium text-destructive mt-1">{state.errors.maxAmount[0]}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="unit">Μονάδα Μέτρησης</Label>
                    <Select name="unit" defaultValue={intervention.unit} required>
                      <SelectTrigger><SelectValue placeholder="Επιλέξτε..." /></SelectTrigger>
                      <SelectContent>
                        {units.map(unit => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {state.errors?.unit && <p className="text-sm font-medium text-destructive mt-1">{state.errors.unit[0]}</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="energySpecsOptions">Επιλογές Ενεργ. Χαρακτηριστικών (χωρισμένες με κόμμα)</Label>
                    <Input id="energySpecsOptions" name="energySpecsOptions" defaultValue={intervention.energySpecsOptions?.join(', ')} placeholder="π.χ., U < 2.0, 2.0 ≤ U < 2.5" />
                </div>
                 <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="systemClassOptions">Επιλογές Κλάσης Συστήματος (χωρισμένες με κόμμα)</Label>
                    <Input id="systemClassOptions" name="systemClassOptions" defaultValue={intervention.systemClassOptions?.join(', ')} placeholder="π.χ., Class A, Class B" />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notes">Σημειώσεις</Label>
                    <Textarea id="notes" name="notes" defaultValue={intervention.notes} rows={3} />
                </div>
            </div>
            <SubmitButton />
        </form>
    );
}
