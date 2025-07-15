import { getBatchWorkOrderData } from "@/app/actions/projects";
import { notFound } from "next/navigation";
import { WorkOrderDetailedClientPage } from "./client-page";

interface PageProps {
    params: { id: string };
    searchParams: { [key: string]: string | string[] | undefined };
}

export default async function WorkOrderDetailedPage({ params, searchParams }: PageProps) {
    const { id } = params;
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
        // Render a server-side error message or use Next.js's error.tsx
        // For simplicity, we can redirect or show a simple error message.
        // This part can be improved based on desired UX for server failures.
        return (
             <div className="flex h-screen w-full items-center justify-center p-4">
                <p className="text-destructive text-center">Απέτυχε η φόρτωση της αναφοράς.</p>
            </div>
        )
    }
}
