/**
 * @fileoverview Generates the email body for a work assignment.
 */

import type { Project, Stage, ProjectIntervention, Contact } from "@/types";
import { getSignature } from './signatures';
import { createSection } from './helpers';

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

function generateInterventionsText(interventions: ProjectIntervention[]): string {
    return interventions.map((intervention) => {
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
}

function generateOwnerInfoSection(owner: Contact): string[] {
    const ownerFullAddress = [
        owner.addressStreet,
        owner.addressNumber,
        owner.addressArea,
        owner.addressPostalCode,
        owner.addressCity,
        owner.addressPrefecture,
    ].filter(Boolean).join(', ');

    return createSection('ΣΤΟΙΧΕΙΑ ΙΔΙΟΚΤΗΤΗ ΓΙΑ ΣΥΝΤΟΝΙΣΜΟ', [
        `• Όνομα: ${owner.firstName} ${owner.lastName}`,
        `• Τηλέφωνο: ${owner.mobilePhone || owner.landlinePhone || 'Δ/Υ'}`,
        `• Διεύθυνση Έργου: ${ownerFullAddress || 'Δ/Υ'}`,
    ]);
}

function generateInvoicingSection(project: Project, owner: Contact | undefined, invoicingContact: Contact): string[] {
     const invoicingAddress = [
        invoicingContact.addressStreet,
        invoicingContact.addressNumber,
        invoicingContact.addressPostalCode,
        invoicingContact.addressCity
    ].filter(Boolean).join(' ');

    const invoiceNoteParts = [project.applicationNumber, owner && `${owner.firstName} ${owner.lastName}`, 'Εξοικονομώ'].filter(Boolean);
  
    return createSection('ΣΤΟΙΧΕΙΑ ΓΙΑ ΕΚΔΟΣΗ ΤΙΜΟΛΟΓΙΟΥ', [
        `${invoicingContact.company || `${invoicingContact.firstName} ${invoicingContact.lastName}`}`,
        invoicingAddress,
        invoicingContact.landlinePhone && `Τηλ: ${invoicingContact.landlinePhone}`,
        invoicingContact.email && `Email: ${invoicingContact.email}`,
        invoicingContact.vatNumber && `ΑΦΜ: ${invoicingContact.vatNumber}`,
        ``,
        `ΠΡΟΣΟΧΗ: Είναι απαραίτητο στις παρατηρήσεις του τιμολογίου να γράψετε:`,
        invoiceNoteParts.join(', '),
    ]);
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
    const interventionsText = generateInterventionsText(selectedInterventions);

    bodyParts.push(assigneeGreeting, ``, `Σας ανατίθενται οι παρακάτω εργασίες για το έργο "${project.title}":`, ``, interventionsText);
    bodyParts.push(...createSection(`ΣΗΜΕΙΩΣΕΙΣ ΓΙΑ ΤΟ ΣΤΑΔΙΟ "${stage.title}"`, [stage.notes]));

    if (includeOwnerInfo && owner) {
        bodyParts.push(...generateOwnerInfoSection(owner));
    }

    if (includePricingInfo && invoicingContact) {
        bodyParts.push(...generateInvoicingSection(project, owner, invoicingContact));
    }

    bodyParts.push(`\n\nΜε εκτίμηση,`, ``, ...getSignature(senderEmail));

    return bodyParts.join('\n');
}