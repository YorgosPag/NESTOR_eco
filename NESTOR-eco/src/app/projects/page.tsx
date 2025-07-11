
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ProjectCard } from "@/components/dashboard/project-card";
import { getAllProjects } from "@/lib/data";
import { getContacts } from "@/lib/contacts-data";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default async function ProjectsPage() {
    const [projects, contacts] = await Promise.all([
        getAllProjects(),
        getContacts(),
    ]);

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Λίστα Έργων</h1>
                    <p className="text-muted-foreground">Δείτε και διαχειριστείτε όλα τα ενεργά και ολοκληρωμένα έργα.</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Button asChild>
                    <Link href="/projects/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Δημιουργία Έργου
                    </Link>
                    </Button>
                </div>
            </div>
             <Tabs defaultValue="all">
                <TabsList>
                    <TabsTrigger value="all">Όλα</TabsTrigger>
                    <TabsTrigger value="on_track">Εντός Χρονοδιαγράμματος</TabsTrigger>
                    <TabsTrigger value="delayed">Σε Καθυστέρηση</TabsTrigger>
                    <TabsTrigger value="completed">Ολοκληρωμένα</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4">
                <div className="grid gap-4 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} contacts={contacts} />
                    ))}
                </div>
                </TabsContent>
                <TabsContent value="on_track" className="mt-4">
                    <div className="grid gap-4 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {projects.filter(p => p.status === 'On Track').map((project) => (
                        <ProjectCard key={project.id} project={project} contacts={contacts} />
                    ))}
                </div>
                </TabsContent>
                <TabsContent value="delayed" className="mt-4">
                    <div className="grid gap-4 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {projects.filter(p => p.status === 'Delayed').map((project) => (
                        <ProjectCard key={project.id} project={project} contacts={contacts} />
                    ))}
                </div>
                </TabsContent>
                <TabsContent value="completed" className="mt-4">
                    <div className="grid gap-4 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {projects.filter(p => p.status === 'Completed').map((project) => (
                        <ProjectCard key={project.id} project={project} contacts={contacts} />
                    ))}
                </div>
                </TabsContent>
            </Tabs>
        </main>
    )
}
