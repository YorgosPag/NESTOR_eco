
import { getProjectById } from "@/lib/projects-data";
import { notFound } from "next/navigation";
import { getAllContacts } from "@/lib/contacts-data";
import { getAdminDb } from "@/lib/firebase-admin";
import { WorkOrderView } from "@/components/projects/work-order-view";

export const dynamic = 'force-dynamic';

export default async function WorkOrderPage({ params }: { params: { id: string } }) {
    const db = getAdminDb();
    const [project, contacts] = await Promise.all([
        getProjectById(db, params.id),
        getAllContacts(db),
    ]);

    if (!project) {
        notFound();
    }

    return <WorkOrderView project={project} contacts={contacts} />;
}
