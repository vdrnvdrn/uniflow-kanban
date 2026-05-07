import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  IconKanban,
  IconUsers,
  IconClock,
  IconCheckCircle,
  IconMessageCircle,
  IconTrophy,
} from "../ui/Icons";

const Feature = ({ Icon, title, desc }) => (
  <div className="glass-card-subtle p-5">
    <div className="flex items-center gap-3 mb-2">
      <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-amber-300/90">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-white font-semibold text-base">{title}</h3>
    </div>
    <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
  </div>
);

const Step = ({ n, title, desc }) => (
  <div className="flex-1 text-center md:text-left">
    <div className="text-6xl font-extrabold text-amber-400/60 leading-none mb-2">{n}</div>
    <h4 className="text-white font-semibold text-lg mb-1">{title}</h4>
    <p className="text-white/55 text-sm leading-relaxed">{desc}</p>
  </div>
);

const Landing = () => {
  const { t, i18n } = useTranslation();
  const navigateTo = useNavigate();

  const changeLanguage = (lng) => i18n.changeLanguage(lng);

  return (
    <div className="min-h-screen">
      {/* Top bar with logo + lang switch */}
      <div className="max-w-6xl mx-auto px-4 pt-5 flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-extrabold tracking-wide">
          <span className="text-amber-400">Uni</span>
          <span className="text-white/80">Flow</span>
        </h1>

        <div className="flex items-center bg-white/10 rounded-full p-0.5 border border-white/10">
          <button
            onClick={() => changeLanguage("en")}
            className={`px-3 py-1 text-sm font-medium rounded-full transition-all duration-200 ${
              i18n.language === "en"
                ? "bg-white/20 text-white shadow-sm"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => changeLanguage("ru")}
            className={`px-3 py-1 text-sm font-medium rounded-full transition-all duration-200 ${
              i18n.language === "ru"
                ? "bg-white/20 text-white shadow-sm"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            RU
          </button>
        </div>
      </div>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-16 md:pt-20 md:pb-24 text-center">
        <h2 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
          <span className="text-white">{t("landingHeroTitle1")}</span>
          <br />
          <span className="text-amber-400">{t("landingHeroTitle2")}</span>
        </h2>
        <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
          {t("landingHeroSubtitle")}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={() => navigateTo("/signup")}
            className="glass-btn-primary px-6 py-3 text-base w-full sm:w-auto"
          >
            {t("landingCtaPrimary")}
          </button>
          <button
            onClick={() => navigateTo("/login")}
            className="glass-btn-secondary px-6 py-3 text-base w-full sm:w-auto"
          >
            {t("landingCtaSecondary")}
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <h3 className="text-3xl md:text-4xl font-bold text-white text-center mb-3">
          {t("landingFeaturesTitle")}
        </h3>
        <p className="text-white/55 text-center mb-10">{t("landingFeaturesSubtitle")}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Feature Icon={IconKanban} title={t("landingF1Title")} desc={t("landingF1Desc")} />
          <Feature Icon={IconUsers} title={t("landingF2Title")} desc={t("landingF2Desc")} />
          <Feature Icon={IconClock} title={t("landingF3Title")} desc={t("landingF3Desc")} />
          <Feature Icon={IconCheckCircle} title={t("landingF4Title")} desc={t("landingF4Desc")} />
          <Feature Icon={IconMessageCircle} title={t("landingF5Title")} desc={t("landingF5Desc")} />
          <Feature Icon={IconTrophy} title={t("landingF6Title")} desc={t("landingF6Desc")} />
        </div>
      </section>

      {/* For small teams */}
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="glass-card-static p-6 md:p-10">
          <h3 className="text-3xl md:text-4xl font-bold text-white text-center mb-3">
            {t("landingTeamsTitle")}
          </h3>
          <p className="text-white/55 text-center mb-10 max-w-2xl mx-auto">
            {t("landingTeamsSubtitle")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0">
            <div className="md:px-6 md:border-r md:border-white/10 text-center md:text-left">
              <h4 className="text-white font-semibold text-lg mb-2">{t("landingT1Title")}</h4>
              <p className="text-white/55 text-sm leading-relaxed">{t("landingT1Desc")}</p>
            </div>
            <div className="md:px-6 md:border-r md:border-white/10 text-center md:text-left">
              <h4 className="text-white font-semibold text-lg mb-2">{t("landingT2Title")}</h4>
              <p className="text-white/55 text-sm leading-relaxed">{t("landingT2Desc")}</p>
            </div>
            <div className="md:px-6 text-center md:text-left">
              <h4 className="text-white font-semibold text-lg mb-2">{t("landingT3Title")}</h4>
              <p className="text-white/55 text-sm leading-relaxed">{t("landingT3Desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <h3 className="text-3xl md:text-4xl font-bold text-white text-center mb-10">
          {t("landingHowTitle")}
        </h3>
        <div className="flex flex-col md:flex-row gap-8 md:gap-6">
          <Step n="1" title={t("landingStep1Title")} desc={t("landingStep1Desc")} />
          <Step n="2" title={t("landingStep2Title")} desc={t("landingStep2Desc")} />
          <Step n="3" title={t("landingStep3Title")} desc={t("landingStep3Desc")} />
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="glass-card-strong p-8 md:p-12 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {t("landingFinalTitle")}
          </h3>
          <p className="text-white/60 mb-6 max-w-xl mx-auto">{t("landingFinalSubtitle")}</p>
          <button
            onClick={() => navigateTo("/signup")}
            className="glass-btn-primary px-8 py-3 text-base"
          >
            {t("landingFinalCta")}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 pt-8 pb-10 mt-8 border-t border-white/10 flex items-center justify-center">
        <span className="text-sm font-bold">
          <span className="text-amber-400">Uni</span>
          <span className="text-white/60">Flow</span>
        </span>
      </footer>
    </div>
  );
};

export default Landing;
