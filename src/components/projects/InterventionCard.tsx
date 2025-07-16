
"use client";

import { useState, useMemo } from "react";
import type { Project, ProjectIntervention, Contact, CustomList, CustomListItem } from "@/types";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AccordionContent, AccordionItem } from "@/components/ui/accordion";
import { InterventionPipeline } from "@/components/projects/intervention-pipeline";
import { EditInterventionDialog } from "@/components/projects/edit-intervention-dialog";
import { DeleteInterventionDialog } from "@/components/projects/delete-intervention-dialog";
import { AddStageDialog } from "@/components/projects/add-stage-dialog";
import { AddSubInterventionDialog } from "./add-sub-intervention-dialog";
import { EditSubInterventionDialog } from "./edit-sub-intervention-dialog";
import { DeleteSubInterventionDialog } from "./delete-sub-intervention-dialog";
import { PlusCircle, Pencil, Trash2, ChevronDown, MoreHorizontal, ArrowUp, ArrowDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { moveSubInterventionAction } from '@/app/actions/sub-interventions';


const TooltipHeader = ({ title, tooltipText, className }: { title: string, tooltipText: React.ReactNode, className?: string }) => (
    <TableHead className={className}>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className="flex items-center justify-end gap-1 cursor-help">
                        {title}
                        <Info className="h-3 w-3 text-muted-foreground" />
                    </span>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="max-w-xs">{tooltipText}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    </TableHead>
);

interface InterventionCardProps {
    project: Project;
    intervention: ProjectIntervention;
    allProjectInterventions: ProjectIntervention[];
    contacts: Contact[];
    customLists: CustomList[];
    customListItems: CustomListItem[];
    owner?: Contact;
}

export function InterventionCard({ project, intervention, allProjectInterventions, contacts, customLists, customListItems, owner }: InterventionCardProps) {

    const processedIntervention = useMemo(() => {
        const subInterventionsWithDisplayCode = (intervention.subInterventions || []).map(sub => {
             const expenseCategory = sub.expenseCategory || intervention.expenseCategory || '';
             const romanNumeralMatch = expenseCategory.match(/\((I|II|III|IV|V|VI|VII|VIII|IX|X)\)/);
             const romanNumeral = romanNumeralMatch ? ` (${romanNumeralMatch[1]})` : '';
             return {
                ...sub,
                displayCode: `${sub.subcategoryCode || ''}${romanNumeral}`
             }
        });
        return {...intervention, subInterventions: subInterventionsWithDisplayCode};
    }, [intervention]);

    const subtotal = processedIntervention.subInterventions?.reduce((sum, sub) => sum + sub.cost, 0) || 0;
    const vatAmount = subtotal * 0.24;
    const totalAmount = subtotal + vatAmount;
    const interventionName = processedIntervention.interventionSubcategory || processedIntervention.interventionCategory;

    return (
        <AccordionItem value={intervention.masterId} className="border-none">
            <Card className="overflow-hidden">
                <AccordionPrimitive.Header className="flex">
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
                </AccordionPrimitive.Header>
                <AccordionContent>
                  <div className="px-6 pb-6 space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-h4">Ανάλυση Κόστους Παρέμβασης</h4>
                        <AddSubInterventionDialog 
                          projectId={project.id} 
                          interventionMasterId={intervention.masterId}
                          interventionCategory={intervention.interventionCategory}
                          customLists={customLists}
                          customListItems={customListItems}
                        >
                          <Button variant="outline" size="sm">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Προσθήκη Υπο-Παρέμβασης
                          </Button>
                        </AddSubInterventionDialog>
                      </div>
                      <div className="border rounded-lg overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Κωδικός</TableHead>
                              <TableHead>Περιγραφή</TableHead>
                              <TooltipHeader 
                                  title="Εγκεκριμένη Τιμή"
                                  tooltipText="Η μέγιστη επιλέξιμη τιμή για αυτή την εργασία, σύμφωνα με το πρόγραμμα Εξοικονομώ."
                                  className="text-right"
                              />
                              <TooltipHeader 
                                  title="Πραγματικό Κόστος"
                                  tooltipText="Το πραγματικό κόστος υλικών & εργασίας για εσάς."
                                  className="text-right"
                              />
                               <TooltipHeader 
                                  title="Περιθώριο"
                                  tooltipText="Η διαφορά μεταξύ εγκεκριμένης τιμής και πραγματικού κόστους."
                                  className="text-right"
                              />
                              <TableHead><span className="sr-only">Ενέργειες</span></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(processedIntervention.subInterventions && processedIntervention.subInterventions.length > 0) ? (
                              processedIntervention.subInterventions.map((sub, index) => {
                                const internalCost = (sub.costOfMaterials || 0) + (sub.costOfLabor || 0);
                                const profit = sub.cost - internalCost;
                                const profitMargin = sub.cost > 0 ? (profit / sub.cost) * 100 : 0;
                                
                                return (
                                <TableRow key={sub.id}>
                                  <TableCell className="text-xs">{sub.displayCode}</TableCell>
                                  <TableCell className="font-medium max-w-xs truncate" title={sub.description}>{sub.description}</TableCell>
                                  <TableCell className="text-right">{sub.cost.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</TableCell>
                                  <TableCell className="text-right">{internalCost > 0 ? internalCost.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' }) : '-'}</TableCell>
                                  <TableCell className={cn("text-right font-semibold", profit < 0 ? "text-destructive" : "text-green-600")}>
                                    {profit.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}
                                    <span className="text-xs ml-1">({profitMargin.toFixed(1)}%)</span>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-0">
                                        <form action={moveSubInterventionAction}>
                                            <input type="hidden" name="projectId" value={project.id} />
                                            <input type="hidden" name="interventionMasterId" value={intervention.masterId} />
                                            <input type="hidden" name="subInterventionId" value={sub.id} />
                                            <input type="hidden" name="direction" value="up" />
                                            <Button type="submit" variant="ghost" size="icon" className="h-8 w-8" disabled={index === 0}>
                                                <ArrowUp className="h-4 w-4"/>
                                            </Button>
                                        </form>
                                        <form action={moveSubInterventionAction}>
                                            <input type="hidden" name="projectId" value={project.id} />
                                            <input type="hidden" name="interventionMasterId" value={intervention.masterId} />
                                            <input type="hidden" name="subInterventionId" value={sub.id} />
                                            <input type="hidden" name="direction" value="down" />
                                            <Button type="submit" variant="ghost" size="icon" className="h-8 w-8" disabled={index === (intervention.subInterventions?.length || 0) - 1}>
                                                <ArrowDown className="h-4 w-4"/>
                                            </Button>
                                        </form>
                                        <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <EditSubInterventionDialog 
                                            projectId={project.id}
                                            interventionMasterId={intervention.masterId}
                                            interventionCategory={intervention.interventionCategory}
                                            subIntervention={sub}
                                            customLists={customLists}
                                            customListItems={customListItems}
                                            >
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Επεξεργασία
                                                </DropdownMenuItem>
                                            </EditSubInterventionDialog>
                                            <DeleteSubInterventionDialog
                                            projectId={project.id}
                                            interventionMasterId={intervention.masterId}
                                            subIntervention={sub}
                                            >
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Διαγραφή
                                                </DropdownMenuItem>
                                            </DeleteSubInterventionDialog>
                                        </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                  </TableCell>
                                </TableRow>
                                )
                            })
                            ) : (
                              <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                  Δεν έχει καταχωρηθεί ανάλυση κόστους.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                          {(processedIntervention.subInterventions && processedIntervention.subInterventions.length > 0) && (
                              <TableFooter>
                                  <TableRow>
                                      <TableCell colSpan={4} className="text-right font-medium">Καθαρή Αξία</TableCell>
                                      <TableCell className="text-right font-bold">{subtotal.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</TableCell>
                                      <TableCell />
                                  </TableRow>
                                  <TableRow>
                                      <TableCell colSpan={4} className="text-right font-medium">ΦΠΑ (24%)</TableCell>
                                      <TableCell className="text-right font-bold">{vatAmount.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</TableCell>
                                      <TableCell />
                                  </TableRow>
                                   <TableRow>
                                      <TableCell colSpan={4} className="text-right font-medium">Συνολική Αξία</TableCell>
                                      <TableCell className="text-right font-bold">{totalAmount.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</TableCell>
                                      <TableCell />
                                  </TableRow>
                              </TableFooter>
                          )}
                        </Table>
                      </div>
                    </div>
                    
                    <div className="border-t -mx-6 px-6 pt-6">
                      <h4 className="text-h4">Στάδια Υλοποίησης</h4>
                      <InterventionPipeline 
                          stages={intervention.stages} 
                          project={project}
                          allProjectInterventions={allProjectInterventions}
                          contacts={contacts} 
                          owner={owner} 
                          interventionMasterId={intervention.masterId} 
                      />
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
}
