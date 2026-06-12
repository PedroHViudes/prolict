
import React from "react";
import { Container, Row, Col, Form, Button, Card, InputGroup } from 'react-bootstrap';
import { LuLock } from "react-icons/lu";
import "../estilos/RedefinirSenha.css";


import Logo_Doc from "../assets/documento.png"; 
import Logo_Escrita from  "../assets/escrtita.png"; // Use a logo que preferir

export default function RedefinirSenha() {
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
                      <Form>
                        <Form.Group className="mb-4">
                          <Form.Label className="label-campo">Nova Senha</Form.Label>
                          <InputGroup className="grupo-input">
                            <InputGroup.Text><LuLock /></InputGroup.Text>
                            <Form.Control type="password" placeholder="Digite sua nova senha" />
                          </InputGroup>
                        </Form.Group>

                        <Form.Group className="mb-4">
                          <Form.Label className="label-campo">Confirme a Senha</Form.Label>
                          <InputGroup className="grupo-input">
                            <InputGroup.Text><LuLock /></InputGroup.Text>
                            <Form.Control type="password" placeholder="Confirme a senha" />
                          </InputGroup>
                        </Form.Group>

                        <div className="d-flex justify-content-between align-items-center mt-5">
                          <p className="texto-suporte ">
                            Em caso de dúvidas ou problemas com o acesso, entre em contato com o suporte
                          </p>
                          <Button className="btn-sm btn-acao ">
                            TROCAR SENHA
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