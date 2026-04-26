import { WebSocket } from 'ws';

export function enviar(ws, obj) {
    try {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(obj));
        }
    } catch (e) {
        console.error('[enviar] Falha:', e.message);
    }
}

export function erro(ws, msgId, codigo, mensagem) {
    enviar(ws, { tipo: 'erro', msgId: msgId ?? null, codigo, mensagem });
}