// Metro doesn't tree-shake Phosphor's ~1,500 icons, so point each import at its own file.
function phosphorIconImports({ types: t }) {
  return {
    visitor: {
      ImportDeclaration(path) {
        const { node } = path;
        if (node.source.value !== 'phosphor-react-native' || node.importKind === 'type') return;
        const icons = node.specifiers.filter(
          (s) =>
            t.isImportSpecifier(s) && s.importKind !== 'type' && s.imported.name !== 'IconContext',
        );
        if (icons.length === 0) return;
        path.insertAfter(
          icons.map((s) =>
            t.importDeclaration(
              [s],
              t.stringLiteral(
                `phosphor-react-native/src/icons/${s.imported.name.replace(/Icon$/, '')}`,
              ),
            ),
          ),
        );
        node.specifiers = node.specifiers.filter((s) => !icons.includes(s));
        if (node.specifiers.length === 0) path.remove();
      },
    },
  };
}

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Lets the app import Drizzle's generated .sql migrations as strings.
      ['inline-import', { extensions: ['.sql'] }],
      phosphorIconImports,
    ],
  };
};
