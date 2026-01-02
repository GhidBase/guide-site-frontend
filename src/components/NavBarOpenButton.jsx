import menuIcon from "../assets/menu.svg"
export default function NavBarOpenButton({ className, buttonClassName }) {
    return <div className={className}><img className={buttonClassName} src={menuIcon} alt="" /></div>;
}
