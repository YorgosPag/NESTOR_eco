
"use client";

import { useMemo } from 'react';
import type { ProjectIntervention } from "@/types";
import {
  CardContent,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { getProfitability } from '@/lib/intervention-helpers';

const TooltipHeader = ({ title, tooltipText }: { title: string, tooltipText: React.ReactNode }) => (
    <TableHead className="text-right">
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

interface QuotationSummaryCardProps {
  interventions: ProjectIntervention[];
}

export function QuotationSummaryCard({ interventions }: QuotationSummaryCardProps) {
  const summaryData = useMemo(() => {
    return interventions.map((intervention) => {
      const { internalCost, programBudget, profit, margin } = intervention.subInterventions?.reduce((acc, sub) => {
          const subProfitability = getProfitability(sub);
          acc.internalCost += subProfitability.internalCost;
          acc.programBudget += (Number(sub.cost) || 0);
          acc.profit += subProfitability.profit;
          return acc;
      }, { internalCost: 0, programBudget: 0, profit: 0, margin: 0 }) || { internalCost: 0, programBudget: 0, profit: 0, margin: 0 };
      
      const totalMargin = programBudget > 0 ? (profit / programBudget) * 100 : 0;
      
      return {
        name: intervention.interventionSubcategory || intervention.interventionCategory,
        internalCost,
        programBudget,
        profit,
        margin: totalMargin,
      };
    });
  }, [interventions]);

  const totals = useMemo(() => {
     return summaryData.reduce(
      (acc, curr) => {
        acc.internalCost += (Number(curr.internalCost) || 0);
        acc.programBudget += (Number(curr.programBudget) || 0);
        acc.profit += (Number(curr.profit) || 0);
        return acc;
      },
      { internalCost: 0, programBudget: 0, profit: 0 }
    );
  }, [summaryData]);
    
  const totalMargin = useMemo(() => {
    return totals.programBudget > 0 ? (totals.profit / totals.programBudget) * 100 : 0;
  }, [totals]);


  if (interventions.length === 0) {
    return null; // Don't show the card if there are no interventions
  }

  return (
      <CardContent className="p-6 pt-0">
        <div className="border rounded-lg overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Παρέμβαση</TableHead>
                        <TooltipHeader 
                            title="Πραγματικό Κόστος (Έξοδα) (άνευ ΦΠΑ)"
                            tooltipText={
                                <>
                                    <span className="font-bold">Πραγματικό Κόστος:</span> Είναι το άθροισμα του κόστους όλων των υλικών και των εργασιών που απαιτούνται για την ολοκλήρωση της παρέμβασης. <span className="font-bold">Αντιπροσωπεύει τα πραγματικά σας έξοδα.</span>
                                </>
                            }
                        />
                         <TooltipHeader 
                            title="Προϋπ/σμός (Έσοδα) (άνευ ΦΠΑ)"
                            tooltipText={
                                <>
                                    <span className="font-bold">Προϋπολογισμός:</span> Είναι το άθροισμα των εγκεκριμένων τιμών του προγράμματος "Εξοικονομώ" για τις υπο-παρεμβάσεις. <span className="font-bold">Αντιπροσωπεύει τα δυνητικά σας έσοδα.</span>
                                </>
                            }
                        />
                         <TooltipHeader 
                            title="Περιθώριο Κέρδους"
                            tooltipText={
                                <>
                                    <span className="font-bold">Περιθώριο Κέρδους:</span> Υπολογίζεται αφαιρώντας το "Πραγματικό Κόστος" από τον "Προϋπολογισμό". Μια θετική τιμή σημαίνει κέρδος, ενώ μια αρνητική σημαίνει ζημία.
                                </>
                            }
                        />
                         <TooltipHeader 
                            title="Ποσοστό Κέρδους"
                            tooltipText={
                                <>
                                    <span className="font-bold">Ποσοστό Κέρδους:</span> Είναι το περιθώριο κέρδους εκφρασμένο ως ποσοστό επί του προϋπολογισμού.
                                </>
                            }
                        />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {summaryData.map((data, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium">{data.name}</TableCell>
                            <TableCell className="text-right">{data.internalCost.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</TableCell>
                            <TableCell className="text-right">{data.programBudget.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</TableCell>
                            <TableCell className={cn("text-right font-semibold", data.profit < 0 ? "text-destructive" : data.profit > 0 ? "text-green-600" : "text-muted-foreground")}>
                                {data.profit.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}
                            </TableCell>
                            <TableCell className={cn("text-right font-semibold flex items-center justify-end gap-1", data.margin < 0 ? "text-destructive" : data.margin > 0 ? "text-green-600" : "text-muted-foreground")}>
                                {isFinite(data.margin) && data.margin !== 0 ? (
                                    <>
                                        {data.margin >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                        {data.margin.toFixed(2)}%
                                    </>
                                ) : (
                                    <span>-</span>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow className="bg-muted/50">
                        <TableHead className="font-bold">ΣΥΝΟΛΑ</TableHead>
                        <TableHead className="text-right font-bold">{totals.internalCost.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</TableHead>
                        <TableHead className="text-right font-bold">{totals.programBudget.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</TableHead>
                        <TableHead className={cn("text-right font-bold", totals.profit < 0 ? "text-destructive" : totals.profit > 0 ? "text-green-600" : "text-muted-foreground")}>{totals.profit.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</TableHead>
                        <TableHead className={cn("text-right font-bold flex items-center justify-end gap-1", totalMargin < 0 ? "text-destructive" : totalMargin > 0 ? "text-green-600" : "text-muted-foreground")}>
                             {isFinite(totalMargin) && totalMargin !== 0 ? (
                                <>
                                    {totalMargin >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                    {totalMargin.toFixed(2)}%
                                </>
                            ) : (
                                <span>-</span>
                            )}
                        </TableHead>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
      </CardContent>
  );
}
