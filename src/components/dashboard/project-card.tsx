
"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Project, Contact } from "@/types";
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
import { calculateClientProjectMetrics } from "@/lib/client-utils";
import { Skeleton } from "../ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  contacts: Contact[];
  onSelectToggle?: (projectId: string, isSelected: boolean) => void;
  isSelected?: boolean;
}

export function ProjectCard({ project: serverProject, contacts, onSelectToggle, isSelected = false }: ProjectCardProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  const project = useMemo(() => {
      // On the server, we use the serverProject directly.
      // On the client, after mounting, we calculate the dynamic metrics.
      if (!isMounted) return serverProject;
      return calculateClientProjectMetrics(serverProject);
  }, [serverProject, isMounted]);


  const owner = contacts.find(c => c.id === project.ownerContactId);
  const ownerAddress = owner ? [owner.addressStreet, owner.addressNumber, owner.addressCity].filter(Boolean).join(' ') : '';


  useEffect(() => {
    setIsMounted(true);
  }, []);

  const statusVariant = {
    'On Track': 'default',
    'Delayed': 'destructive',
    'Completed': 'secondary',
    'Quotation': 'outline',
  }[project.status] as "default" | "destructive" | "secondary" | "outline";

  const statusText = {
    'On Track': 'Εντός Χρονοδιαγράμματος',
    'Delayed': 'Σε Καθυστέρηση',
    'Completed': 'Ολοκληρωμένο',
    'Quotation': 'Σε Προσφορά',
  }[project.status];

  return (
    <Card className={cn("flex flex-col relative", isSelected && "ring-2 ring-primary")}>
      {onSelectToggle && (
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelectToggle(project.id, !!checked)}
            aria-label={`Select project ${project.title}`}
            className="bg-background/80"
          />
        </div>
      )}
      <CardHeader className="p-4 pb-3 bg-primary/15">
        <div className="flex justify-between items-start gap-2">
            <div className="flex-1 space-y-1 pl-7">
                <p className="text-xs text-muted-foreground font-medium">{owner ? `${owner.firstName} ${owner.lastName}` : 'Δ/Υ Ιδιοκτήτης'}</p>
                <div className="text-xs text-muted-foreground space-y-0.5">
                    {project.applicationNumber && <p>Αρ. Αίτησης: {project.applicationNumber}</p>}
                    {ownerAddress && <p className="truncate" title={ownerAddress}>{ownerAddress}</p>}
                </div>
                <CardTitle className="!mt-2 pt-2 border-t border-primary/20">
                    <Link href={`/projects/${project.id}`} className="hover:underline">
                        {project.title}
                    </Link>
                </CardTitle>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 -mr-2 -mt-1">
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
      <CardContent className="flex flex-col gap-4 p-4 flex-grow">
        <div className="flex justify-between items-center text-xs h-5">
            {isMounted ? (
                <>
                    <Badge variant={statusVariant}>{statusText}</Badge>
                    {project.alerts > 0 && <Badge variant="outline" className="text-destructive border-destructive">{project.alerts} Ειδοποιήσεις</Badge>}
                </>
            ) : (
                <Skeleton className="h-full w-2/3" />
            )}
        </div>
        <div>
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>Πρόοδος</span>
            <span>{project.progress}%</span>
          </div>
          <Progress value={project.progress} aria-label={`${project.progress}% ολοκληρωμένο`} />
        </div>
        
        {project.deadline && (
            <div className="border-t pt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span>Προθεσμία: {isMounted ? format(new Date(project.deadline), 'dd/MM/yyyy') : '...'}</span>
                </div>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4 pt-0">
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="text-sm font-semibold cursor-help">
                        {project.budget !== undefined ? `€${project.budget.toLocaleString('el-GR')}` : '-'}
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="max-w-xs text-center">
                        <span className="font-bold">Συνολικός Προϋπολογισμός Έργου</span><br/>
                        (Άθροισμα εγκεκριμένων τιμών, άνευ ΦΠΑ)
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/projects/${project.id}`}>
            Προβολή Έργου
            <ArrowUpRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
