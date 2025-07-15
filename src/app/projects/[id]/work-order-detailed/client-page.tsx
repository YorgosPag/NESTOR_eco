"use client";

import { useMemo } from "react";
import type { Project, Contact } from "@/types";
import { WorkOrderView } from "@/components/projects/work-order-view";
import { notFound } from "next/navigation";
import { calculateClientProjectMetrics } from "@/lib/client-utils";

interface WorkOrderDetailedClientPageProps {
    serverProject: Project;
    contacts: Contact[];
    assigneeId?: string;
}

export function WorkOrderDetailedClientPage({ serverProject, contacts, assigneeId }: WorkOrderDetailedClientPageProps) {
    
    const displayProject = useMemo(() => {
        if (!serverProject) return null;
        let projectWithFilteredInterventions = serverProject;

        if (assigneeId) {
            const filteredInterventions = serverProject.interventions.filter(intervention => 
                intervention.stages.some(stage => stage.assigneeContactId === assigneeId)
            );
            projectWithFilteredInterventions = { ...serverProject, interventions: filteredInterventions };
        }
        
        return calculateClientProjectMetrics(projectWithFilteredInterventions);
    }, [serverProject, assigneeId]);

    if (!displayProject) {
        notFound();
    }

    return <WorkOrderView project={displayProject} contacts={contacts} showAssignees={true} />;
}
