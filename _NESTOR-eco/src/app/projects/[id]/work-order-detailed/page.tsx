
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Project, Contact } from "@/types";
import { Loader2 } from "lucide-react";
import { WorkOrderView } from "@/components/projects/work-order-view";
import { getBatchWorkOrderData } from "@/app/actions/projects";
import { notFound } from "next/navigation";

export default function WorkOrderDetailedPage({ params }: { params: { id: string } }) {
    const searchParams = useSearchParams();
    const assigneeId = searchParams.get('assigneeId');
    const [project, setProject] = useState<Project | null>(null);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await getBatchWorkOrderData([params.id]);
                const proj = result.projects[0];
                if (!proj) {
                    setError("Project not found.");
                    setIsLoading(false);
                    return;
                }

                if (assigneeId) {
                    const filteredInterventions = proj.interventions.filter(intervention => 
                        intervention.stages.some(stage => stage.assigneeContactId === assigneeId)
                    );
                    setProject({ ...proj, interventions: filteredInterventions });
                } else {
                    setProject(proj);
                }

                setContacts(result.contacts);
            } catch (err: any) {
                setError(err.message || "Failed to load data.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [params.id, assigneeId]);

    if (isLoading) {
        return (
             <div className="flex h-screen w-full items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">Φόρτωση αναφοράς...</p>
                </div>
            </div>
        )
    }
    
    if (error) {
        return (
            <div className="flex h-screen w-full items-center justify-center p-4">
                <p className="text-destructive text-center">{error}</p>
            </div>
        )
    }

    if (!project) {
        notFound();
    }

    return <WorkOrderView project={project} contacts={contacts} showAssignees={true} />;
}
