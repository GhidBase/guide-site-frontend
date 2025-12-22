import "../tailwind.css";
import { Outlet } from "react-router";
import Navbar from "./navbar/Navbar.jsx";
import Title from "./Title.jsx";
import { PageProvider } from "../contexts/PageProvider.jsx";

export default function Main() {
    return (
        <PageProvider>
            <div
                id="main-page-sections"
                className="h-full w-full flex flex-col grow box-border custom-background"
            >
                <Title></Title>
                <div
                    id="side-bar-and-content"
                    className="w-full box-border border-t-4 border-(--outline) flex flex-1"
                >
                    <Navbar></Navbar>
                    <Outlet />
                </div>
            </div>
        </PageProvider>
    );
}
