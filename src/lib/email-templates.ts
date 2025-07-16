/**
 * @fileoverview This file contains helper functions for generating email body content.
 * It helps keep business logic out of UI components.
 */

import type { Project, Stage, ProjectIntervention, Contact } from "@/types";
import type { GenerateReminderOutput } from "@/ai/flows/ai-smart-reminders";

// --- SIGNATURES ---

const SIGNATURES = new Map<string, string[]>([
    [
        'georgios.pagonis@gmail.com',
        [
            `Παγώνης Νέστ. Γεώργιος`,
            `Αρχιτέκτων Μηχανικός`,
            ``,
            `Σαμοθράκης 16, 563 34`,
            `Ελευθέριο Κορδελιό, Θεσσαλονίκη`,
            `Τ: 2310 55 95 95`,
            `Μ: 6974 050 023`,
            `georgios.pagonis@gmail.com`
        ]
    ],
    [
        'grigoris.pagonis@gmail.com',
        [
            `Παγώνης Γρηγόριος`,
            `Ειδικός Συνεργάτης`,
            `grigoris.pagonis@gmail.com`
        ]
    ]
]);

const DEFAULT_SIGNATURE = ["Η ομάδα του NESTOR eco"];

function getSignature(senderEmail: string): string[] {
    return SIGNATURES.get(senderEmail) || DEFAULT_SIGNATURE;
}


// --- HELPERS ---

function createSection(title: string, lines: (string | null | undefined)[]): string[] {
    const filteredLines = lines.filter(Boolean);
    if (filteredLines.length === 0) return [];
    return [
        ``,
        title.toUpperCase(),
        '--------------------------------',
        ...filteredLines
    ];
}


// --- EMAIL BODY GENERATORS ---

interface AssignmentEmailPayload {
    project: Project;
    stage: Stage;
    selectedInterventions: ProjectIntervention[];
    assignee?: Contact;
    owner?: Contact;
    senderEmail: string;
    includeOwnerInfo: boolean;
    includePricingInfo: boolean;
    invoicingContact?: Contact;
}

export function generateAssignmentEmailBody({
    project,
    stage,
    selectedInterventions,
    assignee,
    owner,
    senderEmail,
    includeOwnerInfo,
    includePricingInfo,
    invoicingContact,
}: AssignmentEmailPayload): string {
    
    if (selectedInterventions.length === 0) {
        return "Σφάλμα: Δεν έχουν επιλεγεί παρεμβάσεις για την αποστολή της εντολής εργασίας. Παρακαλώ επιλέξτε τουλάχιστον μία παρέμβαση και δοκιμάστε ξανά.";
    }

    const bodyParts: string[] = [];
    const assigneeGreeting = `Αγαπητέ/ή ${assignee ? `${assignee.firstName} ${assignee.lastName}` : "Ανάδοχε"},`;
    
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

    bodyParts.push(assigneeGreeting, ``, `Σας ανατίθενται οι παρακάτω εργασίες για το έργο "${project.title}":`, ``, interventionsText);

    bodyParts.push(...createSection(`ΣΗΜΕΙΩΣΕΙΣ ΓΙΑ ΤΟ ΣΤΑΔΙΟ "${stage.title}"`, [stage.notes]));

    if (includeOwnerInfo && owner) {
        const ownerFullAddress = [
            owner.addressStreet,
            owner.addressNumber,
            owner.addressArea,
            owner.addressPostalCode,
            owner.addressCity,
            owner.addressPrefecture,
        ].filter(Boolean).join(', ');

        bodyParts.push(...createSection('ΣΤΟΙΧΕΙΑ ΙΔΙΟΚΤΗΤΗ ΓΙΑ ΣΥΝΤΟΝΙΣΜΟ', [
            `• Όνομα: ${owner.firstName} ${owner.lastName}`,
            `• Τηλέφωνο: ${owner.mobilePhone || owner.landlinePhone || 'Δ/Υ'}`,
            `• Διεύθυνση Έργου: ${ownerFullAddress || 'Δ/Υ'}`,
        ]));
    }

    if (includePricingInfo && invoicingContact) {
        const invoicingAddress = [
            invoicingContact.addressStreet,
            invoicingContact.addressNumber,
            invoicingContact.addressPostalCode,
            invoicingContact.addressCity
        ].filter(Boolean).join(' ');

        const invoiceNoteParts = [project.applicationNumber, owner && `${owner.firstName} ${owner.lastName}`, 'Εξοικονομώ'].filter(Boolean);
      
        bodyParts.push(...createSection('ΣΤΟΙΧΕΙΑ ΓΙΑ ΕΚΔΟΣΗ ΤΙΜΟΛΟΓΙΟΥ', [
            `${invoicingContact.company || `${invoicingContact.firstName} ${invoicingContact.lastName}`}`,
            invoicingAddress,
            invoicingContact.landlinePhone && `Τηλ: ${invoicingContact.landlinePhone}`,
            invoicingContact.email && `Email: ${invoicingContact.email}`,
            invoicingContact.vatNumber && `ΑΦΜ: ${invoicingContact.vatNumber}`,
            ``,
            `ΠΡΟΣΟΧΗ: Είναι απαραίτητο στις παρατηρήσεις του τιμολογίου να γράψετε:`,
            invoiceNoteParts.join(', '),
        ]));
    }

    bodyParts.push(`\n\nΜε εκτίμηση,`, ``, ...getSignature(senderEmail));

    return bodyParts.join('\n');
}


