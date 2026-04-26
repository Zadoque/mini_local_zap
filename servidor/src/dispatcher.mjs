import { validaCampos } from './utils/validation.mjs';
import { erro } from './utils/comms.mjs';
import { handleLogin, handleCadastro } from './handlers/auth.mjs';
import { handleEnvioMensagem, handleConfirmacaoRecebido, handleConfirmacaoLeitura } from './handlers/messages.mjs';
import { handleBuscarUsuario } from './handlers/users.mjs';
import { onPerguntaSeTaOnline } from './handlers/on-offline_user.mjs';

export async function processaMensagem(cliente, mensagemTexto) {
    let dados;
    try {
        dados = JSON.parse(mensagemTexto);
    } catch (_) {
        const trecho = String(mensagemTexto).substring(0, 80);
        return erro(cliente, null, 'json_invalido',
            `Não foi possível interpretar a mensagem. Trecho: "${trecho}"`);
    }

    const campoFaltando = validaCampos(dados);
    if (campoFaltando === 'tipo_desconhecido') {
        return erro(cliente, dados.msgId ?? null, 'tipo_desconhecido',
            `Tipo "${dados.tipo}" não reconhecido pelo servidor.`);
    }
    if (campoFaltando) {
        return erro(cliente, dados.msgId ?? null, 'campo_ausente',
            `Campo obrigatório ausente ou vazio: "${campoFaltando}".`);
    }

    switch (dados.tipo) {
        case 'pergunta_se_esta_online': await onPerguntaSeTaOnline(cliente, dados);      break;
        case 'login':                   await handleLogin(cliente, dados);               break;
        case 'cadastro':                await handleCadastro(cliente, dados);            break;
        case 'envio_de_mensagem':       await handleEnvioMensagem(cliente, dados);       break;
        case 'confirmacao_de_recebido': await handleConfirmacaoRecebido(cliente, dados); break;
        case 'confirmacao_de_leitura':  await handleConfirmacaoLeitura(cliente, dados);  break;
        case 'buscar_usuario':          await handleBuscarUsuario(cliente, dados);       break;
    }
}