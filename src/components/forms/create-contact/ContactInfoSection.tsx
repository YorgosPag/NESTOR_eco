
"use client";

import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { FormState } from "./types";

interface ContactInfoSectionProps {
    state: FormState;
}

export function ContactInfoSection({ state }: ContactInfoSectionProps) {
    return (
        <AccordionItem value="contact-info">
            <AccordionTrigger className="text-md font-semibold bg-muted/50 hover:bg-muted px-4 rounded-md">Στοιχεία Επικοινωνίας</AccordionTrigger>
            <AccordionContent className="pt-4 px-1 space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="email@example.com" />
                    {state.errors?.email && <p className="text-sm font-medium text-destructive mt-1">{state.errors.email[0]}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="landlinePhone">Σταθερό Τηλέφωνο</Label>
                        <Input id="landlinePhone" name="landlinePhone" type="tel" placeholder="π.χ., 2101234567" />
                        {state.errors?.landlinePhone && <p className="text-sm font-medium text-destructive mt-1">{state.errors.landlinePhone[0]}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="mobilePhone">Κινητό Τηλέφωνο</Label>
                        <Input id="mobilePhone" name="mobilePhone" type="tel" placeholder="π.χ., 6912345678" />
                        {state.errors?.mobilePhone && <p className="text-sm font-medium text-destructive mt-1">{state.errors.mobilePhone[0]}</p>}
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
