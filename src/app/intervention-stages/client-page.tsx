
"use client";

import { useState, useMemo } from 'react';
import type { Project, Contact, Stage } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Network, Filter } from 'lucide-react';
import { StageCard } from '@/components/projects/stage-card'; // Re-using StageCard for consistency

interface InterventionStagesClientPageProps {
    projects: Project[];
    contacts: Contact[];
}

export function InterventionStagesClientPage({ projects, contacts }: InterventionStagesClientPageProps) {
    const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();

    const projectOptions = useMemo(() => 
        projects.map(p => ({ value: p.id, label: p.title }))
    , [projects]);

    const { project, allStages } = useMemo(() => {
        if (!selectedProjectId) return { project: null, allStages: [] };
        const project = projects.find(p => p.id === selectedProjectId);
        if (!project) return { project: null, allStages: [] };
        
        const stages = project.interventions.flatMap(i => i.stages.map(s => ({...s, interventionMasterId: i.masterId})));
        return { project, allStages: stages };
    }, [selectedProjectId, projects]);

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Network className="h-6 w-6" />
                    Επισκόπηση Σταδίων Παρεμβάσεων
                </CardTitle>
                <CardDescription>Επιλέξτε ένα έργο για να δείτε όλα τα στάδια από όλες τις παρεμβάσεις του.</CardDescription>
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {project && allStages.length === 0 && (
                        <p className="text-muted-foreground text-center py-8 col-span-full">Αυτό το έργο δεν έχει στάδια.</p>
                    )}
                    {project && allStages.map((stage: Stage & { interventionMasterId: string }, index: number) => (
                        <StageCard
                            key={stage.id}
                            stage={stage}
                            project={project}
                            allProjectInterventions={project.interventions}
                            contacts={contacts}
                            owner={contacts.find(c => c.id === project.ownerContactId)}
                            interventionMasterId={stage.interventionMasterId}
                            canMoveUp={index > 0} // Simplified logic for this view
                            canMoveDown={index < allStages.length - 1}
                        />
                    ))}
                </div>
            </CardContent>
        </main>
    );
}
