
"use client";

import { useRef } from "react";
import type { Stage, Contact, StageStatus, ProjectIntervention, Project } from "@/types";
import {
  Card,
  CardContent,
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
import { Calendar, Clock, File as FileIcon, MoreVertical, Upload, Wand2, Pencil, Trash2, Play, CheckCircle, XCircle, Undo2, Briefcase, User, ArrowUp, ArrowDown } from "lucide-react";
import { format, differenceInDays, isPast } from 'date-fns';
import { cn } from "@/lib/utils";
import { moveStageAction, updateStageStatusAction } from "@/app/actions/stages";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { useIsClient } from "@/hooks/use-is-client";

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
  const isClient = useIsClient();
  const statusFormRef = useRef<HTMLFormElement>(null);
  const moveFormRef = useRef<HTMLFormElement>(null);
  
  // Refs for hidden inputs to dynamically set their values before form submission
  const statusInputRef = useRef<HTMLInputElement>(null);
  const directionInputRef = useRef<HTMLInputElement>(null);


  const handleStatusUpdate = (newStatus: StageStatus) => {
    if (statusFormRef.current && statusInputRef.current) {
        statusInputRef.current.value = newStatus;
        statusFormRef.current.requestSubmit();
    }
  };

  const handleMove = (direction: 'up' | 'down') => {
      if (moveFormRef.current && directionInputRef.current) {
          directionInputRef.current.value = direction;
          moveFormRef.current.requestSubmit();
      }
  }

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
  
  return (
    <Card className={cn("shadow-md hover:shadow-lg transition-shadow")}>
        {/* Hidden forms for server actions */}
        <form ref={statusFormRef} action={updateStageStatusAction} className="hidden">
            <input type="hidden" name="projectId" value={project.id} />
            <input type="hidden" name="stageId" value={stage.id} />
            <input type="hidden" name="status" ref={statusInputRef} value="" />
        </form>
         <form ref={moveFormRef} action={moveStageAction} className="hidden">
            <input type="hidden" name="projectId" value={project.id} />
            <input type="hidden" name="interventionMasterId" value={interventionMasterId} />
            <input type="hidden" name="stageId" value={stage.id} />
            <input type="hidden" name="direction" ref={directionInputRef} value="" />
        </form>

      <CardHeader className="p-4">
        <div className="flex justify-between items-start gap-2">
            <div className="flex items-center gap-2 flex-1">
              <div className="space-y-1">
                  <CardTitle className="text-h4">
                      {stage.title}
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    <Badge variant={statusVariant} className="capitalize">{statusText}</Badge>
                  </div>
              </div>
            </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {stage.status === 'pending' && <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleStatusUpdate('in progress'); }}><Play className="mr-2 h-4 w-4" /><span>Έναρξη Εργασιών</span></DropdownMenuItem>}
                {stage.status === 'in progress' && <><DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleStatusUpdate('completed'); }}><CheckCircle className="mr-2 h-4 w-4" /><span>Ολοκλήρωση Σταδίου</span></DropdownMenuItem><DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleStatusUpdate('failed'); }} className="text-destructive focus:text-destructive focus:bg-destructive/10"><XCircle className="mr-2 h-4 w-4" /><span>Σήμανση ως Αποτυχημένο</span></DropdownMenuItem></>}
                {(stage.status === 'completed' || stage.status === 'failed') && <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleStatusUpdate('in progress'); }}><Undo2 className="mr-2 h-4 w-4" /><span>Επανέναρξη Εργασιών</span></DropdownMenuItem>}
                
                <DropdownMenuSeparator />
                <NotifyAssigneeDialog 
                  stage={stage}
                  project={project}
                  allProjectInterventions={allProjectInterventions}
                  owner={owner}
                  contacts={contacts}
                />
                <SmartReminderDialog stage={stage} projectName={project.title} contacts={contacts} owner={owner}>
                    <DropdownMenuItem onSelectPreventClose>
                        <Wand2 className="mr-2 h-4 w-4" />
                        <span>Έξυπνη Υπενθύμιση ΑΙ</span>
                    </DropdownMenuItem>
                </SmartReminderDialog>
              <DropdownMenuSeparator />
               <FileUploadDialog stage={stage}>
                <DropdownMenuItem onSelectPreventClose>
                    <Upload className="mr-2 h-4 w-4" />
                    <span>Μεταφόρτωση Εγγράφου</span>
                  </DropdownMenuItem>
               </FileUploadDialog>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleMove('up'); }} disabled={!canMoveUp}>
                    <ArrowUp className="mr-2 h-4 w-4" />
                    <span>Μετακίνηση Πάνω</span>
                </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleMove('down'); }} disabled={!canMoveDown}>
                  <ArrowDown className="mr-2 h-4 w-4" />
                  <span>Μετακίνηση Κάτω</span>
                </DropdownMenuItem>
              <DropdownMenuSeparator />
              <EditStageDialog stage={stage} projectId={project.id} contacts={contacts}>
                 <DropdownMenuItem onSelectPreventClose>
                    <Pencil className="mr-2 h-4 w-4" />
                    <span>Επεξεργασία Σταδίου</span>
                </DropdownMenuItem>
              </EditStageDialog>
              <DeleteStageDialog stage={stage} projectId={project.id}>
                <DropdownMenuItem onSelectPreventClose className="text-destructive focus:text-destructive focus:bg-destructive/10">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Διαγραφή Σταδίου</span>
                </DropdownMenuItem>
              </DeleteStageDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3 text-sm text-muted-foreground">
        {stage.supervisorContactId && (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 text-foreground cursor-help">
                            <Briefcase className="w-4 h-4"/>
                            {supervisor ? (
                                <span>Επιβλέπων: {supervisor.firstName} {supervisor.lastName}</span>
                            ) : (
                                <span className="italic text-muted-foreground">Επιβλέπων δεν βρέθηκε</span>
                            )}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Ο Μηχανικός της εταιρείας που είναι υπεύθυνος για την επίβλεψη.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )}
        {stage.assigneeContactId && (
            <TooltipProvider>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 text-foreground cursor-help">
                            <User className="h-4 w-4"/>
                             {assignee ? (
                                <span>Ανάδοχος: {assignee.firstName} {assignee.lastName}</span>
                             ) : (
                                <span className="italic text-muted-foreground">Ανάδοχος δεν βρέθηκε</span>
                             )}
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
                        <a href={file.url} className="hover:underline" target="_blank" rel="noopener noreferrer">{file.name || "Αρχείο χωρίς όνομα"}</a>
                     </div>
                ))}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
