

"use client";

import { useState, useMemo } from 'react';
import type { Project, Contact, ChartData } from '@/types';
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
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { TableIcon, Filter } from 'lucide-react';
import { MultiSelectCombobox, type MultiSelectOption } from '../ui/multi-select-combobox';
import { DynamicChart } from './dynamic-chart';
import { filterStages, groupStages, generateStatusChartData, generateAssigneeChartData } from '@/lib/report-helpers';

type GroupingOption = 'assignee' | 'supervisor' | 'status' | 'interventionCategory' | 'project';
type FinancialFilterOption = 'all' | 'profitable' | 'lossmaking';

const statusOptions: MultiSelectOption[] = [
    { value: 'pending', label: 'Σε Εκκρεμότητα' },
    { value: 'in progress', label: 'Σε Εξέλιξη' },
    { value: 'completed', label: 'Ολοκληρωμένο' },
    { value: 'failed', label: 'Απέτυχε' },
];

const financialFilterOptions: { value: FinancialFilterOption, label: string }[] = [
    { value: 'all', label: 'Όλα (Κέρδος/Ζημία)' },
    { value: 'profitable', label: 'Μόνο Κερδοφόρα' },
    { value: 'lossmaking', label: 'Μόνο Ζημιογόνα' },
];

export function DynamicReportBuilder({ projects, contacts }: { projects: Project[], contacts: Contact[] }) {
    const [grouping, setGrouping] = useState<GroupingOption>('project');
    const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
    const [selectedSupervisors, setSelectedSupervisors] = useState<string[]>([]);
    const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [financialFilter, setFinancialFilter] = useState<FinancialFilterOption>('all');

    const contactOptions: MultiSelectOption[] = useMemo(() => 
        contacts.map(c => ({ value: c.id, label: `${c.firstName} ${c.lastName}` })).sort((a,b) => a.label.localeCompare(b.label)),
    [contacts]);
    
    const assigneeOptions = contactOptions;
    const supervisorOptions = contactOptions;

    const projectOptions: MultiSelectOption[] = useMemo(() => 
        projects.map(p => ({ value: p.id, label: p.title })).sort((a,b) => a.label.localeCompare(b.label)),
    [projects]);

    const filteredStages = useMemo(() => {
        return filterStages({
            projects,
            contacts,
            financialFilter,
            selectedProjects,
            selectedStatuses,
            selectedAssignees,
            selectedSupervisors,
        });
    }, [projects, contacts, financialFilter, selectedProjects, selectedStatuses, selectedAssignees, selectedSupervisors]);
    
    const reportData = useMemo(() => {
        return groupStages(filteredStages, grouping, statusOptions);
    }, [filteredStages, grouping]);

    const statusChartData = useMemo((): ChartData | null => {
        return generateStatusChartData(filteredStages, statusOptions);
    }, [filteredStages]);

    const assigneeChartData = useMemo((): ChartData | null => {
        return generateAssigneeChartData(filteredStages);
    }, [filteredStages]);


    return (
        <Card>
            <CardHeader>
                 <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                    <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                            <TableIcon className="h-6 w-6" />
                            Ευέλικτες Αναφορές
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Ομαδοποιήστε και φιλτράρετε τα δεδομένα των σταδίων του έργου σας.
                        </CardDescription>
                    </div>
                 </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col gap-4 p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 font-semibold text-sm">
                        <Filter className="w-4 h-4"/>
                        Φίλτρα & Επιλογές
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="grouping-select">Ομαδοποίηση ανά:</Label>
                            <Select value={grouping} onValueChange={(v) => setGrouping(v as GroupingOption)}>
                                <SelectTrigger id="grouping-select">
                                    <SelectValue placeholder="Επιλέξτε..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="project">Έργο</SelectItem>
                                    <SelectItem value="assignee">Ανάδοχο</SelectItem>
                                    <SelectItem value="supervisor">Επιβλέποντα</SelectItem>
                                    <SelectItem value="status">Κατάσταση Σταδίου</SelectItem>
                                    <SelectItem value="interventionCategory">Κατηγορία Παρέμβασης</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Φίλτρο Έργου:</Label>
                            <MultiSelectCombobox
                                options={projectOptions}
                                selected={selectedProjects}
                                onChange={setSelectedProjects}
                                placeholder="Όλα τα έργα"
                                searchPlaceholder="Αναζήτηση..."
                                emptyMessage="Δεν βρέθηκε έργο."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Φίλτρο Κατάστασης:</Label>
                            <MultiSelectCombobox
                                options={statusOptions}
                                selected={selectedStatuses}
                                onChange={setSelectedStatuses}
                                placeholder="Όλες οι καταστάσεις"
                                searchPlaceholder="Αναζήτηση..."
                                emptyMessage="Δεν βρέθηκε κατάσταση."
                            />
                        </div>
                         <div className="space-y-2">
                            <Label>Φίλτρο Αναδόχου:</Label>
                            <MultiSelectCombobox
                                options={assigneeOptions}
                                selected={selectedAssignees}
                                onChange={setSelectedAssignees}
                                placeholder="Όλοι οι ανάδοχοι"
                                searchPlaceholder="Αναζήτηση..."
                                emptyMessage="Δεν βρέθηκε ανάδοχος."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Φίλτρο Επιβλέποντα:</Label>
                            <MultiSelectCombobox
                                options={supervisorOptions}
                                selected={selectedSupervisors}
                                onChange={setSelectedSupervisors}
                                placeholder="Όλοι οι επιβλέποντες"
                                searchPlaceholder="Αναζήτηση..."
                                emptyMessage="Δεν βρέθηκε επιβλέπων."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="financial-filter-select">Οικονομικό Φίλτρο:</Label>
                             <Select value={financialFilter} onValueChange={(v) => setFinancialFilter(v as FinancialFilterOption)}>
                                <SelectTrigger id="financial-filter-select">
                                    <SelectValue placeholder="Επιλέξτε..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {financialFilterOptions.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                
                {filteredStages.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                       {statusChartData && (
                            <div className="min-h-[300px]">
                                <DynamicChart chartData={statusChartData} />
                            </div>
                       )}
                       {assigneeChartData && (
                           <div className="min-h-[300px]">
                                <DynamicChart chartData={assigneeChartData} />
                            </div>
                       )}
                    </div>
                )}


                <div className="border rounded-lg overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{grouping === 'assignee' ? 'Ανάδοχος' : grouping === 'supervisor' ? 'Επιβλέπων' : grouping === 'status' ? 'Κατάσταση' : grouping === 'interventionCategory' ? 'Κατηγορία' : 'Έργο'}</TableHead>
                                <TableHead className="text-center">Πλήθος Σταδίων</TableHead>
                                <TableHead>Λεπτομέρειες (3 πρώτα στάδια)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {reportData.length > 0 ? reportData.map(group => (
                                <TableRow key={group.title}>
                                    <TableCell className="font-medium">{group.title}</TableCell>
                                    <TableCell className="text-center">{group.stages.length}</TableCell>
                                    <TableCell>
                                        <ul className="text-xs list-disc pl-4 space-y-1">
                                            {group.stages.slice(0, 3).map(stage => (
                                                <li key={stage.id} className="text-muted-foreground">
                                                    <span className="font-semibold text-foreground">{grouping === 'project' ? stage.interventionCategory : stage.projectTitle}</span>: {stage.title}
                                                </li>
                                            ))}
                                            {group.stages.length > 3 && <li className="italic">και {group.stages.length - 3} ακόμη...</li>}
                                        </ul>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">Δεν βρέθηκαν δεδομένα για τα επιλεγμένα φίλτρα.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
