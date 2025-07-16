
"use client";

import type { Project, Contact } from '@/types';
import { WorkOrderHeader } from './work-order/WorkOrderHeader';
import { WorkOrderProjectDetails } from './work-order/WorkOrderProjectDetails';
import { WorkOrderInterventionList } from './work-order/WorkOrderInterventionList';

interface WorkOrderViewProps {
    project: Project;
    contacts: Contact[];
    isBatch?: boolean;
    showAssignees?: boolean;
}

export function WorkOrderView({ project, contacts, isBatch = false, showAssignees = false }: WorkOrderViewProps) {
    const owner = contacts.find(c => c.id === project.ownerContactId);

    return (
        <main className="bg-background font-sans print:bg-white">
            {!isBatch && <WorkOrderHeader project={project} />}
            
            <div className="max-w-4xl mx-auto p-8 border rounded-lg bg-card text-card-foreground print:border-none print:shadow-none print:p-0">
                <WorkOrderProjectDetails project={project} owner={owner} />
                <WorkOrderInterventionList project={project} contacts={contacts} showAssignees={showAssignees} />
            </div>

             <div className="text-center mt-8 text-xs text-muted-foreground print:hidden">
                * Για καλύτερη ανάλυση, προτείνεται εκτύπωση σε A4, portrait, χωρίς περιθώρια και χωρίς headers/footers.
            </div>
        </main>
    );
}
