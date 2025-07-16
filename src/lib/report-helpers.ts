
import type { Project, Contact, Stage, ChartData } from '@/types';
import { getProfitability } from './intervention-helpers';

type GroupingOption = 'assignee' | 'supervisor' | 'status' | 'interventionCategory' | 'project';
type FinancialFilterOption = 'all' | 'profitable' | 'lossmaking';

interface StageWithDetails extends Stage {
    projectId: string;
    projectTitle: string;
    projectStatus: Project['status'];
    interventionCategory: string;
    assignee?: Contact;
    supervisor?: Contact;
}

interface FilterStagesPayload {
    projects: Project[];
    contacts: Contact[];
    financialFilter: FinancialFilterOption;
    selectedProjects: string[];
    selectedStatuses: string[];
    selectedAssignees: string[];
    selectedSupervisors: string[];
}

export function filterStages({
    projects,
    contacts,
    financialFilter,
    selectedProjects,
    selectedStatuses,
    selectedAssignees,
    selectedSupervisors,
}: FilterStagesPayload): StageWithDetails[] {
    
    const projectsWithFinancials = projects.map(project => {
        const summary = project.interventions.reduce((acc, intervention) => {
            const { internalCost, programBudget } = intervention.subInterventions?.reduce((subAcc, sub) => {
                const subProfitability = getProfitability(sub);
                subAcc.internalCost += subProfitability.internalCost;
                subAcc.programBudget += sub.cost;
                return subAcc;
            }, { internalCost: 0, programBudget: 0 }) || { internalCost: 0, programBudget: 0 };
            
            acc.internalCost += internalCost;
            acc.programBudget += programBudget;
            return acc;
        }, { internalCost: 0, programBudget: 0 });
        return {
            ...project,
            profit: summary.programBudget - summary.internalCost,
        };
    });

    const financiallyFilteredProjectIds = projectsWithFinancials.filter(p => {
        if (financialFilter === 'profitable') return p.profit > 0;
        if (financialFilter === 'lossmaking') return p.profit < 0;
        return true;
    }).map(p => p.id);

    return projects
        .filter(p => financiallyFilteredProjectIds.includes(p.id))
        .flatMap(p =>
            p.interventions.flatMap(i =>
                i.stages.map(s => ({
                    ...s,
                    projectId: p.id,
                    projectTitle: p.title,
                    projectStatus: p.status,
                    interventionCategory: i.interventionCategory,
                    assignee: contacts.find(c => c.id === s.assigneeContactId),
                    supervisor: contacts.find(c => c.id === s.supervisorContactId),
                }))
            )
    ).filter(stage => {
        const assigneeMatch = selectedAssignees.length === 0 || (stage.assignee && selectedAssignees.includes(stage.assignee.id));
        const supervisorMatch = selectedSupervisors.length === 0 || (stage.supervisor && selectedSupervisors.includes(stage.supervisor.id));
        const projectMatch = selectedProjects.length === 0 || selectedProjects.includes(stage.projectId);
        const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(stage.status);
        return assigneeMatch && supervisorMatch && projectMatch && statusMatch;
    });
}


export function groupStages(
    stages: StageWithDetails[], 
    grouping: GroupingOption,
    statusOptions: { value: string, label: string }[]
): { title: string; stages: StageWithDetails[] }[] {

    const groups = new Map<string, { title: string; stages: StageWithDetails[] }>();

    stages.forEach(stage => {
        let key: string | undefined;
        let title: string | undefined;

        switch (grouping) {
            case 'assignee':
                key = stage.assignee?.id || 'unassigned';
                title = stage.assignee ? `${stage.assignee.firstName} ${stage.assignee.lastName}` : 'Χωρίς Ανάθεση';
                break;
            case 'supervisor':
                key = stage.supervisor?.id || 'unassigned';
                title = stage.supervisor ? `${stage.supervisor.firstName} ${stage.supervisor.lastName}` : 'Χωρίς Επιβλέποντα';
                break;
            case 'status':
                key = stage.status;
                title = statusOptions.find(opt => opt.value === stage.status)?.label || stage.status;
                break;
            case 'interventionCategory':
                key = stage.interventionCategory;
                title = stage.interventionCategory;
                break;
            case 'project':
            default:
                key = stage.projectId;
                title = stage.projectTitle;
                break;
        }

        if (!key || !title) return;

        if (!groups.has(key)) {
            groups.set(key, { title, stages: [] });
        }
        const group = groups.get(key)!;
        group.stages.push(stage);
    });

    return Array.from(groups.values()).sort((a,b) => a.title.localeCompare(b.title));
}


export function generateStatusChartData(
    stages: StageWithDetails[],
    statusOptions: { value: string, label: string }[]
): ChartData | null {
    if (stages.length === 0) return null;
    const statusCounts = stages.reduce((acc, stage) => {
        const statusLabel = statusOptions.find(opt => opt.value === stage.status)?.label || stage.status;
        acc[statusLabel] = (acc[statusLabel] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    
    return {
        type: 'pie',
        title: 'Κατανομή Σταδίων ανά Κατάσταση',
        data: Object.entries(statusCounts).map(([name, value]) => ({ name, value })),
    };
}


export function generateAssigneeChartData(stages: StageWithDetails[]): ChartData | null {
    if (stages.length === 0) return null;
    const assigneeCounts = stages.reduce((acc, stage) => {
        const assigneeName = stage.assignee ? `${stage.assignee.firstName} ${stage.assignee.lastName}` : 'Χωρίς Ανάθεση';
        acc[assigneeName] = (acc[assigneeName] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return {
        type: 'bar',
        title: 'Αριθμός Σταδίων ανά Ανάδοχο',
        data: Object.entries(assigneeCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    };
}
