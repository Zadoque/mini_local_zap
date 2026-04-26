import { clientesAtivos } from '../state.mjs';
import { dbRun, dbGet, dbAll } from '../db/helpers.mjs';
import { SQL } from '../db/queries.mjs';
import { enviar, erro } from '../utils/comms.mjs';

export async function handleBuscarUsuario(cliente, dados) {
    const { numero, msgId } = dados;
    const solicitante = cliente.numeroDoCliente;

    const user = await dbGet(SQL.userFind, [numero]);
    if (!user) {
        return erro(cliente, msgId, 'usuario_nao_encontrado',
            `Nenhum usuário cadastrado com o número ${numero}.`);
    }

    const jaExiste = await dbGet(SQL.contatoExiste, [solicitante, numero, numero, solicitante]);
    if (!jaExiste) await dbRun(SQL.insertConversa, [solicitante, numero]);

    enviar(cliente, {
        tipo: 'sucesso_buscar_usuario', msgId,
        numero: user.numero, nome: user.nome, apelido: user.apelido,
        online: clientesAtivos.has(numero),
    });
}

export async function handleDesconexao(numeroSaindo) {
    clientesAtivos.delete(numeroSaindo);

    const agora = new Date().toISOString();
    await dbRun(SQL.updateOnline,      [0,     numeroSaindo]);
    await dbRun(SQL.updateVistoPorUlt, [agora, numeroSaindo]);

    const conversas = await dbAll(SQL.searchContacts, [numeroSaindo, numeroSaindo]);
    for (const conversa of conversas) {
        const numeroAmigo  = conversa.numero1 === numeroSaindo ? conversa.numero2 : conversa.numero1;
        const conexaoAmigo = clientesAtivos.get(numeroAmigo);
        if (conexaoAmigo) {
            enviar(conexaoAmigo, { tipo: 'contato_offline', numero: numeroSaindo, vistoPorUltimo: agora });
        }
    }

    console.log(`[-] ${numeroSaindo} desconectou.`);
}