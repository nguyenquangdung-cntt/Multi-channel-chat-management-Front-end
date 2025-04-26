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
                className="mb-4 bg-gray-600 px-3 py-1 rounded hover:bg-gray-500 transition"
            >
                <FontAwesomeIcon icon={faBars} />
            </button>
            {isOpen && (
                <ul className="space-y-2">
                    <li className={`hover:text-blue-400 cursor-pointer p-2 rounded ${pathname === "/" ? "text-blue-500 font-bold bg-white" : ""}`}>
                        <Link href="/">
                            <FontAwesomeIcon icon={faHouse} className="w-4 h-4 mr-[5px]" />
                            Dashboard
                        </Link>
                    </li>
                    <li className={`hover:text-blue-400 cursor-pointer p-2 rounded ${pathname === "/messenger" ? "text-blue-500 font-bold bg-white" : ""}`}>
                        <Link href="/messenger">
                            <FontAwesomeIcon icon={faCommentDots} className="w-4 h-4 mr-[5px]" />
                            Messenger
                        </Link>
                    </li>
                </ul>
            )}
        </div>
    );
}
  