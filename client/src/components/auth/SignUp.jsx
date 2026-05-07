import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const SignUp = ({ signUp, error }) => {
  const { t } = useTranslation();
  const [username, setUser] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState();

  return (
    <>
      <div className='min-h-screen flex items-center justify-center p-4'>
        <div className='w-full max-w-md animate-slide-up'>
          <div className='text-center mb-6'>
            <h1 className='font-extrabold text-4xl text-white'>
              <span className="text-amber-400">Uni</span><span className="text-white/80">Flow</span>
            </h1>
            <p className='text-white/60 text-lg'>
              {t('projectManagementSystem')}
            </p>
          </div>
          <div className="glass-card-strong p-8">
            <h2 className="text-center text-2xl text-white font-semibold mb-6">
              {t("registration")}
            </h2>
            {error && (
              <div className="mb-4 p-3 bg-red-500/15 border border-red-400/30 rounded-lg text-white/80 text-sm text-center">
                {error}
              </div>
            )}
            <div className="mb-4">
              <label className="text-white/70 text-sm font-medium block mb-1.5" htmlFor="name">
                {t("name")}
              </label>
              <input
                id="name"
                className="glass-input"
                placeholder={t("namePlaceholder")}
                onChange={(event) => {
                  setName(event.target.value);
                }}
                type="text"
              />
            </div>
            <div className="mb-4">
              <label className="text-white/70 text-sm font-medium block mb-1.5" htmlFor="email">
                {t("email")}
              </label>
              <input
                id="email"
                className="glass-input"
                placeholder={t("emailPlaceholder")}
                onChange={(event) => {
                  setEmail(event.target.value);
                }}
                type="email"
              />
            </div>
            <div className="mb-4">
              <label className="text-white/70 text-sm font-medium block mb-1.5" htmlFor="avatar">
                {t("avatar")}
              </label>
              <input
                id="avatar"
                className="glass-input file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-white/10 file:text-white/80 hover:file:bg-white/20 file:cursor-pointer"
                onChange={(event) => {
                  setImage(event.target.files[0]);
                }}
                type="file"
                accept="image/*"
              />
            </div>
            <div className="mb-4">
              <label className="text-white/70 text-sm font-medium block mb-1.5" htmlFor="username">
                {t("username")}
              </label>
              <input
                id="username"
                className="glass-input"
                placeholder={t("loginPlaceholder")}
                onChange={(event) => {
                  setUser(event.target.value);
                }}
                type="text"
              />
            </div>
            <div className="mb-6">
              <label className="text-white/70 text-sm font-medium block mb-1.5" htmlFor="password">
                {t("password")}
              </label>
              <input
                id="password"
                className="glass-input"
                placeholder={t("passwordPlaceholder")}
                onChange={(event) => {
                  setPassword(event.target.value);
                }}
                type="password"
              />
            </div>
            <div className="mb-4">
              <button
                className="glass-btn-primary w-full py-3"
                onClick={() => {
                  signUp(username, password, email, name, image);
                }}
              >
                {t("register")}
              </button>
            </div>
            <div className='glass-divider mt-5 mb-4'></div>
            <div>
              <div className='text-white/50 text-center text-sm mb-3'>{t("alreadyHaveAccount")}</div>
              <div className='text-center'>
                <Link to='/login' className='text-amber-400 hover:text-amber-300 font-medium transition-colors'>{t("signIn")}</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;
