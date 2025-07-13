
"use client";

import { useEffect, useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import type { Contact, CustomList, CustomListItem } from '@/types';
import { updateContactAction } from '@/app/actions/contacts';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, PlusCircle, X, MapPin, Eye, EyeOff } from 'lucide-react';
import { SearchableSelect } from '../ui/searchable-select';
import { Separator } from '../ui/separator';
import { CreateItemDialog } from '../admin/custom-lists/create-item-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { cn } from '@/lib/utils';

const initialState = {
  message: null,
  errors: {},
  success: false,
};

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

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Αποθήκευση Αλλαγών"}
    </Button>
  );
}

export function EditContactForm({ contact, setOpen, customLists, customListItems }: { contact: Contact, setOpen: (open: boolean) => void, customLists: CustomList[], customListItems: CustomListItem[] }) {
    const [state, formAction] = useActionState(updateContactAction, initialState);
    const { toast } = useToast();
    const [role, setRole] = useState(contact.role);
    const [gender, setGender] = useState(contact.gender || '');
    const [avatar, setAvatar] = useState(contact.avatar || '');
    const [showPassword, setShowPassword] = useState(false);

    const [addressStreet, setAddressStreet] = useState(contact.addressStreet || '');
    const [addressNumber, setAddressNumber] = useState(contact.addressNumber || '');
    const [addressArea, setAddressArea] = useState(contact.addressArea || '');
    const [addressPostalCode, setAddressPostalCode] = useState(contact.addressPostalCode || '');
    const [addressCity, setAddressCity] = useState(contact.addressCity || '');
    const [addressPrefecture, setAddressPrefecture] = useState(contact.addressPrefecture || '');

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
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleClearAvatar = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setAvatar('');
    };

    const contactRolesList = customLists.find(l => l.key === 'CONTACT_ROLES' || l.name === 'Ρόλοι Επαφών');
    const contactRoleOptions = contactRolesList
        ? customListItems
            .filter(item => item.listId === contactRolesList.id)
            .map(item => ({ value: item.name, label: item.name }))
            .sort((a,b) => a.label.localeCompare(b.label))
        : [];
    
    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toISOString().substring(0, 10);
        } catch (e) {
            return '';
        }
    }
    
    const fullAddress = [
        addressStreet,
        addressNumber,
        addressArea,
        addressPostalCode,
        addressCity,
        addressPrefecture,
    ].filter(Boolean).join(", ");

    const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}`;

    return (
        <form action={formAction} className="space-y-4 pt-4">
            <input type="hidden" name="id" value={contact.id} />
            <input type="hidden" name="role" value={role} />
            <input type="hidden" name="gender" value={gender} />
            <input type="hidden" name="avatar" value={avatar} />

            <Accordion type="multiple" defaultValue={['personal-info']} className="w-full space-y-2">
                 <AccordionItem value="personal-info">
                    <AccordionTrigger className="text-md font-semibold bg-muted/50 hover:bg-muted px-4 rounded-md">Προσωπικά Στοιχεία</AccordionTrigger>
                    <AccordionContent className="pt-4 px-1">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="flex-1 space-y-4">
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">Όνομα</Label>
                                        <Input id="firstName" name="firstName" defaultValue={contact.firstName} required />
                                        {state.errors?.firstName && <p className="text-sm font-medium text-destructive mt-1">{state.errors.firstName[0]}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Επώνυμο</Label>
                                        <Input id="lastName" name="lastName" defaultValue={contact.lastName} required />
                                        {state.errors?.lastName && <p className="text-sm font-medium text-destructive mt-1">{state.errors.lastName[0]}</p>}
                                    </div>
                                </div>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                      <Label htmlFor="fatherName">Όνομα Πατέρα</Label>
                                      <Input id="fatherName" name="fatherName" defaultValue={contact.fatherName} />
                                  </div>
                                  <div className="space-y-2">
                                      <Label htmlFor="motherName">Όνομα Μητέρας</Label>
                                      <Input id="motherName" name="motherName" defaultValue={contact.motherName} />
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="dateOfBirth">Ημ/νία Γέννησης</Label>
                                        <Input id="dateOfBirth" name="dateOfBirth" type="date" defaultValue={formatDate(contact.dateOfBirth)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="placeOfBirth">Τόπος Γέννησης</Label>
                                        <Input id="placeOfBirth" name="placeOfBirth" defaultValue={contact.placeOfBirth} />
                                    </div>
                                </div>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="gender">Φύλο</Label>
                                      <Select onValueChange={setGender} value={gender}>
                                        <SelectTrigger id="gender">
                                          <SelectValue placeholder="Επιλέξτε..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Άνδρας">Άνδρας</SelectItem>
                                          <SelectItem value="Γυναίκα">Γυναίκα</SelectItem>
                                          <SelectItem value="Άλλο">Άλλο</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="nationality">Υπηκοότητα</Label>
                                        <Input id="nationality" name="nationality" defaultValue={contact.nationality} />
                                    </div>
                                </div>
                            </div>

                            <div className="w-full md:w-40 flex-shrink-0">
                                 <Label>Φωτογραφία</Label>
                                 <div 
                                     className="mt-2 group aspect-square w-full border-2 border-dashed rounded-lg flex items-center justify-center text-center text-xs p-2 text-muted-foreground relative cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
                                     onDrop={handleDrop}
                                     onDragOver={handleDragOver}
                                     onClick={() => !avatar && document.getElementById('avatar-upload-edit')?.click()}
                                 >
                                    {avatar ? (
                                        <>
                                            <img src={avatar} alt="Avatar preview" className="absolute inset-0 w-full h-full object-cover rounded-lg" />
                                            <Button 
                                                type="button"
                                                variant="destructive" 
                                                size="icon" 
                                                className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                onClick={handleClearAvatar}
                                                aria-label="Διαγραφή φωτογραφίας"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </>
                                    ) : (
                                        <span>Μεταφέρετε ή πατήστε για ανέβασμα</span>
                                    )}
                                    <input id="avatar-upload-edit" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                 </div>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                 <AccordionItem value="id-info">
                    <AccordionTrigger className="text-md font-semibold bg-muted/50 hover:bg-muted px-4 rounded-md">Στοιχεία Ταυτότητας & ΑΦΜ</AccordionTrigger>
                    <AccordionContent className="pt-4 px-1 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="vatNumber">Α.Φ.Μ.</Label>
                                <Input id="vatNumber" name="vatNumber" defaultValue={contact.vatNumber || ''} placeholder="π.χ., 123456789" />
                                {state.errors?.vatNumber && <p className="text-sm font-medium text-destructive mt-1">{state.errors.vatNumber[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="idNumber">Α.Δ. Ταυτότητας</Label>
                                <Input id="idNumber" name="idNumber" defaultValue={contact.idNumber} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="idIssueDate">Ημερομηνία Έκδοσης</Label>
                                <Input id="idIssueDate" name="idIssueDate" type="date" defaultValue={formatDate(contact.idIssueDate)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="idIssuingAuthority">Αρχή Έκδοσης</Label>
                                <Input id="idIssuingAuthority" name="idIssuingAuthority" defaultValue={contact.idIssuingAuthority} />
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="taxis-info">
                    <AccordionTrigger className="text-md font-semibold bg-muted/50 hover:bg-muted px-4 rounded-md">Στοιχεία Σύνδεσης Taxis</AccordionTrigger>
                    <AccordionContent className="pt-4 px-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="usernameTaxis">Username Taxis</Label>
                                <Input id="usernameTaxis" name="usernameTaxis" defaultValue={contact.usernameTaxis || ''} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="passwordTaxis">Password Taxis</Label>
                                <div className="relative">
                                    <Input id="passwordTaxis" name="passwordTaxis" type={showPassword ? 'text' : 'password'} defaultValue={contact.passwordTaxis || ''} />
                                     <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute inset-y-0 right-0 h-full px-3 text-muted-foreground hover:text-foreground"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? 'Απόκρυψη κωδικού' : 'Εμφάνιση κωδικού'}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="contact-info">
                    <AccordionTrigger className="text-md font-semibold bg-muted/50 hover:bg-muted px-4 rounded-md">Στοιχεία Επικοινωνίας</AccordionTrigger>
                    <AccordionContent className="pt-4 px-1 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" defaultValue={contact.email} />
                            {state.errors?.email && <p className="text-sm font-medium text-destructive mt-1">{state.errors.email[0]}</p>}
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="landlinePhone">Σταθερό Τηλέφωνο</Label>
                                <Input id="landlinePhone" name="landlinePhone" type="tel" defaultValue={contact.landlinePhone || ''} />
                                {state.errors?.landlinePhone && <p className="text-sm font-medium text-destructive mt-1">{state.errors.landlinePhone[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mobilePhone">Κινητό Τηλέφωνο</Label>
                                <Input id="mobilePhone" name="mobilePhone" type="tel" defaultValue={contact.mobilePhone || ''} />
                                {state.errors?.mobilePhone && <p className="text-sm font-medium text-destructive mt-1">{state.errors.mobilePhone[0]}</p>}
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                
                 <AccordionItem value="social-media">
                    <AccordionTrigger className="text-md font-semibold bg-muted/50 hover:bg-muted px-4 rounded-md">Κοινωνικά Δίκτυα</AccordionTrigger>
                    <AccordionContent className="pt-4 px-1 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="facebookUrl">Facebook</Label>
                            <Input id="facebookUrl" name="facebookUrl" defaultValue={contact.facebookUrl || ''} placeholder="https://www.facebook.com/username" />
                            {state.errors?.facebookUrl && <p className="text-sm font-medium text-destructive mt-1">{state.errors.facebookUrl[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="instagramUrl">Instagram</Label>
                            <Input id="instagramUrl" name="instagramUrl" defaultValue={contact.instagramUrl || ''} placeholder="https://www.instagram.com/username" />
                            {state.errors?.instagramUrl && <p className="text-sm font-medium text-destructive mt-1">{state.errors.instagramUrl[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tiktokUrl">TikTok</Label>
                            <Input id="tiktokUrl" name="tiktokUrl" defaultValue={contact.tiktokUrl || ''} placeholder="https://www.tiktok.com/@username" />
                            {state.errors?.tiktokUrl && <p className="text-sm font-medium text-destructive mt-1">{state.errors.tiktokUrl[0]}</p>}
                        </div>
                    </AccordionContent>
                </AccordionItem>
                
                 <AccordionItem value="address-info">
                     <AccordionTrigger className="text-md font-semibold bg-muted/50 hover:bg-muted px-4 rounded-md">
                        <span className="flex-1 text-left">Στοιχεία Διεύθυνσης</span>
                        <a 
                            href={fullAddress ? mapsUrl : undefined} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!fullAddress) e.preventDefault();
                            }}
                            className={cn('p-1 rounded-full hover:bg-background/50 transition-colors z-10 mr-2', !fullAddress && 'pointer-events-none opacity-50')} 
                            title="Άνοιγμα σε χάρτες Google"
                            aria-disabled={!fullAddress}
                        >
                            <MapPin className="h-5 w-5 text-primary" />
                        </a>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 px-1 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="addressStreet">Οδός</Label>
                                <Input id="addressStreet" name="addressStreet" value={addressStreet} onChange={(e) => setAddressStreet(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="addressNumber">Αριθμός</Label>
                                <Input id="addressNumber" name="addressNumber" value={addressNumber} onChange={(e) => setAddressNumber(e.target.value)} />
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="addressArea">Περιοχή</Label>
                                <Input id="addressArea" name="addressArea" value={addressArea} onChange={(e) => setAddressArea(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="addressPostalCode">Τ.Κ.</Label>
                                <Input id="addressPostalCode" name="addressPostalCode" value={addressPostalCode} onChange={(e) => setAddressPostalCode(e.target.value)} placeholder="π.χ. 12345" />
                                {state.errors?.addressPostalCode && <p className="text-sm font-medium text-destructive mt-1">{state.errors.addressPostalCode[0]}</p>}
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="addressCity">Δήμος</Label>
                                <Input id="addressCity" name="addressCity" value={addressCity} onChange={(e) => setAddressCity(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="addressPrefecture">Νομός</Label>
                                <Input id="addressPrefecture" name="addressPrefecture" value={addressPrefecture} onChange={(e) => setAddressPrefecture(e.target.value)} />
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

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
                            <Input id="specialty" name="specialty" defaultValue={contact.specialty} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="company">Επιχείρηση/Οργανισμός (Προαιρετικό)</Label>
                            <Input id="company" name="company" defaultValue={contact.company} />
                        </div>
                    </AccordionContent>
                </AccordionItem>

                 <AccordionItem value="other-info">
                    <AccordionTrigger className="text-md font-semibold bg-muted/50 hover:bg-muted px-4 rounded-md">Λοιπά</AccordionTrigger>
                    <AccordionContent className="pt-4 px-1">
                        <div className="space-y-2">
                            <Label htmlFor="notes">Σημειώσεις (Προαιρετικό)</Label>
                            <Textarea id="notes" name="notes" defaultValue={contact.notes || ''} rows={3} />
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            
            <SubmitButton />
        </form>
    );
}
