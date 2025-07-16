
"use client";

import { useMemo } from 'react';
import type { Project } from '@/types';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { TrendingUp, TrendingDown, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getProfitability } from '@/lib/intervention-helpers';

interface FinancialSummaryReportProps {
    projects: Project[];
}

export function FinancialSummaryReport({ projects }: FinancialSummaryReportProps) {
    const reportData = useMemo(() => {
        return projects.map(project => {
            const financialSummary = project.interventions.reduce((acc, intervention) => {
                const { internalCost, programBudget } = intervention.subInterventions?.reduce((subAcc, sub) => {
                    const subProfitability = getProfitability(sub);
                    subAcc.internalCost += subProfitability.internalCost;
                    subAcc.programBudget += sub.cost;
                    return subAcc;
                }, { internalCost: 0, programBudget: 0 }) || { internalCost: 0, programBudget: 0 };
                
                acc.internalCost += internalCost;
                acc.programBudget += programBudget;
                return acc;
            }, { internalCost: 0, programBudget: 0 });

            const profit = financialSummary.programBudget - financialSummary.internalCost;
            const margin = financialSummary.programBudget > 0 ? (profit / financialSummary.programBudget) * 100 : 0;

            return {
                id: project.id,
                title: project.title,
                ...financialSummary,
                profit,
                margin,
            };
        });
    }, [projects]);

    const totals = useMemo(() => {
         return reportData.reduce((acc, curr) => {
            acc.internalCost += curr.internalCost;
            acc.programBudget += curr.programBudget;
            acc.profit += curr.profit;
            return acc;
        }, { internalCost: 0, programBudget: 0, profit: 0 });
    }, [reportData]);
    
    const totalMargin = totals.programBudget > 0 ? (totals.profit / totals.programBudget) * 100 : 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5" />
                    Οικονομική Επισκόπηση Ενεργών Έργων
                </CardTitle>
                <CardDescription>
                    Συγκεντρωτική οικονομική εικόνα όλων των ενεργών έργων σας, εξαιρουμένων των προσφορών.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Έργο</TableHead>
                                <TableHead className="text-right">Εσωτ. Κόστος (Έξοδα)</TableHead>
                                <TableHead className="text-right">Προϋπ/σμός (Έσοδα)</TableHead>
                                <TableHead className="text-right">Περιθώριο Κέρδους</TableHead>
                                <TableHead className="text-right">Ποσοστό Κέρδους</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reportData.length > 0 ? reportData.map((data) => (
                                <TableRow key={data.id}>
                                    <TableCell className="font-medium">{data.title}</TableCell>
                                    <TableCell className="text-right">{data.internalCost.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</TableCell>
                                    <TableCell className="text-right">{data.programBudget.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</TableCell>
                                    <TableCell className={cn("text-right font-semibold", data.profit < 0 ? "text-destructive" : "text-green-600")}>
                                        {data.profit.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}
                                    </TableCell>
                                    <TableCell className={cn("text-right font-semibold flex items-center justify-end gap-1", data.margin < 0 ? "text-destructive" : "text-green-600")}>
                                        {data.margin >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                        {data.margin.toFixed(2)}%
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">Δεν υπάρχουν ενεργά έργα με οικονομικά δεδομένα για εμφάνιση.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        {reportData.length > 0 && (
                            <TableFooter>
                                <TableRow className="bg-muted/50 hover:bg-muted/50">
                                    <TableHead className="font-bold">ΓΕΝΙΚΑ ΣΥΝΟΛΑ</TableHead>
                                    <TableHead className="text-right font-bold">{totals.internalCost.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</TableHead>
                                    <TableHead className="text-right font-bold">{totals.programBudget.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</TableHead>
                                    <TableHead className={cn("text-right font-bold", totals.profit < 0 ? "text-destructive" : "text-green-600")}>
                                        {totals.profit.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}
                                    </TableHead>
                                    <TableHead className={cn("text-right font-bold flex items-center justify-end gap-1", totalMargin < 0 ? "text-destructive" : "text-green-600")}>
                                         {totalMargin >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                        {totalMargin.toFixed(2)}%
                                    </TableHead>
                                </TableRow>
                            </TableFooter>
                        )}
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
