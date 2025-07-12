import { ReportsClientPage } from "@/components/reports/reports-client-page";
import { getAllProjects } from "@/lib/projects-data";
import { getContacts } from "@/lib/contacts-data";
import { getAdminDb } from "@/lib/firebase-admin";

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
    const db = getAdminDb();
    // Fetch data that is needed by the Financial and Dynamic reports.
    // The AI assistant will fetch its own data on-demand via server actions.
    const [projects, contacts] = await Promise.all([
        getAllProjects(db),
        getContacts(db),
    ]);

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <ReportsClientPage projects={projects} contacts={contacts} />
        </main>
    );
}
