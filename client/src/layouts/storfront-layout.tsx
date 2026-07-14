import { Outlet } from "react-router";

export default function StorefrontLayout(){
    return (
        <>
            <header>Header Placeholder</header>
            <main>    
                <Outlet />
            </main>
            <footer>Footer Placeholder</footer>
        </>
    )
}