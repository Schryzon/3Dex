export function truncate(str: string, length: number): string {
    return str.length > length ? str.substring(0, length) + '...' : str
}

export function slugify(str: string): string {
    return str
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-')
}
