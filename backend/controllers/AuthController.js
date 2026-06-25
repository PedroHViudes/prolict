import bcrypt from 'bcryptjs';
import Usuario from '../models/Usuario.js';

const AuthController = {
    cadastro: async (c) => {
        console.log("Recebida requisição de cadastro");
        
        try {
            const body = await c.req.json();
            console.log("Dados recebidos:", body);
            const { nome, empresa, email, senha } = body;

            if (!nome || !email || !senha) {
                return c.json({ mensagem: "Dados obrigatórios faltando." }, 400);
            }

            // Buscamos o usuário no banco de dados D1 (passando c.env.DB)
            const usuarioexistente = await Usuario.buscarPorEmail(c.env.DB, email);

            if (usuarioexistente) {
                return c.json({ mensagem: "Esse email já está sendo usado." }, 400);
            }

            const saltos = 10;
            const senhaCriptografada = await bcrypt.hash(senha, saltos);

            // Criamos o usuário no banco de dados D1
            await Usuario.criar(c.env.DB, {
                nome,
                email,
                senha: senhaCriptografada,
                cargo: empresa, // Mapeando empresa da tela para cargo do banco
            });

            return c.json({ mensagem: "Usuário cadastrado com sucesso!" }, 201);
        }
        catch (erro) {
            console.error("Erro no cadastro:", erro);
            return c.json({ mensagem: "Erro ao processar cadastro." }, 500);
        }
    },

    login: async (c) => {
        console.log("Recebida requisição de login");
        
        try {
            const body = await c.req.json();
            const { email, senha } = body;

            if (!email || !senha) {
                return c.json({ mensagem: "E-mail e senha são obrigatórios." }, 400);
            }

            // Buscamos o usuário no banco de dados D1 (passando c.env.DB)
            const usuario = await Usuario.buscarPorEmail(c.env.DB, email);

            if (!usuario) {
                return c.json({ mensagem: "E-mail ou senha incorretos." }, 400);
            }

            // Compara a senha digitada com a criptografada no banco
            const senhaValida = await bcrypt.compare(senha, usuario.senha);

            if (!senhaValida) {
                return c.json({ mensagem: "E-mail ou senha incorretos." }, 400);
            }

            // Retorna sucesso e os dados básicos do usuário (sem a senha por segurança)
            return c.json({
                mensagem: "Login realizado com sucesso!",
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    cargo: usuario.cargo
                }
            }, 200);
        }
        catch (erro) {
            console.error("Erro no login:", erro);
            return c.json({ mensagem: "Erro ao processar login no servidor." }, 500);
        }
    }
};

export default AuthController;
