
"use client";

import { useEffect, useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import type { Contact, CustomList, CustomListItem } from '@/types';
import { updateContactAction } from '@/app/actions/contacts';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Accordion } from '../ui/accordion';

import { PersonalInfoSection } from '../forms/create-contact/PersonalInfoSection';
import { IdInfoSection } from '../forms/create-contact/IdInfoSection';
import { ContactInfoSection } from '../forms/create-contact/ContactInfoSection';
import { SocialMediaSection } from '../forms/create-contact/SocialMediaSection';
import { AddressInfoSection } from '../forms/create-contact/AddressInfoSection';
import { ProfessionalInfoSection } from '../forms/create-contact/ProfessionalInfoSection';
import { OtherInfoSection } from '../forms/create-contact/OtherInfoSection';
import { useAddressState } from '../forms/create-contact/useAddressState';


const initialState = {
  message: null,
  errors: {},
  success: false,
};

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
    
    const { address, handleAddressChange } = useAddressState({
        street: contact.addressStreet,
        number: contact.addressNumber,
        area: contact.addressArea,
        postalCode: contact.addressPostalCode,
        city: contact.addressCity,
        prefecture: contact.addressPrefecture,
    });


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
    
    return (
        <form action={formAction} className="space-y-4 pt-4">
            <input type="hidden" name="id" value={contact.id} />
            <input type="hidden" name="role" value={role} />
            <input type="hidden" name="gender" value={gender} />
            <input type="hidden" name="avatar" value={avatar} />
            <input type="hidden" name="addressStreet" value={address.street} />
            <input type="hidden" name="addressNumber" value={address.number} />
            <input type="hidden" name="addressArea" value={address.area} />
            <input type="hidden" name="addressPostalCode" value={address.postalCode} />
            <input type="hidden" name="addressCity" value={address.city} />
            <input type="hidden" name="addressPrefecture" value={address.prefecture} />

            {/* Default uncontrolled inputs for fields that don't need complex client-side logic */}
            <input type="hidden" name="firstName" defaultValue={contact.firstName} />
            <input type="hidden" name="lastName" defaultValue={contact.lastName} />
            <input type="hidden" name="fatherName" defaultValue={contact.fatherName} />
            <input type="hidden" name="motherName" defaultValue={contact.motherName} />
            <input type="hidden" name="dateOfBirth" defaultValue={contact.dateOfBirth ? new Date(contact.dateOfBirth).toISOString().substring(0, 10) : ''} />
            <input type="hidden" name="placeOfBirth" defaultValue={contact.placeOfBirth} />
            <input type="hidden" name="nationality" defaultValue={contact.nationality} />
            <input type="hidden" name="vatNumber" defaultValue={contact.vatNumber} />
            <input type="hidden" name="idNumber" defaultValue={contact.idNumber} />
            <input type="hidden" name="idIssueDate" defaultValue={contact.idIssueDate ? new Date(contact.idIssueDate).toISOString().substring(0, 10) : ''} />
            <input type="hidden" name="idIssuingAuthority" defaultValue={contact.idIssuingAuthority} />
            <input type="hidden" name="email" defaultValue={contact.email} />
            <input type="hidden" name="landlinePhone" defaultValue={contact.landlinePhone} />
            <input type="hidden" name="mobilePhone" defaultValue={contact.mobilePhone} />
            <input type="hidden" name="facebookUrl" defaultValue={contact.facebookUrl} />
            <input type="hidden" name="instagramUrl" defaultValue={contact.instagramUrl} />
            <input type="hidden" name="tiktokUrl" defaultValue={contact.tiktokUrl} />
            <input type="hidden" name="specialty" defaultValue={contact.specialty} />
            <input type="hidden" name="company" defaultValue={contact.company} />
            <input type="hidden" name="notes" defaultValue={contact.notes} />


            <Accordion type="multiple" defaultValue={['personal-info']} className="w-full space-y-2">
                <PersonalInfoSection
                    state={state}
                    gender={gender}
                    setGender={setGender}
                    avatar={avatar}
                    setAvatar={setAvatar}
                    contact={contact}
                />
                <IdInfoSection state={state} contact={contact} />
                <ContactInfoSection state={state} contact={contact} />
                <SocialMediaSection state={state} contact={contact} />
                <AddressInfoSection
                    state={state}
                    address={address}
                    handleAddressChange={handleAddressChange}
                />
                <ProfessionalInfoSection
                    state={state}
                    role={role}
                    setRole={setRole}
                    customLists={customLists}
                    customListItems={customListItems}
                    contact={contact}
                />
                <OtherInfoSection state={state} contact={contact} />
            </Accordion>
            
            <SubmitButton />
        </form>
    );
}
