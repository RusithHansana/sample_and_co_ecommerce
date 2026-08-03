const ROUTE_TITLES: Record<string, string> = {
    '/': 'Home — Sample & Co.',
    '/products': 'Products — Sample & Co.',
    '/cart': 'Shopping Cart — Sample & Co.',
    '/checkout': 'Checkout — Sample & Co.',
    '/login': 'Sign In — Sample & Co.',
    '/admin': 'Admin Dashboard — Sample & Co.',
};

export function getRouteTitle(pathname: string): string {
    if (pathname.startsWith('/products/')) return 'Product Detail — Sample & Co.';
    return ROUTE_TITLES[pathname] ?? 'Sample & Co.';
}