interface ReminderEmailPayload {
    stage: Stage;
    projectName: string;
    assignee: Contact;
    owner?: Contact;
    result: GenerateReminderOutput;
    senderEmail: string;
    urgencyConfig: any;
}

export function generateReminderEmailBody({
    stage,
    projectName,
    assignee,
    owner,
    result,
    senderEmail,
    urgencyConfig
}: ReminderEmailPayload): string {
    const bodyParts: string[] = [];

    const reminderSection = createSection('ΥΠΕΝΘΥΜΙΣΗ', [result.reminder]);
    const assessmentSection = createSection('ΑΞΙΟΛΟΓΗΣΗ ΚΑΤΑΣΤΑΣΗΣ', [
        `ΕΠΙΠΕΔΟ ΕΠΕΙΓΟΝΤΟΣ: ${urgencyConfig[result.urgencyLevel].text}`,
        `> ${result.riskAssessment}`,
    ]);
    const stepsSection = createSection('ΠΡΟΤΕΙΝΟΜΕΝΑ ΕΠΟΜΕΝΑ ΒΗΜΑΤΑ', (result.suggestedNextSteps || []).map(step => `• ${step}`));
    const notesSection = createSection('ΠΡΟΣΘΕΤΕΣ ΣΗΜΕΙΩΣΕΙΣ', [stage.notes]);

    bodyParts.push(
      `Αγαπητέ/ή ${assignee.firstName} ${assignee.lastName},`,
      ``,
      `Ακολουθεί μια αυτοματοποιημένη υπενθύμιση από το σύστημα NESTOR eco σχετικά με το στάδιο "${stage.title}" για το έργο "${projectName}".`,
      `\n==================================================`,
      ...reminderSection,
      ...assessmentSection,
      ...stepsSection,
      ...notesSection,
    );

    if (owner) {
      const fullAddress = [
        owner.addressStreet,
        owner.addressNumber,
        owner.addressArea,
        owner.addressPostalCode,
        owner.addressCity,
        owner.addressPrefecture,
      ].filter(Boolean).join(", ");
      
      bodyParts.push(...createSection('ΣΤΟΙΧΕIA ΕΠΙΚΟΙΝΩΝΙΑΣ ΙΔΙΟΚΤΗΤΗ', [
          `• Όνομα: ${owner.firstName} ${owner.lastName}`,
          `• Τηλέφωνο: ${owner.mobilePhone || owner.landlinePhone || 'Δ/Υ'}`,
          `• Διεύθυνση: ${fullAddress || 'Δ/Υ'}`,
      ]));
    }
    
    bodyParts.push(
      `\n==================================================`,
      `\nΜε εκτίμηση,`,
      ``,
      ...getSignature(senderEmail)
    );
    
    return bodyParts.join("\n");
}
