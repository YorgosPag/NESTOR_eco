
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Mail, FileText } from 'lucide-react';
import type { Project } from '@/types';
import { generateWorkOrderEmailBody } from './email-generator';

const userEmails = [
    'georgios.pagonis@gmail.com',
    'grigoris.pagonis@gmail.com',
    'nestoras.pagonis@gmail.com',
];

interface WorkOrderHeaderProps {
    project: Project;
}

export function WorkOrderHeader({ project }: WorkOrderHeaderProps) {
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true) }, []);

    const handleEmail = (senderEmail: string) => {
        if (!isClient) return;
        
        const subject = `Εντολή Εργασίας: ${project.title}`;
        const body = generateWorkOrderEmailBody(project, senderEmail);
        const gmailUrl = new URL("https://mail.google.com/mail/");
        gmailUrl.searchParams.set('view', 'cm');
        gmailUrl.searchParams.set('fs', '1');
        gmailUrl.searchParams.set('authuser', senderEmail);
        gmailUrl.searchParams.set('su', subject);
        gmailUrl.searchParams.set('body', body);
        
        window.open(gmailUrl.toString(), '_blank', 'noopener,noreferrer');
    }

    return (
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
    );
}
