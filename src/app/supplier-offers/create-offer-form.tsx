
"use client";

import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import type { Contact, Project, OfferItem, CustomList, CustomListItem } from '@/types';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { CreateItemDialog } from '@/components/admin/custom-lists/create-item-dialog';
import { createOfferAction } from '@/app/actions/offers';

interface CreateOfferFormProps {
    setOpen: (open: boolean) => void;
    contacts: Contact[];
    projects: Project[];
    customLists: CustomList[];
    customListItems: CustomListItem[];
}

const DialogChild = ({listId, text}: {listId: string, text: string}) => (
    <>
        <Separator className="my-1"/>
        <CreateItemDialog listId={listId}>
            <div onMouseDown={(e) => e.preventDefault()} className="flex cursor-pointer select-none items-center gap-2 rounded-sm p-2 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                <PlusCircle className="h-4 w-4 mr-2" />
                <span>{text}</span>
            </div>
        </CreateItemDialog>
    </>
);

const initialState = {
  message: null,
  errors: {},
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Καταχώριση Προσφοράς"}
    </Button>
  );
}

export function CreateOfferForm({ setOpen, contacts, projects, customLists, customListItems }: CreateOfferFormProps) {
    const [state, formAction] = useFormState(createOfferAction, initialState);
    const { toast } = useToast();

    const [items, setItems] = useState<OfferItem[]>([{ id: `item-${Date.now()}`, name: '', unit: '', unitPrice: 0, quantity: 1 }]);
    
    useEffect(() => {
        if (state?.success) {
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


    const handleItemChange = (index: number, field: keyof Omit<OfferItem, 'id'>, value: string | number) => {
        const newItems = [...items];
        const itemToUpdate = { ...newItems[index] };
        
        if ((field === 'quantity' || field === 'unitPrice') && typeof value === 'string') {
            (itemToUpdate[field] as number) = parseFloat(value) || 0;
        } else {
            (itemToUpdate[field] as string) = value as string;
        }
        
        newItems[index] = itemToUpdate;
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { id: `item-${Date.now()}`, name: '', unit: '', unitPrice: 0, quantity: 1 }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const contactOptions = contacts.map(contact => ({
        value: contact.id,
        label: `${contact.firstName} ${contact.lastName} (${contact.company || contact.role})`
    })).sort((a,b) => a.label.localeCompare(b.label));

    const projectOptions = projects.map(project => ({
        value: project.id,
        label: project.title,
    })).sort((a,b) => a.label.localeCompare(b.label));

    const unitList = customLists.find(l => l.key === 'UNIT_OF_MEASUREMENT' || l.name === 'Μονάδες Μέτρησης');
    const unitOptions = unitList 
        ? customListItems
            .filter(item => item.listId === unitList.id)
            .map(item => ({ value: item.name, label: item.name }))
        : [];

    return (
        <form action={formAction} className="space-y-4 pt-4">
             {/* Use a hidden input to pass the stringified items array */}
            <input type="hidden" name="items" value={JSON.stringify(items)} />

            <div className="space-y-2">
                <Label htmlFor="supplierId">Προμηθευτής / Συνεργείο</Label>
                <SearchableSelect
                    name="supplierId"
                    onValueChange={(value) => {}} // The name attribute handles this in forms
                    options={contactOptions}
                    placeholder="Επιλέξτε επαφή..."
                    searchPlaceholder="Αναζήτηση επαφής..."
                    emptyMessage="Δεν βρέθηκε επαφή."
                />
                 {state.errors?.supplierId && <p className="text-sm font-medium text-destructive mt-1">{state.errors.supplierId[0]}</p>}
            </div>

            <div className="space-y-2">
                <Label>Τύπος Προσφοράς</Label>
                <RadioGroup name="type" defaultValue="general">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="general" id="r-general" />
                        <Label htmlFor="r-general">Γενική</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="perProject" id="r-perProject" />
                        <Label htmlFor="r-perProject">Ανά Έργο</Label>
                    </div>
                </RadioGroup>
            </div>
            
            {/* The form needs to react to the radio button state for this to work perfectly, which is complex with server actions.
                For now, we just include the projectId field and rely on server validation to ignore it if type is 'general'. */}
            <div className="space-y-2">
                <Label htmlFor="projectId">Έργο (αν αφορά)</Label>
                <SearchableSelect
                    name="projectId"
                    onValueChange={(value) => {}}
                    options={projectOptions}
                    placeholder="Επιλέξτε έργο..."
                    searchPlaceholder="Αναζήτηση έργου..."
                    emptyMessage="Δεν βρέθηκε έργο."
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Περιγραφή Προσφοράς</Label>
                <Textarea 
                    id="description" 
                    name="description"
                    placeholder="π.χ. Τιμοκατάλογος Υλικών Ιουνίου 2024"
                    required 
                />
                 {state.errors?.description && <p className="text-sm font-medium text-destructive mt-1">{state.errors.description[0]}</p>}
            </div>
            
            <Separator />
            
            <div className="space-y-4">
                <Label>Γραμμές Προσφοράς</Label>
                {state.errors?.items && <p className="text-sm font-medium text-destructive mt-1">{Array.isArray(state.errors.items) ? state.errors.items[0] : state.errors.items}</p>}
                <div className="space-y-4">
                    {items.map((item, index) => (
                        <div key={item.id} className="flex flex-col gap-2 p-3 border rounded-md bg-muted/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div className="space-y-1 col-span-2">
                                    <Label htmlFor={`item-name-${index}`} className="text-xs">Περιγραφή</Label>
                                    <Input
                                        id={`item-name-${index}`}
                                        value={item.name}
                                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                        placeholder="π.χ. Πάνελ οροφής"
                                    />
                                </div>
                                 <div className="space-y-1">
                                    <Label htmlFor={`item-unit-${index}`} className="text-xs">Μον. Μέτρησης</Label>
                                     <Select
                                        value={item.unit}
                                        onValueChange={(value) => handleItemChange(index, 'unit', value)}
                                    >
                                        <SelectTrigger id={`item-unit-${index}`}>
                                            <SelectValue placeholder="Επιλογή..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {unitOptions.map(option => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                            {unitList && <DialogChild listId={unitList.id} text="Προσθήκη Νέας Μονάδας..." />}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor={`item-quantity-${index}`} className="text-xs">Ποσότητα</Label>
                                    <Input
                                        id={`item-quantity-${index}`}
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                        placeholder="1"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor={`item-unitPrice-${index}`} className="text-xs">Τιμή Μονάδας (€)</Label>
                                    <Input
                                        id={`item-unitPrice-${index}`}
                                        type="number"
                                        value={item.unitPrice}
                                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="space-y-1 flex flex-col justify-end">
                                    <p className="text-sm font-semibold p-2 border rounded-md bg-background text-right">
                                       Σύνολο: {((item.quantity || 0) * item.unitPrice).toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => removeItem(index)}
                                    className="h-7 w-7"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
                <Button type="button" variant="outline" onClick={addItem} className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" /> Προσθήκη Γραμμής
                </Button>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
                <Label htmlFor="file">Επισύναψη (URL)</Label>
                <Input name="fileUrl" id="file" type="url" placeholder="https://example.com/offer.pdf" />
                 {state.errors?.fileUrl && <p className="text-sm font-medium text-destructive mt-1">{state.errors.fileUrl[0]}</p>}
            </div>

            <SubmitButton />
        </form>
    );
}
