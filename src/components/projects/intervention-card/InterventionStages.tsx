
"use client";

import type { Project, ProjectIntervention, Contact } from "@/types";
import { InterventionPipeline } from "@/components/projects/intervention-pipeline";
import { AddStageDialog } from "@/components/projects/add-stage-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface InterventionStagesProps {
    project: Project;
    intervention: ProjectIntervention;
    contacts: Contact[];
    owner?: Contact;
}

export function InterventionStages({ project, intervention, contacts, owner }: InterventionStagesProps) {
    return (
        <div className="border-t -mx-6 px-6 pt-6">
            <h4 className="text-h4">Στάδια Υλοποίησης</h4>
            <InterventionPipeline
                stages={intervention.stages}
                project={project}
                allProjectInterventions={project.interventions}
                contacts={contacts}
                owner={owner}
                interventionMasterId={intervention.masterId}
            />
            <div className="flex justify-start pt-2 mt-4">
                <AddStageDialog projectId={project.id} interventionMasterId={intervention.masterId} contacts={contacts}>
                    <Button variant="outline" size="sm">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Προσθήκη Νέου Σταδίου
                    </Button>
                </AddStageDialog>
            </div>
        </div>
    );
}
