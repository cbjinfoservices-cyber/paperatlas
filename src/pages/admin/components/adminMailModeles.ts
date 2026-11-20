/**
 * Les deux modèles d'authentification, prêts à coller dans Supabase.
 *
 * Supabase n'envoie qu'un modèle par type, à tous les comptes, quelle que
 * soit la langue de la personne. Un modèle par langue ne marcherait donc pas :
 * ces deux textes portent les trois langues à la suite — le français, puis
 * l'arabe (de droite à gauche), puis l'anglais — pour que chacun lise la
 * sienne sans recevoir une langue qu'il ne lit pas.
 *
 * Le lien {{ .ConfirmationURL }} est rempli par Supabase lui-même : il ne se
 * remplace pas, il se garde tel quel.
 *
 * Relecture sur téléphone (écran de 360 px) : dans un bloc arabe, un lien
 * latin collé à la phrase se réordonnait mal — le « https » passait à la fin
 * de la ligne, la ponctuation sautait d'un bord à l'autre. Chaque adresse est
 * donc isolée dans son propre sens de lecture, et coupée si elle dépasse la
 * largeur de l'écran. La signature, qui mêlait arabe et anglais sur une seule
 * ligne, est séparée en deux lignes : chacune garde son sens.
 */

export type ModeleAuth = {
  cle: 'confirmation' | 'reinitialisation';
  /** L'objet du message, lui aussi dans les trois langues. */
  sujet: string;
  /** Le corps HTML, tel qu'il se colle dans Supabase → Authentication → Emails. */
  html: string;
};

/** Le lien de Supabase, isolé et coupable : sur un écran étroit il passe à la
 *  ligne au lieu de déborder du cadre. */
const lien =
  '<span dir="ltr" style="direction:ltr;unicode-bidi:isolate;overflow-wrap:anywhere;word-break:break-word">{{ .ConfirmationURL }}</span>';

const signature = `<div style="margin:26px 0 0;padding-top:14px;border-top:1px solid #e4ddd0">
    <p style="margin:0;font-size:11px;line-height:1.7;color:#8a7f6f">PaperAtlas · <span dir="rtl" lang="ar" style="direction:rtl;unicode-bidi:isolate">رسالة آلية، لا تردّ عليها</span></p>
    <p dir="ltr" style="margin:2px 0 0;font-size:11px;line-height:1.7;color:#8a7f6f">This message was sent automatically, please do not reply.</p>
  </div>`;

const confirmation = `<div dir="ltr" style="max-width:560px;margin:0 auto;padding:24px 18px;font-family:Helvetica,Arial,sans-serif;color:#211d18">
  <p style="margin:0 0 22px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#8a7f6f">PaperAtlas</p>

  <div dir="ltr" lang="fr">
    <p style="margin:0 0 12px;font-size:15px;line-height:1.6">Bonjour,</p>
    <p style="margin:0 0 18px;font-size:15px;line-height:1.6">Confirmez votre adresse pour ouvrir votre compte PaperAtlas : l’annuaire des ateliers, les demandes de devis et le suivi de vos dossiers.</p>
    <p style="margin:0 0 18px"><a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:11px 20px;border-radius:999px;background:#211d18;color:#f7f2e9;font-size:14px;text-decoration:none">Confirmer mon adresse</a></p>
    <p style="margin:0 0 26px;font-size:12px;line-height:1.7;color:#8a7f6f">Si le bouton ne s’ouvre pas, copiez ce lien :<br />${lien}</p>
  </div>

  <div dir="rtl" lang="ar" style="border-top:1px solid #e4ddd0;padding-top:24px;margin-bottom:26px;text-align:right">
    <p style="margin:0 0 12px;font-size:15px;line-height:1.8">مرحبًا،</p>
    <p style="margin:0 0 18px;font-size:15px;line-height:1.9">أكّد بريدك لفتح حسابك على PaperAtlas: دليل الورشات، وطلبات عروض الأسعار، ومتابعة ملفاتك.</p>
    <p style="margin:0 0 18px"><a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:11px 20px;border-radius:999px;background:#211d18;color:#f7f2e9;font-size:14px;text-decoration:none">تأكيد بريدي</a></p>
    <p style="margin:0;font-size:12px;line-height:1.9;color:#8a7f6f">إن لم يفتح الزر، انسخ هذا الرابط:<br />${lien}</p>
  </div>

  <div dir="ltr" lang="en" style="border-top:1px solid #e4ddd0;padding-top:24px;text-align:left">
    <p style="margin:0 0 12px;font-size:15px;line-height:1.6">Hello,</p>
    <p style="margin:0 0 18px;font-size:15px;line-height:1.6">Confirm your address to open your PaperAtlas account: the workshop directory, quote requests and the follow-up of your files.</p>
    <p style="margin:0 0 18px"><a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:11px 20px;border-radius:999px;background:#211d18;color:#f7f2e9;font-size:14px;text-decoration:none">Confirm my address</a></p>
    <p style="margin:0;font-size:12px;line-height:1.7;color:#8a7f6f">If the button does not open, copy this link:<br />${lien}</p>
  </div>

  ${signature}
</div>`;

