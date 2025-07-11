
"use client";

import { useState, useMemo } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ProjectCard } from "@/components/dashboard/project-card";
import type { Project, Contact } from "@/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, Database, FolderSearch, FolderKanban, Search, ChevronDown, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { normalizeForSearch } from "@/lib/text-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from 'next/navigation';

const EmptyStateFiltered = ({ title = "Δεν βρέθηκαν έργα", description = "Δεν υπάρχουν έργα που να ταιριάζουν σε αυτήν την κατηγορία." }) => (
    <div className="flex flex-col col-span-full items-center justify-center rounded-lg border border-dashed shadow-sm p-8 mt-4 min-h-[400px]">
        <FolderSearch className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-h2">{title}</h3>
        <p className="text-muted mt-2">{description}</p>
    </div>
);

// We need to make this a client component to handle search state
interface ProjectsPageProps {
    projects: Project[];
    contacts: Contact[];
}

export function ProjectsClientPage({ projects, contacts }: ProjectsPageProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
    const [isReportLoading, setIsReportLoading] = useState(false);
    const router = useRouter();

    const handleToggleProjectSelection = (projectId: string, isSelected: boolean) => {
        if (isSelected) {
            setSelectedProjects(prev => [...prev, projectId]);
        } else {
            setSelectedProjects(prev => prev.filter(id => id !== projectId));
        }
    };

    const filteredProjects = useMemo(() => {
        if (!searchTerm.trim()) {
            return projects;
        }
        
        const normalizedFilter = normalizeForSearch(searchTerm);
        
        return projects.filter(project => {
            const owner = contacts.find(c => c.id === project.ownerContactId);
            const ownerName = owner ? `${owner.firstName} ${owner.lastName}` : '';
            
            const haystack = [
                project.title,
                project.applicationNumber,
                ownerName
            ].filter(Boolean).join(' ');
            
            const normalizedHaystack = normalizeForSearch(haystack);
            
            return normalizedHaystack.includes(normalizedFilter);
        });
    }, [projects, contacts, searchTerm]);
    
    const handleGenerateReport = () => {
        if (selectedProjects.length === 0) return;
        setIsReportLoading(true);
        const params = new URLSearchParams();
        selectedProjects.forEach(id => params.append('ids', id));
        router.push(`/projects/work-order-batch?${params.toString()}`);
        // We don't setIsReportLoading(false) because the page will navigate away.
    };

    const quotationProjects = filteredProjects.filter(p => p.status === 'Quotation');
    const onTrackProjects = filteredProjects.filter(p => p.status === 'On Track');
    const delayedProjects = filteredProjects.filter(p => p.status === 'Delayed');
    const completedProjects = filteredProjects.filter(p => p.status === 'Completed');
    const allNonCompletedProjects = [...quotationProjects, ...onTrackProjects, ...delayedProjects];


    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-h1 flex items-center gap-2">
                        <FolderKanban className="h-6 w-6" />
                        Λίστα Έργων & Προσφορών
                    </h1>
                    <p className="text-muted">Δείτε και διαχειριστείτε όλες τις προσφορές, τα ενεργά και τα ολοκληρωμένα έργα.</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Button asChild>
                    <Link href="/projects/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Δημιουργία Έργου/Προσφοράς
                    </Link>
                    </Button>
                </div>
            </div>

            <div className="flex items-center justify-between py-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Αναζήτηση έργου, αίτησης, ή ιδιοκτήτη..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" disabled={selectedProjects.length === 0 || isReportLoading}>
                                Αναφορές Έργων ({selectedProjects.length})
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleGenerateReport} disabled={isReportLoading}>
                                {isReportLoading ? (
                                    'Δημιουργία...'
                                ) : (
                                    <><FileText className="mr-2 h-4 w-4" />Αναφορά Εργασιών</>
                                )}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <Tabs defaultValue="all">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
                    <TabsTrigger value="all">Όλα ({allNonCompletedProjects.length})</TabsTrigger>
                    <TabsTrigger value="quotation">Σε Προσφορά ({quotationProjects.length})</TabsTrigger>
                    <TabsTrigger value="on_track">Εντός ({onTrackProjects.length})</TabsTrigger>
                    <TabsTrigger value="delayed">Καθυστέρηση ({delayedProjects.length})</TabsTrigger>
                    <TabsTrigger value="completed">Ολοκληρωμένα ({completedProjects.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4">
                    {projects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed shadow-sm p-8 mt-4 min-h-[400px]">
                            <h3 className="text-h2">Δεν έχετε ακόμα ενεργά έργα</h3>
                            <p className="text-muted mt-2 max-w-md text-center">
                                Για να ξεκινήσετε, μπορείτε να δημιουργήσετε το πρώτο σας έργο ή προσφορά.
                            </p>
                            <div className="mt-6 flex gap-4">
                                <Button asChild>
                                    <Link href="/projects/new">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Δημιουργία Έργου/Προσφοράς
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ) : allNonCompletedProjects.length > 0 ? (
                        <div className="grid gap-4 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {allNonCompletedProjects.map((project) => (
                                <ProjectCard key={project.id} project={project} contacts={contacts} onSelectToggle={handleToggleProjectSelection} isSelected={selectedProjects.includes(project.id)} />
                            ))}
                        </div>
                    ) : (
                        <EmptyStateFiltered title="Δεν βρέθηκαν έργα" description="Δοκιμάστε έναν διαφορετικό όρο αναζήτησης." />
                    )}
                </TabsContent>
                <TabsContent value="quotation" className="mt-4">
                    {quotationProjects.length > 0 ? (
                        <div className="grid gap-4 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {quotationProjects.map((project) => (
                                <ProjectCard key={project.id} project={project} contacts={contacts} onSelectToggle={handleToggleProjectSelection} isSelected={selectedProjects.includes(project.id)} />
                            ))}
                        </div>
                    ) : <EmptyStateFiltered title="Δεν βρέθηκαν προσφορές" description="Δεν υπάρχουν έργα σε φάση προσφοράς που να ταιριάζουν με την αναζήτησή σας." />}
                </TabsContent>
                <TabsContent value="on_track" className="mt-4">
                    {onTrackProjects.length > 0 ? (
                        <div className="grid gap-4 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {onTrackProjects.map((project) => (
                                <ProjectCard key={project.id} project={project} contacts={contacts} onSelectToggle={handleToggleProjectSelection} isSelected={selectedProjects.includes(project.id)} />
                            ))}
                        </div>
                    ) : <EmptyStateFiltered />}
                </TabsContent>
                <TabsContent value="delayed" className="mt-4">
                     {delayedProjects.length > 0 ? (
                        <div className="grid gap-4 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {delayedProjects.map((project) => (
                                <ProjectCard key={project.id} project={project} contacts={contacts} onSelectToggle={handleToggleProjectSelection} isSelected={selectedProjects.includes(project.id)} />
                            ))}
                        </div>
                    ) : <EmptyStateFiltered />}
                </TabsContent>
                <TabsContent value="completed" className="mt-4">
                    {completedProjects.length > 0 ? (
                        <div className="grid gap-4 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {completedProjects.map((project) => (
                                <ProjectCard key={project.id} project={project} contacts={contacts} onSelectToggle={handleToggleProjectSelection} isSelected={selectedProjects.includes(project.id)} />
                            ))}
                        </div>
                    ) : <EmptyStateFiltered />}
                </TabsContent>
            </Tabs>
        </main>
    )
}
