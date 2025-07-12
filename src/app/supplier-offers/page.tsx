
import { getContacts } from "@/lib/contacts-data";
import { getAllProjects } from "@/lib/projects-data";
import { getAdminDb } from "@/lib/firebase-admin";
import { SupplierOffersClientPage } from "./supplier-offers-client-page";
import { getCustomLists, getAllCustomListItems } from "@/lib/custom-lists-data";
import { getOffers } from "@/lib/offers-data";

export const dynamic = 'force-dynamic';

export default async function SupplierOffersPage() {
    const db = getAdminDb();
    const [contacts, projects, customLists, customListItems, offers] = await Promise.all([
        getContacts(db),
        getAllProjects(db),
        getCustomLists(db),
        getAllCustomListItems(db),
        getOffers(db),
    ]);
    
    return (
       <SupplierOffersClientPage 
            initialOffers={offers}
            contacts={contacts} 
            projects={projects}
            customLists={customLists}
            customListItems={customListItems}
        />
    );
}
