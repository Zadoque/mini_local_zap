import { WebSocketServer } from 'ws';
import { processaMensagem } from './dispatcher.mjs';
import { handleDesconexao } from './handlers/users.mjs';
import { erro } from './utils/comms.mjs';

const ouvir = new WebSocketServer({ port: 8080 });
console.log('Servidor rodando em ws://0.0.0.0:8080');

ouvir.on('connection', (cliente) => {
    console.log('Novo cliente conectado.');

    cliente.on('message', (mensagemTexto) => {
        processaMensagem(cliente, mensagemTexto).catch((err) => {
            console.error('[ERRO INTERNO]', err.message);
            erro(cliente, null, 'erro_interno',
                'Ocorreu um erro interno no servidor. Tente novamente.');
        });
    });

    cliente.on('close', () => {
        if (!cliente.numeroDoCliente) return;
        handleDesconexao(cliente.numeroDoCliente).catch((err) => {
            console.error('[ERRO desconexao]', err.message);
        });
    });

    cliente.on('error', (err) => {
        console.error(
            `[ERRO websocket] ${cliente.numeroDoCliente ?? 'não autenticado'}:`,
            err.message
        );
    });
});

process.on('uncaughtException',  (err)    => console.error('[uncaughtException] Servidor mantido vivo:', err.message));
process.on('unhandledRejection', (reason) => console.error('[unhandledRejection] Servidor mantido vivo:', reason));