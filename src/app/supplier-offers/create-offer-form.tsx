
"use client";

import { useEffect, useState } from 'react';
import { useActionState, useFormStatus } from 'react-dom';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';


const OfferItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Η περιγραφή του αντικειμένου είναι υποχρεωτική."),
  unit: z.string().min(1, "Η μονάδα μέτρησης είναι υποχρεωτική."),
  quantity: z.coerce.number().min(0, "Η ποσότητα πρέπει να είναι μη αρνητικός αριθμός.").optional(),
  unitPrice: z.coerce.number().positive("Η τιμή μονάδας πρέπει να είναι θετικός αριθμός."),
});

// Zod schema for validating the entire offer form
const CreateOfferFormSchema = z.object({
  supplierId: z.string().min(1, "Πρέπει να επιλέξετε προμηθευτή."),
  type: z.enum(['general', 'perProject']),
  projectId: z.string().optional(),
  description: z.string().min(3, "Η περιγραφή πρέπει να έχει τουλάχιστον 3 χαρακτήρες."),
  fileUrl: z.string().url().optional().or(z.literal('')),
  items: z.array(OfferItemSchema).min(1, "Πρέπει να υπάρχει τουλάχιστον μία γραμμή προσφοράς."),
});


interface CreateOfferFormProps {
    setOpen: (open: boolean) => void;
    contacts: Contact[];
    projects: Project[];
    customLists: CustomList[];
    customListItems: CustomListItem[];
    onAddOffer: (offer: any) => void;
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
    const [state, formAction] = useActionState(createOfferAction, initialState);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof CreateOfferFormSchema>>({
        resolver: zodResolver(CreateOfferFormSchema),
        defaultValues: {
            type: 'general',
            items: [{ id: `item-${Date.now()}`, name: '', unit: '', unitPrice: 0, quantity: 1 }],
            fileUrl: '',
        }
    });

    const items = form.watch('items');

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
        form.setValue('items', newItems, { shouldValidate: true });
    };

    const addItem = () => {
        form.setValue('items', [...items, { id: `item-${Date.now()}`, name: '', unit: '', unitPrice: 0, quantity: 1 }]);
    };

    const removeItem = (index: number) => {
        form.setValue('items', items.filter((_, i) => i !== index));
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

    const onSubmit = (values: z.infer<typeof CreateOfferFormSchema>) => {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
            if (key === 'items') {
                formData.append(key, JSON.stringify(value));
            } else if (value !== undefined && value !== null) {
                formData.append(key, String(value));
            }
        });
        formAction(formData);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                    control={form.control}
                    name="supplierId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Προμηθευτής / Συνεργείο</FormLabel>
                            <FormControl>
                                <SearchableSelect
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    options={contactOptions}
                                    placeholder="Επιλέξτε επαφή..."
                                    searchPlaceholder="Αναζήτηση επαφής..."
                                    emptyMessage="Δεν βρέθηκε επαφή."
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Τύπος Προσφοράς</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="general" />
                            </FormControl>
                            <FormLabel className="font-normal">Γενική</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="perProject" />
                            </FormControl>
                            <FormLabel className="font-normal">Ανά Έργο</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            
                <FormField
                    control={form.control}
                    name="projectId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Έργο (αν αφορά)</FormLabel>
                             <FormControl>
                                <SearchableSelect
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    options={projectOptions}
                                    placeholder="Επιλέξτε έργο..."
                                    searchPlaceholder="Αναζήτηση έργου..."
                                    emptyMessage="Δεν βρέθηκε έργο."
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Περιγραφή Προσφοράς</FormLabel>
                            <FormControl>
                                <Textarea 
                                    placeholder="π.χ. Τιμοκατάλογος Υλικών Ιουνίου 2024"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <Separator />
                
                <div className="space-y-4">
                    <Label>Γραμμές Προσφοράς</Label>
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
                     <FormMessage>{form.formState.errors.items?.message}</FormMessage>
                    <Button type="button" variant="outline" onClick={addItem} className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" /> Προσθήκη Γραμμής
                    </Button>
                </div>
                
                <Separator />
                
                <FormField
                    control={form.control}
                    name="fileUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Επισύναψη (URL)</FormLabel>
                            <FormControl>
                                <Input type="url" placeholder="https://example.com/offer.pdf" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <SubmitButton />
            </form>
        </Form>
    );
}

