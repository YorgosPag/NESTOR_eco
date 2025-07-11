
import { getMasterInterventions } from "@/lib/interventions-data";
import { AdminClientPage } from "@/components/admin/admin-client-page";

export default async function AdminPage() {
    const masterInterventions = await getMasterInterventions();
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
           <AdminClientPage masterInterventions={masterInterventions} />
        </main>
    );
}
