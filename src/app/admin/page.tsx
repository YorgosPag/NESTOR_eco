
import { AdminClientPage } from "@/components/admin/admin-client-page";
import { getMasterInterventions } from "@/lib/interventions-data";
import { getCustomLists, getAllCustomListItems } from "@/lib/custom-lists-data";
import { getAdminDb } from "@/lib/firebase-admin";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const db = getAdminDb();
    const [masterInterventions, customLists, customListItems] = await Promise.all([
        getMasterInterventions(db),
        getCustomLists(db),
        getAllCustomListItems(db)
    ]);

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <AdminClientPage 
                masterInterventions={masterInterventions}
                customLists={customLists}
                customListItems={customListItems}
            />
        </main>
    );
}

