import axios from 'axios';

/**
 * Serviço central de comunicação com a API do backend.
 * Configura a URL base e automaticamente anexa o token JWT
 * em todas as requisições para as rotas protegidas.
 */
const api = axios.create({
    baseURL: 'http://localhost:3001/api',
});

/**
 * Interceptor de requisições (Request).
 * Antes de cada requisição, verifica se existe um token salvo
 * no localStorage e o anexa ao cabeçalho Authorization.
 * Isso garante que todas as chamadas autenticadas funcionem.
 */
api.interceptors.request.use(
    (configuracao) => {
        const token = localStorage.getItem('token');
        if (token) {
            configuracao.headers.Authorization = `Bearer ${token}`;
        }
        return configuracao;
    },
    (erro) => {
        return Promise.reject(erro);
    }
);

/**
 * Interceptor de respostas (Response).
 * Se o backend retornar erro 401 (token inválido/expirado),
 * limpa o localStorage e redireciona para a tela de login.
 */
api.interceptors.response.use(
    (resposta) => resposta,
    (erro) => {
        if (erro.response && erro.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = '/';
        }
        return Promise.reject(erro);
    }
);

export default api;
