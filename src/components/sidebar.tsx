import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faHouse, faCommentDots } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
    isOpen: boolean;
    toggle: () => void;
}
  
export default function Sidebar({ isOpen, toggle }: SidebarProps) {
    const pathname = usePathname();
    return (
        <div
            id="sidebar"
            className={`transition-all duration-300 bg-gray-800 text-white p-4 h-[1212px] ${
                isOpen ? "w-64" : "w-20 overflow-hidden"
            }`}
        >
            <button
                onClick={toggle}
                className="mb-4 bg-gray-600 p-3 rounded hover:bg-gray-500 transition flex justify-center"
                >
                <FontAwesomeIcon icon={faBars} />
            </button>

            <ul className="space-y-2">
                <li className={`hover:text-blue-400 cursor-pointer p-2 rounded flex items-center gap-2 ${pathname === "/" ? "text-blue-500 font-bold bg-white" : ""}`}>
                    <Link href="/" className="flex items-center">
                        <FontAwesomeIcon icon={faHouse} className="w-5 h-5" />
                        {isOpen && <span className="ml-2">Dashboard</span>}
                    </Link>
                </li>
                <li className={`hover:text-blue-400 cursor-pointer p-2 rounded flex items-center gap-2 ${pathname === "/messenger" ? "text-blue-500 font-bold bg-white" : ""}`}>
                    <Link href="/messenger" className="flex items-center">
                        <FontAwesomeIcon icon={faCommentDots} className="w-5 h-5" />
                        {isOpen && <span className="ml-2">Messenger</span>}
                    </Link>
                </li>
            </ul>
        </div>
    );
}
