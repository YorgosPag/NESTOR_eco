
import { CustomListsClientPage } from "./client-page";
import { getCustomLists, getAllCustomListItems } from "@/lib/custom-lists-data";
import { getAdminDb } from "@/lib/firebase-admin";

export const dynamic = 'force-dynamic';

export default async function CustomListsPage() {
    const db = getAdminDb();
    const [customLists, customListItems] = await Promise.all([
        getCustomLists(db),
        getAllCustomListItems(db)
    ]);

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <CustomListsClientPage 
                customLists={customLists}
                customListItems={customListItems}
            />
        </main>
    );
}
