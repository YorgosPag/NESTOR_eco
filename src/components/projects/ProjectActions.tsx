
"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Trash2, FileText, Rocket } from "lucide-react";
import { EditProjectDialog } from "./edit-project-dialog";
import { DeleteProjectDialog } from "./delete-project-dialog";
import { useFormState } from 'react-dom';
import { activateProjectAction } from '@/app/actions/projects';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import type { Project, Contact } from '@/types';


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
                     <Button asChild variant="outline">
                        <Link href={`/projects/${project.id}/work-order`}>
                            <FileText className="mr-2 h-4 w-4" />
                            Αναφορά Εργασιών
                        </Link>
                    </Button>
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
