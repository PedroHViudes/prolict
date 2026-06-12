import React from "react";
import { Container, Row, Col, Form, Button, Card, InputGroup } from 'react-bootstrap';
import { LuMail, LuLock } from "react-icons/lu";
import { Link } from "react-router-dom"; 
import "../estilos/Login.css";

import logo from "../assets/logo.png";
import img_login from "../assets/imgcadastro.png"; 

export default function Login() {
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

                  {/* Container dos campos (aquela borda cinza interna) */}
                  <div className="container-campos">
                    <Form>
                      {/* Campo de E-mail */}
                      <InputGroup className="grupo-entrada mb-3">
                        <InputGroup.Text><LuMail /></InputGroup.Text>
                        <Form.Control type="email" placeholder="Digite Seu Email" />
                      </InputGroup>

                      {/* Campo de Senha */}
                      <InputGroup className="grupo-entrada">
                        <InputGroup.Text><LuLock /></InputGroup.Text>
                        <Form.Control type="password" placeholder="Digite Sua Senha" />
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
                        
                        <Button className="btn-entrar">
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