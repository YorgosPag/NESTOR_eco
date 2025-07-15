
"use client";

import { useState, useEffect, useRef } from "react";
import type { Stage, Contact, StageStatus, ProjectIntervention, Project } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { FileUploadDialog } from "@/components/projects/file-upload-dialog";
import { SmartReminderDialog } from "@/components/projects/smart-reminder-dialog";
import { EditStageDialog } from "./edit-stage-dialog";
import { DeleteStageDialog } from "./delete-stage-dialog";
import { NotifyAssigneeDialog } from "./notify-assignee-dialog";
import { Calendar, Clock, File as FileIcon, MoreVertical, Upload, Wand2, Pencil, Trash2, Mail, User, ArrowUp, ArrowDown, Play, CheckCircle, XCircle, Undo2, Briefcase } from "lucide-react";
import { format, differenceInDays, isPast } from 'date-fns';
import { cn } from "@/lib/utils";
import { moveStageAction, updateStageStatusAction } from "@/app/actions/projects";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface StageCardProps {
  stage: Stage;
  project: Project;
  allProjectInterventions: ProjectIntervention[];
  interventionMasterId: string;
  contacts: Contact[];
  owner?: Contact;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function StageCard({ stage, project, allProjectInterventions, contacts, owner, interventionMasterId, canMoveUp, canMoveDown }: StageCardProps) {
  const [isClient, setIsClient] = useState(false);
  const formRefUp = useRef<HTMLFormElement>(null);
  const formRefDown = useRef<HTMLFormElement>(null);
  const formRefStart = useRef<HTMLFormElement>(null);
  const formRefComplete = useRef<HTMLFormElement>(null);
  const formRefFail = useRef<HTMLFormElement>(null);
  const formRefRestart = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const statusVariant = {
    pending: "outline",
    "in progress": "default",
    completed: "secondary",
    failed: "destructive",
  }[stage.status] as "default" | "destructive" | "secondary" | "outline";

  const statusText = {
    pending: "Σε Εκκρεμότητα",
    "in progress": "Σε Εξέλιξη",
    completed: "Ολοκληρωμένο",
    failed: "Απέτυχε",
  }[stage.status];
  
  const deadlineDate = new Date(stage.deadline);
  const isOverdue = isClient ? isPast(deadlineDate) && stage.status !== 'completed' : false;
  const isApproaching = isClient ? differenceInDays(deadlineDate, new Date()) <= 7 && !isOverdue && stage.status !== 'completed' : false;

  const assignee = contacts.find(c => c.id === stage.assigneeContactId);
  const supervisor = contacts.find(c => c.id === stage.supervisorContactId);

  const createFormForAction = (action: (prevState: any, formData: FormData) => Promise<any>, ref: React.RefObject<HTMLFormElement>, inputs: { [key: string]: string }) => (
    <form action={action} ref={ref}>
        {Object.entries(inputs).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
        ))}
    </form>
  );

  return (
    <Card className={cn("shadow-md hover:shadow-lg transition-shadow")}>
      <CardHeader className="p-4">
        <div className="flex justify-between items-start gap-2">
            <div className="flex items-center gap-2 flex-1">
              <div className="space-y-1">
                  <CardTitle className="text-h4">
                      {stage.title}
                  </CardTitle>
                  <CardDescription>
                      <Badge variant={statusVariant} className="capitalize">{statusText}</Badge>
                  </CardDescription>
              </div>
            </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {createFormForAction(updateStageStatusAction, formRefStart, { projectId: project.id, stageId: stage.id, status: 'in progress' })}
                {createFormForAction(updateStageStatusAction, formRefComplete, { projectId: project.id, stageId: stage.id, status: 'completed' })}
                {createFormForAction(updateStageStatusAction, formRefFail, { projectId: project.id, stageId: stage.id, status: 'failed' })}
                {createFormForAction(updateStageStatusAction, formRefRestart, { projectId: project.id, stageId: stage.id, status: 'in progress' })}
                {createFormForAction(moveStageAction, formRefUp, { projectId: project.id, interventionMasterId, stageId: stage.id, direction: 'up' })}
                {createFormForAction(moveStageAction, formRefDown, { projectId: project.id, interventionMasterId, stageId: stage.id, direction: 'down' })}
                
                {stage.status === 'pending' && <DropdownMenuItem onSelect={(e) => { e.preventDefault(); formRefStart.current?.requestSubmit(); }}><Play className="mr-2 h-4 w-4" /><span>Έναρξη Εργασιών</span></DropdownMenuItem>}
                {stage.status === 'in progress' && <><DropdownMenuItem onSelect={(e) => { e.preventDefault(); formRefComplete.current?.requestSubmit(); }}><CheckCircle className="mr-2 h-4 w-4" /><span>Ολοκλήρωση Σταδίου</span></DropdownMenuItem><DropdownMenuItem onSelect={(e) => { e.preventDefault(); formRefFail.current?.requestSubmit(); }} className="text-destructive focus:text-destructive focus:bg-destructive/10"><XCircle className="mr-2 h-4 w-4" /><span>Σήμανση ως Αποτυχημένο</span></DropdownMenuItem></>}
                {(stage.status === 'completed' || stage.status === 'failed') && <DropdownMenuItem onSelect={(e) => { e.preventDefault(); formRefRestart.current?.requestSubmit(); }}><Undo2 className="mr-2 h-4 w-4" /><span>Επανέναρξη Εργασιών</span></DropdownMenuItem>}
                
                <DropdownMenuSeparator />
                <NotifyAssigneeDialog 
                  stage={stage}
                  project={project}
                  allProjectInterventions={allProjectInterventions}
                  owner={owner}
                  contacts={contacts}
                />
                <SmartReminderDialog stage={stage} projectName={project.title} contacts={contacts} owner={owner}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Wand2 className="mr-2 h-4 w-4" />
                        <span>Έξυπνη Υπενθύμιση ΑΙ</span>
                    </DropdownMenuItem>
                </SmartReminderDialog>
              <DropdownMenuSeparator />
               <FileUploadDialog stage={stage}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Upload className="mr-2 h-4 w-4" />
                    <span>Μεταφόρτωση Εγγράφου</span>
                  </DropdownMenuItem>
               </FileUploadDialog>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); formRefUp.current?.requestSubmit(); }} disabled={!canMoveUp}>
                    <ArrowUp className="mr-2 h-4 w-4" />
                    <span>Μετακίνηση Πάνω</span>
                </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); formRefDown.current?.requestSubmit(); }} disabled={!canMoveDown}>
                  <ArrowDown className="mr-2 h-4 w-4" />
                  <span>Μετακίνηση Κάτω</span>
                </DropdownMenuItem>
              <DropdownMenuSeparator />
              <EditStageDialog stage={stage} projectId={project.id} contacts={contacts}>
                 <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Pencil className="mr-2 h-4 w-4" />
                    <span>Επεξεργασία Σταδίου</span>
                </DropdownMenuItem>
              </EditStageDialog>
              <DeleteStageDialog stage={stage} projectId={project.id}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Διαγραφή Σταδίου</span>
                </DropdownMenuItem>
              </DeleteStageDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3 text-sm text-muted-foreground">
        {supervisor && (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 text-foreground cursor-help">
                            <Briefcase className="w-4 h-4"/>
                            <span>Επιβλέπων: {supervisor.firstName} {supervisor.lastName}</span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Ο Μηχανικός της εταιρείας που είναι υπεύθυνος για την επίβλεψη.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )}
        {assignee && (
            <TooltipProvider>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 text-foreground cursor-help">
                            <User className="h-4 w-4"/>
                            <span>Ανάδοχος: {assignee.firstName} {assignee.lastName}</span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Ο Εργολάβος/Συνεργείο που είναι υπεύθυνος για την εκτέλεση της εργασίας.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )}
        <div className={cn("flex items-center gap-2", {
            'text-destructive': isOverdue,
            'font-bold text-foreground': isApproaching && !isOverdue,
        })}>
            <Calendar className="h-4 w-4"/>
            <span>Λήξη: {isClient ? format(deadlineDate, 'dd MMM, yyyy') : "..."}</span>
        </div>
        <div className="flex items-center gap-2">
            <Clock className="h-4 w-4"/>
            <span>Ενημέρωση: {isClient ? format(new Date(stage.lastUpdated), 'dd MMM, yyyy') : "..."}</span>
        </div>
        {stage.files && stage.files.length > 0 && (
            <div className="border-t pt-3 mt-3">
                <h4 className="font-medium text-xs text-foreground mb-2">Συνημμένα</h4>
                {stage.files.map(file => (
                     <div key={file.url} className="flex items-center gap-2">
                        <FileIcon className="h-4 w-4"/>
                        <a href={file.url} className="hover:underline" target="_blank" rel="noopener noreferrer">{file.name}</a>
                     </div>
                ))}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
