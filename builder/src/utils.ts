export function retrieveDomainFromUrl(url: string): string {
    const match = url.match(/^https?:\/\/(?:www\.)?([^.\/]+)/i)
    // @ts-ignore
    return match ? match[1] : "empty";
}

export function retrieveBaseDomainFromUrl(url: string): string {
    return url.replace(/(?:.*\.)?([a-z]+\.gov)$/i, "$1");
}