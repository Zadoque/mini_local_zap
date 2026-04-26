import readline from 'readline';
import { state, contatos, conversas } from '../state.mjs';
import { C, limpa, cabecalho, rodape } from './terminal.mjs';
import { formataTempo, formataData, iconeStatus } from './format.mjs';

export function renderizaChat(numero) {
    const contato  = contatos.get(numero);
    const nome     = contato?.nome ?? numero;
    const msgs     = conversas.get(numero) ?? [];
    const statusLn = contato?.online
        ? C.green + 'Online' + C.reset
        : C.gray  + (contato?.vistoPorUltimo ? 'Visto ' + formataTempo(contato.vistoPorUltimo) : 'Offline') + C.reset;

    cabecalho(`💬  ${nome}  |  ${statusLn}`);
    console.log();

    let ultimaData = '';
    for (const msg of msgs) {
        const dataMsg = formataData(msg.time);
        if (dataMsg !== ultimaData) {
            console.log(C.gray + '  ┄┄┄  ' + dataMsg + '  ┄┄┄' + C.reset);
            ultimaData = dataMsg;
        }
        const sou  = msg.remetente === state.usuario.numero;
        const hora = formataTempo(msg.time);
        const icon = sou ? iconeStatus(msg.status) : '';

        if (sou) {
            const linhaTxt = `${C.teal}${msg.texto}${C.reset}  ${icon} ${C.gray}${hora}${C.reset}`;
            console.log('  ' + ' '.repeat(Math.max(0, 58 - msg.texto.length)) + linhaTxt);
        } else {
            console.log(`  ${C.white}${msg.texto}${C.reset}  ${C.gray}${hora}${C.reset}`);
        }
    }

    console.log();
    rodape();
    console.log(C.gray + '  (deixe vazio e pressione Enter para voltar)' + C.reset);
}

export function redesenhaChat(numero, bufferAtual, cursorPos) {
    bufferAtual = bufferAtual ?? '';
    cursorPos   = cursorPos   ?? bufferAtual.length;

    limpa();
    renderizaChat(numero);
    process.stdout.write(C.bold + '  Você: ' + C.reset + bufferAtual);

    const mover = bufferAtual.length - cursorPos;
    if (mover > 0) readline.moveCursor(process.stdout, -mover, 0);
}