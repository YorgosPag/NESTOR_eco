
"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import type { Project, MasterIntervention, Contact, CustomList, CustomListItem } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuditLogDisplay } from "@/components/projects/audit-log";
import { History, PlusCircle, ChevronsUp, ChevronsDown, FileText, LayoutList } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { AddInterventionDialog } from "./add-intervention-dialog";
import { QuotationSummaryCard } from "./quotation-summary-card";
import { ProjectHeader } from "./ProjectHeader";
import { ProjectActions } from "./ProjectActions";
import { ProjectAlerts } from "./ProjectAlerts";
import { InterventionCard } from "./InterventionCard";
import { calculateClientProjectMetrics } from "@/lib/client-utils";
import { useIsClient } from "@/hooks/use-is-client";

export function ProjectDetails({ project: serverProject, masterInterventions, contacts, customLists, customListItems }: { project: Project, masterInterventions: MasterIntervention[], contacts: Contact[], customLists: CustomList[], customListItems: CustomListItem[] }) {
  const isClient = useIsClient();
  const searchParams = useSearchParams();
  const highlightedInterventionId = searchParams.get('intervention');
  
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]);
  
  useEffect(() => {
    // Expand the highlighted intervention from the URL on initial load
    if (highlightedInterventionId) {
        setOpenAccordionItems(prev => [...new Set([...prev, highlightedInterventionId])]);
    }
  }, [highlightedInterventionId]);

  const project = useMemo(() => {
      if (!isClient) return serverProject;
      return calculateClientProjectMetrics(serverProject);
  }, [serverProject, isClient]);

  
  const owner = contacts.find(c => c.id === project.ownerContactId);
  
  const hasInterventions = project.interventions && project.interventions.length > 0;

  const expandAll = () => {
    const allItemIds = ['summary', 'audit-log', ...project.interventions.map(i => i.masterId)];
    setOpenAccordionItems(allItemIds);
  };
  const collapseAll = () => setOpenAccordionItems([]);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <ProjectHeader project={project} owner={owner} />
      
      <ProjectActions project={project} contacts={contacts} />

      <ProjectAlerts project={project} />
      
      <div className="flex items-center justify-between gap-2">
          <AddInterventionDialog projectId={project.id} customLists={customLists} customListItems={customListItems}>
            <Button variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" />
              Προσθήκη Παρέμβασης
            </Button>
          </AddInterventionDialog>
        {hasInterventions && (
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={expandAll}>
                    <ChevronsDown className="mr-2 h-4 w-4" />
                    Ανάπτυξη Όλων
                </Button>
                <Button variant="outline" size="sm" onClick={collapseAll}>
                    <ChevronsUp className="mr-2 h-4 w-4" />
                    Σύμπτυξη Όλων
                </Button>
            </div>
        )}
      </div>

      <Accordion type="multiple" value={openAccordionItems} onValueChange={setOpenAccordionItems} className="w-full space-y-4">
        {hasInterventions && (
            <AccordionItem value="summary" className="border-b-0">
             <Card>
                <AccordionTrigger className="p-6 hover:no-underline rounded-lg data-[state=open]:rounded-b-none">
                     <div className="flex flex-col items-start text-left">
                        <CardTitle className="flex items-center gap-2">
                           <FileText className="h-5 w-5"/>
                           Συνοπτική Οικονομική Ανάλυση Έργου
                        </CardTitle>
                        <CardDescription className="pt-1">
                           Αναλυτική εικόνα του κόστους, των εσόδων και του περιθωρίου κέρδους.
                        </CardDescription>
                     </div>
                </AccordionTrigger>
                <AccordionContent>
                    <QuotationSummaryCard interventions={project.interventions} />
                </AccordionContent>
             </Card>
            </AccordionItem>
        )}
        
        {project.interventions.map((intervention) => (
            <InterventionCard 
                key={intervention.masterId}
                project={project}
                intervention={intervention}
                allProjectInterventions={project.interventions}
                contacts={contacts}
                customLists={customLists}
                customListItems={customListItems}
                owner={owner}
            />
        ))}

        {!hasInterventions && (
          <div className="text-center text-muted-foreground py-8 border border-dashed rounded-lg">
            Δεν υπάρχουν ακόμη παρεμβάσεις για αυτό το έργο.
          </div>
        )}

        <AccordionItem value="audit-log" className="border-b-0">
            <Card>
                <AccordionTrigger className="p-6 hover:no-underline rounded-lg data-[state=open]:rounded-b-none">
                    <div className="flex flex-col items-start text-left">
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" />
                            Ιστορικό Ενεργειών
                        </CardTitle>
                        <CardDescription className="pt-1">
                           Πλήρες ιστορικό όλων των αλλαγών σε αυτό το έργο.
                        </CardDescription>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <CardContent className="pt-6">
                        <AuditLogDisplay auditLogs={project.auditLog} />
                    </CardContent>
                </AccordionContent>
            </Card>
        </AccordionItem>
      </Accordion>
    </main>
  );
}
