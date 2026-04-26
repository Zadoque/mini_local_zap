export const SQL = {
    userCreate:        `INSERT INTO Usuario (numero, nome, apelido, online) VALUES (?, ?, ?, 0)`,
    userFind:          `SELECT numero, nome, apelido FROM Usuario WHERE numero = ?`,
    updateOnline:      `UPDATE Usuario SET online = ? WHERE numero = ?`,
    updateVistoPorUlt: `UPDATE Usuario SET vistoPorUltimo = ? WHERE numero = ?`,
    searchContacts:    `SELECT numero1, numero2 FROM ConversaCom WHERE numero1 = ? OR numero2 = ?`,
    insertMsg:         `INSERT INTO Mensagem (msgIdCliente, texto, remetente, destinatario, status) VALUES (?, ?, ?, ?, 'enviado')`,
    findMsg:           `SELECT id, remetente, destinatario, status FROM Mensagem WHERE id = ?`,
    updateMsgStatus:   `UPDATE Mensagem SET status = ? WHERE id = ?`,
    historico:         `SELECT id, msgIdCliente, texto, remetente, destinatario, status, time
                        FROM Mensagem
                        WHERE remetente = ? OR destinatario = ?
                        ORDER BY time ASC`,
    conversaExiste:    `SELECT id FROM ConversaCom WHERE (numero1 = ? AND numero2 = ?) OR (numero1 = ? AND numero2 = ?)`,
    insertConversa:    `INSERT INTO ConversaCom (numero1, numero2) VALUES (?, ?)`,
    contatoExiste:     `SELECT id FROM ConversaCom WHERE (numero1 = ? AND numero2 = ?) OR (numero1 = ? AND numero2 = ?)`,
};