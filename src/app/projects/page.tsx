
import { getAllProjects } from "@/lib/projects-data";
import { getAllContacts } from "@/lib/contacts-data";
import { getAdminDb } from "@/lib/firebase-admin";
import { ProjectsClientPage } from "./projects-client-page";

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
    const db = getAdminDb();

    const [projects, contacts] = await Promise.all([
        getAllProjects(db),
        getAllContacts(db),
    ]);

    return <ProjectsClientPage projects={projects} contacts={contacts} />
}
