// Estado global como objeto mutável — ESM exporta live bindings de objetos,
// então qualquer módulo que importar `state` vê as mutações em tempo real.
export const state = {
    ws:         null,   // WebSocket ativo
    usuario:    null,   // { numero, nome, apelido }
    chatAberto: null,   // número do contato visível na tela de chat
    chatBuffer: '',     // texto sendo digitado no raw mode
    chatCursor: 0,      // posição do cursor no chatBuffer
    msgCounter: 0,
};

export const contatos  = new Map(); // numero → { nome, apelido, online, vistoPorUltimo }
export const conversas = new Map(); // numero → [{ msgIdServidor, remetente, texto, status, time }]
export const pendentes = new Map(); // msgIdCliente → { resolve, reject }