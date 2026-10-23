const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Usuario = require('../models/Usuario');
const { enviarEmailCodigoRecuperacao } = require('../utils/emailService');
require('dotenv').config();

// Tentativas erradas de código PIN por e-mail (proteção contra força bruta).
// Após 5 erros o código é invalidado e o usuário precisa pedir outro.
const MAX_TENTATIVAS_PIN = 5;
const tentativasPIN = new Map();
const normalizarEmail = (e) => (typeof e === 'string' ? e.trim() : e);

/**
 * Controller de Autenticação.
 * Gerencia as operações de login, cadastro, perfil e redefinição de senha.
 * O sistema é single-user por empresa: apenas um administrador por conta.
 */
const AuthController = {

    /**
     * Realiza o login do administrador.
     */
    async login(req, res) {
        const { senha } = req.body;
        const email = normalizarEmail(req.body.email);

        if (!email || !senha) {
            return res.status(400).json({ mensagem: "E-mail e senha são obrigatórios." });
        }

        try {
            const usuario = await Usuario.buscarPorEmail(email);
            if (!usuario) {
                return res.status(401).json({ mensagem: "E-mail ou senha incorretos." });
            }

            const senhaValida = await bcrypt.compare(senha, usuario.senha);
            if (!senhaValida) {
                return res.status(401).json({ mensagem: "E-mail ou senha incorretos." });
            }

            const token = jwt.sign(
                { id: usuario.id, nome: usuario.nome },
                process.env.JWT_SECRET,
                { expiresIn: '8h' }
            );

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
     */
    async cadastrar(req, res) {
        const { nome, senha } = req.body;
        const email = normalizarEmail(req.body.email);

        if (!nome || !email || !senha) {
            return res.status(400).json({ mensagem: "Dados obrigatórios faltando." });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ mensagem: "Informe um e-mail válido." });
        }
        if (String(senha).length < 6) {
            return res.status(400).json({ mensagem: "A senha deve ter pelo menos 6 caracteres." });
        }

        try {
            const usuarioExistente = await Usuario.buscarPorEmail(email);
            if (usuarioExistente) {
                return res.status(400).json({ mensagem: "Esse e-mail já está sendo usado." });
            }

            const saltos = 10;
            const senhaCriptografada = await bcrypt.hash(senha, saltos);

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
     */
    async perfil(req, res) {
        try {
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
     */
    async atualizarPerfil(req, res) {
        const { nome, email } = req.body;

        if (!nome || !email) {
            return res.status(400).json({ mensagem: "Nome e e-mail são obrigatórios." });
        }

        try {
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
     */
    async atualizarSenha(req, res) {
        const { senhaAtual, novaSenha } = req.body;

        if (!senhaAtual || !novaSenha) {
            return res.status(400).json({ mensagem: "Senha atual e nova senha são obrigatórias." });
        }
        if (String(novaSenha).length < 6) {
            return res.status(400).json({ mensagem: "A nova senha deve ter pelo menos 6 caracteres." });
        }

        try {
            const [linhas] = await require('../db').query('SELECT senha FROM administrador WHERE id = ?', [req.usuario.id]);
            const usuarioCompleto = linhas[0];

            const senhaValida = await bcrypt.compare(senhaAtual, usuarioCompleto.senha);
            if (!senhaValida) {
                // 400 (e não 401): o front trata 401 como sessão expirada e deslogaria o usuário
                return res.status(400).json({ mensagem: "A senha atual está incorreta." });
            }

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
     * Solicita a recuperação de senha gerando um código PIN de 6 dígitos.
     */
    async solicitarRecuperacaoSenha(req, res) {
        const email = normalizarEmail(req.body.email);

        if (!email) {
            return res.status(400).json({ mensagem: "O e-mail é obrigatório." });
        }

        try {
            const usuario = await Usuario.buscarPorEmail(email);

            if (!usuario) {
                return res.status(200).json({ 
                    mensagem: "Se este e-mail estiver cadastrado em nosso sistema, um código de 6 dígitos foi enviado para ele.",
                    email: email
                });
            }

            const codigoPIN = crypto.randomInt(100000, 1000000).toString();

            await Usuario.salvarTokenReset(usuario.id, codigoPIN, 15);
            tentativasPIN.delete(usuario.email.toLowerCase());
            const envio = await enviarEmailCodigoRecuperacao(usuario.email, usuario.nome, codigoPIN);

            // Antes o erro de envio era ignorado e a tela dizia "enviado" mesmo sem e-mail nenhum sair.
            if (!envio.sucesso) {
                await Usuario.limparTokenReset(usuario.id);
                return res.status(503).json({
                    mensagem: "Não foi possível enviar o e-mail com o código agora. Verifique a configuração de e-mail do servidor (SMTP) e tente novamente."
                });
            }

            return res.status(200).json({
                mensagem: "Código de verificação de 6 dígitos enviado para o seu e-mail!",
                email: email
            });

        } catch (erro) {
            console.error("Erro na solicitação de recuperação de senha:", erro);
            return res.status(500).json({ 
                mensagem: "Erro interno ao processar a recuperação de senha.",
                detalhes: erro.message
            });
        }
    },

    /**
     * Redefine a senha utilizando o código PIN de 6 dígitos e o e-mail do usuário.
     */
    async redefinirSenhaComToken(req, res) {
        const { codigoPIN, token, novaSenha } = req.body;
        const email = normalizarEmail(req.body.email);
        const pinParaValidar = (codigoPIN || token || "").trim();

        if (!email || !pinParaValidar || !novaSenha) {
            return res.status(400).json({ mensagem: "E-mail, código de verificação e nova senha são obrigatórios." });
        }
        if (String(novaSenha).length < 6) {
            return res.status(400).json({ mensagem: "A nova senha deve ter pelo menos 6 caracteres." });
        }

        try {
            // O código só vale junto com o e-mail (um código de 6 dígitos sozinho seria fácil de adivinhar)
            const usuario = await Usuario.buscarPorEmailETokenReset(email, pinParaValidar);

            if (!usuario) {
                if (email) {
                    const chave = email.toLowerCase();
                    const n = (tentativasPIN.get(chave) || 0) + 1;
                    tentativasPIN.set(chave, n);
                    if (n >= MAX_TENTATIVAS_PIN) {
                        const dono = await Usuario.buscarPorEmail(email);
                        if (dono) await Usuario.limparTokenReset(dono.id);
                        tentativasPIN.delete(chave);
                        return res.status(429).json({ mensagem: "Muitas tentativas com código errado. Por segurança o código foi cancelado; solicite um novo." });
                    }
                }
                return res.status(400).json({ mensagem: "Código de verificação incorreto ou expirado. Solicite um novo código." });
            }
            tentativasPIN.delete(usuario.email.toLowerCase());

            const saltos = 10;
            const novaSenhaCriptografada = await bcrypt.hash(novaSenha, saltos);

            await Usuario.atualizarSenha(usuario.id, novaSenhaCriptografada);
            await Usuario.limparTokenReset(usuario.id);

            return res.status(200).json({ mensagem: "Senha redefinida com sucesso! Você já pode fazer login." });

        } catch (erro) {
            console.error("Erro ao redefinir senha com PIN:", erro);
            return res.status(500).json({ 
                mensagem: "Erro interno ao redefinir a senha.",
                detalhes: erro.message
            });
        }
    },

    /**
     * Remove permanentemente a conta do administrador.
     */
    async excluirConta(req, res) {
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
