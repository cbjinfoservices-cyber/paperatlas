import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import Annuaire from "../pages/annuaire/page";
import EntrepriseProfile from "../pages/entreprise/page";
import AuteurProfile from "../pages/auteur/page";
import Annonces from "../pages/annonces/page";
import AnnonceDetail from "../pages/annonces/detail/page";
import Emplois from "../pages/emplois/page";
import EmploiDetail from "../pages/emplois/detail/page";
import Deposer from "../pages/deposer/page";
import Compte from "../pages/compte/page";
import Inscription from "../pages/compte/inscription/page";
import CandidatInscription from "../pages/compte/inscription/candidat/page";
import ProfilCandidat from "../pages/compte/profil-candidat/page";
import Connexion from "../pages/compte/connexion/page";
import Messages from "../pages/messages/page";
import CandidatProfile from "../pages/candidats/page";
import CandidatsListe from "../pages/candidats/liste/page";
import DemandeB2b from "../pages/demande-b2b/page";
import DemandeMarche from "../pages/demande-marche/page";
import Demandes from "../pages/demandes/page";
import Offres from "../pages/offres/page";
import Devis from "../pages/devis/page";
import Suivi from "../pages/suivi/page";
import MentionsLegales from "../pages/legal/mentions/page";
import Confidentialite from "../pages/legal/confidentialite/page";
import Admin from "../pages/admin/page";
import PlanDuSite from "../pages/plan-du-site/page";
import ArabeWorld from "../pages/arabe-world/page";

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