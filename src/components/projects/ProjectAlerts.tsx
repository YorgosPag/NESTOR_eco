
"use client";

import type { Project } from '@/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Rocket } from "lucide-react";
import { calculateClientProjectMetrics } from '@/lib/client-utils';
import { useMemo } from 'react';

interface ProjectAlertsProps {
    project: Project;
}

export function ProjectAlerts({ project: serverProject }: ProjectAlertsProps) {
    // Use memoized client-side calculation to ensure alerts are up-to-date
    const project = useMemo(() => calculateClientProjectMetrics(serverProject, true), [serverProject]);

    if (project.status === 'Quotation') {
        return (
             <Alert className="mt-4 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                <Rocket className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="text-blue-800 dark:text-blue-300">Φάση Προσφοράς</AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-400">
                    Αυτό το έργο είναι σε φάση προσφοράς. Μπορείτε να προσθέσετε παρεμβάσεις και να διαμορφώσετε την ανάλυση κόστους.
                    Όταν η προσφορά γίνει αποδεκτή, πατήστε το κουμπί ενεργοποίησης από τις ενέργειες του έργου.
                </AlertDescription>
            </Alert>
        );
    }

    if (project.status === 'Delayed' && project.alerts > 0) {
        return (
            <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Προσοχή Απαιτείται</AlertTitle>
                <AlertDescription>
                    Αυτό το έργο έχει {project.alerts} στάδι{project.alerts > 1 ? 'α' : 'ο'} που έχει καθυστερήσει. Παρακαλούμε ελέγξτε τις προθεσμίες.
                </AlertDescription>
            </Alert>
        );
    }
    
    return null;
}
