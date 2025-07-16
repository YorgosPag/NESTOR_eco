
"use client";

import { useState } from 'react';

export interface AddressState {
    street: string;
    number: string;
    area: string;
    postalCode: string;
    city: string;
    prefecture: string;
}

export function useAddressState(initialState: Partial<AddressState>) {
    const [address, setAddress] = useState<AddressState>({
        street: initialState.street || '',
        number: initialState.number || '',
        area: initialState.area || '',
        postalCode: initialState.postalCode || '',
        city: initialState.city || '',
        prefecture: initialState.prefecture || '',
    });

    const handleAddressChange = (field: keyof AddressState, value: string) => {
        setAddress(prev => ({ ...prev, [field]: value }));
    };

    return { address, handleAddressChange };
}
