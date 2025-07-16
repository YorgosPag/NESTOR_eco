
export type FormState = {
    message: string | null;
    errors?: {
        subcategoryCode?: string[];
        description?: string[];
        quantity?: string[];
        cost?: string[];
        costOfMaterials?: string[];
        costOfLabor?: string[];
        unitCost?: string[];
        implementedQuantity?: string[];
    } | null;
    success: boolean;
};
