import sqlite3Pkg from 'sqlite3';

const sqlite3 = sqlite3Pkg.verbose();

export const db = new sqlite3.Database('./chat.db', (err) => {
    if (err) {
        console.error('Erro ao abrir o banco:', err.message);
        process.exit(1);
    }
    console.log('Conectado ao banco de dados SQLite.');
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS Usuario (
            numero          TEXT PRIMARY KEY,
            nome            TEXT NOT NULL,
            apelido         TEXT NOT NULL,
            online          BOOLEAN DEFAULT 0,
            vistoPorUltimo  TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS ConversaCom (
            id      INTEGER PRIMARY KEY AUTOINCREMENT,
            numero1 TEXT NOT NULL,
            numero2 TEXT NOT NULL,
            FOREIGN KEY (numero1) REFERENCES Usuario(numero),
            FOREIGN KEY (numero2) REFERENCES Usuario(numero)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS Mensagem (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            msgIdCliente TEXT,
            texto        TEXT NOT NULL,
            remetente    TEXT NOT NULL,
            destinatario TEXT NOT NULL,
            status       TEXT DEFAULT 'enviado',
            time         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (remetente)    REFERENCES Usuario(numero),
            FOREIGN KEY (destinatario) REFERENCES Usuario(numero)
        )`);
    });
});