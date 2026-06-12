const db = require  ('../db');

const Usuario ={
   
    buscarPorEmail: async (email) => {
        
        const [linhas] = await db.query('SELECT * FROM administrador WHERE email = ?', [email]);
        return linhas[0]; 
    },

    criar: async (dados) => {
        const { nome, email, senha, cargo } = dados;
        const sql = "INSERT INTO administrador (nome, email, senha, cargo) VALUES (?, ?, ?, ?)";
        const valores = [nome, email, senha, cargo];
        
        
        return await db.query(sql, valores);


    }
  
};
  module.exports = Usuario;