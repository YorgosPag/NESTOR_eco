
"use client";

import { useEffect, useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateInterventionAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import type { Project, ProjectIntervention, MasterIntervention } from '@/types';

const initialState = {
  message: null,
  errors: {},
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full mt-4">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Αποθήκευση Αλλαγών"}
    </Button>
  );
}

interface EditInterventionFormProps {
    project: Project;
    intervention: ProjectIntervention;
    masterInterventions: MasterIntervention[];
    setOpen: (open: boolean) => void;
}

export function EditInterventionForm({ project, intervention, masterInterventions, setOpen }: EditInterventionFormProps) {
  const [state, formAction] = useActionState(updateInterventionAction, initialState);
  const { toast } = useToast();

  const [quantity, setQuantity] = useState(intervention.quantity);
  const [selectedEnergySpec, setSelectedEnergySpec] = useState(intervention.selectedEnergySpec);
  const [selectedSystemClass, setSelectedSystemClass] = useState(intervention.selectedSystemClass);

  const masterIntervention = masterInterventions.find(i => i.id === intervention.masterId);
  const totalCost = masterIntervention ? Math.min(quantity * masterIntervention.maxUnitPrice, masterIntervention.maxAmount) : 0;
  
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
  
  if (!masterIntervention) {
      return <p className='text-destructive'>Σφάλμα: Δεν βρέθηκε η βασική παρέμβαση.</p>
  }
  
  const hasCompletedStages = intervention.stages.some(s => s.status === 'completed');

  if (hasCompletedStages) {
      return (
          <div className='text-center p-4 bg-destructive/10 text-destructive rounded-md'>
              <p className='font-semibold'>Δεν επιτρέπεται η επεξεργασία παρέμβασης με ολοκληρωμένα στάδια.</p>
          </div>
      )
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="projectId" value={project.id} />
      <input type="hidden" name="interventionMasterId" value={intervention.masterId} />
      
      <Card className="bg-muted/50">
        <CardHeader className="pb-4">
            <CardTitle className="text-base">{masterIntervention.interventionCategory}</CardTitle>
            <CardDescription>{masterIntervention.expenseCategory}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
              <Label htmlFor="quantity">Ποσότητα ({masterIntervention.unit.split('/')[1]})</Label>
              <Input id="quantity" name="quantity" type="number" step="0.1" required value={quantity} onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)} />
              {state.errors?.quantity && <p className="text-sm font-medium text-destructive mt-1">{state.errors.quantity[0]}</p>}
          </div>

          {masterIntervention.energySpecsOptions && masterIntervention.energySpecsOptions.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="selectedEnergySpec">Ενεργειακά Χαρακτηριστικά</Label>
              <Select name="selectedEnergySpec" defaultValue={selectedEnergySpec} onValueChange={setSelectedEnergySpec}>
                  <SelectTrigger id="selectedEnergySpec">
                      <SelectValue placeholder="Επιλέξτε χαρακτηριστικό..."/>
                  </SelectTrigger>
                  <SelectContent>
                      {masterIntervention.energySpecsOptions.map(spec => <SelectItem key={spec} value={spec}>{spec}</SelectItem>)}
                  </SelectContent>
              </Select>
            </div>
          )}
          {masterIntervention.systemClassOptions && masterIntervention.systemClassOptions.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="selectedSystemClass">Κλάση Συστήματος</Label>
              <Select name="selectedSystemClass" defaultValue={selectedSystemClass} onValueChange={setSelectedSystemClass}>
                  <SelectTrigger id="selectedSystemClass">
                      <SelectValue placeholder="Επιλέξτε κλάση..."/>
                  </SelectTrigger>
                  <SelectContent>
                      {masterIntervention.systemClassOptions.map(cls => <SelectItem key={cls} value={cls}>{cls}</SelectItem>)}
                  </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center text-sm bg-muted/20 p-4">
          <div className="text-muted-foreground">
              <p>Μέγ. Κόστος/Μονάδα: €{masterIntervention.maxUnitPrice.toLocaleString('el-GR')}</p>
              <p>Μέγ. Δαπάνη: €{masterIntervention.maxAmount.toLocaleString('el-GR')}</p>
          </div>
          <div className="text-right">
              <p className="text-muted-foreground">Νέο Υπολογιζόμενο Κόστος</p>
              <p className="font-bold text-lg">€{totalCost.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </CardFooter>
      </Card>
      <SubmitButton />
    </form>
  );
}
