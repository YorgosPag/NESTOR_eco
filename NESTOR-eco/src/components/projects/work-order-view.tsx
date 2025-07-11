
"use client";

import type { Project, Contact } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Printer, Mail, Calendar, Phone, MapPin, FileText, User } from 'lucide-react';
import { format } from 'date-fns';
import { el } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


const userEmails = [
    'georgios.pagonis@gmail.com',
    'grigoris.pagonis@gmail.com',
    'nestoras.pagonis@gmail.com',
];

interface WorkOrderViewProps {
    project: Project;
    contacts: Contact[];
    isBatch?: boolean;
    showAssignees?: boolean;
}

export function WorkOrderView({ project, contacts, isBatch = false, showAssignees = false }: WorkOrderViewProps) {
    const [isClient, setIsClient] = useState(false);
    const owner = contacts.find(c => c.id === project.ownerContactId);

    const ownerFullAddress = owner ? [
        owner.addressStreet,
        owner.addressNumber,
        owner.addressArea,
        owner.addressPostalCode,
        owner.addressCity,
        owner.addressPrefecture,
    ].filter(Boolean).join(', ') : '';

    useEffect(() => {
        setIsClient(true);
    }, []);

    function generateEmailBody(senderEmail: string) {
        const bodyParts = [
            `ΕΝΤΟΛΗ ΕΡΓΑΣΙΑΣ`,
            `====================================`,
            ``,
            `Στοιχεία Έργου:`,
            `--------------------`,
            `Τίτλος: ${project.title}`,
            project.applicationNumber ? `Αρ. Αίτησης: ${project.applicationNumber}` : '',
            project.deadline ? `Καταληκτική Ημερομηνία: ${format(new Date(project.deadline), 'dd/MM/yyyy')}` : '',
            ``,
        ];

        if (owner) {
            bodyParts.push(
                `Στοιχεία Ιδιοκτήτη:`,
                `--------------------`,
                `Όνομα: ${owner.firstName} ${owner.lastName}`,
                `Διεύθυνση: ${ownerFullAddress || 'Δεν έχει οριστεί'}`,
                `Τηλέφωνο: ${owner.mobilePhone || owner.landlinePhone || 'Δεν έχει οριστεί'}`,
                ``,
            );
        }

        bodyParts.push(
            `Λίστα Παρεμβάσεων & Εργασιών:`,
            `---------------------------------`,
        );

        project.interventions.forEach(intervention => {
            bodyParts.push(`\n• ΠΑΡΕΜΒΑΣΗ: ${intervention.interventionSubcategory || intervention.interventionCategory}`);
            
            if (intervention.subInterventions && intervention.subInterventions.length > 0) {
                intervention.subInterventions.forEach(sub => {
                    const quantityText = sub.quantity ? ` - Ποσότητα: ${sub.quantity} ${sub.quantityUnit || ''}` : null;
                    const priceText = sub.cost > 0 ? ` - Τιμή: ${sub.cost.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}` : '';
                    const energySpecText = sub.selectedEnergySpec ? ` - Χαρακτ/κά: ${sub.selectedEnergySpec}` : '';
                    bodyParts.push(`  └─ ${sub.displayCode}: ${sub.description}${energySpecText}${quantityText}${priceText}`);
                });
            } else {
                 const currentStage = intervention.stages.find(s => s.status !== 'completed') || intervention.stages[intervention.stages.length - 1];
                 if (currentStage) {
                    bodyParts.push(`  - Τρέχον Στάδιο: ${currentStage.title}`);
                 } else {
                    bodyParts.push(`  - Δεν έχουν καθορισμένα στάδια.`);
                 }
            }
        });
        
        bodyParts.push(
            ``,
            `====================================`,
            `Με εκτίμηση,`,
            ``
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

        return bodyParts.filter(part => part !== '').join('\n');
    }

    function handleEmail(senderEmail: string) {
        if (!isClient) return;
        
        const subject = `Εντολή Εργασίας: ${project.title}`;
        const body = generateEmailBody(senderEmail);
        const gmailUrl = new URL("https://mail.google.com/mail/");
        gmailUrl.searchParams.set('view', 'cm');
        gmailUrl.searchParams.set('fs', '1');
        gmailUrl.searchParams.set('authuser', senderEmail);
        gmailUrl.searchParams.set('su', subject);
        gmailUrl.searchParams.set('body', body);
        
        window.open(gmailUrl.toString(), '_blank', 'noopener,noreferrer');
    }

    return (
        <main className="bg-background font-sans print:bg-white">
            {!isBatch && (
                <div className="flex justify-between items-center mb-6 print:hidden">
                    <h1 className="text-h1 flex items-center gap-2">
                        <FileText className="h-6 w-6" />
                        Προεπισκόπηση Αναφοράς
                    </h1>
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href={`/projects/${project.id}`}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Επιστροφή στο Έργο
                            </Link>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button disabled={!isClient}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Αποστολή με Email
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>Επιλογή Λογαριασμού</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {userEmails.map(email => (
                                    <DropdownMenuItem key={email} onSelect={() => handleEmail(email)}>
                                        {email}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button onClick={() => window.print()} disabled={!isClient}>
                            <Printer className="mr-2 h-4 w-4" />
                            Εκτύπωση
                        </Button>
                    </div>
                </div>
            )}
            
            <div className="max-w-4xl mx-auto p-8 border rounded-lg bg-card text-card-foreground print:border-none print:shadow-none print:p-0">
                 <header className="flex justify-between items-start pb-6 border-b mb-6">
                    <div>
                        <h2 className="text-h1 text-primary">ΕΝΤΟΛΗ ΕΡΓΑΣΙΑΣ</h2>
                        <p className="text-muted">Αναφορά για συνεργάτες</p>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center justify-end gap-2">
                             <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="text-primary"
                            >
                              <path
                                d="M12 2L2 7L12 12L22 7L12 2Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M2 17L12 22L22 17"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M2 12L12 17L22 12"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span className="font-semibold">NESTOR eco</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Ημερομηνία: {isClient ? format(new Date(), 'dd MMMM yyyy', { locale: el }) : '...'}</p>
                    </div>
                </header>

                <section className="grid md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <h3 className="text-h3 border-b pb-2 mb-3">Στοιχεία Έργου</h3>
                        <div className="space-y-1 text-p">
                            <p><strong>Τίτλος:</strong> {project.title}</p>
                            {project.applicationNumber && <p><strong>Αρ. Αίτησης:</strong> {project.applicationNumber}</p>}
                            {project.deadline && (
                                <p className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span><strong>Καταληκτική Ημερομηνία:</strong> {isClient ? format(new Date(project.deadline), 'dd/MM/yyyy') : '...'}</span>
                                </p>
                            )}
                        </div>
                    </div>
                    {owner && (
                        <div>
                            <h3 className="text-h3 border-b pb-2 mb-3">Στοιχεία Ιδιοκτήτη</h3>
                            <p className="font-bold text-lg">{owner.firstName} {owner.lastName}</p>
                            <div className="space-y-1 mt-2 text-muted-foreground">
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 mt-0.5 shrink-0"/>
                                    {ownerFullAddress ? (
                                        <a href={`https://www.google.com/maps?q=${encodeURIComponent(ownerFullAddress)}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">
                                            {ownerFullAddress}
                                        </a>
                                    ) : (
                                        <span>Δεν έχει οριστεί</span>
                                    )}
                                </div>
                                <p className="flex items-center gap-2"><Phone className="w-4 h-4"/> {owner.mobilePhone || owner.landlinePhone || 'Δεν έχει οριστεί'}</p>
                            </div>
                        </div>
                    )}
                </section>

                <section>
                    <h3 className="text-h2 mb-4 text-primary">Λίστα Παρεμβάσεων & Εργασιών</h3>
                    <div className="space-y-6">
                        {project.interventions.map(intervention => {
                            const firstStageWithAssignee = intervention.stages?.find(s => s.assigneeContactId);
                            const assignee = firstStageWithAssignee ? contacts.find(c => c.id === firstStageWithAssignee.assigneeContactId) : undefined;
                            
                            return (
                                <div key={intervention.masterId} className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-4 p-4 border rounded-md bg-muted/50 print:bg-gray-50 print:border-gray-200">
                                    <div className="col-span-1 md:col-span-3">
                                        <h4 className="text-h4">{intervention.interventionSubcategory || intervention.interventionCategory}</h4>
                                        {intervention.subInterventions && intervention.subInterventions.length > 0 ? (
                                            <div className="mt-4 pl-4 border-l-2 border-primary/50 space-y-2">
                                                {intervention.subInterventions.map(sub => {
                                                    const quantityText = sub.quantity ? `${sub.quantity} ${sub.quantityUnit || ''}` : null;
                                                    const priceText = sub.cost > 0 ? sub.cost.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' }) : null;

                                                    return (
                                                        <div key={sub.id} className="text-sm">
                                                            <p className="font-semibold">{sub.displayCode}: <span className="font-normal">{sub.description}</span></p>
                                                            <div className="text-xs text-muted-foreground pl-4 flex flex-wrap gap-x-4">
                                                                {sub.selectedEnergySpec && <span>Ενεργ. Χαρακτ/κά: {sub.selectedEnergySpec}</span>}
                                                                {quantityText && <span>Ποσότητα: {quantityText}</span>}
                                                                {priceText && <span>Εγκεκριμένη Τιμή: {priceText}</span>}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground mt-2 italic">Δεν έχουν καταχωρηθεί αναλυτικές εργασίες για αυτή την παρέμβαση.</p>
                                        )}
                                    </div>
                                    <div className="col-span-1">
                                       {showAssignees && (
                                            <>
                                                <h4 className="text-h4">Ανάδοχος Εργασιών</h4>
                                                {assignee ? (
                                                    <div className="space-y-1 mt-2 text-p">
                                                        <p className="flex items-center gap-2 font-semibold">
                                                            <User className="w-4 h-4"/>
                                                            <span>{assignee.firstName} {assignee.lastName}</span>
                                                        </p>
                                                        <p className="flex items-center gap-2">
                                                            <Phone className="w-4 h-4 text-muted-foreground"/>
                                                            <span>{assignee.mobilePhone || assignee.landlinePhone || 'Δεν υπάρχει'}</span>
                                                        </p>
                                                        <p className="flex items-center gap-2">
                                                            <Mail className="w-4 h-4 text-muted-foreground"/>
                                                            <span>{assignee.email || 'Δεν υπάρχει'}</span>
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground mt-2 italic">Δεν έχει οριστεί ακόμη ανάδοχος.</p>
                                                )}
                                            </>
                                       )}
                                    </div>
                                </div>
                            )
                        })}
                         {project.interventions.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">Δεν υπάρχουν παρεμβάσεις σε αυτό το έργο.</p>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
