/**
 * @fileoverview Generic helper functions for email generation.
 */

export function createSection(title: string, lines: (string | null | undefined)[]): string[] {
    const filteredLines = lines.filter(Boolean);
    if (filteredLines.length === 0) return [];
    return [
        ``,
        title.toUpperCase(),
        '--------------------------------',
        ...filteredLines
    ];
}