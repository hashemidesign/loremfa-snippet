const vscode = require('vscode');
const { generateText, parseAbbreviation } = require('./lib/loremfa');

function findAbbreviation(editor) {
  if (!editor || editor.selections.length !== 1 || !editor.selection.isEmpty) return;

  const cursor = editor.selection.active;
  const line = editor.document.lineAt(cursor.line).text;
  const abbreviation = parseAbbreviation(
    line.slice(0, cursor.character),
    line.slice(cursor.character)
  );
  if (!abbreviation) return;

  const start = cursor.translate(0, -abbreviation.length);
  return { ...abbreviation, range: new vscode.Range(start, cursor) };
}

function activate(context) {
  const updateContext = () => {
    void vscode.commands.executeCommand('setContext', 'loremfa.canExpand',
      Boolean(findAbbreviation(vscode.window.activeTextEditor)));
  };

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(updateContext),
    vscode.window.onDidChangeTextEditorSelection(updateContext),
    vscode.workspace.onDidChangeTextDocument(event => {
      if (event.document === vscode.window.activeTextEditor?.document) updateContext();
    }),
    vscode.commands.registerCommand('loremfa.expand', async () => {
      const editor = vscode.window.activeTextEditor;
      const match = findAbbreviation(editor);
      if (!match) return;
      await editor.edit(edit => edit.replace(match.range, generateText(match)));
    })
  );
  updateContext();
}

module.exports = { activate };
