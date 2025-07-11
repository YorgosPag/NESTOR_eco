

"use client";

import { useState } from "react";
import type { Project, Contact } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FinancialSummaryReport } from "./financial-summary-report";
import { AIReportAssistant } from "./ai-report-assistant";
import { BarChart2 } from "lucide-react";
import { DynamicReportBuilder } from "./dynamic-report-builder";

interface ReportsClientPageProps {
    projects: Project[];
    contacts: Contact[];
}

export function ReportsClientPage({ projects, contacts }: ReportsClientPageProps) {
    const [selectedReport, setSelectedReport] = useState("report_builder");

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1 flex items-baseline gap-4">
                    <h1 className="text-h2 flex items-center gap-2">
                        <BarChart2 className="h-5 w-5" />
                        Αναφορές
                    </h1>
                     <p className="text-muted-foreground text-sm hidden md:block">Δυναμικές αναφορές για την επισκόπηση των δεδομένων σας.</p>
                </div>
                <div className="w-full sm:w-auto min-w-[250px]">
                     <Select value={selectedReport} onValueChange={setSelectedReport}>
                        <SelectTrigger>
                            <SelectValue placeholder="Επιλέξτε αναφορά..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="report_builder">Ευέλικτες Αναφορές</SelectItem>
                            <SelectItem value="ai_assistant">Βοηθός Αναφορών AI</SelectItem>
                            <SelectItem value="financial_summary">Οικονομική Επισκόπηση</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div>
                {selectedReport === 'ai_assistant' && (
                    <AIReportAssistant />
                )}
                 {selectedReport === 'report_builder' && (
                    <DynamicReportBuilder projects={projects} contacts={contacts} />
                )}
                {selectedReport === 'financial_summary' && (
                    <FinancialSummaryReport projects={projects.filter(p => p.status !== 'Quotation')} />
                )}
            </div>
        </div>
    );
}
