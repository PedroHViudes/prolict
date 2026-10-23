
import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Card, InputGroup, Alert } from 'react-bootstrap';
import { LuLock, LuMail, LuKey } from "react-icons/lu";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import "../estilos/RedefinirSenha.css";
import api from "../services/api";

import Logo_Doc from "../assets/documento.png"; 
import Logo_Escrita from  "../assets/escrtita.png"; 

/**
 * Página de Redefinição de Senha com PIN.
 * Valida o código de 6 dígitos recebido por e-mail e permite cadastrar uma nova senha de acesso.
 */
export default function RedefinirSenha() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [codigoPIN, setCodigoPIN] = useState(searchParams.get("token") || "");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleRedefinir = async (e) => {
    e.preventDefault();
    setErro("");
    setMensagemSucesso("");

    if (!codigoPIN || codigoPIN.trim().length === 0) {
      setErro("Por favor, digite o código de 6 dígitos enviado para seu e-mail.");
      return;
    }

    if (!novaSenha || !confirmaSenha) {
      setErro("Por favor, preencha todos os campos de senha.");
      return;
    }

    if (novaSenha !== confirmaSenha) {
      setErro("A nova senha e a confirmação não conferem.");
      return;
    }

    try {
      setCarregando(true);
      const resposta = await api.post("/redefinir-senha", { 
        email, 
        codigoPIN: codigoPIN.trim(), 
        novaSenha 
      });

      setMensagemSucesso(resposta.data.mensagem || "Senha redefinida com sucesso!");
      
      setTimeout(() => {
        navigate("/");
      }, 2500);

    } catch (err) {
      console.error("Erro ao redefinir senha:", err);
      const msg = err.response?.data?.mensagem || "Erro ao redefinir a senha. Verifique o código e tente novamente.";
      setErro(msg);
    } finally {
      setCarregando(false);
    }
  };

  return (
   <div className="pagina-fundo">
      <Container>
        <Row className="justify-content-center">
          <Col md={11} lg={9}>
            <Card className="cartao-principal">
              <Card.Body className="p-0">
                <div className="moldura-interna m-4 m-md-5">
                  <Row className="align-items-center g-0">
                    
                    {/* Lado Esquerdo: Logotipo Empilhado */}
                    <Col md={5} className="d-flex flex-column align-items-center divisoria-lateral py-4">
                      <img src={Logo_Doc} alt="Ícone" className="img-doc " />
                      <img src={Logo_Escrita} alt="Texto" className="img-texto ms-4 "  />
                    </Col>

                    {/* Lado Direito: Formulário */}
                    <Col md={6} className=" ps-5 py-3">
                      <h4 className="fw-bold mb-3 text-dark">Redefinir Senha</h4>

                      {erro && <Alert variant="danger" className="text-center p-2 small">{erro}</Alert>}
                      {mensagemSucesso && (
                        <Alert variant="success" className="text-center p-2 small">
                          {mensagemSucesso} <br /> Redirecionando para o login...
                        </Alert>
                      )}

                      <Form onSubmit={handleRedefinir}>
                        <Form.Group className="mb-3">
                          <Form.Label className="label-campo">E-mail Cadastrado</Form.Label>
                          <InputGroup className="grupo-input">
                            <InputGroup.Text><LuMail /></InputGroup.Text>
                            <Form.Control 
                              type="email" 
                              placeholder="Seu e-mail" 
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </InputGroup>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label className="label-campo">Código de 6 Dígitos (do e-mail)</Form.Label>
                          <InputGroup className="grupo-input">
                            <InputGroup.Text><LuKey /></InputGroup.Text>
                            <Form.Control 
                              type="text" 
                              maxLength={6}
                              placeholder="Ex: 482910" 
                              value={codigoPIN}
                              onChange={(e) => setCodigoPIN(e.target.value)}
                              className="fw-bold text-primary tracking-widest"
                            />
                          </InputGroup>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label className="label-campo">Nova Senha</Form.Label>
                          <InputGroup className="grupo-input">
                            <InputGroup.Text><LuLock /></InputGroup.Text>
                            <Form.Control 
                              type="password" 
                              placeholder="Digite sua nova senha" 
                              value={novaSenha}
                              onChange={(e) => setNovaSenha(e.target.value)}
                            />
                          </InputGroup>
                        </Form.Group>

                        <Form.Group className="mb-4">
                          <Form.Label className="label-campo">Confirme a Nova Senha</Form.Label>
                          <InputGroup className="grupo-input">
                            <InputGroup.Text><LuLock /></InputGroup.Text>
                            <Form.Control 
                              type="password" 
                              placeholder="Confirme a senha" 
                              value={confirmaSenha}
                              onChange={(e) => setConfirmaSenha(e.target.value)}
                            />
                          </InputGroup>
                        </Form.Group>

                        <div className="d-flex justify-content-between align-items-center mt-4">
                          <Link to="/" className="text-decoration-none small text-muted">
                            Voltar ao login
                          </Link>
                          <Button type="submit" className="btn-sm btn-acao px-4" disabled={carregando}>
                            {carregando ? "Processando..." : "TROCAR SENHA"}
                          </Button>
                        </div>
                      </Form>
                    </Col>

                  </Row>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}