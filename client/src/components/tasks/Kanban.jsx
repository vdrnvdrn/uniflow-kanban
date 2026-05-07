import { useEffect, useState, useContext } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../../api";
import TaskSlot from "./TaskSlot";
import TaskFilterBar from "./TaskFilterBar";
import { IconSearch } from "../ui/Icons";
import { GlobalContext } from "../Home.jsx";

const Kanban = () => {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [todo, setTodo] = useState([]);
  const [doing, setDoing] = useState([]);
  const [done, setDone] = useState([]);
  const [projectData, setProjectData] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [activeTab, setActiveTab] = useState("Todo");
  const [sortBy, setSortBy] = useState("created");
  const [filters, setFilters] = useState({
    state: [],
    userId: null,
    search: '',
    deadline_from: '',
    deadline_to: ''
  });

  const { state } = useLocation();
  const { project } = state;
  const user = useContext(GlobalContext);
  const role = user?.role;

  useEffect(() => {
    fetchUsers();
    fetchProject();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  useEffect(() => {
    const sortFn = (a, b) => {
      if (sortBy === "deadline") {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    };
    const sorted = [...tasks].sort(sortFn);
    setTodo(sorted.filter((task) => task.state === "Todo"));
    setDoing(sorted.filter((task) => task.state === "Doing"));
    setDone(sorted.filter((task) => task.state === "Done"));
  }, [tasks, sortBy]);

  const fetchProject = async () => {
    try {
      const { data } = await api.get(
        `/api/project/${project.id}`
      );
      setProjectData(data);
    } catch {
      // silently ignore
    }
  };

  const isAdminOrManager =
    role === "admin" ||
    (role === "manager" &&
      projectData &&
      projectData.managerId === user?.id);

  const kanbanSlots = [
    { id: 1, title: t("toDo"), role: "Todo", data: todo },
    { id: 2, title: t("doing"), role: "Doing", data: doing },
    { id: 3, title: t("done"), role: "Done", data: done },
  ];

  const fetchTasks = async () => {
    try {
      // Build query string from filters
      const params = new URLSearchParams();

      if (filters.state && filters.state.length > 0) {
        params.append('state', filters.state.join(','));
      }
      if (filters.userId) {
        params.append('userId', filters.userId);
      }
      if (filters.search && filters.search.trim()) {
        params.append('search', filters.search.trim());
      }
      if (filters.deadline_from) {
        params.append('deadline_from', filters.deadline_from);
      }
      if (filters.deadline_to) {
        params.append('deadline_to', filters.deadline_to);
      }

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const { data } = await api.get(
        `/api/project/${project.id}/tasks${queryString}`
      );
      setTasks(data);
    } catch {
      // silently ignore
    }
  };

  const fetchUsers = async () => {
    const { data } = await api.get(
      `/api/project/${project.id}/users`
    );
    setUsers(data);
  };

  const handleDrop = async (event, state) => {
    event.preventDefault();
    const id = event.dataTransfer.getData("id");
    await api.put(
      "/api/task/" + id,
      { state }
    );
    fetchTasks();
  };

  const addTask = async (title, description, state, assigned, deadline) => {
    try {
      let userId = parseInt(assigned);
      userId = Number.isNaN(userId) ? null : userId;
      await api.post(
        "/api/task",
        {
          name: title,
          description,
          state,
          projectId: project.id,
          userId,
          deadline,
        }
      );
      fetchTasks();
    } catch {
      // silently ignore
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div>
      {/* Search Button and Filter Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="p-2 text-white/60 hover:bg-white/10 rounded-lg transition-colors duration-200 hover:text-white"
            title={t('searchTasks') || 'Search tasks'}
            aria-label="Toggle search filter"
          >
            <IconSearch className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center bg-white/5 rounded-full p-0.5 border border-white/10">
          <button
            onClick={() => setSortBy("created")}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
              sortBy === "created" ? "bg-white/15 text-white" : "text-white/50 hover:text-white/80"
            }`}
          >
            {t('sortByCreated')}
          </button>
          <button
            onClick={() => setSortBy("deadline")}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
              sortBy === "deadline" ? "bg-white/15 text-white" : "text-white/50 hover:text-white/80"
            }`}
          >
            {t('sortByDeadline')}
          </button>
        </div>
      </div>

      {/* Filter Bar - Toggle visibility */}
      {showFilter && (
        <TaskFilterBar
          users={users}
          onFilter={handleFilterChange}
          currentUserId={user?.id}
          initialFilters={filters}
        />
      )}

      {/* Mobile: tab switcher */}
      <div className="flex md:hidden mb-3 gap-1 bg-white/5 rounded-xl p-1">
        {kanbanSlots.map((slot) => (
          <button
            key={slot.id}
            onClick={() => setActiveTab(slot.role)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === slot.role
                ? "bg-white/15 text-white shadow-sm"
                : "text-white/50 hover:text-white/70"
            }`}
          >
            {slot.title}
            <span className="ml-1.5 text-xs opacity-60">({slot.data.length})</span>
          </button>
        ))}
      </div>

      {/* Desktop: 3-column grid */}
      <div className="hidden md:grid md:grid-cols-3">
        {kanbanSlots.map((slot) => (
          <TaskSlot
            key={slot.id}
            users={users}
            addTask={addTask}
            fetchTasks={fetchTasks}
            handleDrop={handleDrop}
            canManage={isAdminOrManager}
            currentUserId={user?.id}
            {...slot}
          />
        ))}
      </div>

      {/* Mobile: single column */}
      <div className="md:hidden">
        {kanbanSlots
          .filter((slot) => slot.role === activeTab)
          .map((slot) => (
            <TaskSlot
              key={slot.id}
              users={users}
              addTask={addTask}
              fetchTasks={fetchTasks}
              handleDrop={handleDrop}
              canManage={isAdminOrManager}
              currentUserId={user?.id}
              {...slot}
            />
          ))}
      </div>
    </div>
  );
};

export default Kanban;
