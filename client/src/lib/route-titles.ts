const ROUTE_TITLES: Record<string, string> = {
    // Storefront
    '/': 'Home — Sample & Co.',
    '/products': 'Products — Sample & Co.',
    '/login': 'Sign In — Sample & Co.',
    '/register': 'Register — Sample & Co.',
    '/cart': 'Shopping Cart — Sample & Co.',
    '/checkout': 'Checkout — Sample & Co.',
    '/orders': 'Order History — Sample & Co.',
    '/forbidden': 'Forbidden — Sample & Co.',

    // Admin
    '/admin': 'Dashboard — Sample & Co.',
    '/admin/products': 'Products — Sample & Co.',
    '/admin/products/new': 'New Product — Sample & Co.',
    '/admin/orders': 'Orders — Sample & Co.',
};

const DYNAMIC_ROUTES: { pattern: RegExp; title: (id: string) => string }[] = [
    { pattern: /^\/products\/([^/]+)$/, title: (id) => `Product ${id} — Sample & Co.` },
    { pattern: /^\/order-confirmation\/([^/]+)$/, title: (id) => `Order Confirmation — Sample & Co.` },
    { pattern: /^\/orders\/([^/]+)$/, title: (id) => `Order ${id} — Sample & Co.` },
    { pattern: /^\/admin\/products\/([^/]+)$/, title: (id) => `Edit Product ${id} — Sample & Co.` },
    { pattern: /^\/admin\/orders\/([^/]+)$/, title: (id) => `Order ${id} — Sample & Co.` },
];

export function getRouteTitle(pathname: string): string {
    if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];

    for (const { pattern, title } of DYNAMIC_ROUTES) {
        const match = pathname.match(pattern);
        if (match) return title(match[1]);
    }

    return 'Sample & Co.';
}