import { useAuth } from "@/hooks/use-auth"
import { Link } from "react-router";

export default function HomePage() {
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    }
    return (
        <div>
            <h1>HomePage</h1>
            <p>Placeholder - to be implemented</p>
            <div>
                <Link to='/cart'>To Cart</Link>
            </div>
            <div>
                <Link to='/login'>To Login</Link>
            </div>
            <div>
                <Link to='/register'>To Register</Link>
            </div>
            <button onClick={handleLogout} className="cursor-pointer">Logout</button>
        </div>
    )
}
