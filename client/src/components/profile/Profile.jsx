import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import api, { API_URL } from "../../api";
import { GlobalContext } from "../Home";

const Profile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentUser = useContext(GlobalContext);

  // Profile data
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    fullName: "",
    profession: "",
    email: "",
  });

  // Photo upload
  const [newPhoto, setNewPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [status, setStatus] = useState("available");

  const handleStatusChange = async (newStatus) => {
    if (!profile) return;
    const prev = status;
    setStatus(newStatus);
    try {
      await api.put(`/api/user/${profile.id}/status`, { status: newStatus });
      setSuccess(t("statusUpdated") || "Status updated");
    } catch (err) {
      setStatus(prev);
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  // Fetch profile on mount
  useEffect(() => {
    if (currentUser) {
      fetchProfile();
    }
  }, [currentUser]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Clear error message after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/user/${currentUser.id}`);
      setProfile(data);
      setStatus(data.status || "available");
      setFormData({
        fullName: data.fullName,
        profession: data.profession || "",
        email: data.email,
      });
      setError(null);
    } catch (err) {
      setError(t("failedToLoadProfile") || "Failed to load profile");
      void err;
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPhoto(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaveLoading(true);
      setError(null);

      // Validate
      if (!formData.fullName.trim()) {
        setError(t("fullNameRequired") || "Full name is required");
        return;
      }

      if (formData.email && !isValidEmail(formData.email)) {
        setError(t("invalidEmail") || "Invalid email format");
        return;
      }

      // Update profile
      await api.put(`/api/user/${currentUser.id}`, {
        fullName: formData.fullName,
        profession: formData.profession,
        email: formData.email,
      });

      setSuccess(t("profileUpdated") || "Profile updated successfully");
      setEditMode(false);
      fetchProfile();
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(t("failedToUpdateProfile") || "Failed to update profile");
      }
      void err;
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    if (!newPhoto) {
      setError(t("selectPhoto") || "Please select a photo");
      return;
    }

    try {
      setSaveLoading(true);
      setError(null);

      // Validate file type
      if (!newPhoto.type.startsWith("image/")) {
        setError(t("invalidFileType") || "Please select an image file");
        return;
      }

      // Validate file size (5MB)
      if (newPhoto.size > 5 * 1024 * 1024) {
        setError(t("fileTooLarge") || "File must be less than 5MB");
        return;
      }

      const formDataUpload = new FormData();
      formDataUpload.append("image", newPhoto);

      await api.put(`/api/user/${currentUser.id}/photo`, formDataUpload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess(t("photoUpdated") || "Photo updated successfully");
      setNewPhoto(null);
      setPhotoPreview(null);
      fetchProfile();
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(t("failedToUploadPhoto") || "Failed to upload photo");
      }
      void err;
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaveLoading(true);
      setError(null);

      // Validate
      if (!passwordData.oldPassword) {
        setError(t("oldPasswordRequired") || "Old password is required");
        return;
      }

      if (!passwordData.newPassword) {
        setError(t("newPasswordRequired") || "New password is required");
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setError(t("passwordTooShort") || "Password must be at least 6 characters");
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError(t("passwordsDoNotMatch") || "Passwords do not match");
        return;
      }

      await api.put(`/api/user/${currentUser.id}/password`, {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });

      setSuccess(t("passwordChanged") || "Password changed successfully");
      setShowPasswordForm(false);
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(t("failedToChangePassword") || "Failed to change password");
      }
      void err;
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        fullName: profile.fullName,
        profession: profile.profession || "",
        email: profile.email,
      });
    }
    setEditMode(false);
    setError(null);
  };

  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-white/50">{t("loading") || "Loading..."}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-white/60">{error || (t("profileNotFound") || "Profile not found")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Message */}
        {success && (
          <div className="mb-4 p-4 bg-green-500/15 text-white/80 rounded-lg border border-green-400/30">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/15 text-white/80 rounded-lg border border-red-400/30">
            {error}
          </div>
        )}

        {/* Status Selector */}
        <div className="glass-card p-5 mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">{t("availability") || "Availability"}</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { key: "available", color: "bg-emerald-400", label: t("statusAvailable") || "Available" },
              { key: "busy", color: "bg-amber-400", label: t("statusBusy") || "Busy" },
              { key: "away", color: "bg-white/40", label: t("statusAway") || "Away" },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => handleStatusChange(s.key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all ${
                  status === s.key
                    ? "bg-white/15 border-white/40 text-white"
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                <span className="text-sm font-medium">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Profile Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            {/* Photo */}
            <div className="flex-shrink-0">
              <img
                src={photoPreview || `${API_URL}/${profile.photo}`}
                alt={profile.fullName}
                className="w-24 h-24 rounded-full border-4 border-white/40 object-cover"
              />
            </div>

            {/* Basic Info */}
            <div className="flex-grow">
              <h1 className="text-2xl sm:text-3xl font-bold text-white text-center sm:text-left">{profile.fullName}</h1>
              <p className="text-white/60">{profile.profession || "-"}</p>
              <p className="text-sm text-white/50">{profile.email}</p>
              <p className="text-xs text-white/50 mt-2">
                {t("userId") || "User ID"}: {profile.id}
              </p>
            </div>

            {/* Action Buttons */}
            {!editMode && (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setEditMode(true)}
                  className="glass-btn-primary px-4 py-2"
                >
                  {t("editProfile") || "Edit"}
                </button>
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="glass-btn-secondary px-4 py-2"
                >
                  {t("changePassword") || "Change Password"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Edit Form */}
        {editMode && (
          <div className="glass-card p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">{t("editProfile") || "Edit Profile"}</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  {t("fullName") || "Full Name"}
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  maxLength={100}
                  required
                  className="glass-input"
                />
              </div>

              {/* Profession */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  {t("profession") || "Profession"}
                </label>
                <input
                  type="text"
                  name="profession"
                  value={formData.profession}
                  onChange={handleInputChange}
                  maxLength={100}
                  placeholder={t("optional") || "Optional"}
                  className="glass-input"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  {t("email") || "Email"}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="glass-input"
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="glass-btn-primary px-6 py-2 disabled:opacity-40"
                >
                  {saveLoading ? (t("saving") || "Saving...") : (t("save") || "Save")}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saveLoading}
                  className="glass-btn-secondary px-6 py-2 disabled:opacity-40"
                >
                  {t("cancel") || "Cancel"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Photo Upload */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">{t("photo") || "Profile Photo"}</h2>
          <form onSubmit={handlePhotoUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                {t("selectPhoto") || "Select Photo"}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="block w-full text-sm text-white/50
                  file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0
                  file:text-sm file:font-semibold file:bg-white/15 file:text-white/80
                  hover:file:bg-white/25"
              />
              <p className="text-xs text-white/50 mt-1">
                {t("photoHint") || "Supported: JPEG, PNG, GIF (max 5MB)"}
              </p>
            </div>

            {/* Photo Preview */}
            {photoPreview && (
              <div className="flex justify-center">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-32 h-32 rounded-lg border-2 border-white/40 object-cover"
                />
              </div>
            )}

            {/* Upload Button */}
            {newPhoto && (
              <button
                type="submit"
                disabled={saveLoading}
                className="w-full glass-btn-primary px-6 py-2 disabled:opacity-40"
              >
                {saveLoading ? (t("uploading") || "Uploading...") : (t("uploadPhoto") || "Upload Photo")}
              </button>
            )}
          </form>
        </div>

        {/* Change Password Form */}
        {showPasswordForm && (
          <div className="glass-card p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">{t("changePassword") || "Change Password"}</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Old Password */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  {t("oldPassword") || "Old Password"}
                </label>
                <input
                  type="password"
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  required
                  className="glass-input"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  {t("newPassword") || "New Password"}
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  minLength={6}
                  required
                  className="glass-input"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  {t("confirmPassword") || "Confirm Password"}
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  minLength={6}
                  required
                  className="glass-input"
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="glass-btn-primary px-6 py-2 disabled:opacity-40"
                >
                  {saveLoading ? (t("saving") || "Saving...") : (t("changePassword") || "Change Password")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({
                      oldPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                    setError(null);
                  }}
                  disabled={saveLoading}
                  className="glass-btn-secondary px-6 py-2 disabled:opacity-40"
                >
                  {t("cancel") || "Cancel"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
