import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Card, InputGroup, Alert } from 'react-bootstrap';
import { LuMail } from "react-icons/lu";
import { Link, useNavigate } from "react-router-dom";
import "../estilos/EsqueciSenha.css";
import api from "../services/api";

// Importação das mesmas imagens para manter o padrão visual
import logo from "../assets/logo.png";
import img_recuperacao from "../assets/recuperar senha.png"; 

/**
 * Página de Solicitação de Recuperação de Senha.
 * O usuário informa o e-mail cadastrado e o sistema gera e envia um código PIN de 6 dígitos por e-mail.
 */
export default function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const handleSolicitar = async (e) => {
    e.preventDefault();
    setErro("");
    setMensagemSucesso("");

    if (!email) {
      setErro("Por favor, digite seu e-mail.");
      return;
    }

    try {
      setCarregando(true);
      const resposta = await api.post("/esqueci-senha", { email });
      setMensagemSucesso(resposta.data.mensagem || "Código de verificação de 6 dígitos enviado para seu e-mail!");
      
      // Redireciona para a tela de redefinição passando o e-mail após 1.5s
      setTimeout(() => {
        navigate(`/redefinir-senha?email=${encodeURIComponent(email)}`);
      }, 1500);

    } catch (err) {
      console.error("Erro ao solicitar recuperação:", err);
      const msg = err.response?.data?.mensagem || "Erro ao conectar com o servidor. Tente novamente.";
      setErro(msg);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="pagina-recuperacao">
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={9}>
            <Card className="cartao-recuperacao">
              <Row className="g-0">
                
                {/* Lado Esquerdo: Imagem */}
                <Col md={6} className="d-none d-md-block coluna-imagem-recuperacao">
                  <img 
                    src={img_recuperacao} 
                    alt="Recuperação ProLicit" 
                    className="imagem" 
                  />
                </Col>

                {/* Lado Direito: Formulário */}
                <Col md={6} className="p-4 p-lg-5 fundo-branco-recuperacao">
                  <div className="text-center mb-4">
                    <img src={logo} alt="Logo ProLicit" className="logo" />
                    
                    <h4 className="titulo mt-3">Recuperar Senha</h4>
                    
                    <p className="texto-apoio">
                      Informe seu e-mail cadastrado. Enviaremos um código de verificação de 6 dígitos para o seu e-mail.
                    </p>
                  </div>

                  {erro && <Alert variant="danger" className="text-center p-2 small">{erro}</Alert>}
                  {mensagemSucesso && (
                    <Alert variant="success" className="text-center p-2 small">
                      {mensagemSucesso} <br /> Redirecionando...
                    </Alert>
                  )}

                  {/* Caixa cinza interna */}
                  <div className="caixa-campos">
                    <Form onSubmit={handleSolicitar}>
                      <InputGroup className="grupo-recuperacao mb-3">
                        <InputGroup.Text><LuMail /></InputGroup.Text>
                        <Form.Control 
                          type="email" 
                          placeholder="Digite Seu Email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </InputGroup>

                      <Button type="submit" className="btn-enviar w-100" disabled={carregando}>
                        {carregando ? "Enviando Código..." : "Enviar Código por E-mail"}
                      </Button>
                    </Form>
                  </div>

                  <div className="text-center mt-4">
                    <Link to="/" className="link-login">
                      Voltar para o login
                    </Link>
                    
                    <p className="rodape mt-4">
                      Em caso de dúvidas ou problemas com o acesso, entre em contato com o suporte
                    </p>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}