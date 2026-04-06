export function formatDate(date: string | Date | null | undefined): string {
    if (!date) return 'Unknown date';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Unknown date';
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(d);
}
