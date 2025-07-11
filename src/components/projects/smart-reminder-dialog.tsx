
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
import { generateReminderAction } from "@/app/actions/ai";
import { Loader2, Bot, Wand2, Mail, AlertTriangle, ListTodo, ShieldCheck } from "lucide-react";
import type { Stage, Contact } from "@/types";
import type { GenerateReminderOutput } from "@/ai/flows/ai-smart-reminders";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";

interface SmartReminderDialogProps {
  stage: Stage;
  projectName: string;
  contacts: Contact[];
  owner?: Contact;
  children: ReactNode;
}

const userEmails = [
    'georgios.pagonis@gmail.com',
    'grigoris.pagonis@gmail.com',
    'nestoras.pagonis@gmail.com',
];

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

  const generateGmailLink = (senderEmail: string) => {
    if (!assignee || !result) return "";

    const subject = `Υπενθύμιση: ${stage.title} - Έργο: ${projectName}`;
    
    let notesSection = '';
    if (stage.notes) {
        notesSection = `\n\n   ΠΡΟΣΘΕΤΕΣ ΣΗΜΕΙΩΣΕΙΣ\n   --------------------------------\n   ${stage.notes}`;
    }

    const bodyParts = [
      ``,
      `Αγαπητέ/ή ${assignee.firstName} ${assignee.lastName},`,
      ``,
      `Ακολουθεί μια αυτοματοποιημένη υπενθύμιση από το σύστημα NESTOR eco σχετικά με το στάδιο "${stage.title}" για το έργο "${projectName}".`,
      ``,
      `==================================================`,
      ``,
      `   ΥΠΕΝΘΥΜΙΣΗ`,
      `   --------------------------------`,
      `   ${result.reminder}`,
      ``,
      ``,
      `   ΑΞΙΟΛΟΓΗΣΗ ΚΑΤΑΣΤΑΣΗΣ`,
      `   --------------------------------`,
      `   ΕΠΙΠΕΔΟ ΕΠΕΙΓΟΝΤΟΣ: ${urgencyConfig[result.urgencyLevel].text}`,
      `   > ${result.riskAssessment}`,
      ``,
      ``,
      `   ΠΡΟΤΕΙΝΟΜΕΝΑ ΕΠΟΜΕΝΑ ΒΗΜΑΤΑ`,
      `   --------------------------------`,
      ...result.suggestedNextSteps.map(step => `   • ${step}`),
      ``,
      notesSection,
      ``,
    ];

    if (owner) {
      const fullAddress = [
        owner.addressStreet,
        owner.addressNumber,
        owner.addressArea,
        owner.addressPostalCode,
        owner.addressCity,
        owner.addressPrefecture,
      ].filter(Boolean).join(", ");
      
      bodyParts.push(
        `   ΣΤΟΙΧΕΙΑ ΕΠΙΚΟΙΝΩΝΙΑΣ ΙΔΙΟΚΤΗΤΗ`,
        `   --------------------------------`,
        `   • Όνομα: ${owner.firstName} ${owner.lastName}`,
        `   • Τηλέφωνο: ${owner.mobilePhone || owner.landlinePhone || 'Δ/Υ'}`,
        `   • Διεύθυνση: ${fullAddress || 'Δ/Υ'}`,
        ``,
        ``,
      );
    }
    
    bodyParts.push(
      `==================================================`,
      ``,
      `Με εκτίμηση,`,
      ``,
    );

    if (senderEmail === 'georgios.pagonis@gmail.com') {
        bodyParts.push(
            `Παγώνης Νέστ. Γεώργιος`,
            `Αρχιτέκτων Μηχανικός`,
            ``,
            `Σαμοθράκης 16, 563 34`,
            `Ελευθέριο Κορδελιό, Θεσσαλονίκη`,
            `Τ: 2310 55 95 95`,
            `Μ: 6974 050 023`,
            `georgios.pagonis@gmail.com`
        );
    } else {
         bodyParts.push(`Η ομάδα του NESTOR eco`);
    }
    
    const body = bodyParts.join("\n");
    
    const gmailUrl = new URL("https://mail.google.com/mail/");
    gmailUrl.searchParams.set('view', 'cm');
    gmailUrl.searchParams.set('fs', '1');
    gmailUrl.searchParams.set('to', assignee.email);
    gmailUrl.searchParams.set('su', subject);
    gmailUrl.searchParams.set('body', body);
    gmailUrl.searchParams.set('authuser', senderEmail);


    return gmailUrl.toString();
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
            {assignee && ` Θα μπορείτε να την αποστείλετε στον/στην ${assignee.firstName} ${assignee.lastName}.`}
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button className="flex-1">
                        <Mail className="mr-2 h-4 w-4" />
                        Αποστολή Email
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Επιλογή Αποστολέα</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                     {userEmails.map(email => (
                        <DropdownMenuItem key={email} onSelect={() => {
                            const url = generateGmailLink(email);
                            window.open(url, '_blank', 'noopener,noreferrer');
                        }}>
                            {email}
                        </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
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
