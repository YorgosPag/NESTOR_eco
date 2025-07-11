
"use client";

import { useState, type ReactNode } from "react";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { generateReminderAction } from "@/app/client-actions";
import { Loader2, Bot, Wand2, Mail, AlertTriangle, ListTodo, ShieldCheck } from "lucide-react";
import type { Stage, Contact } from "@/types";
import type { GenerateReminderOutput } from "@/ai/flows/ai-smart-reminders";
import { cn } from "@/lib/utils";

interface SmartReminderDialogProps {
  stage: Stage;
  projectName: string;
  contacts: Contact[];
  owner?: Contact;
  children: React.ReactNode;
}

export function SmartReminderDialog({ stage, projectName, contacts, owner, children }: SmartReminderDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateReminderOutput | null>(null);
  const { toast } = useToast();

  const assignee = contacts.find(c => c.id === stage.assigneeContactId);

  const handleSubmit = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await generateReminderAction({
        projectName,
        stageName: stage.title,
        deadline: stage.deadline,
        status: stage.status,
        lastUpdated: stage.lastUpdated,
        notes: stage.notes,
      });

      if (response.success && response.data) {
        setResult(response.data);
      } else {
        toast({
          variant: "destructive",
          title: "Η δημιουργία υπενθύμισης απέτυχε",
          description: response.error,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Σφάλμα",
        description: "Προέκυψε ένα μη αναμενόμενο σφάλμα.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const urgencyConfig = {
      low: { text: "Χαμηλή", icon: ShieldCheck, className: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800" },
      medium: { text: "Μεσαία", icon: AlertTriangle, className: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800" },
      high: { text: "Υψηλή", icon: AlertTriangle, className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800" },
  };

  const generateMailtoLink = () => {
    if (!assignee || !result) return "";

    const subject = `Υπενθύμιση: ${stage.title} - Έργο: ${projectName}`;
    
    const bodyParts = [
      `Αγαπητέ/ή ${assignee.name},`,
      ``,
      `Ακολουθεί μια υπενθύμιση σχετικά με το στάδιο "${stage.title}" για το έργο "${projectName}".`,
      ``,
      `---`,
      `**Υπενθύμιση:**`,
      result.reminder,
      ``,
      `**Επίπεδο Επείγοντος:** ${urgencyConfig[result.urgencyLevel].text}`,
      `**Ανάλυση Κινδύνου:** ${result.riskAssessment}`,
      ``,
      `**Προτεινόμενα Επόμενα Βήματα:**`,
      ...result.suggestedNextSteps.map(step => `- ${step}`),
      `---`
    ];

    if (owner) {
      bodyParts.push(
        ``,
        `Στοιχεία Ιδιοκτήτη για επικοινωνία:`,
        `- Όνομα: ${owner.name}`,
        `- Τηλέφωνο: ${owner.phone || 'Δ/Υ'}`
      );
    }
    
    bodyParts.push(
      ``,
      `Παρακαλούμε ελέγξτε την κατάσταση και προβείτε στις απαραίτητες ενέργειες.`,
      ``,
      `Ευχαριστούμε,`,
      `NESTOR eco`
    );
    
    const body = bodyParts.join("\n");
    return `mailto:${assignee.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.trim())}`;
  };

  const resetState = () => {
    setIsLoading(false);
    setResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
            resetState();
        }
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Bot className="w-6 h-6"/> Έξυπνη Υπενθύμιση AI</DialogTitle>
          <DialogDescription>
            Δημιουργία έξυπνης υπενθύμισης για το στάδιο: <strong>{stage.title}</strong>.
            {assignee && ` Θα μπορείτε να την αποστείλετε στον/στην ${assignee.name}.`}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            {isLoading && (
                 <div className="min-h-[14rem] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 </div>
            )}
            {result && (
                <div className="space-y-4">
                  <div className={cn("p-3 rounded-lg border flex items-center gap-3", urgencyConfig[result.urgencyLevel].className)}>
                    {React.createElement(urgencyConfig[result.urgencyLevel].icon, { className: "h-5 w-5" })}
                    <div>
                      <h4 className="font-semibold text-sm">Επίπεδο Επείγοντος: {urgencyConfig[result.urgencyLevel].text}</h4>
                      <p className="text-xs">{result.riskAssessment}</p>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-3 rounded-md">
                      <p className="text-sm font-medium">{result.reminder}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold flex items-center text-sm mb-2"><ListTodo className="w-4 h-4 mr-2" />Προτεινόμενα Βήματα</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {result.suggestedNextSteps.map((step, i) => <li key={i}>{step}</li>)}
                    </ul>
                  </div>
                </div>
            )}
            {!isLoading && !result && (
                <div className="text-center text-muted-foreground min-h-[14rem] flex flex-col items-center justify-center">
                    <Wand2 className="w-10 h-10 mb-2 text-primary/50"/>
                    <p>Πατήστε το κουμπί παρακάτω για να δημιουργήσετε μια αναλυτική υπενθύμιση με την υποστήριξη της AI.</p>
                </div>
            )}
        </div>
        <DialogFooter className="gap-2 sm:justify-end flex-col sm:flex-row">
            <Button variant="ghost" onClick={() => setOpen(false)} className="w-full sm:w-auto">Άκυρο</Button>
            <div className="flex w-full sm:w-auto gap-2">
              {result && assignee && (
                <Button asChild className="flex-1">
                  <a href={generateMailtoLink()}>
                    <Mail className="mr-2 h-4 w-4" />
                    Αποστολή Email
                  </a>
                </Button>
              )}
              <Button onClick={handleSubmit} disabled={isLoading} className="flex-1">
                  <Wand2 className="mr-2 h-4 w-4" />
                  {result ? "Εκ νέου" : (isLoading ? "Δημιουργία..." : "Δημιουργία")}
              </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
