import { useRef } from 'react';
import { useLang } from '@/i18n/LangProvider';

/**
 * Un champ de pièce jointe, dessiné comme une ligne de dossier : le nom de la
 * pièce, ce qu'elle doit être, puis le fichier choisi qui remplace la consigne.
 * Le sélecteur du navigateur reste caché derrière la ligne : c'est le bouton
 * qui l'ouvre, et un « × » qui l'efface.
 *
 * Aucun envoi n'a lieu ici : le fichier est gardé en mémoire, et part au dépôt
 * du dossier. Une pièce retirée ne laisse donc rien derrière elle.
 */
export default function PieceField({
  id,
  label,
  hint,
  file,
  disabled,
  onPick,
}: {
  id: string;
  label: string;
  hint: string;
  file: File | null;
  disabled?: boolean;
  onPick: (file: File | null) => void;
}) {
  const { t } = useLang();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const clear = () => {
    if (inputRef.current) inputRef.current.value = '';
    onPick(null);
  };

  return (
    <div className="b2b-piece" data-on={file ? 'yes' : 'no'}>
      <label className="b2b-piece-label" htmlFor={id}>
        <span className="b2b-piece-ic" aria-hidden="true">
          <i className={file ? 'ri-file-pdf-2-fill' : 'ri-file-pdf-2-line'}></i>
        </span>
        <span className="b2b-piece-txt">
          <strong>{label}</strong>
          <em title={file ? file.name : hint}>{file ? file.name : hint}</em>
        </span>
      </label>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="application/pdf,.pdf"
        className="b2b-piece-input"
        disabled={disabled}
        onChange={(event) => onPick(event.target.files?.[0] ?? null)}
      />
      {file ? (
        <button type="button" className="b2b-piece-x" onClick={clear} disabled={disabled}>
          <i className="ri-close-line" aria-hidden="true"></i>
          {t('mar.pieceRemove')}
        </button>
      ) : (
        <button
          type="button"
          className="b2b-piece-add"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          <i className="ri-upload-2-line" aria-hidden="true"></i>
          {t('mar.pieceAdd')}
        </button>
      )}
    </div>
  );
}