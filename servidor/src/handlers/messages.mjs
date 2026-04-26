import { clientesAtivos } from '../state.mjs';
import { dbRun, dbGet } from '../db/helpers.mjs';
import { SQL } from '../db/queries.mjs';
import { enviar, erro } from '../utils/comms.mjs';

export async function handleEnvioMensagem(cliente, dados) {
    if (!cliente.numeroDoCliente) {
        return erro(cliente, dados.msgId, 'nao_autenticado',
            'Você precisa fazer login antes de enviar mensagens.');
    }

    const { msgId, destinatario, texto } = dados;
    const remetente = cliente.numeroDoCliente;

    const destExiste = await dbGet(SQL.userFind, [destinatario]);
    if (!destExiste) {
        return erro(cliente, msgId, 'destinatario_nao_encontrado',
            `O número ${destinatario} não está cadastrado no sistema.`);
    }

    const result        = await dbRun(SQL.insertMsg, [msgId, texto, remetente, destinatario]);
    const msgIdServidor = result.lastID;

    enviar(cliente, { tipo: 'mensagem_confirmada', msgId, msgIdServidor, status: 'enviado' });

    const conversaExiste = await dbGet(SQL.conversaExiste, [remetente, destinatario, destinatario, remetente]);
    if (!conversaExiste) await dbRun(SQL.insertConversa, [remetente, destinatario]);

    const conexaoDest = clientesAtivos.get(destinatario);
    if (conexaoDest) {
        enviar(conexaoDest, {
            tipo: 'nova_mensagem', msgIdServidor, msgIdCliente: msgId,
            remetente, texto, time: new Date().toISOString(),
        });
    }
}

export async function handleConfirmacaoRecebido(cliente, dados) {
    const { msgId } = dados;

    const msg = await dbGet(SQL.findMsg, [msgId]);
    if (!msg) return erro(cliente, msgId, 'mensagem_nao_encontrada', `Mensagem id=${msgId} não encontrada.`);
    if (msg.status !== 'enviado') return; // Idempotente

    await dbRun(SQL.updateMsgStatus, ['entregue', msgId]);

    const conexaoRemetente = clientesAtivos.get(msg.remetente);
    if (conexaoRemetente) enviar(conexaoRemetente, { tipo: 'atualizacao_status', msgId, status: 'entregue' });
}

export async function handleConfirmacaoLeitura(cliente, dados) {
    const { msgId } = dados;

    const msg = await dbGet(SQL.findMsg, [msgId]);
    if (!msg) return erro(cliente, msgId, 'mensagem_nao_encontrada', `Mensagem id=${msgId} não encontrada.`);
    if (msg.status === 'lido') return; // Idempotente

    await dbRun(SQL.updateMsgStatus, ['lido', msgId]);

    const conexaoRemetente = clientesAtivos.get(msg.remetente);
    if (conexaoRemetente) enviar(conexaoRemetente, { tipo: 'atualizacao_status', msgId, status: 'lido' });
}