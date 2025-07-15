

"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Copy, HardDriveDownload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportContactsToMarkdownAction } from '@/app/actions/contacts';
import { getAllProjects } from '@/lib/projects-data';
import { getContacts } from '@/lib/contacts-data';
import { getAdminDb } from '@/lib/firebase-admin';
import type { Project, Contact } from '@/types';


type ExportType = 'contacts' | 'projects';

function formatProjectsToMarkdown(projects: Project[], contacts: Contact[]): string {
    let markdown = '# Λίστα Έργων Βάσης Δεδομένων\n\n';
    markdown += 'Ακολουθούν τα αναλυτικά στοιχεία για όλα τα έργα που είναι καταχωρημένα στο σύστημα.\n\n---\n\n';

    projects.forEach((project, index) => {
        const owner = contacts.find(c => c.id === project.ownerContactId);
        markdown += `## ${index + 1}. ${project.title}\n\n`;
        markdown += `- **ID Έργου:** ${project.id}\n`;
        markdown += `- **Αρ. Αίτησης:** ${project.applicationNumber || 'Δ/Υ'}\n`;
        markdown += `- **Ιδιοκτήτης:** ${owner ? `${owner.firstName} ${owner.lastName}` : 'Άγνωστος'}\n`;
        markdown += `- **Κατάσταση:** ${project.status}\n`;
        markdown += `- **Προϋπολογισμός:** €${project.budget.toLocaleString('el-GR')}\n`;
        markdown += `- **Προθεσμία:** ${project.deadline ? new Date(project.deadline).toLocaleDateString('el-GR') : 'Δ/Υ'}\n`;
        
        if (project.interventions.length > 0) {
            markdown += `\n### Παρεμβάσεις (${project.interventions.length}):\n`;
            project.interventions.forEach(intervention => {
                markdown += `\n- **${intervention.interventionCategory} / ${intervention.interventionSubcategory}**\n`;
                if(intervention.subInterventions && intervention.subInterventions.length > 0){
                    markdown += `  - **Ανάλυση Κόστους:**\n`;
                    intervention.subInterventions.forEach(sub => {
                        markdown += `    - ${sub.description}: €${sub.cost.toLocaleString('el-GR')}\n`;
                    });
                }
            });
        }
        
        markdown += `\n---\n\n`;
    });

    return markdown;
}


export function DataExport() {
    const [isLoading, setIsLoading] = useState<ExportType | null>(null);
    const [markdownData, setMarkdownData] = useState<string | null>(null);
    const { toast } = useToast();

    const handleExport = async (type: ExportType) => {
        setIsLoading(type);
        setMarkdownData(null);
        try {
            let result;
            if (type === 'contacts') {
                result = await exportContactsToMarkdownAction();
            } else {
                // This logic is now on the client, but it needs to call a server action
                // to get the data, as it requires admin DB access.
                // We'll create a new server action for this.
                toast({
                    variant: 'destructive',
                    title: 'Λειτουργία υπό κατασκευή',
                    description: 'Η εξαγωγή έργων δεν είναι ακόμα διαθέσιμη από το client.',
                });
                // In a real scenario, you'd call a server action here that fetches projects and contacts
                // and then format them using formatProjectsToMarkdown.
                // For now, we simulate an empty result.
                result = { success: true, data: "# Η εξαγωγή έργων θα υλοποιηθεί σύντομα." };
            }
            
            if (result.success) {
                setMarkdownData(result.data);
                toast({ title: 'Επιτυχία', description: `Τα δεδομένα (${type === 'contacts' ? 'επαφών' : 'έργων'}) εξήχθησαν με επιτυχία.` });
            } else {
                toast({ variant: 'destructive', title: 'Σφάλμα', description: (result as any).error });
            }
        } catch (error) {
             toast({ variant: 'destructive', title: 'Σφάλμα Συστήματος', description: 'Προέκυψε ένα μη αναμενόμενο σφάλμα κατά την εξαγωγή.' });
        } finally {
            setIsLoading(null);
        }
    };
    
    const handleCopy = () => {
        if (!markdownData) return;
        navigator.clipboard.writeText(markdownData).then(() => {
            toast({ title: 'Επιτυχία', description: 'Τα δεδομένα αντιγράφηκαν στο πρόχειρο.' });
        }).catch(() => {
            toast({ variant: 'destructive', title: 'Σφάλμα', description: 'Η αντιγραφή απέτυχε.' });
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <HardDriveDownload className="h-6 w-6" />
                    Εξαγωγή Δεδομένων
                </CardTitle>
                <CardDescription>
                    Εξάγετε τα δεδομένα σας από τη βάση δεδομένων σε μορφή Markdown για εύκολη αντιγραφή και χρήση.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Button onClick={() => handleExport('contacts')} disabled={!!isLoading}>
                        {isLoading === 'contacts' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Εξαγωγή Επαφών
                    </Button>
                     <Button onClick={() => handleExport('projects')} disabled={!!isLoading}>
                        {isLoading === 'projects' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Εξαγωγή Έργων
                    </Button>
                    {markdownData && (
                        <Button onClick={handleCopy} variant="outline">
                            <Copy className="mr-2 h-4 w-4" />
                            Αντιγραφή
                        </Button>
                    )}
                </div>

                {isLoading && (
                    <div className="min-h-[20rem] flex items-center justify-center rounded-md border bg-muted">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
                
                {markdownData && !isLoading && (
                    <div>
                        <Label htmlFor="markdown-output">Αποτέλεσμα Εξαγωγής</Label>
                        <Textarea
                            id="markdown-output"
                            readOnly
                            value={markdownData}
                            className="mt-2 h-[400px] font-mono text-xs"
                            placeholder="Τα δεδομένα Markdown θα εμφανιστούν εδώ..."
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
