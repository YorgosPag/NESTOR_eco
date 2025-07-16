
"use client";

import { useState, useMemo } from 'react';
import type { Project, Contact, ProjectIntervention } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { ClipboardList, Filter } from 'lucide-react';
import Link from 'next/link';

interface ProjectInterventionsClientPageProps {
    projects: Project[];
    contacts: Contact[];
}

export function ProjectInterventionsClientPage({ projects, contacts }: ProjectInterventionsClientPageProps) {
    const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();

    const projectOptions = useMemo(() => 
        projects.map(p => ({ value: p.id, label: p.title }))
    , [projects]);

    const displayedInterventions = useMemo(() => {
        if (!selectedProjectId) return [];
        const project = projects.find(p => p.id === selectedProjectId);
        return project ? project.interventions : [];
    }, [selectedProjectId, projects]);

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-6 w-6" />
                    Επισκόπηση Παρεμβάσεων Έργων
                </CardTitle>
                <CardDescription>Επιλέξτε ένα έργο για να δείτε τις παρεμβάσεις του.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col gap-4 p-4 border rounded-lg bg-muted/50 max-w-lg">
                    <div className="flex items-center gap-2 font-semibold text-sm">
                        <Filter className="w-4 h-4"/>
                        Επιλογή Έργου
                    </div>
                    <SearchableSelect
                        options={projectOptions}
                        value={selectedProjectId}
                        onValueChange={setSelectedProjectId}
                        placeholder="Επιλέξτε ένα έργο..."
                        searchPlaceholder="Αναζήτηση έργου..."
                        emptyMessage="Δεν βρέθηκε έργο."
                    />
                </div>
                
                <div className="space-y-4">
                    {selectedProjectId && displayedInterventions.length === 0 && (
                        <p className="text-muted-foreground text-center py-8">Αυτό το έργο δεν έχει παρεμβάσεις.</p>
                    )}
                    {displayedInterventions.map((intervention: ProjectIntervention) => (
                        <Link 
                            key={intervention.masterId} 
                            href={`/projects/${selectedProjectId}?intervention=${intervention.masterId}`} 
                            className="block hover:shadow-lg transition-shadow rounded-lg"
                            aria-label={`View intervention: ${intervention.interventionSubcategory || intervention.interventionCategory}`}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle>{intervention.interventionSubcategory || intervention.interventionCategory}</CardTitle>
                                    <CardDescription>
                                        {intervention.stages.length} στάδια | Κόστος: {(intervention.totalCost || 0).toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </main>
    );
}
