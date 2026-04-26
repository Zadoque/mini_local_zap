import { C } from './terminal.mjs';

export function formataNumeroBR(num) {
    const s = num.replace(/\D/g, '');
    const m = s.match(/^(\d{2})(\d{2})(\d{1})(\d{4})(\d{4})$/);
    if (m) return `+${m[1]} ${m[2]} ${m[3]}${m[4]}-${m[5]}`;
    return '+' + s;
}

export function normalizaNumero(raw) { return '+' + raw.replace(/\D/g, ''); }

export function iconeStatus(status) {
    if (status === 'enviando...') return C.gray  + '…'  + C.reset;
    if (status === 'enviado')     return C.gray  + '✓'  + C.reset;
    if (status === 'entregue')    return C.gray  + '✓✓' + C.reset;
    if (status === 'lido')        return C.teal  + '✓✓' + C.reset;
    if (status === 'erro')        return C.red   + '✗'  + C.reset;
    return '';
}

export function formataTempo(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function formataData(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formataNumeroDigitando(digits) {
    let r = '';
    if (digits.length > 0) r += digits.substring(0, 2);
    if (digits.length > 2) r += ' ' + digits.substring(2, 4);
    if (digits.length > 4) r += ' ' + digits.substring(4, 9);
    if (digits.length > 9) r += '-' + digits.substring(9, 13);
    return r || '';
}