
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectCard } from '@/components/dashboard/project-card';
import { Users, DollarSign, FileText, PlusCircle, ArrowRight, Activity, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OverviewChart } from '@/components/dashboard/overview-chart';
import { UpcomingDeadlines } from '@/components/dashboard/upcoming-deadlines';
import type { Project, Contact } from '@/types';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// --- Hardcoded Data for Preview ---
const mockContacts: Contact[] = [
    { id: 'contact-1', firstName: 'Ιωάννης', lastName: 'Παπαδόπουλος', role: 'Πελάτης', addressCity: 'Μαρούσι', addressStreet: 'Αγίου Γεωργίου', addressNumber: '23' },
    { id: 'contact-2', firstName: 'Μαρία', lastName: 'Γεωργίου', role: 'Πελάτης', addressCity: 'Πάτρα', addressStreet: 'Αγίας Σοφίας', addressNumber: '15' },
    { id: 'contact-3', firstName: 'Εταιρεία', lastName: 'Α.Ε.', role: 'Πελάτης', company: 'Hellenic Business Corp.'},
    { id: 'contact-4', firstName: 'Κώστας', lastName: 'Μάστορας', role: 'Τεχνίτης', specialty: 'Υδραυλικός', avatar: 'https://i.pravatar.cc/150?u=contact-6' },
    { id: 'contact-5', firstName: 'Μαρία', lastName: 'Προμηθεύτρια', role: 'Προμηθευτής', specialty: 'Κουφώματα', avatar: 'https://i.pravatar.cc/150?u=contact-2' },
];

const mockProjects: Project[] = [
    {
        id: 'proj-1',
        title: "Ανακαίνιση στο Μαρούσι",
        applicationNumber: 'ΕΞ-2024-001',
        ownerContactId: 'contact-1',
        deadline: new Date(Date.now() + 6 * 86400000).toISOString(), // Deadline in 6 days
        interventions: [],
        budget: 14200,
        progress: 75,
        status: 'On Track',
        alerts: 0,
        auditLog: [],
    },
    {
        id: 'proj-2',
        title: "Αναβάθμιση στην Πάτρα",
        applicationNumber: 'ΕΞ-2024-002',
        ownerContactId: 'contact-2',
        deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
        interventions: [],
        budget: 9500,
        progress: 25,
        status: 'Delayed',
        alerts: 1,
        auditLog: [],
    },
    {
        id: 'proj-3',
        title: "Εγκατάσταση Φ/Β",
        applicationNumber: 'ΕΞ-2023-157',
        ownerContactId: 'contact-3',
        deadline: new Date(Date.now() - 30 * 86400000).toISOString(),
        interventions: [],
        budget: 6500,
        progress: 100,
        status: 'Completed',
        alerts: 0,
        auditLog: [],
    },
    {
        id: 'proj-4',
        title: "Προσφορά για Νέα Κατοικία",
        applicationNumber: 'ΕΞ-2024-005',
        ownerContactId: 'contact-1',
        interventions: [],
        budget: 25000,
        progress: 0,
        status: 'Quotation',
        alerts: 0,
        auditLog: [],
    },
];

const mockChartData = [
    { name: 'Εντός', total: 14200 },
    { name: 'Καθυστέρηση', total: 9500 },
];

const mockDeadlines = [
    { projectId: 'proj-1', projectTitle: 'Ανακαίνιση στο Μαρούσι', stageTitle: 'Παραγγελία Κουφωμάτων', deadline: new Date(Date.now() + 5 * 86400000).toISOString(), assigneeContactId: 'contact-5' },
    { projectId: 'proj-2', projectTitle: 'Αναβάθμιση στην Πάτρα', stageTitle: 'Εγκατάσταση Αντλίας', deadline: new Date(Date.now() + 12 * 86400000).toISOString(), assigneeContactId: 'contact-4' },
];

// --- Helper Component for Empty State ---
const EmptyState = ({ title, buttonText }: { title: string, buttonText: string }) => (
    <div className="flex flex-col col-span-full items-center justify-center rounded-lg border border-dashed shadow-sm p-8 mt-4 min-h-[200px] text-center">
        <LayoutGrid className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <h3 className="text-h3">{title}</h3>
        <p className="text-muted mt-2">Μπορείτε να ξεκινήσετε δημιουργώντας ένα νέο.</p>
        <Button asChild className="mt-4">
            <Link href="/projects/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                {buttonText}
            </Link>
        </Button>
    </div>
);


