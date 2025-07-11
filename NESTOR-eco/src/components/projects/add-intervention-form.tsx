
"use client";

import { useEffect, useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { addInterventionAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import type { MasterIntervention } from '@/types';

const initialState = {
  message: null,
  errors: {},
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full mt-4">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Προσθήκη Παρέμβασης στο Έργο"}
    </Button>
  );
}

interface AddInterventionFormProps {
  projectId: string;
  setOpen: (open: boolean) => void;
  masterInterventions: MasterIntervention[];
}

export function AddInterventionForm({ projectId, setOpen, masterInterventions }: AddInterventionFormProps) {
  const [state, formAction] = useActionState(addInterventionAction, initialState);
  const { toast } = useToast();

  const [selectedId, setSelectedId] = useState('');
  const [quantity, setQuantity] = useState(0);

  const selectedMaster = masterInterventions.find(i => i.id === selectedId);
  const totalCost = selectedMaster ? Math.min(quantity * selectedMaster.maxUnitPrice, selectedMaster.maxAmount) : 0;
  
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
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="projectId" value={projectId} />
      
      <div className="space-y-2">
        <Label htmlFor="masterId">Επιλογή Παρέμβασης</Label>
        <Select name="masterId" onValueChange={setSelectedId} required>
          <SelectTrigger id="masterId">
            <SelectValue placeholder="Επιλέξτε από τη λίστα..." />
          </SelectTrigger>
          <SelectContent>
            {masterInterventions.map(inter => (
              <SelectItem key={inter.id} value={inter.id}>{inter.interventionCategory} {inter.interventionSubcategory ? `- ${inter.interventionSubcategory}` : ''}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state.errors?.masterId && <p className="text-sm font-medium text-destructive mt-1">{state.errors.masterId[0]}</p>}
      </div>

      {selectedMaster && (
        <>
          <Card className="bg-muted/50">
            <CardHeader className="pb-4">
               <CardTitle className="text-base">{selectedMaster.interventionCategory}</CardTitle>
               <CardDescription>{selectedMaster.expenseCategory}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                  <Label htmlFor="quantity">Ποσότητα ({selectedMaster.unit.split('/')[1]})</Label>
                  <Input id="quantity" name="quantity" type="number" step="0.1" required value={quantity} onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)} />
                  {state.errors?.quantity && <p className="text-sm font-medium text-destructive mt-1">{state.errors.quantity[0]}</p>}
              </div>

              {selectedMaster.energySpecsOptions && selectedMaster.energySpecsOptions.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="selectedEnergySpec">Ενεργειακά Χαρακτηριστικά</Label>
                  <Select name="selectedEnergySpec">
                      <SelectTrigger id="selectedEnergySpec">
                          <SelectValue placeholder="Επιλέξτε χαρακτηριστικό..."/>
                      </SelectTrigger>
                      <SelectContent>
                          {selectedMaster.energySpecsOptions.map(spec => <SelectItem key={spec} value={spec}>{spec}</SelectItem>)}
                      </SelectContent>
                  </Select>
                </div>
              )}
              {selectedMaster.systemClassOptions && selectedMaster.systemClassOptions.length > 0 &&(
                <div className="space-y-2">
                  <Label htmlFor="selectedSystemClass">Κλάση Συστήματος</Label>
                  <Select name="selectedSystemClass">
                      <SelectTrigger id="selectedSystemClass">
                          <SelectValue placeholder="Επιλέξτε κλάση..."/>
                      </SelectTrigger>
                      <SelectContent>
                          {selectedMaster.systemClassOptions.map(cls => <SelectItem key={cls} value={cls}>{cls}</SelectItem>)}
                      </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between items-center text-sm bg-muted/20 p-4">
              <div className="text-muted-foreground">
                  <p>Μέγ. Κόστος/Μονάδα: €{selectedMaster.maxUnitPrice.toLocaleString('el-GR')}</p>
                  <p>Μέγ. Δαπάνη: €{selectedMaster.maxAmount.toLocaleString('el-GR')}</p>
              </div>
              <div className="text-right">
                  <p className="text-muted-foreground">Υπολογιζόμενο Κόστος</p>
                  <p className="font-bold text-lg">€{totalCost.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </CardFooter>
          </Card>
          <SubmitButton />
        </>
      )}
    </form>
  );
}
