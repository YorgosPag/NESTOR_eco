
"use client";

import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { FormState } from "./types";

interface IdInfoSectionProps {
    state: FormState;
}

export function IdInfoSection({ state }: IdInfoSectionProps) {
    return (
        <AccordionItem value="id-info">
            <AccordionTrigger className="text-md font-semibold bg-muted/50 hover:bg-muted px-4 rounded-md">Στοιχεία Ταυτότητας & ΑΦΜ</AccordionTrigger>
            <AccordionContent className="pt-4 px-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="vatNumber">Α.Φ.Μ.</Label>
                        <Input id="vatNumber" name="vatNumber" placeholder="π.χ., 123456789" />
                        {state.errors?.vatNumber && <p className="text-sm font-medium text-destructive mt-1">{state.errors.vatNumber[0]}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="idNumber">Α.Δ. Ταυτότητας</Label>
                        <Input id="idNumber" name="idNumber" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="idIssueDate">Ημερομηνία Έκδοσης</Label>
                        <Input id="idIssueDate" name="idIssueDate" type="date" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="idIssuingAuthority">Αρχή Έκδοσης</Label>
                        <Input id="idIssuingAuthority" name="idIssuingAuthority" />
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
