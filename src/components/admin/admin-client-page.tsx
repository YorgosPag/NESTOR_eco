
"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle, Shield } from "lucide-react";
import { CreateInterventionDialog } from "./create-intervention-dialog";
import type { MasterIntervention, CustomList, CustomListItem } from "@/types";
import { InterventionsTable } from "./interventions-table";
import { columns } from "./intervention-columns";
import { Card, CardContent } from "../ui/card";

interface AdminClientPageProps {
    masterInterventions: MasterIntervention[];
    customLists: CustomList[];
    customListItems: CustomListItem[];
}

export function AdminClientPage({ masterInterventions, customLists, customListItems }: AdminClientPageProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Shield className="h-6 w-6" />
                        Κατάλογος Παρεμβάσεων
                    </h1>
                    <p className="text-muted-foreground">Κεντρική διαχείριση όλων των master παρεμβάσεων και των επιλογών τους.</p>
                </div>
                 <CreateInterventionDialog customLists={customLists} customListItems={customListItems}>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Νέα Master Παρέμβαση
                    </Button>
                </CreateInterventionDialog>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <InterventionsTable columns={columns({ customLists, customListItems })} data={masterInterventions} />
                </CardContent>
            </Card>
        </div>
    );
}
