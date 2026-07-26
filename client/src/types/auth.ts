export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface AuthContextValue {
    user: AuthUser | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>
}