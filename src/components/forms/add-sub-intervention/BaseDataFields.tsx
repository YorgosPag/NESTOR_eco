
"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ClipboardCheck } from 'lucide-react';
import { DialogChild } from '../create-contact/DialogChild';
import type { CustomList, CustomListItem } from '@/types';
import type { FormState } from './types';


interface BaseDataFieldsProps {
    state: FormState;
    customLists: CustomList[];
    customListItems: CustomListItem[];
    description: string;
    setDescription: (value: string) => void;
    subcategoryCode: string;
    setSubcategoryCode: (value: string) => void;
    energySpec: string;
    setEnergySpec: (value: string) => void;
    quantityUnit: string;
    setQuantityUnit: (value: string) => void;
}

const getListAndOptions = (customLists: CustomList[], customListItems: CustomListItem[], key: string, name: string) => {
    const list = customLists.find(l => l.key === key || l.name?.toLowerCase() === name.toLowerCase());
    if (!list) return { list: null, options: [] };
    const options = customListItems
        .filter(item => item.listId === list.id)
        .map(item => ({ value: item.name, label: item.name }))
        .sort((a, b) => a.label.localeCompare(b.label));
    return { list, options };
};

export function BaseDataFields({
    state,
    customLists,
    customListItems,
    description,
    setDescription,
    subcategoryCode,
    setSubcategoryCode,
    energySpec,
    setEnergySpec,
    quantityUnit,
    setQuantityUnit,
}: BaseDataFieldsProps) {

    const { list: codeList, options: codeOptions } = getListAndOptions(customLists, customListItems, 'CODE', 'Κωδικός');
    const { list: descriptionList, options: descriptionOptions } = getListAndOptions(customLists, customListItems, 'SUB_INTERVENTION_CATEGORY', 'Υπο-Κατηγορία Παρέμβασης');
    const { list: energySpecList, options: energySpecOptions } = getListAndOptions(customLists, customListItems, 'ENERGY_SPECS', 'Ενεργειακά Χαρακτηριστικά');
    const { list: unitList, options: unitOptions } = getListAndOptions(customLists, customListItems, 'UNIT_OF_MEASUREMENT', 'Μονάδες Μέτρησης');


    return (
        <Card>
            <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="description-select">Περιγραφή</Label>
                    <SearchableSelect
                        value={description}
                        onValueChange={setDescription}
                        options={descriptionOptions}
                        placeholder="Επιλέξτε περιγραφή..."
                        searchPlaceholder="Αναζήτηση..."
                        emptyMessage='Η λίστα "Υπο-Κατηγορία Παρέμβασης" είναι κενή.'
                    >
                        {descriptionList && <DialogChild listId={descriptionList.id} text="Προσθήκη Νέας Περιγραφής..."/>}
                    </SearchableSelect>
                    {state.errors?.description && <p className="text-sm font-medium text-destructive mt-1">{state.errors.description[0]}</p>}
                </div>

                 <div className="space-y-2">
                    <Label htmlFor="subcategoryCode-select">Κωδικός Υποκατηγορίας</Label>
                    <SearchableSelect
                        value={subcategoryCode}
                        onValueChange={setSubcategoryCode}
                        options={codeOptions}
                        placeholder="Επιλέξτε κωδικό..."
                        searchPlaceholder="Αναζήτηση..."
                        emptyMessage='Η λίστα "Κωδικός" είναι κενή.'
                    >
                        {codeList && <DialogChild listId={codeList.id} text="Προσθήκη Νέου Κωδικού..."/>}
                    </SearchableSelect>
                    {state.errors?.subcategoryCode && <p className="text-sm font-medium text-destructive mt-1">{state.errors.subcategoryCode[0]}</p>}
                </div>

                 <div className="space-y-2">
                    <Label htmlFor="energySpec-select">Ενεργειακά Χαρακτηριστικά</Label>
                    <SearchableSelect
                        value={energySpec}
                        onValueChange={setEnergySpec}
                        options={energySpecOptions}
                        placeholder="Επιλέξτε χαρακτηριστικά..."
                        searchPlaceholder="Αναζήτηση..."
                        emptyMessage='Η λίστα "Ενεργειακά Χαρακτηριστικά" είναι κενή.'
                    >
                        {energySpecList && <DialogChild listId={energySpecList.id} text="Προσθήκη Νέου Χαρακτηριστικού..."/>}
                    </SearchableSelect>
                </div>
                
               <Accordion type="single" collapsible defaultValue="approved" className="w-full pt-2">
                    <AccordionItem value="approved">
                        <AccordionTrigger className="text-base font-semibold text-green-700 dark:text-green-400 hover:no-underline bg-green-500/10 px-4 rounded-md">
                            <div className="flex items-center gap-2"><ClipboardCheck/>Εγκεκριμένα Στοιχεία</div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 px-1">
                            <div className="space-y-4 rounded-md border p-4">
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">Εγκεκριμένη Ποσότητα</Label>
                                    <div className="flex items-center gap-2">
                                        <Input id="quantity" name="quantity" type="number" step="any" placeholder="π.χ., 15.5" className="w-2/3" />
                                        <Select value={quantityUnit} onValueChange={setQuantityUnit}>
                                            <SelectTrigger className="w-1/3">
                                                <SelectValue placeholder="Μον." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {unitOptions.map(option => (
                                                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                                ))}
                                                {unitList && <DialogChild listId={unitList.id} text="Νέα Μονάδα..."/>}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {state.errors?.quantity && <p className="text-sm font-medium text-destructive mt-1">{state.errors.quantity[0]}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cost">Εγκεκριμένη Τιμή Προγράμματος (άνευ ΦΠΑ)</Label>
                                    <div className="relative">
                                        <Input id="cost" name="cost" type="number" step="0.01" placeholder="0.00" required className="pl-7"/>
                                         <span className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground">€</span>
                                    </div>
                                    {state.errors?.cost && <p className="text-sm font-medium text-destructive mt-1">{state.errors.cost[0]}</p>}
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

            </CardContent>
        </Card>
    );
}

