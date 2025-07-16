
"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Edit } from "lucide-react";
import type { SubIntervention } from "@/types";
import type { FormState } from "./types";

interface CostAnalysisFieldsProps {
    state: FormState;
    subIntervention: SubIntervention;
    quantityUnit: string;
}

export function CostAnalysisFields({ state, subIntervention, quantityUnit }: CostAnalysisFieldsProps) {
    return (
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
    );
}
