import { useLocation, useNavigate } from "react-router-dom";

const SideBar = () => {
    const { state } = useLocation();
    const { project } = state;
    const navigateTo = useNavigate();

    const navList = [
        {
            title: 'Edit Project',
            link: "/project/edit"
        },
        {
            title: 'Users',
            link: "/project/users"
        }
    ]

    return (
        <div className="p-2 bg-[#060317] shadow">
            <div className="w-[280px] h-screen pt-2">
                <div
                    onClick={() => {
                        navigateTo("/project", { state: { project } });
                    }}
                    className="border-[1px] rounded mx-3 cursor-pointer border-[#71710E] duration-300 hover:bg-[#171703]">
                    <h1
                        className="text-[#E3E31C] text-center font-[400] text-[25px] py-4 duration-100"
                    >
                        {project.name}
                    </h1>
                </div>
                <ul className="p-3">
                    {navList.map((item, i) =>
                    (<li
                        key={i}
                        className={
                        `text-[#e3e31c] text-[20px]
                        py-2 px-3 my-2 rounded cursor-pointer
                        border-1 border-[#71710E] duration-300
                        hover:translate-x-1 hover:bg-[#e3e31c] hover:text-[#0C062D]`
                        }
                        onClick={() => {
                            navigateTo(item.link, { state: { project } });
                        }}
                    >
                        {item.title}
                    </li>)
                    )}
                </ul>
            </div>
        </div>
    )
}

export default SideBar
