import { Link } from "react-router";

export default function ForbiddenPage() {
    return (
        <div>
            <h1>403</h1>
            <p>You don't have access to this page.</p>
            <Link to="/">Go Home</Link>
        </div>
    )
}
