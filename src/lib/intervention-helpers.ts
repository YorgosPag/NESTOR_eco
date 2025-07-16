
import type { SubIntervention } from "@/types";

/**
 * Calculates the profitability of a single sub-intervention.
 * @param sub - The sub-intervention object.
 * @returns An object with internalCost, profit, and margin percentage.
 */
export function getProfitability(sub: SubIntervention) {
    const internalCost = (Number(sub.costOfMaterials) || 0) + (Number(sub.costOfLabor) || 0);
    const programCost = (Number(sub.cost) || 0);
    const profit = programCost - internalCost;
    const margin = programCost > 0 ? (profit / programCost) * 100 : 0;
    return { internalCost, profit, margin };
}

/**
 * Extracts the Roman numeral from an expense category string.
 * e.g., "Κουφώματα (I)" -> " (I)"
 * @param expenseCategory - The string to parse.
 * @returns The Roman numeral part or an empty string.
 */
function getRomanNumeral(expenseCategory: string): string {
    const romanNumeralMatch = expenseCategory.match(/\((I|II|III|IV|V|VI|VII|VIII|IX|X)\)/);
    return romanNumeralMatch ? ` (${romanNumeralMatch[1]})` : '';
}

/**
 * Formats the display code for a sub-intervention, including its Roman numeral.
 * @param subcategoryCode - The base code for the sub-intervention.
 * @param expenseCategory - The expense category string containing the potential Roman numeral.
 * @returns The formatted display code.
 */
export function formatDisplayCode(subcategoryCode: string, expenseCategory: string): string {
    const romanNumeral = getRomanNumeral(expenseCategory);
    return `${subcategoryCode || ''}${romanNumeral}`;
}
