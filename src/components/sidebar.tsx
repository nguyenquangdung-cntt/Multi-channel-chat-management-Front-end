import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

interface SidebarProps {
    isOpen: boolean;
    toggle: () => void;
  }
  
export default function Sidebar({ isOpen, toggle }: SidebarProps) {
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
            <li className="hover:text-emerald-400 cursor-pointer">Dashboard</li>
            <li className="hover:text-emerald-400 cursor-pointer">Users</li>
            <li className="hover:text-emerald-400 cursor-pointer">Settings</li>
            </ul>
        )}
        </div>
    );
}
  