import { useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../../api";

const generateRandom = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < 10; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
};

const ResetPasswordModal = ({ user, onClose }) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = () => setPassword(generateRandom());

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError(t("passwordTooShort") || "Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.put(`/api/admin/users/${user.id}/password`, { newPassword: password });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card-strong p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-semibold text-white mb-1">{t("resetPasswordTitle")}</h3>
        <p className="text-white/60 text-sm mb-4">{user.fullName} · {user.email}</p>

        {submitted ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-500/15 border border-emerald-400/30 rounded-lg">
              <p className="text-white text-sm mb-2">{t("resetPasswordDone")}</p>
              <div className="font-mono text-amber-300 text-lg select-all break-all">{password}</div>
            </div>
            <p className="text-xs text-white/50">{t("resetPasswordHint")}</p>
            <button onClick={onClose} className="glass-btn-primary w-full px-4 py-2">
              {t("done") || "OK"}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-1.5">{t("newPassword") || "New password"}</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("enterOrGenerate") || "Enter or generate"}
                  className="glass-input flex-1"
                  minLength={6}
                  required
                />
                <button type="button" onClick={handleGenerate} className="glass-btn-secondary px-3">
                  {t("generate") || "Generate"}
                </button>
              </div>
            </div>
            {error && <div className="text-sm text-red-300/90 bg-red-500/15 border border-red-400/30 rounded p-2">{error}</div>}
            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={loading} className="glass-btn-primary flex-1 px-4 py-2 disabled:opacity-40">
                {loading ? "..." : (t("resetPassword") || "Reset")}
              </button>
              <button type="button" onClick={onClose} className="glass-btn-secondary px-4 py-2">
                {t("cancel")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordModal;
