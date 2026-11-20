import { Link, useLocation } from "react-router-dom";
import { useLang } from "@/i18n/LangProvider";

const COPY = {
  fr: { title: "Page introuvable", text: "Cette adresse n’existe pas ou n’existe plus.", home: "Retour à l’accueil", dir: "Voir l’annuaire" },
  ar: { title: "الصفحة غير موجودة", text: "هذا العنوان غير موجود أو لم يعد متاحًا.", home: "العودة إلى الرئيسية", dir: "تصفّح الدليل" },
  en: { title: "Page not found", text: "This address does not exist, or no longer does.", home: "Back to home", dir: "Browse the directory" },
};

export default function NotFound() {
  const location = useLocation();
  const { lang } = useLang();
  const copy = COPY[lang] ?? COPY.fr;

  return (
    <div className="relative flex flex-col items-center justify-center h-screen text-center px-4">
      <h1 className="absolute bottom-0 text-9xl md:text-[12rem] font-black text-gray-50 select-none pointer-events-none z-0">
        404
      </h1>
      <div className="relative z-10">
        <h1 className="text-xl md:text-2xl font-semibold mt-6">{copy.title}</h1>
        <p className="mt-2 text-base text-gray-400 font-mono">{location.pathname}</p>
        <p className="mt-4 text-lg md:text-xl text-gray-500">{copy.text}</p>
        <p className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <Link to="/" className="cta">{copy.home}</Link>
          <Link to="/annuaire" className="ghost-btn">{copy.dir}</Link>
        </p>
      </div>
    </div>
  );
}