
import { getTriggers } from "@/lib/triggers-data";
import { getCustomLists, getAllCustomListItems } from "@/lib/custom-lists-data";
import { getAdminDb } from "@/lib/firebase-admin";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, BellRing } from "lucide-react";
import { CreateTriggerDialog } from "@/components/admin/triggers/create-trigger-dialog";
import { TriggersTable } from "@/components/admin/triggers/triggers-table";
import { columns as triggerColumns } from "@/components/admin/triggers/trigger-columns";

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
