
import { getBatchWorkOrderData } from "@/app/actions/projects";
import { notFound } from "next/navigation";
import { WorkOrderDetailedClientPage } from "./client-page";

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: { [key: string]: string | string[] | undefined };
}

export default async function WorkOrderDetailedPage({ params, searchParams }: PageProps) {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const assigneeId = searchParams.assigneeId as string | undefined;

    try {
        const result = await getBatchWorkOrderData([id]);
        const project = result.projects[0];

        if (!project) {
            notFound();
        }

        return <WorkOrderDetailedClientPage serverProject={project} contacts={result.contacts} assigneeId={assigneeId} />;
    } catch (error) {
        console.error("Failed to load work order data:", error);
        return (
            <div className="flex h-screen w-full items-center justify-center p-4">
                <p className="text-destructive text-center">Απέτυχε η φόρτωση της αναφοράς.</p>
            </div>
        );
    }
}
