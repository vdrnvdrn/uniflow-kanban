import { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import api, { API_URL } from "../../api";
import { GlobalContext } from "../Home.jsx";
import { IconSend, IconX, IconTrash } from "../ui/Icons";

const TaskDetailModal = ({ task, onClose }) => {
  const { t } = useTranslation();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const user = useContext(GlobalContext);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const { data } = await api.get(
        `/api/task/${task.id}/comments`
      );
      setComments(data);
    } catch {
      // silently ignore
    }
  };

  const postComment = async () => {
    if (!newComment.trim()) return;
    try {
      await api.post(
        `/api/task/${task.id}/comments`,
        { text: newComment }
      );
      setNewComment("");
      fetchComments();
    } catch {
      // silently ignore
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await api.delete(
        `/api/comment/${commentId}`
      );
      fetchComments();
    } catch {
      // silently ignore
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="glass-card-strong w-full max-w-md max-h-[80vh] overflow-y-auto mx-4 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-white/10">
          <h2 className="text-base font-semibold text-white">{t("taskDetails")}</h2>
          <button
            className="p-1 text-white/50 hover:text-white/80 hover:bg-white/10 rounded-lg transition-colors"
            onClick={onClose}
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        {/* Task Info */}
        <div className="px-4 py-3 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white mb-1">{task.name}</h3>
          {task.description && (
            <p className="text-white/50 text-xs mb-2">{task.description}</p>
          )}
          <div className="flex flex-wrap gap-x-4 text-xs text-white/50">
            <span>
              <span className="font-medium text-white/70">{t("assignedTo")}:</span> {task?.user?.fullName ?? t("unassigned")}
            </span>
            <span>
              <span className="font-medium text-white/70">{t("deadline")}:</span> {task.deadline ?? t("noDeadline")}
            </span>
          </div>
        </div>

        {/* Comments Section */}
        <div className="px-4 py-3">
          <h4 className="text-sm font-medium text-white/70 mb-2">
            {t("comments")} ({comments.length})
          </h4>

          {comments.length === 0 ? (
            <p className="text-white/50 text-xs mb-3">{t("noComments")}</p>
          ) : (
            <div className="space-y-2 mb-3 max-h-[200px] overflow-y-auto">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex gap-2 p-2 rounded-lg bg-white/5"
                >
                  <img
                    src={`${API_URL}/${comment.user?.photo}`}
                    alt=""
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0 border border-white/20"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-xs text-white">
                        {comment.user?.fullName}
                      </span>
                      <span className="text-xs text-white/50">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-white/60 break-words">{comment.text}</p>
                  </div>
                  {(comment.userId === user?.id ||
                    user?.role === "admin") && (
                    <button
                      className="p-1 text-white/50 hover:text-white/80 hover:bg-white/15 rounded transition-colors flex-shrink-0"
                      onClick={() => deleteComment(comment.id)}
                    >
                      <IconTrash className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add Comment */}
          <div className="flex gap-2 items-end">
            <input
              type="text"
              className="glass-input flex-1 text-sm"
              placeholder={t("writeComment")}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  postComment();
                }
              }}
            />
            <button
              className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors border border-white/30"
              onClick={postComment}
            >
              <IconSend className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
