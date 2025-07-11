
"use client";

import { useState } from "react";
import type { Offer, Contact, Project, CustomList, CustomListItem } from "@/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, ShoppingBag } from "lucide-react";
import { CreateOfferDialog } from "./create-offer-dialog";
import { OffersTable } from "./offers-table";

interface SupplierOffersClientPageProps {
    contacts: Contact[];
    projects: Project[];
    customLists: CustomList[];
    customListItems: CustomListItem[];
}

const mockOffers: Offer[] = [
    {
        id: 'offer-1',
        supplierId: 'contact-2', // Μαρία Προμηθεύτρια
        supplierType: 'vendor',
        type: 'general',
        description: 'Γενικός τιμοκατάλογος κουφωμάτων 2024',
        items: [],
        createdAt: new Date('2024-05-15'),
        fileUrl: '#'
    },
    {
        id: 'offer-2',
        supplierId: 'contact-1', // Γιώργος Τεχνικός
        supplierType: 'contractor',
        type: 'perProject',
        projectId: 'dummy-id-1', // Ανακαίνιση Μονοκατοικίας στο Μαρούσι
        description: 'Ειδική προσφορά για ηλεκτρολογικά στο έργο του Αμαρουσίου',
        items: [],
        createdAt: new Date('2024-06-01')
    }
];

export function SupplierOffersClientPage({ contacts, projects, customLists, customListItems }: SupplierOffersClientPageProps) {
    const [offers, setOffers] = useState<Offer[]>(mockOffers);

    const handleAddOffer = (newOfferData: Omit<Offer, 'id' | 'createdAt'>) => {
        const newOffer: Offer = {
            ...newOfferData,
            id: `offer-${Date.now()}`,
            createdAt: new Date(),
        };
        setOffers(prevOffers => [newOffer, ...prevOffers]);
    };

    return (
         <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
             <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-h1 flex items-center gap-2">
                        <ShoppingBag className="h-6 w-6" />
                        Προσφορές Προμηθευτών
                    </h1>
                    <p className="text-muted">Διαχειριστείτε τις προσφορές από τους προμηθευτές και τα συνεργεία σας.</p>
                </div>
                <CreateOfferDialog 
                    contacts={contacts} 
                    projects={projects} 
                    onAddOffer={handleAddOffer}
                    customLists={customLists}
                    customListItems={customListItems}
                >
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Νέα Προσφορά
                    </Button>
                </CreateOfferDialog>
            </div>

            <OffersTable offers={offers} contacts={contacts} projects={projects} />
        </main>
    )
}
