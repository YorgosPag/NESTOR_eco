import { getAllProjects } from "@/lib/projects-data";
import { getContacts } from "@/lib/contacts-data";
import { getAdminDb } from "@/lib/firebase-admin";
import { DashboardClientPage } from "@/components/dashboard/dashboard-client-page";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const db = getAdminDb();

  const [projects, contacts] = await Promise.all([
    getAllProjects(db),
    getContacts(db),
  ]);

  return <DashboardClientPage projects={projects} contacts={contacts} />;
}
