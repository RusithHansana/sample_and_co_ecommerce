interface Breadcrumbs {
    title: string;
    url: string;
    isLast: boolean;
}

const formatTitle = (path: string): string => {
    return path
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export const getBreadCrumbs = (pathname: string): Breadcrumbs[] => {
    const paths = pathname.split("/").filter(Boolean);

    return paths
        .map((path, i) => {
            const url = `/${paths.slice(0, i + 1).join("/")}`;
            const isLast = i === paths.length - 1;
            const title = formatTitle(path);

            return {
                title,
                url,
                isLast
            }
        })
};