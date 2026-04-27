import { readFileSync, writeFileSync, existsSync } from 'fs';

export const CONFIG_FILE = './chat-config.json';
export const config = { ip: '192.168.18.9', porta: '8080' };

export function carregaConfig() {
    try {
        if (existsSync(CONFIG_FILE))
            Object.assign(config, JSON.parse(readFileSync(CONFIG_FILE, 'utf8')));
    } catch (_) {}
}

export function salvaConfig() {
    try { writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2)); } catch (_) {}
}