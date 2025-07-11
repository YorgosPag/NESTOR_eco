
import { getContacts } from "@/lib/contacts-data";
import { ContactsTable } from "@/components/contacts/contacts-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { CreateContactDialog } from "@/components/contacts/create-contact-dialog";

export default async function ContactsPage() {
    const contacts = await getContacts();
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Λίστα Επαφών</h1>
                    <p className="text-muted-foreground">Διαχειριστείτε όλες τις επαφές σας από ένα κεντρικό σημείο.</p>
                </div>
                <CreateContactDialog>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Νέα Επαφή
                    </Button>
                </CreateContactDialog>
            </div>
            
            <ContactsTable contacts={contacts} />

        </main>
    );
}
