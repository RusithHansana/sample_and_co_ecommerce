import { Outlet } from "react-router";

export default function StorefrontLayout(){
    return (
        <div>
            <header>Header Placeholder</header>
            <main>    
                <Outlet />
            </main>
            <footer>Footer Placeholder</footer>
        </div>
    )
}