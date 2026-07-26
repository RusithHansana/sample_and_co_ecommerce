import { AuthContext } from "@/contexts/auth-context";
import type { AuthContextValue } from "@/types/auth";
import { useContext } from "react";

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used within an <AuthProvider>. " +
            "Wrap your component tree with <AuthProvider> in App.tsx.",
        );
    }

    return context;
}