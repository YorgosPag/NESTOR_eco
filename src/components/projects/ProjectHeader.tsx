
"use client";

import { useEffect, useMemo } from 'react';
import type { Project, Contact } from '@/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { calculateClientProjectMetrics } from '@/lib/client-utils';
import { Skeleton } from '../ui/skeleton';

interface ProjectHeaderProps {
    project: Project;
    owner?: Contact;
    isMounted: boolean;
}

export function ProjectHeader({ project: serverProject, owner, isMounted }: ProjectHeaderProps) {
    
    // Use memoized client-side calculation to ensure alerts are up-to-date
    const project = useMemo(() => calculateClientProjectMetrics(serverProject, isMounted), [serverProject, isMounted]);

    const statusConfig = {
        'Quotation': { text: 'Σε Προσφορά', variant: 'outline', icon: <Clock className="h-4 w-4" /> },
        'On Track': { text: 'Εντός Χρονοδιαγράμματος', variant: 'default', icon: <CheckCircle className="h-4 w-4" /> },
        'Delayed': { text: 'Σε Καθυστέρηση', variant: 'destructive', icon: <AlertCircle className="h-4 w-4" /> },
        'Completed': { text: 'Ολοκληρωμένο', variant: 'secondary', icon: <CheckCircle className="h-4 w-4" /> },
    }[project.status] || { text: 'Άγνωστο', variant: 'outline', icon: <Clock className="h-4 w-4" /> };
    

    return (
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
                <h1 className="text-h1">{project.title}</h1>
                <div className="text-muted mt-2 space-y-1.5">
                    {owner && (
                        <p className="font-semibold text-foreground/80">{owner.firstName} {owner.lastName} - {owner.addressCity || owner.addressStreet}</p>
                    )}
                     {project.applicationNumber && (
                        <p className="text-sm">Αρ. Αίτησης: {project.applicationNumber}</p>
                    )}
                    {project.deadline && (
                        <p className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4" />
                            <span>Προθεσμία Ολοκλήρωσης: {isMounted ? format(new Date(project.deadline), 'dd MMMM, yyyy') : '...'}</span>
                        </p>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                {isMounted ? (
                    <Badge variant={statusConfig.variant} className="text-sm py-1 px-3 gap-2">
                        {statusConfig.icon}
                        {statusConfig.text}
                    </Badge>
                ) : (
                    <Skeleton className="h-8 w-40" />
                )}
                {isMounted && project.alerts > 0 && (
                    <Badge variant="outline" className="text-destructive border-destructive">{project.alerts} Ειδοποιήσεις</Badge>
                )}
            </div>
        </div>
    );
}
