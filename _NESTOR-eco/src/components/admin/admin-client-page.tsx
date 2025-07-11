
"use client";

import type { MasterIntervention } from "@/types";
import { InterventionsTable } from "@/components/admin/interventions-table";
import { columns } from "@/components/admin/intervention-columns";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { CreateInterventionDialog } from "@/components/admin/create-intervention-dialog";


interface AdminClientPageProps {
    masterInterventions: MasterIntervention[];
}

export function AdminClientPage({ masterInterventions }: AdminClientPageProps) {
    if (!masterInterventions) {
        return (
             <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8">
                <div className="flex flex-col items-center gap-1 text-center">
                    <h3 className="text-2xl font-bold tracking-tight">
                        Σφάλμα Φόρτωσης
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Δεν ήταν δυνατή η φόρτωση των παρεμβάσεων από τη βάση δεδομένων.
                    </p>
                </div>
            </div>
        )
    }

    if (masterInterventions.length === 0) {
        return (
             <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8">
                <div className="flex flex-col items-center gap-1 text-center">
                    <h3 className="text-2xl font-bold tracking-tight">
                        Δεν υπάρχουν Master Παρεμβάσεις
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Δεν έχουν οριστεί ακόμα τιμές. Προσθέστε την πρώτη για να ξεκινήσετε.
                    </p>
                    <CreateInterventionDialog>
                        <Button className="mt-4">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Νέα Master Παρέμβαση
                        </Button>
                    </CreateInterventionDialog>
                </div>
            </div>
        )
    }
    
    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Διαχείριση Triggers</h1>
                    <p className="text-muted-foreground">Κεντρική διαχείριση όλων των master παρεμβάσεων και των επιλογών τους.</p>
                </div>
                 <CreateInterventionDialog>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Νέα Master Παρέμβαση
                    </Button>
                </CreateInterventionDialog>
            </div>
            
            <InterventionsTable columns={columns} data={masterInterventions} />
        </>
    )
}
