import { WebSocket } from 'ws';
import { state, pendentes } from '../state.mjs';
import { config } from '../config.mjs';
import { C, linha } from '../ui/terminal.mjs';
import { processaMensagemServidor } from './handlers.mjs';

export function proximoMsgId() { return `msg_${++state.msgCounter}`; }

export function enviar(obj) {
    if (state.ws && state.ws.readyState === WebSocket.OPEN)
        state.ws.send(JSON.stringify(obj));
}

export function enviarAguardar(obj, timeoutMs = 8000) {
    return new Promise((resolve, reject) => {
        const msgId = obj.msgId ?? proximoMsgId();
        obj.msgId = msgId;
        pendentes.set(msgId, { resolve, reject });
        enviar(obj);
        setTimeout(() => {
            if (pendentes.has(msgId)) {
                pendentes.delete(msgId);
                reject(new Error('Timeout: servidor não respondeu a tempo.'));
            }
        }, timeoutMs);
    });
}

export function conectar() {
    return new Promise((resolve, reject) => {
        const socket = new WebSocket(`ws://${config.ip}:${config.porta}`);
        socket.on('open',  () => { state.ws = socket; resolve(); });
        socket.on('error', (err) => reject(err));
        socket.on('message', (raw) => {
            let dados;
            try { dados = JSON.parse(raw); } catch (_) { return; }
            processaMensagemServidor(dados);
        });
        socket.on('close', () => {
            state.ws = null;
            if (state.usuario) {
                console.log('\n' + C.red + linha('─') + C.reset);
                console.log(C.red + '  Conexão com o servidor perdida.' + C.reset);
                console.log(C.red + linha('─') + C.reset);
            }
        });
    });
}