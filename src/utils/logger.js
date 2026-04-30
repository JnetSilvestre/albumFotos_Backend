const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../../errors.log');

/**
 * Registra erros no arquivo errors.log no formato:
 * [data ISO] nome_erro: mensagem
 * Stack: stack
 * ---
 * @param {Error} error
 */
function logError(error) {
  try {
    const timestamp = new Date().toISOString();
    const nomeErro = error && error.name ? error.name : 'Erro';
    const mensagem = error && error.message ? error.message : 'Erro sem mensagem';
    const stack = error && error.stack ? error.stack : 'Stack não disponível';

    const linhaLog =
      `[${timestamp}] ${nomeErro}: ${mensagem}\n` +
      `Stack: ${stack}\n` +
      `---\n`;

    fs.appendFileSync(logFilePath, linhaLog, 'utf8');
  } catch (logErr) {

    console.error('Falha ao gravar no arquivo de log:', logErr.message);
  }
}

module.exports = { logError };
