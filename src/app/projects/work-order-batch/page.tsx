
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import type { Project, Contact } from "@/types";
import { Loader2, Printer, FileText } from "lucide-react";
import { WorkOrderView } from "@/components/projects/work-order-view";
import { getBatchWorkOrderData } from "@/app/actions/projects";
import { Button } from "@/components/ui/button";
import { calculateClientProjectMetrics } from "@/lib/client-utils";

export default function BatchWorkOrderPage() {
    const searchParams = useSearchParams();
    const [serverData, setServerData] = useState<{ projects: Project[], contacts: Contact[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBatchData = async () => {
            const projectIds = searchParams.getAll('ids');
            if (projectIds.length === 0) {
                setError("Δεν επιλέχθηκαν έργα.");
                setLoading(false);
                return;
            }

            try {
                const result = await getBatchWorkOrderData(projectIds);
                if (result.projects.length === 0) {
                    setError("Δεν βρέθηκαν τα επιλεγμένα έργα.");
                } else {
                    setServerData(result);
                }
            } catch (err: any) {
                setError(`Απέτυχε η φόρτωση των δεδομένων: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchBatchData();
    }, [searchParams]);

    const displayData = useMemo(() => {
        if (!serverData) return null;
        return {
            ...serverData,
            projects: serverData.projects.map(p => calculateClientProjectMetrics(p))
        }
    }, [serverData]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">Η αναφορά δημιουργείται, παρακαλώ περιμένετε...</p>
                </div>
            </div>
        );
    }

    if (error) {
         return (
            <div className="flex h-screen w-full items-center justify-center p-4">
                <p className="text-destructive text-center max-w-md">{error}</p>
            </div>
        );
    }
    
    if (!displayData) {
        return (
            <div className="flex h-screen w-full items-center justify-center p-4">
                <p className="text-muted-foreground">Δεν υπάρχουν δεδομένα για εμφάνιση.</p>
            </div>
        );
    }

    return (
        <div>
             <header className="print:hidden p-4 bg-background border-b sticky top-0 z-20">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-h2 flex items-center gap-2">
                           <FileText className="h-5 w-5"/>
                           Μαζική Αναφορά Εργασιών
                        </h1>
                        <p className="text-muted text-sm">{displayData.projects.length} Έργα</p>
                    </div>
                    <Button
                        onClick={() => {
                          requestAnimationFrame(() => window.print());
                        }}
                    >
                        <Printer className="mr-2 h-4 w-4" />
                        Εκτύπωση Όλων
                    </Button>
                </div>
            </header>

            <div className="p-4 md:p-8 space-y-8">
                 {displayData.projects.map((project, index) => (
                    <div key={project.id} className={index < displayData.projects.length - 1 ? "page-break-after" : ""}>
                        <WorkOrderView project={project} contacts={displayData.contacts} isBatch={true} />
                    </div>
                ))}
            </div>
        </div>
    );
}
