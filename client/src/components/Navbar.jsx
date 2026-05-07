import { useNavigate, useLocation } from "react-router-dom";
import { GlobalContext } from "./Home";
import { useContext, useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { IconKanban } from "./ui/Icons";
import api, { API_URL } from "../api";

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const [hover, setHover] = useState(false);
    const [myTasksCount, setMyTasksCount] = useState(0);
    const [attention, setAttention] = useState(0);
    const location = useLocation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const navigateTo = useNavigate();
    const user = useContext(GlobalContext);

    useEffect(() => {
        let cancelled = false;
        api.get('/api/user/me/active-tasks-count')
            .then(({ data }) => { if (!cancelled) setMyTasksCount(data.count || 0); })
            .catch(() => {});
        if (user?.role === 'admin') {
            api.get('/api/admin/stats')
                .then(({ data }) => { if (!cancelled) setAttention(data.attentionCount || 0); })
                .catch(() => {});
        }
        return () => { cancelled = true; };
    }, [location.pathname, user?.role]);

    const logout = () => {
        localStorage.removeItem('token');
        window.location.reload(false);
    };

    return (
        <div className='glass-navbar fixed top-0 left-0 right-0 z-40 flex justify-between items-center h-14 md:h-16 mx-0 px-3 md:px-8'>
            <div className="flex items-center">
                <ul className='flex gap-6'>
                    <li
                        onClick={() => navigateTo("/")}
                        className='px-2 py-1 text-white/60 hover:text-white cursor-pointer transition-colors duration-200'
                        title={t('projects')}
                    >
                        <IconKanban className="w-6 h-6" />
                    </li>
                    {user?.role !== 'admin' && (
                        <li
                            className='relative flex items-center gap-2 px-3 py-1 text-white/70 text-sm rounded-full bg-white/5 border border-white/10'
                            title={t('myActiveTasks')}
                        >
                            <span className="hidden sm:inline">{t('myTasks')}</span>
                            <span className={`min-w-[1.5rem] text-center text-xs font-bold px-1.5 py-0.5 rounded-full ${myTasksCount > 0 ? 'bg-amber-400/30 text-amber-200 border border-amber-300/40' : 'bg-white/10 text-white/60 border border-white/20'}`}>
                                {myTasksCount}
                            </span>
                        </li>
                    )}
                    {user?.role === 'admin' && attention > 0 && (
                        <li
                            onClick={() => navigateTo('/admin')}
                            className='relative flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-red-500/15 border border-red-400/40 cursor-pointer hover:bg-red-500/25 transition-colors animate-pulse'
                            title={t('attentionRequired')}
                        >
                            <span className="hidden sm:inline text-red-200">{t('attention')}</span>
                            <span className="sm:hidden text-red-200">!</span>
                            <span className="min-w-[1.5rem] text-center text-xs font-bold px-1.5 py-0.5 rounded-full bg-red-500/40 text-white border border-red-300/50">
                                {attention}
                            </span>
                        </li>
                    )}
                </ul>
            </div>

            <div
                className="absolute left-1/2 transform -translate-x-1/2 cursor-pointer"
                onClick={() => navigateTo("/")}
            >
                <h1 className='text-lg md:text-xl font-extrabold tracking-wide'>
                    <span className="text-amber-400">Uni</span><span className="text-white/80">Flow</span>
                </h1>
            </div>

            <div className="flex items-center space-x-4">
                {/* Language switcher */}
                <div className="flex items-center bg-white/10 rounded-full p-0.5 border border-white/10">
                    <button
                        onClick={() => changeLanguage('en')}
                        className={`px-3 py-1 text-sm font-medium rounded-full transition-all duration-200 ${
                            i18n.language === 'en'
                                ? 'bg-white/20 text-white shadow-sm'
                                : 'text-white/50 hover:text-white/80'
                        }`}
                        aria-label="Switch to English"
                    >
                        EN
                    </button>
                    <button
                        onClick={() => changeLanguage('ru')}
                        className={`px-3 py-1 text-sm font-medium rounded-full transition-all duration-200 ${
                            i18n.language === 'ru'
                                ? 'bg-white/20 text-white shadow-sm'
                                : 'text-white/50 hover:text-white/80'
                        }`}
                        aria-label="Switch to Russian"
                    >
                        RU
                    </button>
                </div>

                <div
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                    className="relative"
                >
                    <div className="relative w-10 h-10 cursor-pointer">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/40 hover:border-white/60 transition-colors">
                            <img src={`${API_URL}/${user.photo}`} alt="Profile" className="w-full h-full object-cover"/>
                        </div>
                        {user.status && (
                            <span
                                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-[#1a1530] ${
                                    user.status === 'available' ? 'bg-emerald-400' :
                                    user.status === 'busy' ? 'bg-amber-400' : 'bg-white/40'
                                }`}
                                title={user.status}
                            />
                        )}
                    </div>

                    {hover && (
                        <div className="absolute right-0 top-full pt-1 z-50">
                            <div className="w-48 md:w-56 glass-card-strong rounded-xl py-2 animate-fade-in">
                            <div className='px-4 py-2 text-white font-medium'>
                                {user.fullName}
                            </div>
                            <div className="mx-3 glass-divider"></div>
                            <div
                                onClick={() => {
                                    navigateTo("/profile");
                                    setHover(false);
                                }}
                                className='px-4 py-2 hover:bg-white/10 text-white/70 hover:text-white cursor-pointer transition-colors rounded-lg mx-1'
                            >
                                {t('editProfile')}
                            </div>
                            <div
                                onClick={logout}
                                className='px-4 py-2 hover:bg-white/10 text-white/70 hover:text-white cursor-pointer transition-colors rounded-lg mx-1'
                            >
                                {t('logout')}
                            </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navbar;
