const ROUTE_TITLES: Record<string, string> = {
    '/': 'Home — Sample & Co.',
    '/products': 'Products — Sample & Co.',
    '/cart': 'Shopping Cart — Sample & Co.',
    '/checkout': 'Checkout — Sample & Co.',
    '/login': 'Sign In — Sample & Co.',
    '/admin': 'Admin Dashboard — Sample & Co.',
};

export function getRouteTitle(pathname: string): string {
    const productMatch = pathname.match(/^\/products\/([^/]+)(\/.*)?$/);
    if (productMatch) {
        const [, id, subpath] = productMatch;
        if (subpath === '/reviews') return `Product ${id} Reviews — Sample & Co.`;
        return `Product ${id} — Sample & Co.`;
    }
    return ROUTE_TITLES[pathname] ?? 'Sample & Co.';
}