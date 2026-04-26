export const C = {
    reset:  '\x1b[0m',
    bold:   '\x1b[1m',
    dim:    '\x1b[2m',
    green:  '\x1b[32m',
    teal:   '\x1b[36m',
    yellow: '\x1b[33m',
    red:    '\x1b[31m',
    white:  '\x1b[37m',
    gray:   '\x1b[90m',
};

export function limpa() { process.stdout.write('\x1b[2J\x1b[H'); }
export function linha(char = '─', largura = 62) { return char.repeat(largura); }

export function cabecalho(titulo) {
    console.log();
    console.log(C.teal + '╔' + linha('═') + '╗' + C.reset);
    const pad = Math.max(0, 62 - titulo.length);
    const esq = Math.floor(pad / 2);
    const dir = pad - esq;
    console.log(C.teal + '║' + C.reset + ' '.repeat(esq) + C.bold + titulo + C.reset + ' '.repeat(dir) + C.teal + '║' + C.reset);
    console.log(C.teal + '╚' + linha('═') + '╝' + C.reset);
}

export function rodape() { console.log(C.gray + linha('─') + C.reset); }
export function ok(msg)    { console.log(C.green  + '  ✔  ' + C.reset + msg); }
export function falha(msg) { console.log(C.red    + '  ✘  ' + C.reset + msg); }
export function info(msg)  { console.log(C.yellow + '  ℹ  ' + C.reset + msg); }