
import { CreateProjectForm } from "@/components/projects/create-project-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getContacts } from "@/lib/contacts-data";

export default async function NewProjectPage() {
    const contacts = await getContacts();
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="max-w-2xl mx-auto w-full">
                <Card>
                    <CardHeader>
                        <CardTitle>Δημιουργία Νέου Έργου</CardTitle>
                        <CardDescription>Συμπληρώστε τις παρακάτω πληροφορίες για να δημιουργήσετε ένα νέο έργο.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CreateProjectForm contacts={contacts}/>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
