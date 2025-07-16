
import { getAllProjects } from "@/lib/projects-data";
import { getAllContacts } from "@/lib/contacts-data";
import { getAdminDb } from "@/lib/firebase-admin";
import { ProjectInterventionsClientPage } from "./client-page";

export const dynamic = 'force-dynamic';

export default async function ProjectInterventionsPage() {
    const db = getAdminDb();
    const [projects, contacts] = await Promise.all([
        getAllProjects(db),
        getAllContacts(db),
    ]);

    return <ProjectInterventionsClientPage projects={projects} contacts={contacts} />;
}
