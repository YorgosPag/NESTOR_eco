
import type { Project, User } from "@/types";
import { isPast } from 'date-fns';

export const users: User[] = [
    {
      id: "user-1",
      name: "Alice",
      email: "alice@example.com",
      avatar: "https://i.pravatar.cc/150?u=user-1",
      role: "Admin",
    },
    {
      id: "user-2",
      name: "Bob",
      email: "bob@example.com",
      avatar: "https://i.pravatar.cc/150?u=user-2",
      role: "Supplier",
    },
    {
      id: "user-3",
      name: "Charlie",
      email: "charlie@example.com",
      avatar: "https://i.pravatar.cc/150?u=user-3",
      role: "Client",
    },
];

// This function can be run on server or client. `isClient` flag handles time-sensitive data.
export function calculateProjectMetrics(project: Omit<Project, 'progress' | 'alerts' | 'budget'> & { id: string }, isClient: boolean = false): Project {
    if (!project || !project.interventions) {
        return project as Project;
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
                } else if (isClient && stage.status !== 'failed') {
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
        } else if (isClient && overdueStages > 0) {
            status = 'Delayed';
        } else {
            status = 'On Track';
        }
    }

    const sortedInterventions = [...project.interventions].sort((a, b) => 
        (a.interventionSubcategory || a.interventionCategory).localeCompare(b.interventionSubcategory || b.interventionCategory)
    );
    
    let totalProjectBudget = 0;
    const interventionsWithRecalculatedCosts = sortedInterventions.map(intervention => {
        const interventionTotalCost = intervention.subInterventions?.reduce((sum, sub) => sum + sub.cost, 0) || 0;
        totalProjectBudget += interventionTotalCost;
        
        const romanNumeralMatch = (intervention.expenseCategory || '').match(/\((I|II|III|IV|V|VI|VII|VIII|IX|X)\)/);
        const romanNumeral = romanNumeralMatch ? ` (${romanNumeralMatch[1]})` : '';

        const updatedSubInterventions = intervention.subInterventions?.map(sub => ({
            ...sub,
            displayCode: `${sub.subcategoryCode}${romanNumeral}`
        }));

        return {
            ...intervention,
            totalCost: interventionTotalCost,
            subInterventions: updatedSubInterventions
        };
    });

    return {
        ...project,
        interventions: interventionsWithRecalculatedCosts,
        budget: totalProjectBudget,
        progress,
        status,
        alerts: overdueStages,
    };
}
