import { carregaConfig } from './config.mjs';
import { conectar } from './network/socket.mjs';
import { telaInicial } from './screens.mjs';
import { C } from './ui/terminal.mjs';

async function init() {
    carregaConfig();
    try { await conectar(); } catch (_) {}
    await telaInicial();
}

process.on('SIGINT', () => {
    console.log('\n' + C.gray + '  Saindo...' + C.reset);
    process.exit(0);
});

init();