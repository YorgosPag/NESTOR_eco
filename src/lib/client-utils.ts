
'use client';

import type { Project } from "@/types";
import { isPast } from 'date-fns';

/**
 * Calculates project metrics on the client-side, including time-sensitive
 * data like 'Delayed' status, which cannot be reliably calculated on the server.
 * This is meant to be used for real-time UI updates after the initial server render.
 * @param project The project object from the server.
 * @returns A project object with accurately calculated client-side metrics.
 */
export function calculateClientProjectMetrics(project: Project): Project {
    if (!project || !project.interventions) {
        return project;
    }

    let totalStages = 0;
    let completedStages = 0;
    let overdueStages = 0;

    project.interventions.forEach(intervention => {
        if (intervention.stages) {
            totalStages += intervention.stages.length;
            intervention.stages.forEach(stage => {
                if (stage.status === 'completed') {
                    completedStages++;
                } else if (stage.status !== 'failed') {
                    if (isPast(new Date(stage.deadline))) {
                        overdueStages++;
                    }
                }
            });
        }
    });

    const progress = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;
    
    let status = project.status;
    if (status !== 'Quotation' && status !== 'Completed') {
        if (progress === 100 && totalStages > 0) {
            status = 'Completed';
        } else if (overdueStages > 0) {
            status = 'Delayed';
        } else {
            status = 'On Track';
        }
    }

    return {
        ...project,
        progress,
        status,
        alerts: overdueStages,
    };
}
