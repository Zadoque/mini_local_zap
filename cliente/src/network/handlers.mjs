import { WebSocket } from 'ws';
import { state, contatos, conversas, pendentes } from '../state.mjs';
import { C } from '../ui/terminal.mjs';
import { redesenhaChat } from '../ui/chat.mjs';

// enviar() é definida localmente para evitar dependência circular com socket.mjs
function enviar(obj) {
    if (state.ws && state.ws.readyState === WebSocket.OPEN)
        state.ws.send(JSON.stringify(obj));
}

export function processaMensagemServidor(dados) {
    const { tipo, msgId } = dados;

    if (msgId && pendentes.has(msgId)) {
        const { resolve, reject } = pendentes.get(msgId);
        pendentes.delete(msgId);
        if (tipo === 'erro') reject(new Error(dados.mensagem));
        else                 resolve(dados);
        return;
    }

    switch (tipo) {
        case 'nova_mensagem': {
            const { msgIdServidor, remetente, texto, time } = dados;
            if (!conversas.has(remetente)) conversas.set(remetente, []);
            conversas.get(remetente).push({ msgIdServidor, remetente, texto, status: 'entregue', time });

            if (!contatos.has(remetente)) {
                contatos.set(remetente, { nome: remetente, apelido: '', online: true, vistoPorUltimo: null });
            } else {
                const c = contatos.get(remetente);
                c.online = true;
                c.vistoPorUltimo = null;
            }

            enviar({ tipo: 'confirmacao_de_recebido', msgId: msgIdServidor });

            if (state.chatAberto === remetente) {
                enviar({ tipo: 'confirmacao_de_leitura', msgId: msgIdServidor });
                redesenhaChat(remetente, state.chatBuffer, state.chatCursor);
            } else {
                const nome = contatos.get(remetente)?.nome ?? remetente;
                process.stdout.write(`\n${C.teal}  ◆ Nova mensagem de ${nome}${C.reset}\n`);
            }
            break;
        }

        case 'atualizacao_status': {
            for (const [, msgs] of conversas) {
                const msg = msgs.find(m => m.msgIdServidor === dados.msgId);
                if (msg) {
                    msg.status = dados.status;
                    if (state.chatAberto) redesenhaChat(state.chatAberto, state.chatBuffer, state.chatCursor);
                    break;
                }
            }
            break;
        }

        case 'contato_online': {
            const c = contatos.get(dados.numero);
            if (c) { c.online = true; c.vistoPorUltimo = null; }
            if (state.chatAberto === dados.numero)
                redesenhaChat(dados.numero, state.chatBuffer, state.chatCursor);
            break;
        }

        case 'contato_offline': {
            const c = contatos.get(dados.numero);
            if (c) { c.online = false; c.vistoPorUltimo = dados.vistoPorUltimo; }
            if (state.chatAberto === dados.numero)
                redesenhaChat(dados.numero, state.chatBuffer, state.chatCursor);
            break;
        }
    }
}