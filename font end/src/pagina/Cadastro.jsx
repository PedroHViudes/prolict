import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Card, InputGroup } from 'react-bootstrap';
import { LuUser, LuBriefcase, LuMail, LuLock,LuKey  } from "react-icons/lu";
import { Link, useNavigate } from "react-router-dom";
import "../estilos/Cadastro.css";

import axios from "axios";

import logo from "../assets/logo.png";
import img_cadastro from "../assets/imgcadastro.png";

export default function Cadastro() {
    const [nome, setNome] = useState("");
    const [empresa, setEmpresa] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");

    const navigate = useNavigate();

    const realizarCadastro = async (e) => {
        e.preventDefault();

        if (senha !== confirmarSenha){
            alert("As senhas não coincidem! Verifique e tente novamente.");
        return;
        }


        try {
          
            const response = await axios.post("http://localhost:3001/cadastro", {
                nome: nome,
                empresa: empresa,
                email: email,
                senha: senha,
                
            });

            alert(response.data.mensagem);
            navigate("/")
        } catch (error) {
            const mensagemErro = error.response?.data?.mensagem || "Servidor Indisponível ";
            alert(mensagemErro);
        }

    }










    return (
        <div className="cadastro-container">
            <Container>
                <Row className="justify-content-center">
                    <Col md={10} lg={9}>
                        <Card className="cadastro-card">
                            <Row className="g-0">

                                {/* Coluna da Imagem */}
                                <Col md={6} className="d-none d-md-block p-0 cadastro-image">
                                    <img
                                        src={img_cadastro}
                                        alt="Ilustração Cadastro"

                                    />
                                </Col>


                                {/* Coluna do Formulário */}
                                <Col md={6} className="p-4 p-lg-5 bg-white">
                                    <div className="text-center mb-4">
                                        <h2 className="cadastro-title d-flex align-items-center justify-content-center gap-2">
                                            <img src={logo} alt="Logo ProLicit" style={{ maxWidth: '200px' }} />
                                        </h2>
                                        <h5 className="mt-3">
                                            Cadastrar-se no <span className="text-prolicit-verde">ProLicit!</span>
                                        </h5>
                                    </div>

                                    <Form onSubmit={realizarCadastro}>
                                        <InputGroup className="mb-3 prolicit-input-group">
                                            <InputGroup.Text><LuUser /></InputGroup.Text>
                                            <Form.Control placeholder="Digite o Nome do Responsável" onChange={(e) => setNome(e.target.value)} />
                                        </InputGroup>

                                        <InputGroup className="mb-3 prolicit-input-group">
                                            <InputGroup.Text><LuBriefcase /></InputGroup.Text>
                                            <Form.Control placeholder="Digite Nome da Empresa" onChange={(e) => setEmpresa(e.target.value)} />
                                        </InputGroup>

                                        <InputGroup className="mb-3 prolicit-input-group">
                                            <InputGroup.Text><LuMail /></InputGroup.Text>
                                            <Form.Control type="email" placeholder="Digite o Email Empresarial" onChange={(e) => setEmail(e.target.value)} />
                                        </InputGroup>

                                        <InputGroup className="mb-3 prolicit-input-group">
                                            <InputGroup.Text><LuLock /></InputGroup.Text>
                                            <Form.Control type="password" placeholder="Digite uma Senha" onChange={(e) => setSenha(e.target.value)} />
                                        </InputGroup>

                                        <InputGroup className="mb-3 prolicit-input-group">
                                            <InputGroup.Text><LuLock /></InputGroup.Text>
                                            <Form.Control type="password" placeholder="Digite uma Senha" onChange={(e) => setConfirmarSenha(e.target.value)} />
                                        </InputGroup>

                                        
                                           
                                        

                                        <div className="d-flex justify-content-between align-items-center">
                                            <Link to="/" className="link-login">
                                                Fazer o Login
                                            </Link>

                                            <Button type="submit" className="btn-cadastrar rounded-pill">
                                                Cadastrar
                                            </Button>
                                        </div>
                                    </Form>

                                    <p className="mt-4 text-center small text-muted">
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