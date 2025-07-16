/**
 * @fileoverview Manages email signatures.
 */

const SIGNATURES = new Map<string, string[]>([
    [
        'georgios.pagonis@gmail.com',
        [
            `Παγώνης Νέστ. Γεώργιος`,
            `Αρχιτέκτων Μηχανικός`,
            ``,
            `Σαμοθράκης 16, 563 34`,
            `Ελευθέριο Κορδελιό, Θεσσαλονίκη`,
            `Τ: 2310 55 95 95`,
            `Μ: 6974 050 023`,
            `georgios.pagonis@gmail.com`
        ]
    ],
    [
        'grigoris.pagonis@gmail.com',
        [
            `Παγώνης Γρηγόριος`,
            `Ειδικός Συνεργάτης`,
            `grigoris.pagonis@gmail.com`
        ]
    ]
]);

const DEFAULT_SIGNATURE = ["Η ομάδα του NESTOR eco"];

export function getSignature(senderEmail: string): string[] {
    return SIGNATURES.get(senderEmail) || DEFAULT_SIGNATURE;
}