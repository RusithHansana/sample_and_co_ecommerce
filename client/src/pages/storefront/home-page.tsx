import { useAuth } from "@/hooks/use-auth"

export default function HomePage() {
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    }
    return (
        <div>
            <h1>HomePage</h1>
            <p>Placeholder - to be implemented</p>
            <button onClick={handleLogout} className="cursor-pointer">Logout</button>
        </div>
    )
}
