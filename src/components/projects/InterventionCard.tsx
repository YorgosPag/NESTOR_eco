
"use client";

import type { Project, ProjectIntervention, Contact, CustomList, CustomListItem } from "@/types";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Card, CardContent } from "@/components/ui/card";
import { AccordionContent, AccordionItem } from "@/components/ui/accordion";
import { InterventionCardHeader } from './intervention-card/InterventionCardHeader';
import { InterventionCostAnalysis } from './intervention-card/InterventionCostAnalysis';
import { InterventionStages } from './intervention-card/InterventionStages';

interface InterventionCardProps {
    project: Project;
    intervention: ProjectIntervention;
    contacts: Contact[];
    customLists: CustomList[];
    customListItems: CustomListItem[];
    owner?: Contact;
}

export function InterventionCard({ project, intervention, contacts, customLists, customListItems, owner }: InterventionCardProps) {
    const interventionName = intervention.interventionSubcategory || intervention.interventionCategory;

    return (
        <AccordionItem value={intervention.masterId} className="border-none">
            <Card className="overflow-hidden">
                <AccordionPrimitive.Header className="flex">
                    <InterventionCardHeader
                        interventionName={interventionName}
                        project={project}
                        intervention={intervention}
                        customLists={customLists}
                        customListItems={customListItems}
                    />
                </AccordionPrimitive.Header>
                <AccordionContent>
                    <div className="px-6 pb-6 space-y-6">
                        <InterventionCostAnalysis
                            project={project}
                            intervention={intervention}
                            customLists={customLists}
                            customListItems={customListItems}
                        />
                        <InterventionStages
                            project={project}
                            intervention={intervention}
                            contacts={contacts}
                            owner={owner}
                        />
                    </div>
                </AccordionContent>
            </Card>
        </AccordionItem>
    );
}
