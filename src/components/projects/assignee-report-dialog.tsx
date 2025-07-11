
"use client";

import { useState, useMemo } from 'react';
import type { Project, Contact } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';

interface AssigneeReportDialogProps {
    project: Project;
    contacts: Contact[];
    children: React.ReactNode;
}

export function AssigneeReportDialog({ project, contacts, children }: AssigneeReportDialogProps) {
    const [open, setOpen] = useState(false);
    const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(null);
    const router = useRouter();

    const assigneesInProject = useMemo(() => {
        const assigneeIds = new Set<string>();
        project.interventions.forEach(intervention => {
            intervention.stages.forEach(stage => {
                if (stage.assigneeContactId) {
                    assigneeIds.add(stage.assigneeContactId);
                }
            });
        });
        return contacts.filter(contact => assigneeIds.has(contact.id));
    }, [project, contacts]);

    const handleGenerateReport = () => {
        if (!selectedAssigneeId) return;
        router.push(`/projects/${project.id}/work-order-detailed?assigneeId=${selectedAssigneeId}`);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Αναφορά Εργασιών ανά Ανάδοχο</DialogTitle>
                    <DialogDescription>
                        Επιλέξτε έναν ανάδοχο για να δημιουργήσετε μια αναφορά που περιέχει μόνο τις δικές του εργασίες.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="assignee-select">Επιλογή Αναδόχου</Label>
                        <Select onValueChange={setSelectedAssigneeId} value={selectedAssigneeId || ''}>
                            <SelectTrigger id="assignee-select">
                                <SelectValue placeholder="Επιλέξτε από τη λίστα..." />
                            </SelectTrigger>
                            <SelectContent>
                                {assigneesInProject.length > 0 ? assigneesInProject.map(assignee => (
                                    <SelectItem key={assignee.id} value={assignee.id}>
                                        {assignee.firstName} {assignee.lastName}
                                    </SelectItem>
                                )) : (
                                    <div className="p-2 text-sm text-muted-foreground text-center">Δεν βρέθηκαν ανάδοχοι σε αυτό το έργο.</div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)}>Άκυρο</Button>
                    <Button onClick={handleGenerateReport} disabled={!selectedAssigneeId}>
                        Δημιουργία Αναφοράς
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
