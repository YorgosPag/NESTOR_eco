
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, BellRing } from "lucide-react";
import { CreateTriggerDialog } from "@/components/admin/triggers/create-trigger-dialog";
import { TriggersTable } from "@/components/admin/triggers/triggers-table";
import { columns as triggerColumns } from "@/components/admin/triggers/trigger-columns";
import type { Trigger, CustomList, CustomListItem } from "@/types";

interface TriggersClientPageProps {
    triggers: Trigger[];
    customLists: CustomList[];
    customListItems: CustomListItem[];
}

export function TriggersClientPage({ triggers, customLists, customListItems }: TriggersClientPageProps) {
    return (
        <div className="space-y-6">
             <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                        <BellRing className="h-6 w-6" />
                        Διαχείριση Triggers
                    </h1>
                    <p className="text-muted-foreground">Κεντρική διαχείριση όλων των αυτοματοποιημένων triggers.</p>
                </div>
                <CreateTriggerDialog customLists={customLists} customListItems={customListItems}>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Νέο Trigger
                    </Button>
                </CreateTriggerDialog>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <TriggersTable columns={triggerColumns({ customLists, customListItems })} data={triggers} />
                </CardContent>
            </Card>
        </div>
    );
}
