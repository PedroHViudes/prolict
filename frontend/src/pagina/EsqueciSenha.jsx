import React from "react";
import { Container, Row, Col, Form, Button, Card, InputGroup } from 'react-bootstrap';
import { LuMail } from "react-icons/lu";
import { Link } from "react-router-dom";
import "../estilos/EsqueciSenha.css";

// Importação das mesmas imagens para manter o padrão visual
import logo from "../assets/logo.png";
import img_recuperacao from "../assets/recuperar senha.png"; 

export default function EsqueciSenha() {
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
                  <div className="text-center mb-5 ">
                    <img src={logo} alt="Logo ProLicit" className="logo" />
                    
                    <h4 className="titulo mt-5">Recuperar Senha</h4>
                    
                    <p className="texto-apoio">
                      Informe seu e-mail cadastrado. Enviaremos um link para você redefinir sua senha.
                    </p>
                  </div>

                  {/* Caixa cinza interna (conforme o design) */}
                  <div className="caixa-campos">
                    <Form>
                      <InputGroup className="grupo-recuperacao mb-3">
                        <InputGroup.Text><LuMail /></InputGroup.Text>
                        <Form.Control type="email" placeholder="Digite Seu Email" />
                      </InputGroup>

                      <Button className="btn-enviar w-100">
                        Enviar Link de Recuperação
                      </Button>
                    </Form>
                  </div>

                  <div className="text-center mt-4">
                    <Link to="/" className="link-login">
                      Voltar para o login
                    </Link>
                    
                    <p className="rodape mt-5">
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