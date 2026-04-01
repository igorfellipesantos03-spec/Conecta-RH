/**
 * Session Store — Armazena tokens Protheus no servidor (memória).
 *
 * O token OAuth2 do Protheus retornado no login do usuário é guardado aqui,
 * associado ao username, com TTL de 15 minutos (alinhado ao JWT do ConectaRH).
 *
 * O Frontend NUNCA recebe o token real do Protheus — apenas o JWT próprio.
 * Quando o backend precisa fazer chamadas ao Protheus em nome do usuário,
 * ele recupera o token daqui via sessionStore.get(username).
 *
 * Nota: Em memória, ao reiniciar o servidor os tokens se perdem
 * e os usuários precisam relogar. Para produção com múltiplos processos,
 * considere migrar para Redis ou banco de dados.
 */

const TTL_MS = 15 * 60 * 1000; // 15 minutos

class SessionStore {
  constructor() {
    this._store = new Map();
  }

  /**
   * Armazena o token Protheus para um username.
   * Remove automaticamente após TTL_MS.
   */
  set(username, protheusToken) {
    // Limpa timer anterior se existir
    const existing = this._store.get(username);
    if (existing?.timer) clearTimeout(existing.timer);

    const timer = setTimeout(() => {
      this._store.delete(username);
      console.log(`[SessionStore] Token expirado e removido para: ${username}`);
    }, TTL_MS);

    this._store.set(username, { token: protheusToken, timer });
  }

  /**
   * Retorna o token Protheus armazenado ou null se não existir/expirou.
   */
  get(username) {
    const entry = this._store.get(username);
    return entry ? entry.token : null;
  }

  /**
   * Remove manualmente o token de um username (logout).
   */
  remove(username) {
    const entry = this._store.get(username);
    if (entry?.timer) clearTimeout(entry.timer);
    this._store.delete(username);
  }
}

module.exports = new SessionStore();
