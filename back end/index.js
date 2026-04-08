const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const Usuario = require('./models/Usuario');

const app = express();

app.use(cors());
app.use(express.json());

app.post('/cadastro', async (req, res) => {
    console.log("Dados recebidos:", req.body);
    const { nome, empresa, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ mensagem: "Dados obrigatórios faltando." });
    }

    try {
        const usuarioexistente = await Usuario.buscarPorEmail(email);

        if (usuarioexistente) {
            return res.status(400).json({ mensagem: "Esse email já está sendo usado." })
        }

        const saltos = 10;
        const senhaCriptografada = await bcrypt.hash(senha, saltos);

        await Usuario.criar({
            nome,
            email,
            senha: senhaCriptografada,
            cargo: empresa, // Mapeando empresa da tela para cargo do banco
            
        });

        res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" });
    }
    catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: "Erro ao processar cadastro." });
    }

});
app.listen(3001, () => console.log("Backend organizado rodando na porta 3001"));