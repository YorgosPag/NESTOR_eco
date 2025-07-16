
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { Project, Contact, ProjectIntervention, Stage } from "@/types";
import { ScrollArea } from "../ui/scroll-area";
import { Mail } from "lucide-react";
import { MultiSelectCombobox } from "../ui/multi-select-combobox";
import { useToast } from "@/hooks/use-toast";
import { SearchableSelect } from "../ui/searchable-select";
import { logEmailNotificationAction } from "@/app/actions/email";
import { generateAssignmentEmailBody } from "@/lib/email-templates";

const userEmails = [
    'georgios.pagonis@gmail.com',
    'grigoris.pagonis@gmail.com',
    'nestoras.pagonis@gmail.com',
];

export function NotifyAssigneeDialog({
  project,
  stage,
  allProjectInterventions,
  contacts,
  owner,
}: {
  project: Project;
  stage: Stage;
  allProjectInterventions: ProjectIntervention[];
  contacts: Contact[];
  owner?: Contact;
}) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [selectedInterventionIds, setSelectedInterventionIds] = useState<
    string[]
  >(() => {
    const relatedIntervention = allProjectInterventions.find((intervention) =>
      intervention.stages?.some((s) => s.id === stage.id)
    );
    return relatedIntervention ? [relatedIntervention.masterId] : [];
  });
  
  const [includeOwnerInfo, setIncludeOwnerInfo] = useState(true);
  const [includePricingInfo, setIncludePricingInfo] = useState(false);
  const [invoicingContactId, setInvoicingContactId] = useState<string | undefined>(undefined);
  const [ccContactIds, setCcContactIds] = useState<string[]>([]);

  const assignee = useMemo(() => {
    return contacts.find((c) => c.id === stage?.assigneeContactId);
  }, [contacts, stage]);

  const allContactsOptions = useMemo(
    () =>
      contacts
        .map((contact) => ({
          value: contact.id,
          label: `${contact.firstName} ${contact.lastName} (${contact.company || contact.role})`,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [contacts]
  );
  
  const handleSendEmail = async (senderEmail: string) => {
    const toEmail = assignee?.email || "";
    
    const ccContacts = contacts.filter(c => ccContactIds.includes(c.id) && c.email);
    const uniqueCcEmails = [...new Set(ccContacts.map(c => c.email).filter(Boolean))];

    if (!toEmail && uniqueCcEmails.length === 0) {
        toast({
            variant: "destructive",
            title: "Αποστολή Αδύνατη",
            description: "Δεν βρέθηκε καμία έγκυρη διεύθυνση email για αποστολή.",
        });
        return;
    }
    
    const selectedInterventions = allProjectInterventions.filter(i => selectedInterventionIds.includes(i.masterId));
    
    const subject = `Εντολή Εργασίας: ${project.title}`;
    const body = generateAssignmentEmailBody({
        project,
        stage,
        selectedInterventions,
        assignee,
        owner,
        senderEmail,
        includeOwnerInfo,
        includePricingInfo,
        invoicingContact: contacts.find(c => c.id === invoicingContactId)
    });

    const gmailUrl = new URL("https://mail.google.com/mail/");
    gmailUrl.searchParams.set("view", "cm");
    gmailUrl.searchParams.set("fs", "1");
    if (toEmail) {
      gmailUrl.searchParams.set("to", toEmail);
    }
    if (uniqueCcEmails.length > 0) {
      gmailUrl.searchParams.set("cc", uniqueCcEmails.join(','));
    }
    gmailUrl.searchParams.set("su", subject);
    gmailUrl.searchParams.set("body", body);
    gmailUrl.searchParams.set("authuser", senderEmail);

    window.open(gmailUrl.toString(), "_blank", "noopener,noreferrer");

    if (assignee) {
        const formData = new FormData();
        formData.append('projectId', project.id);
        formData.append('stageId', stage.id);
        formData.append('assigneeName', `${assignee.firstName} ${assignee.lastName}`);
        await logEmailNotificationAction(null, formData);
    }
  };
  
  const handleTriggerClick = () => {
    if (!assignee) return; 

    if (!assignee.email) {
      toast({
        variant: "destructive",
        title: "Δεν Υπάρχει Email",
        description: `Η επαφή "${assignee.firstName} ${assignee.lastName}" δεν έχει καταχωρημένη διεύθυνση email.`,
      });
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <DropdownMenuItem
        disabled={!assignee}
        onSelect={(e) => e.preventDefault()}
        onClick={handleTriggerClick}
      >
        <Mail className="mr-2 h-4 w-4" />
        <span>Ειδοποίηση Αναδόχου</span>
      </DropdownMenuItem>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Ειδοποίηση Αναδόχου</DialogTitle>
            <DialogDescription>
              Επιλέξτε τις παρεμβάσεις για να δημιουργήσετε ένα email για τον/την{" "}
              <b>{assignee ? `${assignee.firstName} ${assignee.lastName}` : "Ανάδοχο"}</b>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label>Παρεμβάσεις προς εκτέλεση:</Label>
              <ScrollArea className="h-40 rounded-md border p-2 mt-2">
                <div className="space-y-2">
                  {allProjectInterventions.map((intervention) => (
                    <div key={intervention.masterId} className="flex items-center gap-2">
                      <Checkbox
                        id={`intervention-${intervention.masterId}`}
                        checked={selectedInterventionIds.includes(intervention.masterId)}
                        onCheckedChange={(checked) => {
                          setSelectedInterventionIds((prev) =>
                            checked
                              ? [...prev, intervention.masterId]
                              : prev.filter((id) => id !== intervention.masterId)
                          );
                        }}
                      />
                      <Label htmlFor={`intervention-${intervention.masterId}`} className="font-normal">
                        {intervention.interventionSubcategory || intervention.interventionCategory}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div>
              <Label>Πρόσθετες Επιλογές:</Label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="include-owner"
                    checked={includeOwnerInfo}
                    onCheckedChange={(checked) => setIncludeOwnerInfo(Boolean(checked))}
                  />
                  <Label htmlFor="include-owner" className="font-normal">
                    Συμπερίληψη στοιχείων ιδιοκτήτη
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="include-pricing"
                    checked={includePricingInfo}
                    onCheckedChange={(checked) => {
                        const isChecked = Boolean(checked);
                        setIncludePricingInfo(isChecked);
                        if (!isChecked) {
                          setInvoicingContactId(undefined);
                        }
                    }}
                  />
                  <Label htmlFor="include-pricing" className="font-normal">
                    Συμπερίληψη στοιχείων τιμολόγησης
                  </Label>
                </div>
              </div>
            </div>

            {includePricingInfo && (
              <div className="space-y-2">
                <Label htmlFor="invoicing-contact-select">Στοιχεία Τιμολόγησης (Επιλογή Επαφής)</Label>
                <SearchableSelect
                    options={allContactsOptions}
                    value={invoicingContactId}
                    onValueChange={setInvoicingContactId}
                    placeholder="Επιλέξτε επαφή για τιμολόγηση..."
                    searchPlaceholder="Αναζήτηση επαφής..."
                />
              </div>
            )}

            <div>
                <Label htmlFor="cc-contacts">Κοινοποίηση προς τρίτους:</Label>
                <MultiSelectCombobox
                    options={allContactsOptions.filter(c => c.value !== assignee?.id)}
                    selected={ccContactIds}
                    onChange={setCcContactIds}
                    placeholder="Επιλογή επαφών..."
                    className="mt-2"
                />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Άκυρο</Button>
             <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button
                          disabled={selectedInterventionIds.length === 0}
                      >
                          <Mail className="mr-2 h-4 w-4" />
                          Δημιουργία Email
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                  <DropdownMenuLabel>Επιλογή Αποστολέα</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                      {userEmails.map(email => (
                      <DropdownMenuItem key={email} onSelect={() => handleSendEmail(email)}>
                          {email}
                      </DropdownMenuItem>
                  ))}
                  </DropdownMenuContent>
              </DropdownMenu>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
