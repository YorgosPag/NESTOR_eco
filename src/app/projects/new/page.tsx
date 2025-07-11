
import { CreateProjectForm } from "@/components/projects/create-project-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getContacts } from "@/lib/contacts-data";
import { getAdminDb } from "@/lib/firebase-admin";
import { PlusCircle } from "lucide-react";

export default async function NewProjectPage() {
    const db = getAdminDb();
    const contacts = await getContacts(db);
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="max-w-2xl mx-auto w-full">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-h2 flex items-center gap-2">
                            <PlusCircle className="h-5 w-5" />
                            Δημιουργία Νέου Έργου / Προσφοράς
                        </CardTitle>
                        <CardDescription>Συμπληρώστε τις παρακάτω πληροφορίες. Το νέο έργο θα δημιουργηθεί αρχικά σε κατάσταση "Προσφοράς".</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CreateProjectForm contacts={contacts}/>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
