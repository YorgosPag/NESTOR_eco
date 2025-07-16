
"use client";

import { useState, useEffect } from 'react';
import type { Project, Contact } from '@/types';
import { format } from 'date-fns';
import { el } from 'date-fns/locale';
import { Calendar, Phone, MapPin, Mail } from 'lucide-react';
import { formatAddress } from '@/lib/text-utils';

interface WorkOrderProjectDetailsProps {
    project: Project;
    owner?: Contact;
}

export function WorkOrderProjectDetails({ project, owner }: WorkOrderProjectDetailsProps) {
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true) }, []);
    
    const ownerFullAddress = owner ? formatAddress(
        owner.addressStreet,
        owner.addressNumber,
        owner.addressArea,
        owner.addressPostalCode,
        owner.addressCity,
        owner.addressPrefecture
    ) : '';

    return (
        <>
            <header className="flex justify-between items-start pb-6 border-b mb-6">
                <div>
                    <h2 className="text-h1 text-primary">ΕΝΤΟΛΗ ΕΡΓΑΣΙΑΣ</h2>
                    <p className="text-muted">Αναφορά για συνεργάτες</p>
                </div>
                <div className="text-right">
                    <div className="flex items-center justify-end gap-2">
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                            <p className="flex items-center gap-2"><Mail className="w-4 h-4"/> {owner.email || 'Δεν έχει οριστεί'}</p>
                        </div>
                    </div>
                )}
            </section>
        </>
    );
}
