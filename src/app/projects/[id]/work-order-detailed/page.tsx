
"use client";

import { useWorkOrderData } from "@/hooks/useWorkOrderData";
import { WorkOrderDetailedClientPage } from "./client-page";
import { Loader2 } from "lucide-react";


export default function WorkOrderDetailedPage({ params, searchParams }: { params: { id: string }, searchParams: { [key: string]: string | string[] | undefined } }) {
    const id = params.id;
    const assigneeId = searchParams.assigneeId as string | undefined;

    const { data: project, contacts, loading, error } = useWorkOrderData(id);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">Η αναφορά φορτώνεται...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
          <div className="flex h-screen w-full items-center justify-center p-4">
            <p className="text-destructive text-center">
              Απέτυχε η φόρτωση της αναφοράς: {error?.message}
            </p>
          </div>
        )
    }

    if (!project || !contacts) {
        return (
             <div className="flex h-screen w-full items-center justify-center p-4">
                <p className="text-destructive text-center">Δεν βρέθηκαν δεδομένα για το έργο ή τις επαφές.</p>
             </div>
        )
    }

    return (
        <WorkOrderDetailedClientPage
            serverProject={project}
            contacts={contacts}
            assigneeId={assigneeId}
        />
    );
}
