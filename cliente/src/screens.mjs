import readline from 'readline';
import { WebSocket } from 'ws';
import { state, contatos, conversas } from './state.mjs';
import { config, salvaConfig } from './config.mjs';
import { sleep } from './utils.mjs';
import { conectar, enviar, enviarAguardar, proximoMsgId } from './network/socket.mjs';
import { C, limpa, cabecalho, rodape, ok, falha, info } from './ui/terminal.mjs';
import { formataNumeroBR, normalizaNumero, formataTempo } from './ui/format.mjs';
import { rl, pergunta, inputNumero } from './ui/input.mjs';
import { renderizaChat, redesenhaChat } from './ui/chat.mjs';

// ── TELA INICIAL ──────────────────────────────────────────────────────────────
export async function telaInicial() {
    limpa();
    state.usuario = null;
    state.chatAberto = null;
    cabecalho('WhatsApp CLI  ·  Sistema de Mensagens');
    console.log();
    console.log(`  ${C.gray}Servidor: ${C.teal}${config.ip}:${config.porta}  ${state.ws ? C.green + '● Conectado' : C.red + '● Desconectado'}${C.reset}`);
    console.log();
    console.log(`  ${C.bold}1.${C.reset}  Login`);
    console.log(`  ${C.bold}2.${C.reset}  Cadastro`);
    console.log(`  ${C.bold}3.${C.reset}  Configurações`);
    console.log(`  ${C.bold}4.${C.reset}  Sair`);
    rodape();
    const op = (await pergunta('  Escolha: ')).trim();
    switch (op) {
        case '1': return telaLogin();
        case '2': return telaCadastro();
        case '3': return telaConfiguracoes();
        case '4': process.exit(0); break;
        default:  return telaInicial();
    }
}

