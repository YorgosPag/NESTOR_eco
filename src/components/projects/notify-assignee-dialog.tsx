

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
import { logEmailNotificationAction } from "@/app/actions/projects";

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
  
  const generateEmailBody = (senderEmail: string) => {
    const bodyParts: string[] = [];

    const selectedInterventions = allProjectInterventions.filter(i => selectedInterventionIds.includes(i.masterId));
    
    const interventionsText = selectedInterventions.map((intervention) => {
        let interventionBlock = `• ΠΑΡΕΜΒΑΣΗ: ${intervention.interventionSubcategory || intervention.interventionCategory}`;
        
        if (intervention.subInterventions && intervention.subInterventions.length > 0) {
            const subInterventionsText = intervention.subInterventions.map((sub, subIndex, arr) => {
                const isLast = subIndex === arr.length - 1;
                const prefix = isLast ? '└─' : '├─';
                const quantityText = sub.quantity ? ` - Ποσότητα: ${sub.quantity} ${sub.quantityUnit || ''}` : '';
                
                const expenseCategory = sub.expenseCategory || '';
                const romanNumeralMatch = expenseCategory.match(/\((I|II|III|IV|V|VI|VII|VIII|IX|X)\)/);
                const romanNumeral = romanNumeralMatch ? ` (${romanNumeralMatch[1]})` : '';

                return `  ${prefix} ${sub.subcategoryCode}${romanNumeral}: ${sub.description}${quantityText}`;
            }).join('\n');
            interventionBlock += `\n${subInterventionsText}`;
        }
        
        return interventionBlock;
    }).join('\n\n');

    let assigneeGreeting = `Αγαπητέ/ή ${assignee ? `${assignee.firstName} ${assignee.lastName}` : "Ανάδοχε"},`;
    
    bodyParts.push(assigneeGreeting);
    bodyParts.push(``);
    bodyParts.push(`Σας ανατίθενται οι παρακάτω εργασίες για το έργο "${project.title}":`);
    bodyParts.push(``);
    bodyParts.push(interventionsText);


    if (stage.notes) {
        bodyParts.push(``);
        bodyParts.push(`ΣΗΜΕΙΩΣΕΙΣ ΓΙΑ ΤΟ ΣΤΑΔΙΟ "${stage.title}":`);
        bodyParts.push(stage.notes);
    }
    
    if (includeOwnerInfo && owner) {
        const ownerFullAddress = [
            owner.addressStreet,
            owner.addressNumber,
            owner.addressArea,
            owner.addressPostalCode,
            owner.addressCity,
            owner.addressPrefecture,
        ].filter(Boolean).join(', ');

        bodyParts.push(``);
        bodyParts.push(`ΣΤΟΙΧΕΙΑ ΙΔΙΟΚΤΗΤΗ ΓΙΑ ΣΥΝΤΟΝΙΣΜΟ:`);
        bodyParts.push(`• Όνομα: ${owner.firstName} ${owner.lastName}`);
        bodyParts.push(`• Τηλέφωνο: ${owner.mobilePhone || owner.landlinePhone || 'Δ/Υ'}`);
        bodyParts.push(`• Διεύθυνση Έργου: ${ownerFullAddress || 'Δ/Υ'}`);
    }

    if (includePricingInfo && invoicingContactId) {
      const invoicingContact = contacts.find(c => c.id === invoicingContactId);
      if (invoicingContact) {
        const invoicingAddress = [
            invoicingContact.addressStreet,
            invoicingContact.addressNumber,
            invoicingContact.addressPostalCode,
            invoicingContact.addressCity
        ].filter(Boolean).join(' ');

        bodyParts.push(``);
        bodyParts.push(`ΣΤΟΙΧΕΙΑ ΓΙΑ ΕΚΔΟΣΗ ΤΙΜΟΛΟΓΙΟΥ:`);
        bodyParts.push(`${invoicingContact.company || `${invoicingContact.firstName} ${invoicingContact.lastName}`}`);
        if(invoicingAddress) bodyParts.push(invoicingAddress);
        if(invoicingContact.landlinePhone) bodyParts.push(`Τηλ: ${invoicingContact.landlinePhone}`);
        if(invoicingContact.email) bodyParts.push(`Email: ${invoicingContact.email}`);
        if(invoicingContact.vatNumber) bodyParts.push(`ΑΦΜ: ${invoicingContact.vatNumber}`);
        
        const invoiceNoteParts = [];
        if (project.applicationNumber) invoiceNoteParts.push(project.applicationNumber);
        if (owner) invoiceNoteParts.push(`${owner.firstName} ${owner.lastName}`);
        invoiceNoteParts.push('Εξοικονομώ');
        const invoiceNote = invoiceNoteParts.join(', ');
        
        bodyParts.push(``);
        bodyParts.push(`ΠΡΟΣΟΧΗ: Είναι απαραίτητο στις παρατηρήσεις του τιμολογίου να γράψετε:`);
        bodyParts.push(invoiceNote);
      }
    }

    bodyParts.push(``);
    bodyParts.push(`================================`);
    bodyParts.push(`Με εκτίμηση,`);
    bodyParts.push(``);

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

    return bodyParts.join('\n');
  }

  const handleSendEmail = async (senderEmail: string) => {
    // 1. Collect all intended recipients
    const recipients: (Contact | undefined)[] = [];
    if (assignee) recipients.push(assignee);
    recipients.push(...contacts.filter(c => ccContactIds.includes(c.id)));
    if (includePricingInfo && invoicingContactId) {
        const invoicingContact = contacts.find(c => c.id === invoicingContactId);
        if (invoicingContact) {
            recipients.push(invoicingContact);
        }
    }

    // 2. Find who has a valid email and who doesn't
    const uniqueRecipients = [...new Map(recipients.map(item => [item?.id, item])).values()];
    const contactsWithEmail = uniqueRecipients.filter(c => c && c.email);
    const contactsWithoutEmail = uniqueRecipients.filter(c => c && !c.email);

    // 3. Handle errors and warnings
    if (contactsWithEmail.length === 0) {
        toast({
            variant: "destructive",
            title: "Αποστολή Αδύνατη",
            description: "Δεν βρέθηκε καμία έγκυρη διεύθυνση email για αποστολή.",
        });
        return;
    }
    
    if (contactsWithoutEmail.length > 0) {
        const names = contactsWithoutEmail.map(c => `${c?.firstName} ${c?.lastName}`).join(', ');
        toast({
            variant: "default",
            className: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800",
            title: "Προειδοποίηση",
            description: `Οι εξής επαφές δεν έχουν email και δεν θα συμπεριληφθούν: ${names}. Το email θα σταλεί στους υπόλοιπους.`,
        });
    }
    
    // 4. Prepare and send the email
    const toEmail = assignee?.email || (contactsWithEmail.find(c => c?.id !== assignee?.id)?.email || '');
    const ccEmails = contactsWithEmail
        .map(c => c?.email)
        .filter(Boolean)
        .filter(email => email !== toEmail);
        
    const uniqueCcEmails = [...new Set(ccEmails)];

    const subject = `Εντολή Εργασίας: ${project.title}`;
    const body = generateEmailBody(senderEmail);

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

    // 5. Log the action to the audit log
    if (assignee) {
        const formData = new FormData();
        formData.append('projectId', project.id);
        formData.append('stageId', stage.id);
        formData.append('assigneeName', `${assignee.firstName} ${assignee.lastName}`);
        await logEmailNotificationAction(null, formData);
    }
  };
  
  const assigneeHasEmail = assignee && assignee.email;

  return (
    <>
      <DropdownMenuItem
        disabled={!assignee}
        onSelect={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
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
              {!assigneeHasEmail && assignee && <span className="text-red-600 font-semibold ml-1">(Προσοχή: Δεν υπάρχει καταχωρημένο email)</span>}
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
