
import { getContacts } from "@/lib/contacts-data";
import { ContactsTable } from "@/components/contacts/contacts-table";
import { Button } from "@/components/ui/button";
import { PlusCircle, BookUser } from "lucide-react";
import { CreateContactDialog } from "@/components/contacts/create-contact-dialog";
import { getAdminDb } from "@/lib/firebase-admin";
import { getCustomLists, getAllCustomListItems } from "@/lib/custom-lists-data";

export const dynamic = 'force-dynamic';

export default async function ContactsPage() {
    const db = getAdminDb();
    const [contacts, customLists, customListItems] = await Promise.all([
        getContacts(db),
        getCustomLists(db),
        getAllCustomListItems(db)
    ]);

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-h1 flex items-center gap-2">
                        <BookUser className="h-6 w-6" />
                        Λίστα Επαφών
                    </h1>
                    <p className="text-muted">Διαχειριστείτε όλες τις επαφές σας από ένα κεντρικό σημείο.</p>
                </div>
                <CreateContactDialog customLists={customLists} customListItems={customListItems}>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Νέα Επαφή
                    </Button>
                </CreateContactDialog>
            </div>
            
            <ContactsTable contacts={contacts} customLists={customLists} customListItems={customListItems} />

        </main>
    );
}
