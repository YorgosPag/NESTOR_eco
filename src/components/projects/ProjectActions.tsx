
"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Trash2, FileText, Rocket, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditProjectDialog } from "./edit-project-dialog";
import { DeleteProjectDialog } from "./delete-project-dialog";
import { useFormState } from 'react-dom';
import { activateProjectAction } from '@/app/actions/projects';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import type { Project, Contact } from '@/types';
import { AssigneeReportDialog } from './assignee-report-dialog';


function ActivateProjectButton({ projectId }: { projectId: string }) {
    const { toast } = useToast();
    const [state, formAction] = useFormState(activateProjectAction, { success: false, message: null });

    useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast({ title: "Επιτυχία!", description: state.message });
            } else {
                toast({ variant: "destructive", title: "Σφάλμα", description: state.message });
            }
        }
    }, [state, toast]);

    return (
        <form action={formAction}>
            <input type="hidden" name="projectId" value={projectId} />
            <Button type="submit">
                <Rocket className="mr-2 h-4 w-4" />
                Ενεργοποίηση Έργου
            </Button>
        </form>
    );
}


interface ProjectActionsProps {
    project: Project;
    contacts: Contact[];
}

export function ProjectActions({ project, contacts }: ProjectActionsProps) {

    const isQuotation = project.status === 'Quotation';

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <Button asChild variant="outline">
                <Link href="/projects">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Επιστροφή στη Λίστα
                </Link>
            </Button>
            <div className="flex items-center gap-2">
                {!isQuotation && (
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                           <Button variant="outline">
                                Αναφορές Έργου
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/projects/${project.id}/work-order`}>
                                <FileText className="mr-2 h-4 w-4" />
                                Αναφορά Εργασιών
                                </Link>
                            </DropdownMenuItem>
                             <AssigneeReportDialog project={project} contacts={contacts}>
                                 <div className="relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Αναφορά Εργασιών (Αναδόχων)
                                 </div>
                             </AssigneeReportDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
                 {isQuotation && <ActivateProjectButton projectId={project.id} />}
                <EditProjectDialog project={project} contacts={contacts}>
                    <Button variant="outline">
                        <Pencil className="mr-2 h-4 w-4" />
                        Επεξεργασία
                    </Button>
                </EditProjectDialog>
                <DeleteProjectDialog project={project}>
                    <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Διαγραφή
                    </Button>
                </DeleteProjectDialog>
            </div>
        </div>
    );
}
