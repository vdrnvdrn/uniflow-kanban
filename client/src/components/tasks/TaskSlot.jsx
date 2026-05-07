import { useState } from "react";
import { useTranslation } from "react-i18next";
import TaskCard from "./TaskCard";
import { InputModal } from "./InputModal.jsx";
import { IconPlus } from "../ui/Icons";

const TaskSlot = ({
  data,
  title,
  handleDrop,
  role,
  addTask,
  fetchTasks,
  users,
  canManage,
  currentUserId,
}) => {
  const { t } = useTranslation();
  const [dragOver, setDragOver] = useState(false);
  const [inputModalOpen, setInputModalOpen] = useState(false);

  return (
    <div
      className="mx-0 md:mx-2 min-w-0"
      onDrop={(event) => {
        setDragOver(false);
        handleDrop(event, role);
      }}
      onDragOver={(event) => {
        setDragOver(true);
        event.preventDefault();
      }}
      onDragLeave={(event) => {
        setDragOver(false);
        event.preventDefault();
      }}
    >
      <div className="glass-card-subtle px-4 py-3 mb-3 border-t border-white/30">
        <h2 className="text-sm font-semibold text-white text-center tracking-wide flex items-center justify-center gap-2">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
            role === "done" ? "bg-amber-400" : role === "doing" ? "bg-orange-400" : "bg-white/40"
          }`} />
          {title}
        </h2>
      </div>
      <div
        className={`${
          dragOver ? "bg-white/10" : "bg-white/5"
        } duration-100 rounded-lg min-h-[250px] flex flex-col border border-white/10`}
      >
        <div className="overflow-y-auto overscroll-contain max-h-[500px] flex-grow p-2 thin-scrollbar">
          {data.map((task, i) => (
            <TaskCard
              key={i}
              task={task}
              fetchTasks={fetchTasks}
              canDrag={canManage || task.userId === currentUserId}
              canDelete={canManage}
            />
          ))}
        </div>

        {canManage && (
          <div className="p-3">
            <InputModal addTask={addTask} role={role} users={users} open={inputModalOpen} onClose={() => setInputModalOpen(false)} />
            <button
              onClick={() => setInputModalOpen(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-sm text-white/50 hover:text-white/80 transition-colors duration-200"
            >
              <IconPlus className="w-4 h-4" />
              {t("addCard")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskSlot;
