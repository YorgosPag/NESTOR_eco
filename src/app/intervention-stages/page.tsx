
import { getAllProjects } from "@/lib/projects-data";
import { getContacts } from "@/lib/contacts-data";
import { getAdminDb } from "@/lib/firebase-admin";
import { InterventionStagesClientPage } from "./client-page";

export const dynamic = 'force-dynamic';

export default async function InterventionStagesPage() {
    const db = getAdminDb();
    const [projects, contacts] = await Promise.all([
        getAllProjects(db),
        getContacts(db),
    ]);

    return <InterventionStagesClientPage projects={projects} contacts={contacts} />;
}
