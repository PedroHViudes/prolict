const Usuario = {
    buscarPorEmail: async (db, email) => {
        return await db
            .prepare('SELECT * FROM administrador WHERE email = ?')
            .bind(email)
            .first();
    },

    criar: async (db, dados) => {
        const { nome, email, senha, cargo } = dados;
        const sql = "INSERT INTO administrador (nome, email, senha, cargo) VALUES (?, ?, ?, ?)";
        return await db
            .prepare(sql)
            .bind(nome, email, senha, cargo)
            .run();
    }
};

export default Usuario;