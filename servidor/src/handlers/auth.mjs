import { clientesAtivos } from '../state.mjs';
import { dbRun, dbGet, dbAll } from '../db/helpers.mjs';
import { SQL } from '../db/queries.mjs';
import { enviar, erro } from '../utils/comms.mjs';

export async function handleLogin(cliente, dados) {
    const { numero, msgId } = dados;

    const usuario = await dbGet(SQL.userFind, [numero]);
    if (!usuario) {
        return erro(cliente, msgId, 'usuario_nao_encontrado',
            'Número não cadastrado. Por favor, faça o cadastro primeiro.');
    }

    if (clientesAtivos.has(numero)) {
        return erro(cliente, msgId, 'ja_conectado',
            'Esse número já está conectado em outro dispositivo. Faça logout lá primeiro.');
    }

    cliente.numeroDoCliente = numero;
    clientesAtivos.set(numero, cliente);
    await dbRun(SQL.updateOnline, [1, numero]);

    const conversas = await dbAll(SQL.searchContacts, [numero, numero]);
    const mensagens = await dbAll(SQL.historico, [numero, numero]);
    const contatos  = conversas.map(c => c.numero1 === numero ? c.numero2 : c.numero1);

    contatos.forEach(contato => {
        const conexaoContato = clientesAtivos.get(contato);
        if (conexaoContato) enviar(conexaoContato, { tipo: 'contato_online', numero });
    });

    const contatosEnriquecidos = await Promise.all(contatos.map(async (num) => {
        const info  = await dbGet(SQL.userFind, [num]) ?? {};
        const visto = await dbGet(`SELECT vistoPorUltimo FROM Usuario WHERE numero = ?`, [num]);
        return {
            numero:         num,
            nome:           info.nome    ?? num,
            apelido:        info.apelido ?? '',
            online:         clientesAtivos.has(num),
            vistoPorUltimo: clientesAtivos.has(num) ? null : (visto?.vistoPorUltimo ?? null),
        };
    }));

    enviar(cliente, { tipo: 'sucesso_login', msgId, usuario, contatos: contatosEnriquecidos, mensagens });
    console.log(`[+] ${usuario.nome} (${numero}) conectou.`);
}

export async function handleCadastro(cliente, dados) {
    const { numero, nome, apelido, msgId } = dados;

    const jaExiste = await dbGet(SQL.userFind, [numero]);
    if (jaExiste) {
        return erro(cliente, msgId, 'numero_ja_cadastrado',
            'Número já cadastrado. Por favor, faça login.');
    }

    await dbRun(SQL.userCreate, [numero, nome, apelido]);
    enviar(cliente, { tipo: 'sucesso_cadastro', msgId, mensagem: `Usuário ${nome} cadastrado com sucesso!` });
    console.log(`[+] Cadastro: ${nome} (${numero})`);
}