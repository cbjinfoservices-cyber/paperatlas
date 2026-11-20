import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthProvider';
import { useLang } from '@/i18n/LangProvider';
import { compteDAuteur, compteDeFiche, openConversation } from '@/lib/messaging';

/** Où en est le geste : au repos, en train d’ouvrir, ou arrêté par une raison. */
export type WriteState = 'idle' | 'busy' | 'none' | 'self' | 'error';

/** Le genre de fiche d’où l’on écrit : l’atelier de l’annuaire, ou un auteur. */
type FicheKind = 'fiche' | 'auteur';

/**
 * « Écrire », posé une seule fois pour la fiche d’atelier, les cartes de
 * l’annuaire et les cartes d’auteurs.
 *
 * Un visiteur non connecté est d’abord envoyé à la connexion, puis ramené là
 * d’où il vient. Une fois connecté, le compte qui tient la fiche est retrouvé
 * par son identifiant seul — rien d’autre n’est lu — et le fil s’ouvre dans la
 * messagerie, déjà sélectionné.
 */
export function useWriteToWorkshop() {
  const navigate = useNavigate();
  const { user, compte } = useAuth();
  const { t } = useLang();
  const [writeState, setWriteState] = useState<WriteState>('idle');

  const openThread = async (kind: FicheKind, ficheId: string, nom: string, backTo?: string) => {
    const retour = backTo || (kind === 'auteur' ? `/auteur/${ficheId}` : `/entreprise/${ficheId}`);
    if (!user) {
      navigate(`/compte/connexion?next=${encodeURIComponent(retour)}`);
      return;
    }
    setWriteState('busy');
    try {
      const autre = kind === 'auteur' ? await compteDAuteur(ficheId) : await compteDeFiche(ficheId);
      if (!autre) {
        setWriteState('none');
        return;
      }
      if (autre === user.id) {
        setWriteState('self');
        return;
      }
      const nomMoi = (compte?.nom || compte?.organisme || user.email || '').trim();
      const fil = await openConversation({
        meId: user.id,
        meNom: nomMoi || t('msg.you'),
        otherId: autre,
        otherNom: nom,
        sujet: '',
        kind: 'libre',
        origine: kind,
      });
      setWriteState('idle');
      navigate(`/messages?c=${fil}`);
    } catch {
      setWriteState('error');
    }
  };

  /** « Écrire à cet atelier » — depuis sa fiche comme depuis sa carte. */
  const writeToWorkshop = (ficheId: string, nom: string, backTo?: string) =>
    openThread('fiche', ficheId, nom, backTo);

  /** Le même geste, sur la fiche d’un auteur ou sa carte de l’annuaire. */
  const writeToAuthor = (auteurId: string, nom: string, backTo?: string) =>
    openThread('auteur', auteurId, nom, backTo);

  return { writeState, writeToWorkshop, writeToAuthor, reset: () => setWriteState('idle') };
}