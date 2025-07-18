
"use client";

import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FormState } from "./types";
import type { Contact } from "@/types";


interface OtherInfoSectionProps {
    state: FormState;
    contact?: Partial<Contact>;
}

export function OtherInfoSection({ state, contact = {} }: OtherInfoSectionProps) {
    return (
        <AccordionItem value="other-info">
            <AccordionTrigger className="text-md font-semibold bg-muted/50 hover:bg-muted px-4 rounded-md">Λοιπά</AccordionTrigger>
            <AccordionContent className="pt-4 px-1">
                <div className="space-y-2">
                    <Label htmlFor="notes">Σημειώσεις (Προαιρετικό)</Label>
                    <Textarea id="notes" name="notes" defaultValue={contact.notes} rows={3} />
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
