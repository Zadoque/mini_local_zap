import readline from 'readline';
import { C } from './terminal.mjs';
import { formataNumeroDigitando } from './format.mjs';

export const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

export function pergunta(prompt) {
    return new Promise(resolve => {
        if (process.stdin.isTTY) process.stdin.setRawMode(false);
        process.stdin.resume();
        rl.question(prompt, resolve);
    });
}

export function inputNumero(prompt) {
    return new Promise(resolve => {
        process.stdout.write(prompt);
        let buffer = '';

        const handler = (chunk) => {
            const key = chunk.toString();
            if (key === '\r' || key === '\n') {
                process.stdin.setRawMode(false);
                process.stdin.removeListener('data', handler);
                process.stdin.pause();
                rl.resume();
                console.log();
                resolve(buffer);
                return;
            }
            if (key === '\x7f' || key === '\b') {
                if (buffer.length > 0) buffer = buffer.slice(0, -1);
            } else if (key >= '0' && key <= '9') {
                buffer += key;
            }
            const formatado = formataNumeroDigitando(buffer);
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            process.stdout.write(prompt + C.teal + formatado + C.reset);
        };

        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on('data', handler);
    });
}