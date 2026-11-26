import type { RouteObject } from "react-router-dom";
import { lazy } from "react";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";

/* Chaque page est chargée à la demande : seule la page d'accueil, premier
   écran des visiteurs, reste dans le bundle initial. */
const Annuaire = lazy(() => import("../pages/annuaire/page"));
const BusinessProfilePage = lazy(() => import("../pages/annuaire/BusinessProfilePage"));
const EntrepriseProfile = lazy(() => import("../pages/entreprise/page"));
const AuteurProfile = lazy(() => import("../pages/auteur/page"));
const Annonces = lazy(() => import("../pages/annonces/page"));
const AnnonceDetail = lazy(() => import("../pages/annonces/detail/page"));
const Emplois = lazy(() => import("../pages/emplois/page"));
const EmploiDetail = lazy(() => import("../pages/emplois/detail/page"));
const Deposer = lazy(() => import("../pages/deposer/page"));
const Compte = lazy(() => import("../pages/compte/page"));
const Inscription = lazy(() => import("../pages/compte/inscription/page"));
const CandidatInscription = lazy(() => import("../pages/compte/inscription/candidat/page"));
const ProfilCandidat = lazy(() => import("../pages/compte/profil-candidat/page"));
const Connexion = lazy(() => import("../pages/compte/connexion/page"));
const MotDePasse = lazy(() => import("../pages/compte/mot-de-passe/page"));
const Messages = lazy(() => import("../pages/messages/page"));
const CandidatProfile = lazy(() => import("../pages/candidats/page"));
const CandidatsListe = lazy(() => import("../pages/candidats/liste/page"));
const DemandeB2b = lazy(() => import("../pages/demande-b2b/page"));
const DemandeMarche = lazy(() => import("../pages/demande-marche/page"));
const Demandes = lazy(() => import("../pages/demandes/page"));
const Offres = lazy(() => import("../pages/offres/page"));
const Devis = lazy(() => import("../pages/devis/page"));
const Suivi = lazy(() => import("../pages/suivi/page"));
const MentionsLegales = lazy(() => import("../pages/legal/mentions/page"));
const Confidentialite = lazy(() => import("../pages/legal/confidentialite/page"));
const Cgu = lazy(() => import("../pages/legal/cgu/page"));
const Cgv = lazy(() => import("../pages/legal/cgv/page"));
const Admin = lazy(() => import("../pages/admin/page"));
const PlanDuSite = lazy(() => import("../pages/plan-du-site/page"));
const ArabeWorld = lazy(() => import("../pages/arabe-world/page"));

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/annuaire",
    element: <Annuaire />,
  },
  {
    path: "/annuaire/entreprise/:id",
    element: <BusinessProfilePage />,
  },
  {
    /* Une page par type d'établissement, avec sa propre adresse :
       /annuaire/imprimeries, /annuaire/editeurs, /annuaire/librairies… */
    path: "/annuaire/:slug",
    element: <Annuaire />,
  },
  {
    /* Une page par type et par pays, avec sa propre adresse :
       /annuaire/imprimeries/algerie, /annuaire/editeurs/maroc… */
    path: "/annuaire/:slug/:payslug",
    element: <Annuaire />,
  },
  {
    path: "/entreprise/:id",
    element: <EntrepriseProfile />,
  },
  {
    path: "/auteur/:id",
    element: <AuteurProfile />,
  },
  {
    path: "/annonces",
    element: <Annonces />,
  },
  {
    path: "/annonces/:id",
    element: <AnnonceDetail />,
  },
  {
    path: "/emplois",
    element: <Emplois />,
  },
  {
    path: "/emplois/:id",
    element: <EmploiDetail />,
  },
  {
    path: "/deposer",
    element: <Deposer />,
  },
  {
    path: "/demande-b2b",
    element: <DemandeB2b />,
  },
  {
    /* Le guichet des marchés publics a sa propre page : la carte de la page
       Demandes promet un vocabulaire, elle doit le tenir. */
    path: "/demande-marche",
    element: <DemandeMarche />,
  },
  {
    /* Les trois guichets du réseau réunis sur une page : devis d'abonnement,
       grand tirage et sous-traitance, marchés publics. */
    path: "/demandes",
    element: <Demandes />,
  },
  {
    path: "/offres",
    element: <Offres />,
  },
  {
    path: "/offres/devis",
    element: <Devis />,
  },
  {
    path: "/suivi",
    element: <Suivi />,
  },
  {
    path: "/mentions-legales",
    element: <MentionsLegales />,
  },
  {
    path: "/confidentialite",
    element: <Confidentialite />,
  },
  {
    path: "/cgu",
    element: <Cgu />,
  },
  {
    path: "/cgv",
    element: <Cgv />,
  },
  {
    /* La seconde marque du réseau, expliquée en une page : d'où viennent les
       deux noms de la maison, et pourquoi le site se lit en trois langues. */
    path: "/arabe-world",
    element: <ArabeWorld />,
  },
  {
    path: "/plan-du-site",
    element: <PlanDuSite />,
  },
  {
    /* La même page, sous l'adresse que les visiteurs tapent aussi. */
    path: "/sitemap",
    element: <PlanDuSite />,
  },
  {
    path: "/compte",
    element: <Compte />,
  },
  {
    path: "/admin",
    element: <Admin />,
  },
  {
    path: "/compte/inscription",
    element: <Inscription />,
  },
  {
    path: "/compte/inscription/candidat",
    element: <CandidatInscription />,
  },
  {
    path: "/compte/profil-candidat",
    element: <ProfilCandidat />,
  },
  {
    path: "/compte/connexion",
    element: <Connexion />,
  },
  {
    path: "/compte/mot-de-passe",
    element: <MotDePasse />,
  },
  {
    path: "/messages",
    element: <Messages />,
  },
  {
    path: "/candidats",
    element: <CandidatsListe />,
  },
  {
    path: "/candidats/:id",
    element: <CandidatProfile />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;