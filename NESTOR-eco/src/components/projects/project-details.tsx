
"use client";

import { useState, useEffect } from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import type { Project, MasterIntervention, Contact } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AuditLogDisplay } from "@/components/projects/audit-log";
import { History, PlusCircle, ChevronsUp, ChevronsDown, Pencil, Trash2, Calendar, AlertTriangle, ChevronDown } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion";
import { InterventionPipeline } from "@/components/projects/intervention-pipeline";
import { AddInterventionDialog } from "@/components/projects/add-intervention-dialog";
import { EditInterventionDialog } from "@/components/projects/edit-intervention-dialog";
import { DeleteInterventionDialog } from "@/components/projects/delete-intervention-dialog";
import { AddStageDialog } from "@/components/projects/add-stage-dialog";
import { format } from 'date-fns';
import { EditProjectDialog } from "@/components/projects/edit-project-dialog";
import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


export function ProjectDetails({ project, masterInterventions, contacts }: { project: Project, masterInterventions: MasterIntervention[], contacts: Contact[] }) {
  const [openInterventions, setOpenInterventions] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const expandAll = () => setOpenInterventions(project.interventions.map(i => i.masterId));
  const collapseAll = () => setOpenInterventions([]);
  
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
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{project.title}</h1>
            <div className="text-muted-foreground mt-1 space-y-1">
                {owner && <p>{owner.name} - {owner.address}</p>}
                {project.deadline && (
                    <p className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>Προθεσμία Ολοκλήρωσης: {isClient ? format(new Date(project.deadline), 'dd MMMM, yyyy') : '...'}</span>
                    </p>
                )}
            </div>
        </div>
        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <Badge variant={statusVariant} className="text-sm">{statusText}</Badge>
            {project.alerts > 0 && <Badge variant="outline" className="text-destructive border-destructive">{project.alerts} Ειδοποιήσεις</Badge>}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-start md:justify-end gap-2">
          <EditProjectDialog project={project} contacts={contacts}>
              <Button variant="outline">
                  <Pencil className="mr-2 h-4 w-4" />
                  Επεξεργασία Έργου
              </Button>
          </EditProjectDialog>
          <DeleteProjectDialog project={project}>
              <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Διαγραφή Έργου
              </Button>
          </DeleteProjectDialog>
          <AddInterventionDialog projectId={project.id} masterInterventions={masterInterventions}>
              <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Προσθήκη Παρέμβασης
              </Button>
          </AddInterventionDialog>
      </div>

      {project.alerts > 0 && (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Προσοχή Απαιτείται</AlertTitle>
          <AlertDescription>
            Αυτό το έργο έχει {project.alerts} στάδι{project.alerts > 1 ? 'α' : 'ο'} που έχει καθυστερήσει. Παρακαλούμε ελέγξτε τις προθεσμίες.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="interventions" className="w-full">
        <TabsList>
            <TabsTrigger value="interventions">Παρεμβάσεις</TabsTrigger>
            <TabsTrigger value="audit-log">
                <History className="w-4 h-4 mr-2" />
                Ιστορικό Ενεργειών
            </TabsTrigger>
        </TabsList>
        <TabsContent value="interventions" className="mt-4">
            <div className="flex justify-end gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={expandAll}>
                    <ChevronsDown className="mr-2 h-4 w-4" />
                    Ανάπτυξη Όλων
                </Button>
                <Button variant="outline" size="sm" onClick={collapseAll}>
                    <ChevronsUp className="mr-2 h-4 w-4" />
                    Σύμπτυξη Όλων
                </Button>
            </div>
            <Accordion 
                type="multiple" 
                className="w-full space-y-4"
                value={openInterventions}
                onValueChange={setOpenInterventions}
            >
                {project.interventions.map((intervention) => {
                    const canEdit = !intervention.stages.some(s => s.status === 'completed');
                    const canDelete = intervention.stages.every(s => s.status === 'pending');

                    return (
                        <AccordionItem value={intervention.masterId} key={intervention.masterId} className="border-none">
                            <Card>
                                <AccordionPrimitive.Header className="flex w-full items-center">
                                    <AccordionPrimitive.Trigger className="flex flex-1 items-center justify-between p-6 text-left font-medium transition-all hover:no-underline [&[data-state=open]>svg]:rotate-180">
                                        <div className="flex flex-col">
                                            <CardTitle className="text-xl">{intervention.interventionCategory}</CardTitle>
                                            <CardDescription>{intervention.interventionSubcategory}</CardDescription>
                                        </div>
                                        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                                    </AccordionPrimitive.Trigger>
                                    <div className="flex items-center shrink-0 pr-4">
                                        <EditInterventionDialog project={project} intervention={intervention} masterInterventions={masterInterventions}>
                                            <Button variant="ghost" size="icon" className="shrink-0 hover:bg-muted/80" disabled={!canEdit}>
                                                <Pencil className="h-4 w-4" />
                                                <span className="sr-only">Επεξεργασία Παρέμβασης</span>
                                            </Button>
                                        </EditInterventionDialog>
                                        <DeleteInterventionDialog project={project} intervention={intervention}>
                                            <Button variant="ghost" size="icon" disabled={!canDelete} className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0">
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Διαγραφή Παρέμβασης</span>
                                            </Button>
                                        </DeleteInterventionDialog>
                                    </div>
                                </AccordionPrimitive.Header>
                                <AccordionContent>
                                   <div className="px-6 pb-6 space-y-6">
                                     <div className="border-t -mx-6 px-6 pt-6">
                                        <h4 className="font-semibold mb-4 text-foreground">Λεπτομέρειες Παρέμβασης</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Ποσότητα</p>
                                                <p className="font-semibold">{intervention.quantity} {intervention.unit.split('/')[1]}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Κόστος / Μονάδα</p>
                                                <p className="font-semibold">€{intervention.maxUnitPrice.toLocaleString('el-GR')}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Μέγ. Δαπάνη</p>
                                                <p className="font-semibold">€{intervention.maxAmount.toLocaleString('el-GR')}</p>
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <p className="text-muted-foreground">Υπολογιζόμενο Κόστος</p>
                                                <p className="font-bold text-base text-primary">€{intervention.totalCost.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                            </div>
                                            {intervention.selectedEnergySpec && (
                                                <div className="md:col-span-2">
                                                    <p className="text-muted-foreground">Ενεργειακά Χαρακτηριστικά</p>
                                                    <p className="font-semibold">{intervention.selectedEnergySpec}</p>
                                                </div>
                                            )}
                                            {intervention.selectedSystemClass && (
                                                <div className="md:col-span-2">
                                                    <p className="text-muted-foreground">Κλάση Συστήματος</p>
                                                    <p className="font-semibold">{intervention.selectedSystemClass}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="border-t -mx-6 px-6 pt-6">
                                        <h4 className="font-semibold mb-4 text-foreground">Στάδια Υλοποίησης</h4>
                                        <InterventionPipeline stages={intervention.stages} projectName={project.title} projectId={project.id} contacts={contacts} owner={owner} />
                                    </div>
                                    
                                    <div className="flex justify-start pt-2">
                                        <AddStageDialog projectId={project.id} interventionMasterId={intervention.masterId} contacts={contacts}>
                                            <Button variant="outline" size="sm">
                                                <PlusCircle className="mr-2 h-4 w-4" />
                                                Προσθήκη Νέου Σταδίου
                                            </Button>
                                        </AddStageDialog>
                                    </div>
                                   </div>
                                </AccordionContent>
                            </Card>
                        </AccordionItem>
                    );
                })}
            </Accordion>
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