export default function DashboardPreviewPage() {
    const onTrackProjects = mockProjects.filter(p => p.status === 'On Track').length;
    const delayedProjects = mockProjects.filter(p => p.status === 'Delayed').length;
    const activeProjects = mockProjects.filter(p => p.status === 'On Track' || p.status === 'Delayed');
    const quotationProjects = mockProjects.filter(p => p.status === 'Quotation');
    const totalBudget = activeProjects.reduce((sum, p) => sum + p.budget, 0);

    const hasUpcomingDeadlines = activeProjects.some(p => {
        const deadline = p.deadline ? new Date(p.deadline) : null;
        return deadline && (deadline.getTime() - Date.now()) < 7 * 86400000;
    });

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-h1 flex items-center gap-2">
                        <LayoutGrid className="h-6 w-6" />
                        Πίνακας Ελέγχου (Προεπισκόπηση)
                    </h1>
                    <p className="text-muted">Μια γενική επισκόπηση της κατάστασης των έργων και των προσφορών σας.</p>
                </div>
                <Button asChild>
                    <Link href="/projects/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Δημιουργία Έργου/Προσφοράς
                    </Link>
                </Button>
            </div>
            
            {hasUpcomingDeadlines && (
                <Alert variant="destructive" className="bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-200">
                    <Activity className="h-4 w-4 !text-yellow-600 dark:!text-yellow-400" />
                    <AlertTitle className="font-bold">Προσοχή!</AlertTitle>
                    <AlertDescription className="flex justify-between items-center">
                        Υπάρχουν ενεργά έργα που η προθεσμία τους λήγει εντός των επόμενων 7 ημερών.
                        <Button variant="link" asChild className="text-yellow-900 dark:text-yellow-200">
                            <Link href="/projects">Δείτε τα Έργα <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Συνολικός Προϋπολογισμός (Ενεργά)
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">€{totalBudget.toLocaleString('el-GR')}</div>
                        <p className="text-xs text-muted-foreground">
                            Σε {activeProjects.length} ενεργά έργα
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Έργα εντός Χρονοδιαγράμματος
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{onTrackProjects}</div>
                        <p className="text-xs text-muted-foreground">
                            από σύνολο {activeProjects.length} ενεργών
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Έργα σε Καθυστέρηση</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{delayedProjects}</div>
                        <p className="text-xs text-muted-foreground">
                            Απαιτούν προσοχή
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Προσφορές σε εκκρεμότητα</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{quotationProjects.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Αναμένουν έγκριση
                        </p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-7">
                <OverviewChart data={mockChartData} />
                <UpcomingDeadlines deadlines={mockDeadlines} contacts={mockContacts} />
            </div>
            <div className="space-y-8">
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-h2">Πρόσφατα Ενεργά Έργα</h2>
                         {activeProjects.length > 0 && (
                            <Button variant="outline" asChild>
                                <Link href="/projects">
                                    Προβολή Όλων <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        )}
                    </div>
                    {activeProjects.length > 0 ? (
                        <div className="grid gap-4 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {activeProjects.map((project) => (
                                <ProjectCard key={project.id} project={project} contacts={mockContacts} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState title="Δεν βρέθηκαν ενεργά έργα" buttonText="Δημιουργία Έργου" />
                    )}
                </div>
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-h2">Πρόσφατες Προσφορές</h2>
                         {quotationProjects.length > 0 && (
                            <Button variant="outline" asChild>
                                <Link href="/projects">
                                    Προβολή Όλων <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        )}
                    </div>
                     {quotationProjects.length > 0 ? (
                        <div className="grid gap-4 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {quotationProjects.map((project) => (
                                <ProjectCard key={project.id} project={project} contacts={mockContacts} />
                            ))}
                        </div>
                    ) : (
                         <EmptyState title="Δεν βρέθηκαν προσφορές" buttonText="Δημιουργία Προσφοράς" />
                    )}
                </div>
            </div>
        </main>
    );
}

