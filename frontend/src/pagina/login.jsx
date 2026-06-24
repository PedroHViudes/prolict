/**
 * Componente da Tela de Login do ProLicit
 * Permite a autenticação de administradores e redireciona para o Dashboard principal.
 */

import React, { useState } from "react"; // React e Hook para controle de estados
import { Container, Row, Col, Form, Button, Card, InputGroup } from 'react-bootstrap'; // Componentes do Bootstrap para Grid e formulários
import { LuMail, LuLock } from "react-icons/lu"; // Ícones de envelope (email) e cadeado (senha)
import { Link, useNavigate } from "react-router-dom"; // Links de navegação e Hook para redirecionamento
import axios from "axios"; // Biblioteca para chamadas HTTP
import "../estilos/Login.css"; // Estilização CSS da tela de login

// Importação das imagens do projeto
import logo from "../assets/logo.png";
import img_login from "../assets/imgcadastro.png"; 

export default function Login() {
  // Estados para gerenciar as entradas de e-mail e senha
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  
  // Instância do react-router para redirecionar o usuário
  const navigate = useNavigate();

  /**
   * Função executada ao submeter o formulário de login
   * Realiza a requisição ao Cloudflare Worker
   */
  const realizarLogin = async (e) => {
    e.preventDefault(); // Impede o recarregamento automático da página

    // Validação simples de campos vazios
    if (!email || !senha) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    try {
      // URL do backend: lê da variável de ambiente no Cloudflare ou usa a porta padrão do Wrangler local
      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8787";
      
      // Chamada HTTP POST enviando email e senha para o backend
      const response = await axios.post(`${API_URL}/login`, {
        email: email,
        senha: senha
      });

      // Exibe mensagem de sucesso e armazena os dados do usuário no localStorage
      alert(response.data.mensagem);
      localStorage.setItem("usuario", JSON.stringify(response.data.usuario));
      
      // Redireciona o usuário autenticado para a tela de Dashboard
      navigate("/dashboard");
    } catch (error) {
      // Caso ocorra um erro, exibe o aviso com a mensagem vinda do servidor
      const mensagemErro = error.response?.data?.mensagem || "Servidor Indisponível ";
      alert(mensagemErro);
    }
  };

  return (
    <div className="pagina-login">
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={9}>
            <Card className="cartao-login">
              <Row className="g-0">
                
                {/* Coluna da Imagem (Esquerda) */}
                <Col md={6} className="d-none d-md-block coluna-imagem">
                  <img 
                    src={img_login} 
                    alt="Trabalhando no ProLicit" 
                    className="imagem-principal" 
                  />
                </Col>

                {/* Coluna do Formulário (Direita) */}
                <Col md={6} className="p-4 p-lg-5 coluna-formulario">
                  <div className="text-center mb-4">
                    {/* Logo do projeto */}
                    <img src={logo} alt="Logo ProLicit" className="logo-marca" />
                    
                    <h4 className="titulo-principal mt-2">
                      Bem-vindo ao <span>ProLicit!</span>
                    </h4>
                    
                    <p className="texto-apoio">
                      Facilitamos a gestão de licitação para pequenas e médias empresas. 
                      Acesse sua conta para acompanhar propostas, prazos e documentações de forma simples e digital.
                    </p>
                  </div>

                  {/* Container dos campos (borda cinza interna) */}
                  <div className="container-campos">
                    <Form onSubmit={realizarLogin}>
                      {/* Campo de E-mail */}
                      <InputGroup className="grupo-entrada mb-3">
                        <InputGroup.Text><LuMail /></InputGroup.Text>
                        <Form.Control 
                          type="email" 
                          placeholder="Digite Seu Email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </InputGroup>

                      {/* Campo de Senha */}
                      <InputGroup className="grupo-entrada">
                        <InputGroup.Text><LuLock /></InputGroup.Text>
                        <Form.Control 
                          type="password" 
                          placeholder="Digite Sua Senha" 
                          value={senha}
                          onChange={(e) => setSenha(e.target.value)}
                          required
                        />
                      </InputGroup>

                      {/* Link Esqueci a Senha */}
                      <Link to="/esqueci-senha" title="Recuperar senha" className="link-esqueci">
                        Esqueci a senha
                      </Link>

                      {/* Botões de Ação */}
                      <div className="d-flex justify-content-between align-items-center mt-4">
                        <Link to="/cadastro" className="link-cadastro">
                          Não tenho acesso
                        </Link>
                        
                        <Button type="submit" className="btn-entrar">
                          Entrar
                        </Button>
                      </div>
                    </Form>
                  </div>

                  {/* Rodapé de suporte */}
                  <p className="mt-4 text-center rodape-suporte">
                    Em caso de dúvidas ou problemas com o acesso, entre em contato com o suporte
                  </p>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}