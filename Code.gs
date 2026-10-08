/**
 * Backend do app de Registro de Ponto.
 * Cole este código em Extensões > Apps Script da sua planilha Google,
 * substituindo o conteúdo do arquivo Code.gs que vier por padrão.
 *
 * Depois de colar, vá em "Implantar" > "Gerenciar implantações" > ícone de lápis
 * na implantação existente > "Nova versão" > "Implantar", para que a mudança
 * entre em vigor na mesma URL que você já está usando.
 *
 * Tudo passa por GET (leitura e escrita) para evitar um bloqueio de CORS
 * conhecido do Apps Script quando o POST é chamado de outro site.
 */

var SHEET_NAME = 'Pontos';
var TOKEN = 'M7TMhdj41YvLfFiszlmNAmeq'; // chave simples para evitar acesso de estranhos

function doGet(e) {
  if (!e || e.parameter.token !== TOKEN) {
    return jsonOutput({ error: 'unauthorized' });
  }

  if (e.parameter.action === 'set') {
    return handleSet_(e.parameter);
  }

  return handleList_();
}

function handleList_() {
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

function handleSet_(params) {
  var date = params.date;
  var field = params.field;
  var time = params.time;

  if (!date || !field || !time) {
    return jsonOutput({ error: 'missing_fields' });
  }
  if (field !== 'entrada' && field !== 'saida') {
    return jsonOutput({ error: 'invalid_field' });
  }

  var sheet = getSheet_();
  var values = sheet.getDataRange().getValues();
  var rowIndex = -1;
  for (var i = 1; i < values.length; i++) {
    if (formatDateValue_(values[i][0]) === date) {
      rowIndex = i + 1; // linha real na planilha (1-indexed, +1 pelo cabeçalho)
      break;
    }
  }

  var col = field === 'entrada' ? 2 : 3;

  if (rowIndex === -1) {
    var newRow = [date, '', ''];
    newRow[col - 1] = time;
    sheet.appendRow(newRow);
  } else {
    sheet.getRange(rowIndex, col).setValue(time);
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