const reinitialisation = `<div dir="ltr" style="max-width:560px;margin:0 auto;padding:24px 18px;font-family:Helvetica,Arial,sans-serif;color:#211d18">
  <p style="margin:0 0 22px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#8a7f6f">PaperAtlas</p>

  <div dir="ltr" lang="fr">
    <p style="margin:0 0 12px;font-size:15px;line-height:1.6">Bonjour,</p>
    <p style="margin:0 0 18px;font-size:15px;line-height:1.6">Une nouvelle demande de mot de passe a été faite pour votre compte PaperAtlas. Choisissez-en un nouveau depuis le lien ci-dessous ; il ne vaut que pour cette demande.</p>
    <p style="margin:0 0 18px"><a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:11px 20px;border-radius:999px;background:#211d18;color:#f7f2e9;font-size:14px;text-decoration:none">Choisir un nouveau mot de passe</a></p>
    <p style="margin:0 0 26px;font-size:12px;line-height:1.7;color:#8a7f6f">Si vous n’êtes pas à l’origine de cette demande, ignorez ce message : votre mot de passe reste inchangé.</p>
  </div>

  <div dir="rtl" lang="ar" style="border-top:1px solid #e4ddd0;padding-top:24px;margin-bottom:26px;text-align:right">
    <p style="margin:0 0 12px;font-size:15px;line-height:1.8">مرحبًا،</p>
    <p style="margin:0 0 18px;font-size:15px;line-height:1.9">ورد طلب جديد لكلمة المرور على حسابك في PaperAtlas. اختر كلمة مرور جديدة من الرابط أدناه؛ وهو صالح لهذا الطلب وحده.</p>
    <p style="margin:0 0 18px"><a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:11px 20px;border-radius:999px;background:#211d18;color:#f7f2e9;font-size:14px;text-decoration:none">اختيار كلمة مرور جديدة</a></p>
    <p style="margin:0;font-size:12px;line-height:1.9;color:#8a7f6f">إن لم تكن أنت من طلب ذلك، تجاهل هذه الرسالة: كلمة مرورك تبقى كما هي.</p>
  </div>

  <div dir="ltr" lang="en" style="border-top:1px solid #e4ddd0;padding-top:24px;text-align:left">
    <p style="margin:0 0 12px;font-size:15px;line-height:1.6">Hello,</p>
    <p style="margin:0 0 18px;font-size:15px;line-height:1.6">A new password request was made for your PaperAtlas account. Choose a new one from the link below; it is valid for this request only.</p>
    <p style="margin:0 0 18px"><a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:11px 20px;border-radius:999px;background:#211d18;color:#f7f2e9;font-size:14px;text-decoration:none">Choose a new password</a></p>
    <p style="margin:0;font-size:12px;line-height:1.7;color:#8a7f6f">If you did not ask for this, ignore this message: your password stays unchanged.</p>
  </div>

  ${signature}
</div>`;

export const MODELES_AUTH: ModeleAuth[] = [
  {
    cle: 'confirmation',
    sujet:
      'Confirmez votre adresse · PaperAtlas · أكّد بريدك · Confirm your address',
    html: confirmation,
  },
  {
    cle: 'reinitialisation',
    sujet:
      'Nouveau mot de passe · PaperAtlas · كلمة مرور جديدة · Set a new password',
    html: reinitialisation,
  },
];

/** Les trois premières valeurs du SMTP d'authentification de Supabase, telles
 *  qu'elles se recopient. Le mot de passe n'est pas écrit ici : c'est la clé
 *  Resend, qui vit dans les secrets et ne se recopie pas à la main. */
export const SMTP_AUTH = {
  host: 'smtp.resend.com',
  port: '465',
  user: 'resend',
} as const;

/** L'écran de Supabase où ces valeurs s'enregistrent, ouvert d'un clic. */
export const SMTP_URL = 'https://supabase.com/dashboard/project/_/auth/smtp';

/**
 * Le seul bloc arabe d'un modèle, prêt à s'afficher dans un cadre de 320 px.
 *
 * Le modèle complet se colle dans Supabase ; ici, on n'en veut que la partie
 * arabe, pour juger sur place le sens de lecture — sans ouvrir une boîte de
 * réception. Le lien de confirmation reste un repère immobile : il ne mène
 * nulle part depuis l'aperçu, et son adresse est coupée comme dans le message
 * réel.
 */
export function apercuArabe(modele: ModeleAuth): string {
  const debut = modele.html.indexOf('<div dir="rtl" lang="ar"');
  if (debut < 0) return '';
  const fin = modele.html.indexOf('<div dir="ltr" lang="en"', debut);
  const bloc = modele.html.slice(debut, fin > debut ? fin : undefined);
  /* Le lien de Supabase n'a pas d'adresse dans un aperçu : il devient un
     repère inerte, jamais une porte qui quitte la console. */
  const corps = bloc.replace(/\{\{ \.ConfirmationURL \}\}/g, '#apercu-modele');
  const marque =
    '<p style="margin:0 0 20px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#8a7f6f">PaperAtlas</p>';
  return `<div dir="ltr" style="padding:18px 14px 20px;background:#ffffff;font-family:Helvetica,Arial,sans-serif;color:#211d18">${marque}${corps}</div>`;
}