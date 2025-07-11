"use client";

import type { CustomList, CustomListItem } from "@/types";
import { CustomListsManager } from "@/components/admin/custom-lists/custom-lists-manager";

interface TriggersClientPageProps {
    customLists: CustomList[];
    customListItems: CustomListItem[];
}

export function TriggersClientPage({ customLists, customListItems }: TriggersClientPageProps) {
    return (
        <div className="grid gap-6">
            <CustomListsManager lists={customLists} items={customListItems} />
        </div>
    );
}
