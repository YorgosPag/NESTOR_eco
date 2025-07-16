
"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Button, buttonVariants } from "@/components/ui/button";
import { EditInterventionDialog } from "@/components/projects/edit-intervention-dialog";
import { DeleteInterventionDialog } from "@/components/projects/delete-intervention-dialog";
import { Pencil, Trash2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project, ProjectIntervention, CustomList, CustomListItem } from "@/types";

interface InterventionCardHeaderProps {
    interventionName: string;
    project: Project;
    intervention: ProjectIntervention;
    customLists: CustomList[];
    customListItems: CustomListItem[];
}

export function InterventionCardHeader({
    interventionName,
    project,
    intervention,
    customLists,
    customListItems
}: InterventionCardHeaderProps) {
    return (
        <AccordionPrimitive.Trigger className="flex w-full items-center justify-between p-4 bg-muted/50 hover:bg-muted transition-colors [&[data-state=open]>svg]:rotate-180">
            <div className="flex-1 text-left">
                <h3 className="text-h3">{interventionName}</h3>
            </div>
            <div className="flex items-center gap-2">
                <div onClick={(e) => e.stopPropagation()}>
                    <EditInterventionDialog project={project} intervention={intervention} customLists={customLists} customListItems={customListItems}>
                        <div className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), "h-8 w-8 cursor-pointer")}>
                            <Pencil className="h-4 w-4" />
                        </div>
                    </EditInterventionDialog>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                    <DeleteInterventionDialog project={project} intervention={intervention}>
                         <div className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), "h-8 w-8 text-destructive hover:text-destructive cursor-pointer")}>
                            <Trash2 className="h-4 w-4" />
                         </div>
                    </DeleteInterventionDialog>
                </div>
                <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200" />
            </div>
        </AccordionPrimitive.Trigger>
    );
}
