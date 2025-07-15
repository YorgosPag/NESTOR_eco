
import { getBatchWorkOrderData } from "@/app/actions/projects";
import { notFound } from "next/navigation";
import { WorkOrderDetailedClientPage } from "./client-page";

// By removing the explicit PageProps interface, we allow Next.js's
// built-in TypeScript support to correctly infer the types for params and searchParams.
// This is the recommended approach and resolves the build error.
export default async function WorkOrderDetailedPage({ params, searchParams }: {
    params: { id: string };
    searchParams: { [key: string]: string | string[] | undefined };
}) {
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
        return (
            <div className="flex h-screen w-full items-center justify-center p-4">
                <p className="text-destructive text-center">Απέτυχε η φόρτωση της αναφοράς.</p>
            </div>
        );
    }
}
