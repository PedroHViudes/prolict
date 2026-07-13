import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Card, InputGroup, Alert } from 'react-bootstrap';
import { LuMail, LuLock } from "react-icons/lu";
import { Link, useNavigate } from "react-router-dom"; 
import "../estilos/Login.css";
import api from "../services/api";

import logo from "../assets/logo.png";
import img_login from "../assets/imgcadastro.png"; 

/**
 * Página de Login do PROLICIT.
 * Realiza a autenticação do administrador e salva o token JWT.
 * Se o token existir e for válido, redireciona direto para o Dashboard.
 */
export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  /**
   * Manipula o envio do formulário de login.
   * Envia e-mail e senha para o backend, recebe o token JWT
   * e salva no localStorage para manter a sessão.
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");
    
    // Validação: campos obrigatórios
    if (!email || !senha) {
      setErro("Por favor, preencha o e-mail e a senha.");
      return;
    }

    try {
      setCarregando(true);
      // Envia os dados para a rota de login no backend
      const resposta = await api.post("/login", { email, senha });
      
      // Salva o token JWT e os dados do usuário no navegador
      localStorage.setItem("token", resposta.data.token);
      localStorage.setItem("usuario", JSON.stringify(resposta.data.usuario));

      // Redireciona para o Dashboard após login bem-sucedido
      navigate("/dashboard");

    } catch (error) {
      console.error("Erro no login:", error);
      if (error.response && error.response.data.mensagem) {
        setErro(error.response.data.mensagem);
      } else {
        setErro("Erro ao conectar com o servidor.");
      }
    } finally {
      setCarregando(false);
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
                    <img src={logo} alt="Logo ProLicit" className="logo-marca" />
                    
                    <h4 className="titulo-principal mt-2">
                      Bem-vindo ao <span>ProLicit!</span>
                    </h4>
                    
                    <p className="texto-apoio">
                      Facilitamos a gestão de licitação para pequenas e médias empresas. 
                      Acesse sua conta para acompanhar propostas, prazos e documentações de forma simples e digital.
                    </p>
                  </div>

                  {/* Container dos campos */}
                  <div className="container-campos">
                    {erro && <Alert variant="danger" className="text-center p-2 small">{erro}</Alert>}

                    <Form onSubmit={handleLogin}>
                      {/* Campo de E-mail */}
                      <InputGroup className="grupo-entrada mb-3">
                        <InputGroup.Text><LuMail /></InputGroup.Text>
                        <Form.Control 
                          type="email" 
                          placeholder="Digite Seu Email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
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
                        
                        <Button type="submit" className="btn-entrar" disabled={carregando}>
                          {carregando ? "Entrando..." : "Entrar"}
                        </Button>
                      </div>
                    </Form>
                  </div>

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
