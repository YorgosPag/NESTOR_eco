
"use client";

import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FormState, AddressState } from "./types";

interface AddressInfoSectionProps {
    state: FormState;
    address: AddressState;
    handleAddressChange: (field: keyof AddressState, value: string) => void;
}

export function AddressInfoSection({ state, address, handleAddressChange }: AddressInfoSectionProps) {
    const fullAddress = [
        address.street,
        address.number,
        address.area,
        address.postalCode,
        address.city,
        address.prefecture,
    ].filter(Boolean).join(", ");

    const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}`;

    return (
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
                        <Input id="addressStreet" name="addressStreet" value={address.street} onChange={(e) => handleAddressChange('street', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="addressNumber">Αριθμός</Label>
                        <Input id="addressNumber" name="addressNumber" value={address.number} onChange={(e) => handleAddressChange('number', e.target.value)} />
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="addressArea">Περιοχή</Label>
                        <Input id="addressArea" name="addressArea" value={address.area} onChange={(e) => handleAddressChange('area', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="addressPostalCode">Τ.Κ.</Label>
                        <Input id="addressPostalCode" name="addressPostalCode" value={address.postalCode} onChange={(e) => handleAddressChange('postalCode', e.target.value)} placeholder="π.χ., 12345" />
                        {state.errors?.addressPostalCode && <p className="text-sm font-medium text-destructive mt-1">{state.errors.addressPostalCode[0]}</p>}
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="addressCity">Δήμος</Label>
                        <Input id="addressCity" name="addressCity" value={address.city} onChange={(e) => handleAddressChange('city', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="addressPrefecture">Νομός</Label>
                        <Input id="addressPrefecture" name="addressPrefecture" value={address.prefecture} onChange={(e) => handleAddressChange('prefecture', e.target.value)} />
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
