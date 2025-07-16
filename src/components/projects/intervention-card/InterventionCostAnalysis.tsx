
"use client";

import { useMemo } from 'react';
import type { Project, ProjectIntervention, SubIntervention, CustomList, CustomListItem } from "@/types";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu-item";
import { Button } from "@/components/ui/button";
import { AddSubInterventionDialog } from "../add-sub-intervention-dialog";
import { EditSubInterventionDialog } from "../edit-sub-intervention-dialog";
import { DeleteSubInterventionDialog } from "../delete-sub-intervention-dialog";
import { PlusCircle, Pencil, Trash2, MoreHorizontal, ArrowUp, ArrowDown, Info, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { moveSubInterventionAction } from '@/app/actions/sub-interventions';
import { getProfitability, formatDisplayCode } from '@/lib/intervention-helpers';

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

const SubInterventionRow = ({ sub, index, length, project, intervention, customLists, customListItems }: { sub: SubIntervention, index: number, length: number, project: Project, intervention: ProjectIntervention, customLists: CustomList[], customListItems: CustomListItem[] }) => {
    const { profit, margin, internalCost } = getProfitability(sub);
    return (
        <TableRow key={sub.id}>
            <TableCell className="text-xs">{sub.displayCode}</TableCell>
            <TableCell className="font-medium max-w-xs truncate" title={sub.description}>{sub.description}</TableCell>
            <TableCell className="text-right">{(sub.cost || 0).toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</TableCell>
            <TableCell className="text-right">{internalCost > 0 ? internalCost.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' }) : '-'}</TableCell>
            <TableCell className={cn("text-right font-semibold", profit < 0 ? "text-destructive" : profit > 0 ? "text-green-600" : "text-muted-foreground")}>
                {profit.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}
                {isFinite(margin) && margin !== 0 && (<span className="text-xs ml-1">({margin.toFixed(1)}%)</span>)}
            </TableCell>
            <TableCell className="text-right">
                <div className="flex items-center justify-end gap-0">
                    <form action={moveSubInterventionAction}><input type="hidden" name="projectId" value={project.id} /><input type="hidden" name="interventionMasterId" value={intervention.masterId} /><input type="hidden" name="subInterventionId" value={sub.id} /><input type="hidden" name="direction" value="up" /><Button type="submit" variant="ghost" size="icon" className="h-8 w-8" disabled={index === 0}><ArrowUp className="h-4 w-4"/></Button></form>
                    <form action={moveSubInterventionAction}><input type="hidden" name="projectId" value={project.id} /><input type="hidden" name="interventionMasterId" value={intervention.masterId} /><input type="hidden" name="subInterventionId" value={sub.id} /><input type="hidden" name="direction" value="down" /><Button type="submit" variant="ghost" size="icon" className="h-8 w-8" disabled={index === length - 1}><ArrowDown className="h-4 w-4"/></Button></form>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <EditSubInterventionDialog projectId={project.id} interventionMasterId={intervention.masterId} interventionCategory={intervention.interventionCategory} subIntervention={sub} customLists={customLists} customListItems={customListItems}><DropdownMenuItem onSelectPreventClose><Pencil className="mr-2 h-4 w-4" />Επεξεργασία</DropdownMenuItem></EditSubInterventionDialog>
                            <DeleteSubInterventionDialog projectId={project.id} interventionMasterId={intervention.masterId} subIntervention={sub}><DropdownMenuItem onSelectPreventClose className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="mr-2 h-4 w-4" />Διαγραφή</DropdownMenuItem></DeleteSubInterventionDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </TableCell>
        </TableRow>
    );
};

export function InterventionCostAnalysis({ project, intervention, customLists, customListItems }: { project: Project; intervention: ProjectIntervention; customLists: CustomList[]; customListItems: CustomListItem[] }) {
    const processedIntervention = useMemo(() => {
        const subInterventionsWithDisplayCode = (intervention.subInterventions || []).map(sub => ({ ...sub, displayCode: formatDisplayCode(sub.subcategoryCode || '', sub.expenseCategory || intervention.expenseCategory || '') }));
        return {...intervention, subInterventions: subInterventionsWithDisplayCode};
    }, [intervention]);

    const { subtotal, vatAmount, totalAmount } = useMemo(() => {
        const subtotal = processedIntervention.subInterventions?.reduce((sum, sub) => sum + (Number(sub.cost) || 0), 0) || 0;
        const vatAmount = subtotal * 0.24;
        const totalAmount = subtotal + vatAmount;
        return { subtotal, vatAmount, totalAmount };
    }, [processedIntervention]);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-h4">Ανάλυση Κόστους Παρέμβασης</h4>
                <AddSubInterventionDialog projectId={project.id} interventionMasterId={intervention.masterId} interventionCategory={intervention.interventionCategory} customLists={customLists} customListItems={customListItems}>
                    <Button variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4" />Προσθήκη Υπο-Παρέμβασης</Button>
                </AddSubInterventionDialog>
            </div>
            <div className="border rounded-lg overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Κωδικός</TableHead><TableHead>Περιγραφή</TableHead>
                            <TooltipHeader title="Εγκεκριμένη Τιμή" tooltipText="Η μέγιστη επιλέξιμη τιμή για αυτή την εργασία, σύμφωνα με το πρόγραμμα Εξοικονομώ." className="text-right" />
                            <TooltipHeader title="Πραγματικό Κόστος" tooltipText="Το πραγματικό κόστος υλικών & εργασίας για εσάς." className="text-right" />
                            <TooltipHeader title="Περιθώριο" tooltipText="Η διαφορά μεταξύ εγκεκριμένης τιμής και πραγματικού κόστους." className="text-right" />
                            <TableHead><span className="sr-only">Ενέργειες</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(processedIntervention.subInterventions && processedIntervention.subInterventions.length > 0) ? (
                            processedIntervention.subInterventions.map((sub, index) => <SubInterventionRow key={sub.id} sub={sub} index={index} length={processedIntervention.subInterventions.length} project={project} intervention={intervention} customLists={customLists} customListItems={customListItems} />)
                        ) : (<TableRow><TableCell colSpan={6} className="h-24 text-center">Δεν έχει καταχωρηθεί ανάλυση κόστους.</TableCell></TableRow>)}
                    </TableBody>
                    {(processedIntervention.subInterventions && processedIntervention.subInterventions.length > 0) && (
                        <TableFooter>
                            <TableRow><TableCell colSpan={4} className="text-right font-medium">Καθαρή Αξία</TableCell><TableCell className="text-right font-bold">{subtotal.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</TableCell><TableCell /></TableRow>
                            <TableRow><TableCell colSpan={4} className="text-right font-medium">ΦΠΑ (24%)</TableCell><TableCell className="text-right font-bold">{vatAmount.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</TableCell><TableCell /></TableRow>
                            <TableRow><TableCell colSpan={4} className="text-right font-medium">Συνολική Αξία</TableCell><TableCell className="text-right font-bold">{totalAmount.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</TableCell><TableCell /></TableRow>
                        </TableFooter>
                    )}
                </Table>
            </div>
        </div>
    );
}
