import { useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../../api";
import TaskDetailModal from "./TaskDetailModal";
import { IconTrash, IconUser, IconCalendar, IconMessageCircle } from "../ui/Icons";

const TaskCard = ({ task, fetchTasks, canDrag, canDelete }) => {
  const { t } = useTranslation();
  const [showDetail, setShowDetail] = useState(false);

  const deleteTask = async (id) => {
    try {
      await api.delete("/api/task/" + id);
      fetchTasks();
    } catch {
      // silently ignore
    }
  };

  return (
    <>
      <div
        onDragStart={(event) => {
          if (!canDrag) {
            event.preventDefault();
            return;
          }
          event.dataTransfer.setData("id", task.id);
          event.target.style.opacity = 0.7;
        }}
        onDragEnd={(event) => {
          event.target.style.opacity = 1;
        }}
        draggable={canDrag}
        className={`glass-card-subtle hover:bg-white/10 duration-100 p-3 mb-2 text-sm text-white ${
          canDrag ? "cursor-pointer" : "cursor-default opacity-80"
        }`}
        onClick={() => setShowDetail(true)}
      >
        <div className="mb-2">
          <div className="font-medium text-white mb-1">{task.name}</div>
          <div className="text-white/50 text-xs leading-relaxed">
            {task.description}
          </div>
        </div>
        <div className="flex flex-col gap-1 text-xs text-white/50 pt-2 border-t border-white/10">
          <span className="flex items-center gap-1.5" title={t("assignedTo")}>
            <IconUser className="w-3.5 h-3.5" />
            {task?.user?.fullName ?? t("unassigned")}
          </span>
          <span className="flex items-center gap-1.5" title={t("deadline")}>
            <IconCalendar className="w-3.5 h-3.5" />
            {task.deadline ?? t("noDeadline")}
          </span>
          {task.commentCount > 0 && (
            <span className="flex items-center gap-1.5 text-white/60" title={t("comments")}>
              <IconMessageCircle className="w-3.5 h-3.5" />
              {task.commentCount}
            </span>
          )}
        </div>
        {canDelete && (
          <div className="pt-2 mt-2 border-t border-white/10 flex justify-end">
            <button
              className="p-2 text-white/50 hover:text-white/80 hover:bg-white/15 rounded-lg transition-colors duration-200"
              onClick={(e) => {
                e.stopPropagation();
                deleteTask(task.id);
              }}
            >
              <IconTrash className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {showDetail && (
        <TaskDetailModal task={task} onClose={() => setShowDetail(false)} />
      )}
    </>
  );
};

export default TaskCard;
