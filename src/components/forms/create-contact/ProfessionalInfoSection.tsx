
"use client";

import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { DialogChild } from "./DialogChild";
import type { CustomList, CustomListItem } from "@/types";
import type { FormState } from "./types";

interface ProfessionalInfoSectionProps {
    state: FormState;
    role: string;
    setRole: (value: string) => void;
    customLists: CustomList[];
    customListItems: CustomListItem[];
}

export function ProfessionalInfoSection({ state, role, setRole, customLists, customListItems }: ProfessionalInfoSectionProps) {
    const contactRolesList = customLists.find(l => l.key === 'CONTACT_ROLES' || l.name === 'Ρόλοι Επαφών');
    const contactRoleOptions = contactRolesList
        ? customListItems
            .filter(item => item.listId === contactRolesList.id)
            .map(item => ({ value: item.name, label: item.name }))
            .sort((a,b) => a.label.localeCompare(b.label))
        : [];

    return (
        <AccordionItem value="professional-info">
            <AccordionTrigger className="text-md font-semibold bg-muted/50 hover:bg-muted px-4 rounded-md">Επαγγελματικά Στοιχεία</AccordionTrigger>
            <AccordionContent className="pt-4 px-1 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="role-select">Ρόλος</Label>
                    <SearchableSelect
                        value={role}
                        onValueChange={setRole}
                        options={contactRoleOptions}
                        placeholder="Επιλέξτε ρόλο..."
                        searchPlaceholder="Αναζήτηση ρόλου..."
                        emptyMessage="Δεν βρέθηκε ρόλος. Δημιουργήστε τη λίστα 'Ρόλοι Επαφών' από τη Διαχείριση."
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
            </AccordionContent>
        </AccordionItem>
    );
}