// ── CONFIGURAÇÕES ─────────────────────────────────────────────────────────────
async function telaConfiguracoes() {
    limpa();
    cabecalho('Configurações  ·  Servidor');
    console.log();
    console.log(`  ${C.gray}IP atual   : ${C.teal}${config.ip}${C.reset}`);
    console.log(`  ${C.gray}Porta atual: ${C.teal}${config.porta}${C.reset}`);
    console.log();
    const novoIp    = (await pergunta('  Novo IP    (Enter para manter): ')).trim();
    const novaPorta = (await pergunta('  Nova Porta (Enter para manter): ')).trim();
    if (novoIp)    config.ip    = novoIp;
    if (novaPorta) config.porta = novaPorta;
    salvaConfig();
    info('Tentando conectar...');
    try {
        if (state.ws) state.ws.close();
        await conectar();
        ok(`Conectado a ${config.ip}:${config.porta}`);
    } catch (e) {
        falha(`Não foi possível conectar: ${e.message}`);
    }
    await pergunta('\n  Pressione Enter para voltar...');
    return telaInicial();
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
async function telaLogin() {
    limpa();
    cabecalho('Login');
    console.log();

    if (!state.ws || state.ws.readyState !== WebSocket.OPEN) {
        info(`Reconectando a ${config.ip}:${config.porta}...`);
        try {
            await conectar();
            ok('Conexão restabelecida.');
            await sleep(600);
            limpa();
            cabecalho('Login');
            console.log();
        } catch (e) {
            falha(`Não foi possível conectar: ${e.message}`);
            falha('Configure o servidor na opção 3 da tela inicial.');
            await pergunta('  Enter para voltar...');
            return telaInicial();
        }
    }

    console.log(`  ${C.gray}Formato: 55 22 90000-0000 (código do país + DDD + número)${C.reset}`);
    console.log();
    const numeroRaw = await inputNumero('  + ');
    const numero    = normalizaNumero(numeroRaw);

    try {
        const resp = await enviarAguardar({ tipo: 'login', msgId: proximoMsgId(), numero });
        state.usuario = resp.usuario;

        for (const c of (resp.contatos ?? [])) {
            const num = typeof c === 'string' ? c : c.numero;
            contatos.set(num, {
                nome:           typeof c === 'string' ? num   : (c.nome           ?? num),
                apelido:        typeof c === 'string' ? ''    : (c.apelido        ?? ''),
                online:         typeof c === 'string' ? false : (c.online         ?? false),
                vistoPorUltimo: typeof c === 'string' ? null  : (c.vistoPorUltimo ?? null),
            });
            conversas.set(num,[]);
        }

        for (const msg of (resp.mensagens ?? [])) {
            const outro = msg.remetente === state.usuario.numero ? msg.destinatario : msg.remetente;
            if (!conversas.has(outro)) conversas.set(outro, []);
            conversas.get(outro).push(msg);

            if (msg.destinatario === state.usuario.numero && msg.status === 'enviado') {
                enviar({ tipo: 'confirmacao_de_recebido', msgId: msg.id });
                msg.status = 'entregue';
            }
        }

        ok(`Bem-vindo, ${state.usuario.nome}!`);
        await sleep(800);
        return telaMenu();
    } catch (e) {
        falha(e.message);
        await pergunta('  Enter para voltar...');
        return telaInicial();
    }
}

// ── CADASTRO ──────────────────────────────────────────────────────────────────
async function telaCadastro() {
    limpa();
    cabecalho('Cadastro');
    console.log();
    console.log(`  ${C.gray}Formato: 55 22 90000-0000${C.reset}`);
    console.log();

    if (!state.ws || state.ws.readyState !== WebSocket.OPEN) {
        info(`Reconectando a ${config.ip}:${config.porta}...`);
        try {
            await conectar();
            ok('Conexão restabelecida.');
            await sleep(400);
        } catch (e) {
            falha(`Não foi possível conectar: ${e.message}`);
            await pergunta('  Enter para voltar...');
            return telaInicial();
        }
    }

    const numeroRaw = await inputNumero('  + ');
    const numero    = normalizaNumero(numeroRaw);
    const nome      = (await pergunta('  Nome completo : ')).trim();
    const apelido   = (await pergunta('  Apelido       : ')).trim();

    try {
        const resp = await enviarAguardar({ tipo: 'cadastro', msgId: proximoMsgId(), numero, nome, apelido });
        ok(resp.mensagem);
    } catch (e) {
        falha(e.message);
    }

    await pergunta('  Enter para voltar...');
    return telaInicial();
}

// ── MENU ──────────────────────────────────────────────────────────────────────
async function telaMenu() {
    limpa();
    cabecalho(`Menu  ·  ${state.usuario.nome} (${formataNumeroBR(state.usuario.numero)})`);
    console.log();
    console.log(`  ${C.bold}1.${C.reset}  Logout`);
    console.log(`  ${C.bold}2.${C.reset}  Ver Conversas`);
    console.log(`  ${C.bold}3.${C.reset}  Ver Contatos`);
    console.log(`  ${C.bold}4.${C.reset}  Perfil`);
    console.log(`  ${C.bold}5.${C.reset}  Sair`);
    rodape();
    const op = (await pergunta('  Escolha: ')).trim();
    switch (op) {
        case '1': return logout();
        case '2': return telaConversas();
        case '3': return telaContatos();
        case '4': return telaPerfil();
        case '5': process.exit(0); break;
        default:  return telaMenu();
    }
}

async function logout() {
    contatos.clear();
    conversas.clear();
    if (state.ws && state.ws.readyState === WebSocket.OPEN) state.ws.close();
    state.ws = null;
    await conectar();
    return telaInicial();
}

async function telaPerfil() {
    limpa();
    cabecalho('Meu Perfil');
    console.log();
    console.log(`  ${C.bold}Nome   :${C.reset} ${state.usuario.nome}`);
    console.log(`  ${C.bold}Apelido:${C.reset} ${state.usuario.apelido}`);
    console.log(`  ${C.bold}Número :${C.reset} ${formataNumeroBR(state.usuario.numero)}`);
    console.log();
    rodape();
    await pergunta('  Enter para voltar...');
    return telaMenu();
}

// ── CONVERSAS ─────────────────────────────────────────────────────────────────
async function telaConversas() {
    limpa();
    cabecalho('Conversas');
    console.log();

    const lista = [...conversas.keys()].map(num => {
        const c       = contatos.get(num) ?? { nome: num, online: false };
        const msgs    = conversas.get(num) ?? [];
        const ultima  = msgs[msgs.length - 1];
        const preview = ultima
            ? ultima.texto.substring(0, 28) + (ultima.texto.length > 28 ? '...' : '')
            : '';
        const naolidas = msgs.filter(m => m.remetente !== state.usuario.numero && m.status !== 'lido').length;
        return { num, c, preview, ultima, naolidas };
    });

    if (lista.length === 0) info('Nenhuma conversa ainda.');

    lista.forEach(({ num, c, preview, ultima, naolidas }, i) => {
        
        const badge   = naolidas > 0 ? C.teal + ` [${naolidas}]` + C.reset : '';
        const horaMsg = ultima ? C.gray + formataTempo(ultima.time) + C.reset : '';
        console.log(
            `  ${C.bold}${i + 1}.${C.reset}  ${C.white}${c.nome}${C.reset} ${C.gray}(${formataNumeroBR(num)})${C.reset}` +
            `  ──  ${badge}`
        );
        if (preview) console.log(`       ${C.dim}${preview}${C.reset}  ${horaMsg}`);
        console.log();
    });

    rodape();
    console.log(`  ${C.gray}0. Voltar${C.reset}`);
    console.log();
    const op = (await pergunta('  Escolha: ')).trim();
    if (op === '0' || op === '') return telaMenu();
    const idx = parseInt(op) - 1;
    if (idx >= 0 && idx < lista.length){
        enviar({ tipo: 'pergunta_se_esta_online', numero: lista[idx].num});
        return telaChat(lista[idx].num);
    } 
    return telaConversas();
}

// ── CONTATOS ──────────────────────────────────────────────────────────────────
async function telaContatos() {
    limpa();
    cabecalho('Contatos');
    console.log();

    const lista = [...contatos.keys()];
    if (lista.length === 0) info('Nenhum contato ainda.');

    lista.forEach((num, i) => {
        const c = contatos.get(num);
        console.log(`  ${C.bold}${i + 1}.${C.reset}  ${C.white}${c.nome}${C.reset}  ${C.gray}(${formataNumeroBR(num)})${C.reset}`);
    });

    console.log();
    console.log(`  ${C.bold}${lista.length + 1}.${C.reset}  ${C.teal}Adicionar contato${C.reset}`);
    rodape();
    console.log(`  ${C.gray}0. Voltar${C.reset}`);
    console.log();
    const op = (await pergunta('  Escolha: ')).trim();
    if (op === '0' || op === '') return telaMenu();
    const idx = parseInt(op) - 1;
    if (idx === lista.length) return telaAdicionarContato();
    if (idx >= 0 && idx < lista.length) {
        //Pergunto para o servidor se o contato está online
        return telaChat(lista[idx]);
    }
    return telaContatos();
}

async function telaAdicionarContato() {
    limpa();
    cabecalho('Adicionar Contato');
    console.log();
    console.log(`  ${C.gray}Formato: 55 22 90000-0000${C.reset}`);
    console.log();
    const numeroRaw = await inputNumero('  + ');
    const numero    = normalizaNumero(numeroRaw);

    if (numero === state.usuario.numero) {
        falha('Esse é o seu próprio número!');
        await pergunta('  Enter para voltar...');
        return telaContatos();
    }

    try {
        const resp = await enviarAguardar({ tipo: 'buscar_usuario', msgId: proximoMsgId(), numero });
        ok(`Encontrado: ${resp.nome} (${resp.apelido})`);
        contatos.set(numero, { nome: resp.nome, apelido: resp.apelido, online: resp.online ?? false });
        if (!conversas.has(numero)) conversas.set(numero, []);
    } catch (e) {
        falha(e.message);
    }

    await pergunta('  Enter para voltar...');
    return telaContatos();
}

// ── CHAT ──────────────────────────────────────────────────────────────────────
async function telaChat(numero) {
    state.chatAberto = numero;
    if (!contatos.has(numero)) contatos.set(numero, { nome: numero, apelido: '', online: false });

    const msgs = conversas.get(numero) ?? [];
    for (const msg of msgs) {
        const msgIdServidor = msg.msgIdServidor ?? msg.id;
        if (msg.remetente !== state.usuario.numero && msg.status !== 'lido' && msgIdServidor) {
            enviar({ tipo: 'confirmacao_de_leitura', msgId: msgIdServidor });
            msg.status = 'lido';
        }
    }

    renderizaChat(numero);
    state.chatBuffer = '';
    state.chatCursor = 0;

    await new Promise((resolveChat) => {
        const enviarMensagem = async () => {
            const texto = state.chatBuffer.trim();
            state.chatBuffer = '';
            state.chatCursor = 0;

            if (!texto) {
                process.stdin.setRawMode(false);
                process.stdin.removeListener('data', onData);
                if (onData._restore) onData._restore();
                rl.resume();
                state.chatAberto = null;
                resolveChat();
                return;
            }

            const msgId    = proximoMsgId();
            const msgLocal = {
                msgIdServidor: null,
                remetente:     state.usuario.numero,
                texto,
                status:        'enviando...',
                time:          new Date().toISOString(),
            };

            console.log(conversas.get(numero));
            conversas.get(numero).push(msgLocal);
            redesenhaChat(numero, state.chatBuffer, state.chatCursor);

            try {
                const resp = await enviarAguardar({ tipo: 'envio_de_mensagem', msgId, destinatario: numero, texto });
                msgLocal.msgIdServidor = resp.msgIdServidor;
                msgLocal.status        = resp.status;
            } catch (_) {
                msgLocal.status = 'erro';
            }

            redesenhaChat(numero, state.chatBuffer, state.chatCursor);
        };

        const onData = (chunk) => {
            const key = chunk.toString();

            if (key === '\r' || key === '\n') {
                process.stdout.write('\n');
                if (!state.chatBuffer.trim()) {
                    process.stdin.setRawMode(false);
                    process.stdin.removeListener('data', onData);
                    if (onData._restore) onData._restore();
                    rl.resume();
                    state.chatBuffer = '';
                    state.chatCursor = 0;
                    state.chatAberto = null;
                    resolveChat();
                } else {
                    enviarMensagem();
                }
                return;
            }

            if (key === '\x03') { process.exit(); }

            if (key === '\x7f' || key === '\b') {
                if (state.chatCursor > 0) {
                    state.chatBuffer = state.chatBuffer.slice(0, state.chatCursor - 1) + state.chatBuffer.slice(state.chatCursor);
                    state.chatCursor--;
                    readline.moveCursor(process.stdout, -1, 0);
                    readline.clearLine(process.stdout, 1);
                    process.stdout.write(state.chatBuffer.slice(state.chatCursor));
                    if (state.chatBuffer.length > state.chatCursor)
                        readline.moveCursor(process.stdout, -(state.chatBuffer.length - state.chatCursor), 0);
                }
                return;
            }

            if (key === '\x1b[D') { if (state.chatCursor > 0)                    { state.chatCursor--; readline.moveCursor(process.stdout, -1, 0); } return; }
            if (key === '\x1b[C') { if (state.chatCursor < state.chatBuffer.length) { state.chatCursor++; readline.moveCursor(process.stdout,  1, 0); } return; }
            if (key.startsWith('\x1b')) return;

            state.chatBuffer = state.chatBuffer.slice(0, state.chatCursor) + key + state.chatBuffer.slice(state.chatCursor);
            state.chatCursor++;
            process.stdout.write(key);
            if (state.chatCursor < state.chatBuffer.length) {
                process.stdout.write(state.chatBuffer.slice(state.chatCursor));
                readline.moveCursor(process.stdout, -(state.chatBuffer.length - state.chatCursor), 0);
            }
        };

        rl.pause();
        rl.removeAllListeners('line');
        const _savedOutput = rl.output;
        rl.output = { write: () => {}, end: () => {} };

        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on('data', onData);
        process.stdout.write(C.bold + '  Você: ' + C.reset);

        const _restoreRl = () => { rl.output = _savedOutput; };
        process.stdin.once('_restoreRl', _restoreRl);
        onData._restore = _restoreRl;
    });

    return telaConversas();
}