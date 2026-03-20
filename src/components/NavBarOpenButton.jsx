import menuIcon from "../assets/menu.svg";
import { useDarkMode } from "../contexts/ThemeProvider.jsx";
export default function NavBarOpenButton({
    className,
    buttonClassName,
    toggleNav,
}) {
    const { darkMode } = useDarkMode();
    return (
        <div className={className} style={darkMode ? { background: "#1a1208", borderColor: "rgba(255,235,200,0.12)" } : undefined}>
            <img className={buttonClassName} src={menuIcon} alt="" onClick={toggleNav} style={darkMode ? { filter: "brightness(0) invert(1)" } : undefined} />
        </div>
    );
}
