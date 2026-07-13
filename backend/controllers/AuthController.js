const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
require('dotenv').config();

/**
 * Controller de Autenticação.
 * Gerencia as operações de login, cadastro, perfil e redefinição de senha.
 * O sistema é single-user por empresa: apenas um administrador por conta.
 */
const AuthController = {

    /**
     * Realiza o login do administrador.
     * Verifica e-mail e senha, gera um token JWT com validade de 8 horas.
     * O token é necessário para acessar as rotas protegidas do sistema.
     */
    login: async (req, res) => {
        const { email, senha } = req.body;

        // Validação: campos obrigatórios
        if (!email || !senha) {
            return res.status(400).json({ mensagem: "E-mail e senha são obrigatórios." });
        }

        try {
            // Busca o administrador pelo e-mail no banco de dados
            const usuario = await Usuario.buscarPorEmail(email);
            if (!usuario) {
                return res.status(401).json({ mensagem: "E-mail ou senha incorretos." });
            }

            // Compara a senha enviada com o hash salvo no banco using bcrypt
            const senhaValida = await bcrypt.compare(senha, usuario.senha);
            if (!senhaValida) {
                return res.status(401).json({ mensagem: "E-mail ou senha incorretos." });
            }

            // Gera o token JWT com as informações do usuário (id e nome)
            const token = jwt.sign(
                { id: usuario.id, nome: usuario.nome },
                process.env.JWT_SECRET,
                { expiresIn: '8h' } // Token expira em 8 horas por segurança
            );

            // Retorna sucesso com o token e dados básicos do usuário
            res.status(200).json({
                mensagem: "Login realizado com sucesso!",
                token: token,
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email
                }
            });

        } catch (erro) {
            console.error("Erro no login:", erro);
            res.status(500).json({ mensagem: "Erro interno no servidor ao tentar logar." });
        }
    },

    /**
     * Cadastra um novo administrador no sistema.
     * Verifica se o e-mail já está em uso antes de criar a conta.
     * A senha é criptografada com bcrypt (10 saltos) antes de salvar.
     */
    cadastrar: async (req, res) => {
        const { nome, email, senha } = req.body;

        // Validação: campos obrigatórios
        if (!nome || !email || !senha) {
            return res.status(400).json({ mensagem: "Dados obrigatórios faltando." });
        }

        try {
            // Verifica se já existe um administrador com este e-mail
            const usuarioExistente = await Usuario.buscarPorEmail(email);
            if (usuarioExistente) {
                return res.status(400).json({ mensagem: "Esse e-mail já está sendo usado." });
            }

            // Criptografa a senha com bcrypt (10 saltos de segurança)
            const saltos = 10;
            const senhaCriptografada = await bcrypt.hash(senha, saltos);

            // Insere o novo administrador no banco
            await Usuario.criar({
                nome,
                email,
                senha: senhaCriptografada
            });

            res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" });
        } catch (erro) {
            console.error(erro);
            res.status(500).json({ mensagem: "Erro ao processar cadastro." });
        }
    },

    /**
     * Retorna os dados do perfil do administrador logado.
     * Utiliza o ID extraído do token JWT pelo middleware de autenticação.
     */
    perfil: async (req, res) => {
        try {
            // req.usuario.id vem do token JWT decodificado pelo middleware
            const usuario = await Usuario.buscarPorId(req.usuario.id);
            
            if (!usuario) {
                return res.status(404).json({ mensagem: "Usuário não encontrado." });
            }

            res.status(200).json(usuario);
        } catch (erro) {
            console.error("Erro ao buscar perfil:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar dados do perfil." });
        }
    },

    /**
     * Atualiza os dados do perfil (nome e e-mail).
     * Requer autenticação via token JWT.
     */
    atualizarPerfil: async (req, res) => {
        const { nome, email } = req.body;

        if (!nome || !email) {
            return res.status(400).json({ mensagem: "Nome e e-mail são obrigatórios." });
        }

        try {
            // Verifica se o novo e-mail já está sendo usado por outro usuário
            const usuarioExistente = await Usuario.buscarPorEmail(email);
            if (usuarioExistente && usuarioExistente.id !== req.usuario.id) {
                return res.status(400).json({ mensagem: "Esse e-mail já está sendo usado por outra conta." });
            }

            await Usuario.atualizar(req.usuario.id, { nome, email });
            res.status(200).json({ mensagem: "Perfil atualizado com sucesso!" });
        } catch (erro) {
            console.error("Erro ao atualizar perfil:", erro);
            res.status(500).json({ mensagem: "Erro ao atualizar perfil." });
        }
    },

    /**
     * Atualiza a senha do administrador.
     * Requer a senha atual para confirmação de segurança.
     */
    atualizarSenha: async (req, res) => {
        const { senhaAtual, novaSenha } = req.body;

        if (!senhaAtual || !novaSenha) {
            return res.status(400).json({ mensagem: "Senha atual e nova senha são obrigatórias." });
        }

        try {
            // Busca o usuário para verificar a senha atual
            const usuario = await Usuario.buscarPorId(req.usuario.id);
            
            // Precisa buscar com a senha (o buscarPorId não retorna a senha)
            const [linhas] = await require('../db').query('SELECT senha FROM administrador WHERE id = ?', [req.usuario.id]);
            const usuarioCompleto = linhas[0];

            // Verifica se a senha atual está correta
            const senhaValida = await bcrypt.compare(senhaAtual, usuarioCompleto.senha);
            if (!senhaValida) {
                return res.status(401).json({ mensagem: "A senha atual está incorreta." });
            }

            // Criptografa e salva a nova senha
            const saltos = 10;
            const novaSenhaCriptografada = await bcrypt.hash(novaSenha, saltos);
            await Usuario.atualizarSenha(req.usuario.id, novaSenhaCriptografada);

            res.status(200).json({ mensagem: "Senha atualizada com sucesso!" });
        } catch (erro) {
            console.error("Erro ao atualizar senha:", erro);
            res.status(500).json({ mensagem: "Erro ao atualizar senha." });
        }
    },

    /**
     * Remove permanentemente a conta do administrador.
     * Esta ação é irreversível e todos os dados serão excluídos.
     */
    excluirConta: async (req, res) => {
        try {
            await Usuario.excluir(req.usuario.id);
            res.status(200).json({ mensagem: "Conta excluída com sucesso." });
        } catch (erro) {
            console.error("Erro ao excluir conta:", erro);
            res.status(500).json({ mensagem: "Erro ao excluir conta." });
        }
    }
};

module.exports = AuthController;
