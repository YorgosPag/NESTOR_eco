
"use client";

import { useEffect, useState, useActionState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createContactAction } from '@/app/actions/contacts';
import { Accordion } from '@/components/ui/accordion';
import type { CustomList, CustomListItem } from '@/types';
import { useAddressState } from './useAddressState';
import { PersonalInfoSection } from './PersonalInfoSection';
import { IdInfoSection } from './IdInfoSection';
import { TaxisInfoSection } from './TaxisInfoSection';
import { ContactInfoSection } from './ContactInfoSection';
import { SocialMediaSection } from './SocialMediaSection';
import { AddressInfoSection } from './AddressInfoSection';
import { ProfessionalInfoSection } from './ProfessionalInfoSection';
import { OtherInfoSection } from './OtherInfoSection';
import { SubmitButton } from './SubmitButton';

const initialState = {
  message: null,
  errors: {},
  success: false,
};

export function CreateContactForm({ setOpen, customLists, customListItems }: { setOpen: (open: boolean) => void, customLists: CustomList[], customListItems: CustomListItem[] }) {
    const [state, formAction] = useActionState(createContactAction, initialState);
    const { toast } = useToast();
    
    // States for controlled components
    const [role, setRole] = useState('');
    const [gender, setGender] = useState('');
    const [avatar, setAvatar] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { address, handleAddressChange } = useAddressState({});

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
            {/* Hidden inputs to pass state values to the server action */}
            <input type="hidden" name="role" value={role} />
            <input type="hidden" name="gender" value={gender} />
            <input type="hidden" name="avatar" value={avatar} />
            <input type="hidden" name="addressStreet" value={address.street} />
            <input type="hidden" name="addressNumber" value={address.number} />
            <input type="hidden" name="addressArea" value={address.area} />
            <input type="hidden" name="addressPostalCode" value={address.postalCode} />
            <input type="hidden" name="addressCity" value={address.city} />
            <input type="hidden" name="addressPrefecture" value={address.prefecture} />

            <Accordion type="multiple" defaultValue={['personal-info']} className="w-full space-y-2">
                <PersonalInfoSection
                    state={state}
                    gender={gender}
                    setGender={setGender}
                    avatar={avatar}
                    setAvatar={setAvatar}
                />
                <IdInfoSection state={state} />
                <TaxisInfoSection
                    state={state}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                />
                <ContactInfoSection state={state} />
                <SocialMediaSection state={state} />
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
                />
                <OtherInfoSection state={state} />
            </Accordion>

            <SubmitButton />
        </form>
    );
}
