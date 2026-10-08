/**
 * Backend do app de Registro de Ponto.
 * Cole este código em Extensões > Apps Script da sua planilha Google,
 * substituindo o conteúdo do arquivo Code.gs que vier por padrão.
 *
 * Depois de colar, vá em "Implantar" > "Nova implantação" > tipo "App da Web":
 *   - Executar como: Eu (seu e-mail)
 *   - Quem pode acessar: Qualquer pessoa
 * Copie a URL gerada e me envie.
 */

var SHEET_NAME = 'Pontos';
var TOKEN = 'M7TMhdj41YvLfFiszlmNAmeq'; // chave simples para evitar acesso de estranhos

function doGet(e) {
  if (!e || e.parameter.token !== TOKEN) {
    return jsonOutput({ error: 'unauthorized' });
  }
  var sheet = getSheet_();
  var values = sheet.getDataRange().getValues();
  var rows = [];
  for (var i = 1; i < values.length; i++) {
    var r = values[i];
    if (!r[0]) continue;
    rows.push({
      date: formatDateValue_(r[0]),
      entrada: r[1] || '',
      saida: r[2] || ''
    });
  }
  return jsonOutput({ rows: rows });
}

function doPost(e) {
  var body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonOutput({ error: 'invalid_body' });
  }
  if (body.token !== TOKEN) {
    return jsonOutput({ error: 'unauthorized' });
  }
  if (!body.date || !body.field || !body.time) {
    return jsonOutput({ error: 'missing_fields' });
  }

  var sheet = getSheet_();
  var values = sheet.getDataRange().getValues();
  var rowIndex = -1;
  for (var i = 1; i < values.length; i++) {
    if (formatDateValue_(values[i][0]) === body.date) {
      rowIndex = i + 1; // linha real na planilha (1-indexed, +1 pelo cabeçalho)
      break;
    }
  }

  var col = body.field === 'entrada' ? 2 : 3;

  if (rowIndex === -1) {
    var newRow = [body.date, '', ''];
    newRow[col - 1] = body.time;
    sheet.appendRow(newRow);
  } else {
    sheet.getRange(rowIndex, col).setValue(body.time);
  }

  return jsonOutput({ ok: true });
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['data', 'entrada', 'saida']);
  }
  return sheet;
}

function formatDateValue_(v) {
  if (Object.prototype.toString.call(v) === '[object Date]') {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(v);
}

function jsonOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
