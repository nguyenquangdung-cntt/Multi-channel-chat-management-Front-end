import Logo from "../../public/images/logo.png";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

export default function Content() {
    return (
        <div className="container mx-auto py-4 px-6 space-y-4">

            <div className="h-auto relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-xl px-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full px-6 py-2 pr-28 text-gray-800 bg-white rounded-full outline-none shadow-lg"
                        />
                        <button
                            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-orange-500 text-white px-3 py-2 rounded-full font-bold hover:bg-orange-600 transition text-sm"
                        >
                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                        </button>
                    </div>
                </div>

                {/* Logo và nội dung bên dưới */}
                <Image
                    src={Logo}
                    alt="Logo"
                    className="w-[250px] h-[250px] mx-auto mt-20"
                />
                <h1 className="text-white text-5xl font-bold text-center">
                    WELCOME TO MY WEBSITE
                </h1>
                <div className="grid grid-cols-2 gap-4 mt-4 px-[350px]">
                    <button className="bg-white text-dark py-4 rounded-[50px] font-bold">
                    View all
                    </button>
                    <button className="bg-orange-500 text-white py-4 rounded-[50px] font-bold">
                    About me
                    </button>
                </div>
            </div>
        </div>
    );
}