
export type FormState = {
    message: string | null;
    errors?: {
        firstName?: string[];
        lastName?: string[];
        email?: string[];
        mobilePhone?: string[];
        landlinePhone?: string[];
        addressPostalCode?: string[];
        role?: string[];
        vatNumber?: string[];
        facebookUrl?: string[];
        instagramUrl?: string[];
        tiktokUrl?: string[];
    } | null;
    success: boolean;
};

export interface AddressState {
    street: string;
    number: string;
    area: string;
    postalCode: string;
    city: string;
    prefecture: string;
}
