
"use client";

import { useState, useEffect } from "react";
import type { Project, MasterIntervention, Contact, CustomList, CustomListItem, ProjectIntervention } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AuditLogDisplay } from "@/components/projects/audit-log";
import { History, PlusCircle, ChevronsUp, ChevronsDown, FileText } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { AddInterventionDialog } from "./add-intervention-dialog";
import { QuotationSummaryCard } from "./quotation-summary-card";
import { ProjectHeader } from "./ProjectHeader";
import { ProjectActions } from "./ProjectActions";
import { ProjectAlerts } from "./ProjectAlerts";
import { InterventionCard } from "./InterventionCard";
import { useSidebar } from "@/hooks/use-sidebar";


export function ProjectDetails({ project: serverProject, masterInterventions, contacts, customLists, customListItems }: { project: Project, masterInterventions: MasterIntervention[], contacts: Contact[], customLists: CustomList[], customListItems: CustomListItem[] }) {
  const [project, setProject] = useState(serverProject);
  const [openInterventions, setOpenInterventions] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Client-side project metrics are now calculated in the ProjectHeader component directly
  }, []);

  const expandAll = () => setOpenInterventions(project.interventions.map(i => i.masterId));
  const collapseAll = () => setOpenInterventions([]);
  
  const owner = contacts.find(c => c.id === project.ownerContactId);
  
  const hasInterventions = project.interventions && project.interventions.length > 0;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <ProjectHeader project={project} owner={owner} isMounted={isMounted} />
      
      <ProjectActions project={project} contacts={contacts} />

      {isMounted && <ProjectAlerts project={project} />}

      {isMounted && hasInterventions && (
        <Accordion type="single" collapsible value={isSummaryOpen ? "summary" : ""} onValueChange={(value) => setIsSummaryOpen(value === "summary")}>
          <AccordionItem value="summary" className="border-b-0">
             <Card>
                <AccordionTrigger className="p-6 hover:no-underline">
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
        </Accordion>
      )}

      <Tabs defaultValue="interventions" className="w-full">
        <TabsList>
            <TabsTrigger value="interventions">Παρεμβάσεις</TabsTrigger>
            <TabsTrigger value="audit-log">
                <History className="w-4 h-4 mr-2" />
                Ιστορικό Ενεργειών
            </TabsTrigger>
        </TabsList>
        <TabsContent value="interventions" className="mt-4 space-y-6">
          
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
                <AddInterventionDialog projectId={project.id} customLists={customLists} customListItems={customListItems}>
                  <Button variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Προσθήκη Παρέμβασης
                  </Button>
                </AddInterventionDialog>
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
            </div>
            <Accordion type="multiple" value={openInterventions} onValueChange={setOpenInterventions} className="w-full space-y-4">
                {project.interventions.map((intervention) => (
                    <InterventionCard 
                        key={intervention.masterId}
                        project={project}
                        intervention={intervention}
                        allProjectInterventions={project.interventions as ProjectIntervention[]}
                        contacts={contacts}
                        customLists={customLists}
                        customListItems={customListItems}
                        owner={owner}
                    />
                ))}
            </Accordion>
            {!hasInterventions && (
              <div className="text-center text-muted-foreground py-8">
                Δεν υπάρχουν ακόμη παρεμβάσεις για αυτό το έργο.
              </div>
            )}
          </div>
        </TabsContent>
         <TabsContent value="audit-log" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Ιστορικό Ενεργειών Έργου</CardTitle>
                    <CardDescription>Ένα πλήρες ιστορικό όλων των ενεργειών σε αυτό το έργο.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AuditLogDisplay auditLogs={project.auditLog} />
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
