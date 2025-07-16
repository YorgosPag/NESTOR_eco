
"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, formatDistanceToNow } from "date-fns";
import { el } from 'date-fns/locale';
import { ArrowRight, CalendarClock } from "lucide-react";
import type { Contact } from "@/types";
import { useIsClient } from "@/hooks/use-is-client";

interface Deadline {
    projectId: string;
    projectTitle: string;
    stageId: string; // Add stageId to ensure a unique key
    stageTitle: string;
    deadline: string;
    assigneeContactId?: string;
}

interface UpcomingDeadlinesProps {
    deadlines: Deadline[];
    contacts: Contact[];
}

export function UpcomingDeadlines({ deadlines, contacts }: UpcomingDeadlinesProps) {
  const isClient = useIsClient();

  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Προσεχείς Προθεσμίες
        </CardTitle>
        <CardDescription>
          Τα επόμενα στάδια που πλησιάζουν στην ημερομηνία λήξης τους.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {deadlines.length > 0 ? (
            <div className="space-y-4">
            {deadlines.map((item) => {
                const assignee = contacts.find(c => c.id === item.assigneeContactId);
                return (
                    <div key={item.stageId} className="flex items-center">
                        {assignee && (
                             <Avatar className="h-9 w-9">
                                <AvatarImage src={assignee.avatar} alt={assignee.firstName} />
                                <AvatarFallback>{assignee.firstName?.[0]}</AvatarFallback>
                            </Avatar>
                        )}
                        {!assignee && (
                            <div className="h-9 w-9 flex items-center justify-center rounded-full bg-muted">
                                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                            </div>
                        )}
                        <div className="ml-4 space-y-1">
                            <Link href={`/projects/${item.projectId}`} className="text-sm font-medium leading-none hover:underline">{item.stageTitle}</Link>
                            <p className="text-sm text-muted-foreground">
                                {item.projectTitle}
                            </p>
                        </div>
                        <div className="ml-auto font-medium text-sm text-right">
                           <div>{isClient ? formatDistanceToNow(new Date(item.deadline), { addSuffix: true, locale: el }) : "..."}</div>
                           <div className="text-xs text-muted-foreground">{isClient ? format(new Date(item.deadline), 'dd/MM/yyyy') : "..."}</div>
                        </div>
                    </div>
                )
            })}
             <Button asChild variant="outline" size="sm" className="w-full mt-4">
                <Link href="/calendar">
                    Προβολή Ημερολογίου
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
             </Button>
            </div>
        ) : (
            <p className="text-sm text-muted-foreground text-center py-8">Δεν υπάρχουν προσεχείς προθεσμίες.</p>
        )}
      </CardContent>
    </Card>
  );
}
