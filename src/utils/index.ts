export function createPageUrl(pageName: string) {
    if (pageName === "Auth") {
        return "/auth"; // route to our Supabase login page
    }
    return '/' + pageName.toLowerCase().replace(/ /g, '-');
}
