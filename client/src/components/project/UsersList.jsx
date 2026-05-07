import api from "../../api";
import { useEffect, useState, useContext } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AddUsers from "./AddUsers";
import UserCard from "./UserCard";
import { GlobalContext } from "../Home.jsx";

const UsersList = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const user = useContext(GlobalContext);

  const { state } = useLocation();
  const { project } = state;

  const canAddUsers =
    user?.role === "admin" ||
    (user?.role === "manager" && project.managerId === user?.id);

  useEffect(() => {
    fetchUsers();
  }, []);

  const addUser = (userId) => {
    api
      .post(
        "/api/project/addUser",
        { userId, projectId: project.id }
      )
      .then(() => window.location.reload())
      .catch(console.log);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm(t('confirmDeleteUser'))) {
      api
        .delete(`/api/project/${project.id}/users/${userId}`)
        .then(() => {
          fetchUsers();
        })
        .catch(() => {
          alert(t('failedToRemoveUser'));
        });
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get(
        `/api/project/${project.id}/users`
      );
      setUsers(data);
    } catch {
      // silently ignore
    }
  };

  return (
    <div className="p-6">
      {canAddUsers && <AddUsers addUser={addUser} open={addUserModalOpen} onClose={() => setAddUserModalOpen(false)} />}
      {canAddUsers && (
        <div className="flex justify-end mb-6">
          <button
            className="glass-btn-primary px-4 py-2"
            onClick={() => setAddUserModalOpen(true)}
          >
            {t("addMember")}
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u, i) => (
          <UserCard
            key={i}
            user={u}
            canDelete={canAddUsers}
            onDeleteUser={handleDeleteUser}
          />
        ))}
      </div>
    </div>
  );
};

export default UsersList;
