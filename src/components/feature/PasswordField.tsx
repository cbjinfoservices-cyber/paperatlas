import { useState } from 'react';
import { useLang } from '@/i18n/LangProvider';

type PasswordFieldProps = {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
};

/**
 * A password input with a small eye button: the same field, read in clear or
 * masked. The button never submits the form and announces its state to readers
 * who use a screen reader.
 */
export default function PasswordField({
  id,
  name,
  label,
  placeholder,
  autoComplete = 'new-password',
  required = false,
  minLength,
}: PasswordFieldProps) {
  const { t } = useLang();
  const [shown, setShown] = useState(false);
  const hint = shown ? t('acct.pwdHide') : t('acct.pwdShow');

  return (
    <div className="fld">
      <label htmlFor={id}>{label}</label>
      <div className="fld-pwd">
        <input
          id={id}
          name={name}
          type={shown ? 'text' : 'password'}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          placeholder={placeholder}
        />
        <button
          type="button"
          className="fld-pwd-eye"
          onClick={() => setShown((value) => !value)}
          aria-label={hint}
          aria-pressed={shown}
          title={hint}
        >
          <i className={shown ? 'ri-eye-off-line' : 'ri-eye-line'} aria-hidden="true"></i>
        </button>
      </div>
    </div>
  );
}