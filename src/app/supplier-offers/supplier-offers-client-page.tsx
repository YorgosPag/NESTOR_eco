
"use client";

import type { Offer, Contact, Project, CustomList, CustomListItem } from "@/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, ShoppingBag } from "lucide-react";
import { CreateOfferDialog } from "./create-offer-dialog";
import { OffersTable } from "./offers-table";

interface SupplierOffersClientPageProps {
    initialOffers: Offer[];
    contacts: Contact[];
    projects: Project[];
    customLists: CustomList[];
    customListItems: CustomListItem[];
}

export function SupplierOffersClientPage({ initialOffers, contacts, projects, customLists, customListItems }: SupplierOffersClientPageProps) {
    
    // The offers are now passed from the server component after being fetched from the database.
    // The client component is now responsible only for displaying the data and triggering actions.

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
                    customLists={customLists}
                    customListItems={customListItems}
                >
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Νέα Προσφορά
                    </Button>
                </CreateOfferDialog>
            </div>

            <OffersTable offers={initialOffers} contacts={contacts} projects={projects} />
        </main>
    )
}
