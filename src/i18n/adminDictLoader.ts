import { dict, type Lang } from './dict';
import { adminDict } from './dict.admin';
import { relectureDict } from './dict.relecture';

/**
 * Importé en premier par la console admin : fusionne ses textes dans le
 * dictionnaire partagé avant que ses écrans ne s'affichent. Les autres pages
 * ne le chargent jamais.
 */
for (const lang of Object.keys(dict) as Lang[]) {
  Object.assign(dict[lang], adminDict[lang], relectureDict[lang]);
}
