const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const root = path.resolve(__dirname, '..', '..');
const output = path.join(__dirname, '..', 'src', 'directory-data.json');

function readLiteral(file, name, isLiteral) {
  const source = fs.readFileSync(path.join(root, 'src', 'lib', file), 'utf8');
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    const declaration = statement.declarationList.declarations.find(item => item.name.getText(sourceFile) === name);
    if (declaration?.initializer && isLiteral(declaration.initializer)) {
      return vm.runInNewContext(`(${declaration.initializer.getText(sourceFile)})`);
    }
  }
  throw new Error(`Données introuvables : ${file} (${name}).`);
}
const countries = readLiteral('pays.ts', 'paysArabes', ts.isArrayLiteralExpression).map(country => ({
  code: country.code, name: country.nom.fr,
}));
if (!countries.length || countries.some(country => !country.code || !country.name)) {
  throw new Error('Liste des pays invalide.');
}
const wilayas = readLiteral('regionGeo.ts', 'WILAYAS', ts.isObjectLiteralExpression);
fs.writeFileSync(output, JSON.stringify({ countries, wilayas }, null, 2) + '\n');
console.log(`${countries.length} pays et ${Object.keys(wilayas).length} wilayas synchronisés.`);
