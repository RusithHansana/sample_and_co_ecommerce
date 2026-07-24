import { createContext, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { type AuthUser, type AuthContextValue } from "@/types/auth";
import { useNavigate } from "react-router";
import api, { refreshApi, setAuthCallbacks } from "@/api/client";

export const AuthContext = createContext<AuthContextValue | null>(null);

// Helper function to decode JWT
function decodeJwtPayload(token: string): { userId: string, role: string } {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join(""),
    );
    return JSON.parse(jsonPayload);
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const navigate = useNavigate();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const accessTokenRef = useRef<string | null>(null);

    useEffect(() => {
        accessTokenRef.current = accessToken;
    }, [accessToken]);

    const setAuthState = useCallback((authenticatedUser: AuthUser, token: string) => {
        setUser(authenticatedUser);
        setAccessToken(token);
        accessTokenRef.current = token;
    }, []);

    const clearAuthState = useCallback(() => {
        setUser(null);
        setAccessToken(null);
        accessTokenRef.current = null;
    }, []);


    useEffect(() => {
        setAuthCallbacks({
            getToken: () => accessTokenRef.current,
            onRefresh: (newToken: string) => {
                setAccessToken(newToken);
                accessTokenRef.current = newToken

                try {
                    const payload = decodeJwtPayload(newToken);
                    setUser((prev) => prev ? { ...prev, role: payload.role } : prev);
                } catch (error) {
                    // if decoding fails keep the existing user state
                }
            },
            onFailure: () => {
                clearAuthState();
                navigate('/login', { replace: true });
            }
        });
    }, [clearAuthState, navigate]);

    useEffect(() => {
        let isCancelled = false;

        async function bootstrap() {
            try {
                const response = await refreshApi.post('/auth/refresh');

                if (isCancelled) return;

                const token = response.data?.data?.accessToken;

                if (token) {
                    const payload = decodeJwtPayload(token);

                    setAuthState(
                        {
                            id: payload.userId,
                            name: '',
                            email: '',
                            role: payload.role
                        },
                        token
                    );
                }
            } catch (error) {
                if (!isCancelled) {
                    clearAuthState();
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        }

        bootstrap();

        return () => {
            isCancelled = true;
        }

    }, [setAuthState, clearAuthState]);

    const login = useCallback(
        async (email: string, password: string) => {
            const response = await api.post('/auth/login', { email, password });

            const { user: authenticatedUser, accessToken: token } = response.data.data;

            setAuthState(authenticatedUser, token);
        }, [setAuthState]);

    const register = useCallback(
        async (email: string, password: string, name: string) => {
            const response = await api.post('/auth/register', {
                email,
                password,
                name
            });

            const { user: authenticatedUser, accessToken: token } = response.data.data;

            setAuthState(authenticatedUser, token);
        }, [setAuthState]);

    const logout = useCallback(
        async () => {
            try {
                await api.post('/auth/logout');
            } catch (error) {

            } finally {
                clearAuthState();
                navigate('/', { replace: true })
            }
        }, [clearAuthState, navigate]);

    const value: AuthContextValue = {
        user,
        accessToken,
        isAuthenticated: !user,
        isLoading,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}