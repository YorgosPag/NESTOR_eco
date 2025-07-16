
import { getPaginatedContacts } from "@/lib/contacts-data";
import { ContactsTable } from "@/components/contacts/contacts-table";
import { getAdminDb } from "@/lib/firebase-admin";
import { getCustomLists, getAllCustomListItems } from "@/lib/custom-lists-data";

export const dynamic = 'force-dynamic';

export default async function ContactsPage() {
    const db = getAdminDb();
    const [customLists, customListItems] = await Promise.all([
        getCustomLists(db),
        getAllCustomListItems(db)
    ]);

    // The initial data fetching is now handled by the client component
    // to allow for dynamic pagination and searching.

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <ContactsTable 
                customLists={customLists} 
                customListItems={customListItems} 
            />
        </main>
    );
}
