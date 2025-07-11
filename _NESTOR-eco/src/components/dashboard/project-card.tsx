
"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Project, Contact } from "@/types";
import { cn } from "@/lib/utils";
import { ArrowUpRight, MoreVertical, Pencil, Trash2, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { EditProjectDialog } from "../projects/edit-project-dialog";
import { DeleteProjectDialog } from "../projects/delete-project-dialog";
import { format } from "date-fns";

interface ProjectCardProps {
  project: Project;
  contacts: Contact[];
}

export function ProjectCard({ project, contacts }: ProjectCardProps) {
  const statusVariant = {
    'On Track': 'default',
    'Delayed': 'destructive',
    'Completed': 'secondary',
  }[project.status] as "default" | "destructive" | "secondary";

  const statusText = {
    'On Track': 'Εντός Χρονοδιαγράμματος',
    'Delayed': 'Σε Καθυστέρηση',
    'Completed': 'Ολοκληρωμένο',
  }[project.status];
  
  const owner = contacts.find(c => c.id === project.ownerContactId);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start gap-2">
            <div className="flex-1">
                <CardTitle className="text-lg">
                <Link href={`/projects/${project.id}`} className="hover:underline">
                    {project.title}
                </Link>
                </CardTitle>
                <CardDescription>{owner ? owner.name : 'Χωρίς Ιδιοκτήτη'}</CardDescription>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                        <MoreVertical className="h-4 w-4"/>
                        <span className="sr-only">Ενέργειες Έργου</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ενέργειες Έργου</DropdownMenuLabel>
                    <DropdownMenuSeparator/>
                    <EditProjectDialog project={project} contacts={contacts}>
                         <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Επεξεργασία
                        </DropdownMenuItem>
                    </EditProjectDialog>
                     <DeleteProjectDialog project={project}>
                         <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Διαγραφή
                        </DropdownMenuItem>
                    </DeleteProjectDialog>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex justify-between items-center text-xs">
            <Badge variant={statusVariant}>{statusText}</Badge>
            {project.alerts > 0 && <Badge variant="outline" className="text-destructive border-destructive">{project.alerts} Ειδοποιήσεις</Badge>}
        </div>
        <div>
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>Πρόοδος</span>
            <span>{project.progress}%</span>
          </div>
          <Progress value={project.progress} aria-label={`${project.progress}% ολοκληρωμένο`} />
        </div>
        {project.deadline && (
            <div className="flex items-center text-xs text-muted-foreground gap-2 border-t pt-3">
                <Calendar className="h-4 w-4" />
                <span>Προθεσμία: {format(project.deadline, 'dd/MM/yyyy')}</span>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
         <div className="text-sm font-semibold">€{project.budget.toLocaleString('el-GR')}</div>
        <Button asChild variant="ghost" size="sm">
            <Link href={`/projects/${project.id}`}>
                Προβολή Έργου <ArrowUpRight className="h-4 w-4 ml-2" />
            </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
