import { useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GlobalContext } from "./Home.jsx";

const SideBar = ({ mobileOpen, onClose }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { project } = location.state;
  const navigateTo = useNavigate();
  const user = useContext(GlobalContext);
  const role = user?.role;

  const isAdminOrManager =
    role === "admin" || (role === "manager" && project.managerId === user?.id);

  const navList = [];
  if (isAdminOrManager) {
    navList.push({ title: t("editProject"), link: "/project/edit" });
    navList.push({ title: t("users"), link: "/project/users" });
    navList.push({ title: t("statistics"), link: "/project/statistics" });
  }
  navList.push({ title: t("activity"), link: "/project/activity" });

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (mobileOpen && onClose) onClose();
  }, [location.pathname]);

  const sidebarContent = (
    <div className="w-[260px] min-h-screen pt-2">
      <div
        onClick={() => {
          navigateTo("/project", { state: { project } });
        }}
        className="glass-card-subtle border-white/30 hover:border-white/50 rounded-xl mx-3 cursor-pointer duration-300"
      >
        <h1 className="text-white text-center font-semibold text-lg py-4 duration-100">
          {project.name}
        </h1>
      </div>
      {navList.length > 0 && (
        <ul className="p-3 space-y-2">
          {navList.map((item, i) => (
            <li
              key={i}
              className={`text-white/70 text-sm
                py-2.5 px-4 rounded-xl cursor-pointer
                border border-white/10 duration-300
                hover:translate-x-1 hover:bg-white/10 hover:border-white/25 hover:text-white text-center`}
              onClick={() => {
                navigateTo(item.link, { state: { project } });
              }}
            >
              {item.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block glass-sidebar p-2 pt-20">
        {sidebarContent}
      </div>

      {/* Mobile overlay sidebar */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="absolute left-0 top-0 h-full glass-sidebar p-2 pt-20 animate-slide-right"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default SideBar;
