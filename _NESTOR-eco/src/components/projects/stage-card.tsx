
"use client";

import { useState, useEffect } from "react";
import type { Stage, Contact } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Calendar, Clock, File as FileIcon, MoreVertical, Upload, Wand2, Pencil, Trash2, Mail, User } from "lucide-react";
import { format, differenceInDays, isPast } from 'date-fns';
import { cn } from "@/lib/utils";

interface StageCardProps {
  stage: Stage;
  projectName: string;
  projectId: string;
  contacts: Contact[];
  owner?: Contact;
}

export function StageCard({ stage, projectName, projectId, contacts, owner }: StageCardProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This ensures date calculations are only done on the client, preventing hydration mismatch.
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
  const daysUntilDeadline = isClient ? differenceInDays(deadlineDate, new Date()) : 0;
  const isApproaching = isClient ? daysUntilDeadline >= 0 && daysUntilDeadline <= 7 && stage.status !== 'completed' : false;

  const assignee = contacts.find(c => c.id === stage.assigneeContactId);

  const handleNotifyAssignee = () => {
    if (!assignee) return;

    const subject = `Ανάθεση Εργασίας: ${stage.title} - Έργο: ${projectName}`;
    let ownerDetails = 'Δεν έχουν οριστεί στοιχεία ιδιοκτήτη.';
    if (owner) {
        ownerDetails = `Παρακαλούμε επικοινωνήστε με τον ιδιοκτήτη για συντονισμό:\n- Όνομα: ${owner.name || 'Δεν έχει οριστεί'}\n- Τηλέφωνο: ${owner.phone || 'Δεν έχει οριστεί'}\n- Διεύθυνση Έργου: ${owner.address || 'Δεν έχει οριστεί'}`;
    }
    const body = `Αγαπητέ/ή ${assignee.name},\n\nΣας έχει ανατεθεί το παρακάτω στάδιο: "${stage.title}" για το έργο "${projectName}".\n\n${ownerDetails}\n\nΕυχαριστούμε,\nNESTOR eco\n`;
    const mailtoLink = `mailto:${assignee.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Use a more robust method to open the mail client
    window.location.href = mailtoLink;
  };

  return (
    <Card className={cn("shadow-md hover:shadow-lg transition-shadow")}>
      <CardHeader className="p-4">
        <div className="flex justify-between items-start gap-2">
            <div className="flex items-center gap-2 flex-1">
              <div className="space-y-1">
                  <CardTitle className="text-base">
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
                <DropdownMenuItem onSelect={handleNotifyAssignee} disabled={!assignee}>
                  <Mail className="mr-2 h-4 w-4" />
                  <span>Ειδοποίηση Αναδόχου</span>
                </DropdownMenuItem>
                <SmartReminderDialog stage={stage} projectName={projectName} contacts={contacts} owner={owner}>
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
              <EditStageDialog stage={stage} projectId={projectId} contacts={contacts}>
                 <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={stage.status === 'completed'}>
                    <Pencil className="mr-2 h-4 w-4" />
                    <span>Επεξεργασία Σταδίου</span>
                </DropdownMenuItem>
              </EditStageDialog>
              <DeleteStageDialog stage={stage} projectId={projectId}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={stage.status === 'completed'} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Διαγραφή Σταδίου</span>
                </DropdownMenuItem>
              </DeleteStageDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3 text-sm text-muted-foreground">
        {assignee && (
            <div className="flex items-center gap-2 text-foreground">
                <User className="h-4 w-4"/>
                <span>Ανάδοχος: {assignee.name}</span>
            </div>
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
        {stage.files.length > 0 && (
            <div className="border-t pt-3 mt-3">
                <h4 className="font-medium text-xs text-foreground mb-2">Συνημμένα</h4>
                {stage.files.map(file => (
                     <div key={file.id} className="flex items-center gap-2">
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
