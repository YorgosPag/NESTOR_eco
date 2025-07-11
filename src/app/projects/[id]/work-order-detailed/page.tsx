
"use client";

import { useSearchParams } from "next/navigation";
import { getProjectById } from "@/lib/data";
import { notFound } from "next/navigation";
import { getContacts } from "@/lib/contacts-data";
import { getAdminDb } from "@/lib/firebase-admin";
import { WorkOrderView } from "@/components/projects/work-order-view";
import { useEffect, useState } from "react";
import type { Project, Contact } from "@/types";
import { Loader2 } from "lucide-react";

export default function WorkOrderDetailedPage({ params }: { params: { id: string } }) {
    const searchParams = useSearchParams();
    const assigneeId = searchParams.get('assigneeId');
    const [project, setProject] = useState<Project | null>(null);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const db = getAdminDb();
            const [proj, cont] = await Promise.all([
                getProjectById(db, params.id),
                getContacts(db),
            ]);

            if (!proj) {
                // Handle not found case, maybe redirect or show error
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

            setContacts(cont);
            setIsLoading(false);
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

    if (!project) {
        notFound();
    }

    return <WorkOrderView project={project} contacts={contacts} showAssignees={true} />;
}
