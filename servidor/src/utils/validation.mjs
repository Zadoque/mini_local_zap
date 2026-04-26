export const camposObrigatorios = {
    login:                   ['numero'],
    cadastro:                ['numero', 'nome', 'apelido'],
    envio_de_mensagem:       ['msgId', 'destinatario', 'texto'],
    confirmacao_de_recebido: ['msgId'],
    confirmacao_de_leitura:  ['msgId'],
    buscar_usuario:          ['numero'],
};

export function validaCampos(dados) {
    const campos = camposObrigatorios[dados.tipo];
    if (!campos) return 'tipo_desconhecido';
    for (const campo of campos) {
        const val = dados[campo];
        if (val === undefined || val === null || val === '') return campo;
    }
    return null;
}