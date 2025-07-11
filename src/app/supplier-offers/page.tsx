
import { getContacts } from "@/lib/contacts-data";
import { getAllProjects } from "@/lib/data";
import { getAdminDb } from "@/lib/firebase-admin";
import { SupplierOffersClientPage } from "./supplier-offers-client-page";
import { getCustomLists, getAllCustomListItems } from "@/lib/custom-lists-data";

export const dynamic = 'force-dynamic';

export default async function SupplierOffersPage() {
    const db = getAdminDb();
    const [contacts, projects, customLists, customListItems] = await Promise.all([
        getContacts(db),
        getAllProjects(db),
        getCustomLists(db),
        getAllCustomListItems(db),
    ]);
    
    return (
       <SupplierOffersClientPage 
            contacts={contacts} 
            projects={projects}
            customLists={customLists}
            customListItems={customListItems}
        />
    );
}



