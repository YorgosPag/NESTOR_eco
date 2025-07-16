
"use client";

import { useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectCard } from '@/components/dashboard/project-card';
import { Users, DollarSign, FileText, PlusCircle, ArrowRight, Activity, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OverviewChart } from '@/components/dashboard/overview-chart';
import { UpcomingDeadlines } from '@/components/dashboard/upcoming-deadlines';
import type { Project, Contact } from '@/types';
import { calculateClientProjectMetrics } from '@/lib/client-utils';

interface DashboardClientPageProps {
    projects: Project[];
    contacts: Contact[];
}

export function DashboardClientPage({ projects: serverProjects, contacts }: DashboardClientPageProps) {
    
    const projects = useMemo(() => serverProjects.map(p => calculateClientProjectMetrics(p)), [serverProjects]);

    const activeProjects = projects.filter(p => p.status === 'On Track' || p.status === 'Delayed');
    const quotationProjects = projects.filter(p => p.status === 'Quotation');

    const onTrackProjects = activeProjects.filter(p => p.status === 'On Track').length;
    const delayedProjects = activeProjects.filter(p => p.status === 'Delayed').length;
    const totalBudget = activeProjects.reduce((sum, p) => sum + (p.budget ?? 0), 0);
    const totalQuotations = quotationProjects.length;

    const budgetByStatus = activeProjects.reduce((acc, project) => {
        const statusMap: { [key in Project['status']]?: string } = {
            'On Track': 'Εντός',
            'Delayed': 'Καθυστέρηση',
        };
        const statusName = statusMap[project.status];
        if (statusName) {
            if (!acc[statusName]) {
                acc[statusName] = 0;
            }
            acc[statusName] += (project.budget ?? 0);
        }
        return acc;
    }, {} as Record<string, number>);

    const chartData = Object.keys(budgetByStatus).map(statusName => ({
        name: statusName,
        total: budgetByStatus[statusName] || 0,
    }));

    const upcomingDeadlines = activeProjects
        .flatMap(p =>
            p.interventions.flatMap(i =>
                i.stages.map(s => ({
                    ...s,
                    projectId: p.id,
                    projectTitle: p.title,
                }))
            )
        )
        .filter(stage => stage.status !== 'completed' && new Date(stage.deadline) >= new Date())
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        .slice(0, 5)
        .map(stage => ({
            projectId: stage.projectId,
            projectTitle: stage.projectTitle,
            stageId: stage.id, // Pass stageId for unique key
            stageTitle: stage.title,
            deadline: stage.deadline,
            assigneeContactId: stage.assigneeContactId
        }));

    const recentActiveProjects = activeProjects.slice(0, 4);
    const recentQuotations = quotationProjects.slice(0, 4);

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-h1 flex items-center gap-2">
                        <LayoutGrid className="h-6 w-6" />
                        Πίνακας Ελέγχου
                    </h1>
                    <p className="text-muted">Μια γενική επισκόπηση της κατάστασης των έργων και των προσφορών σας.</p>
                </div>
                <Button asChild>
                    <Link href="/projects/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Δημιουργία Έργου/Προσφοράς
                    </Link>
                </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Συνολικός Προϋπολογισμός (Ενεργά)
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">€{totalBudget.toLocaleString('el-GR')}</div>
                        <p className="text-xs text-muted-foreground">
                            Σε {activeProjects.length} ενεργά έργα
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Έργα εντός Χρονοδιαγράμματος
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{onTrackProjects}</div>
                        <p className="text-xs text-muted-foreground">
                            από σύνολο {activeProjects.length} ενεργών
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Έργα σε Καθυστέρηση</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{delayedProjects}</div>
                        <p className="text-xs text-muted-foreground">
                            Απαιτούν προσοχή
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Προσφορές σε εκκρεμότητα</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalQuotations}</div>
                        <p className="text-xs text-muted-foreground">
                            Αναμένουν έγκριση
                        </p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-7">
                <OverviewChart data={chartData} />
                <UpcomingDeadlines deadlines={upcomingDeadlines} contacts={contacts} />
            </div>
            <div className="space-y-8">
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-h2">Πρόσφατα Ενεργά Έργα</h2>
                        <Button variant="outline" asChild>
                            <Link href="/projects">
                                Προβολή Όλων <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                    <div className="grid gap-4 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {recentActiveProjects.length > 0 ? (
                            recentActiveProjects.map((project) => (
                                <ProjectCard key={project.id} project={project} contacts={contacts} />
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground col-span-full italic">Δεν υπάρχουν ενεργά έργα. Ξεκίνα το επόμενο σου αριστούργημα σήμερα!</p>
                        )}
                    </div>
                </div>
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-h2">Πρόσφατες Προσφορές</h2>
                        <Button variant="outline" asChild>
                            <Link href="/projects">
                                Προβολή Όλων <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                    <div className="grid gap-4 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {recentQuotations.length > 0 ? (
                            recentQuotations.map((project) => (
                                <ProjectCard key={project.id} project={project} contacts={contacts} />
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground col-span-full italic">Ούτε μία προσφορά σε εκκρεμότητα. Η ηρεμία πριν την καταιγίδα των deals;</p>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

    