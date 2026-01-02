import "../tailwind.css";
import { Outlet } from "react-router";
import Navbar from "./navbar/Navbar.jsx";
import Title from "./Title.jsx";

export default function Main() {
    return (
        <div
            id="main-page-sections"
            className="h-full w-full flex flex-col grow box-border custom-background"
        >
            <Title></Title>
            <div
                id="side-bar-and-content"
                className="w-full box-border border-t-4 border-(--outline) flex flex-1 xl:pr-30 2xl:pr-60 bg-(--surface-background)"
            >
                <Navbar
                    className={`h-full bg-(--primary) border-r-4 border-(--outline) hidden lg:flex lg:flex-col min-w-60 w-60`}
                ></Navbar>
                <div
                    id="page-outer-bounds"
                    className={`gap-4 sm:px-4 sm:pb-4 flex flex-col w-full max-w-230 mx-auto`}
                >
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
