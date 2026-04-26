import { clientesAtivos } from "../state.mjs";
import { enviar } from '../utils/comms.mjs';
export async function onPerguntaSeTaOnline(cliente, dados) { //numero 1 perguntado se numero2 está online
    const contato_onlie = clientesAtivos.get(dados.numero) ? true : false;
    if(clientesAtivos.get(cliente.numeroDoCliente)){
        enviar(cliente,{tipo: contato_onlie? 'contato-online': 'contato-offline', numero: dados.numero});
    }
}