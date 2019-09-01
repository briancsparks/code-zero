
const vscode  = require('vscode');
// const _       = require('underscore');
// const util    = require('util');

module.exports.findRaInvoke = function () {

  const editor    = vscode.window.activeTextEditor;
  const selection = editor && editor.selection;
  const document  = editor && editor.document;
  if (!editor || !selection || !document) {
    return;
  }

  const filename  = document.fileName;
  const cursorPos = selection.start.line;

  const fullText  = document.getText();
  const lines     = fullText.split("\n");

  // mod.async(DIAG.async({lambdaDeploy: async function(argv, context) {

  var prevFoundLineNum = 0;
  var currFoundLineNum = 0, currFnName;
  var foundLineNum,         fnName;

  var m;
  var lineNum;
  for (lineNum = 0; lineNum < lines.length; ++lineNum) {
    const line = lines[lineNum];

    if (line.match(/argv\s*,\s*context/i)) {
      // console.log(`Found at ${lineNum}: ${line}`);

      if ((m = line.match(/(\w+)\s*:\s*([a-z]+)?\s+function/i))) {
        // console.log(`Found at ${lineNum}`, util.inspect({m}));

        // Found a run-anywhere function, but if we haven't seen the cursor, it might not be the right one.
        prevFoundLineNum  = currFoundLineNum;
        currFoundLineNum  = lineNum;
        currFnName        = m[1];

        if (lineNum >= cursorPos) {
          // This is it!
          foundLineNum  = currFoundLineNum;
          fnName        = currFnName;

          break;
        }
      }
    }

    if (lineNum >= cursorPos) {
      // This is it, only if we have seen a function
      if (currFnName) {
        foundLineNum  = currFoundLineNum;
        fnName        = currFnName;

        break;
      }
    }
  }

  // console.log(`Found`, util.inspect({currFoundLineNum, currFnName, foundLineNum, fnName}));

  var   testParams = [];
  for (lineNum = foundLineNum; lineNum > prevFoundLineNum; --lineNum) {
    const line = lines[lineNum];
    if ((m = line.match(/test_params\s*:\s*(.*)$/i))) {
      testParams.push(m[1].split(/\s+/g));
    }
  }

  // console.log(`Found`, util.inspect({testParams}));

  var out = 'BCS Code-Zero! ' + `ra invoke ${filename} ${fnName} ${testParams[0].map(p => '"'+p+'"').join(' ')}`;

  console.log(out);
  vscode.window.showInformationMessage(out);
};
