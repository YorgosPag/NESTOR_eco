
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProjectCard } from "@/components/dashboard/project-card";
import { getAllProjects } from "@/lib/data";
import { getContacts } from "@/lib/contacts-data";
import { Activity, CreditCard, DollarSign, Users, PlusCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export default async function DashboardPage() {
  const [projects, contacts] = await Promise.all([
    getAllProjects(),
    getContacts(),
  ]);

  const onTrackProjects = projects.filter(p => p.status === 'On Track').length;
  const delayedProjects = projects.filter(p => p.status === 'Delayed').length;
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);

  const budgetByStatus = projects.reduce((acc, project) => {
    const statusMap = {
      'On Track': 'Εντός',
      'Delayed': 'Καθυστέρηση',
      'Completed': 'Ολοκληρωμένα'
    };
    const statusName = statusMap[project.status];
    if (!acc[statusName]) {
      acc[statusName] = 0;
    }
    acc[statusName] += project.budget;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(budgetByStatus).map(statusName => ({
    name: statusName,
    total: budgetByStatus[statusName] || 0,
  }));

  const recentLogs = projects
    .flatMap(p => p.auditLog)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);
    
  const recentProjects = projects.slice(0,4);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Πίνακας Ελέγχou</h1>
                <p className="text-muted-foreground">Μια γενική επισκόπηση της κατάστασης των έργων σας.</p>
            </div>
             <Button asChild>
              <Link href="/projects/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Δημιουργία Έργου
              </Link>
            </Button>
        </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Συνολικός Προυπολογισμός
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalBudget.toLocaleString('el-GR')}</div>
            <p className="text-xs text-muted-foreground">
              Σε {projects.length} έργα
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
              από σύνολο {projects.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Έργα σε Καθυστέρηση</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Ενεργές Ειδοποιήσεις</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{projects.reduce((sum, p) => sum + p.alerts, 0)}</div>
            <p className="text-xs text-muted-foreground">
              Σε όλα τα έργα
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-7">
        <OverviewChart data={chartData} />
        <RecentActivity logs={recentLogs} />
      </div>
      
       <div>
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-tight">Πρόσφατα Έργα</h2>
            <Button variant="outline" asChild>
                <Link href="/projects">
                    Προβολή Όλων <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
         <div className="grid gap-4 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {recentProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} contacts={contacts} />
              ))}
          </div>
       </div>
    </main>
  );
}
