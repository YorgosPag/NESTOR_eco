
import { getTriggers } from "@/lib/triggers-data";
import { getCustomLists, getAllCustomListItems } from "@/lib/custom-lists-data";
import { getAdminDb } from "@/lib/firebase-admin";
import { TriggersClientPage } from "./triggers-client-page";

export const dynamic = 'force-dynamic';

export default async function TriggersPage() {
    const db = getAdminDb();
    const [triggers, customLists, customListItems] = await Promise.all([
        getTriggers(db),
        getCustomLists(db),
        getAllCustomListItems(db)
    ]);
    
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
           <TriggersClientPage
                triggers={triggers}
                customLists={customLists}
                customListItems={customListItems}
           />
        </main>
    );
}
