import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Card, InputGroup } from 'react-bootstrap';
import { LuUser, LuMail, LuLock } from "react-icons/lu";
import { Link, useNavigate } from "react-router-dom";
import "../estilos/Cadastro.css";
import api from "../services/api";

import logo from "../assets/logo.png";
import img_cadastro from "../assets/imgcadastro.png";

/**
 * Página de Cadastro do PROLICIT.
 * Permite criar uma nova conta de administrador para a empresa.
 * Após o cadastro, redireciona para a tela de login.
 */
export default function Cadastro() {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [carregando, setCarregando] = useState(false);

    const navigate = useNavigate();

    /**
     * Manipula o envio do formulário de cadastro.
     * Valida se as senhas coincidem e envia os dados para o backend.
     */
    const realizarCadastro = async (e) => {
        e.preventDefault();

        // Validação: senhas devem ser iguais
        if (senha !== confirmarSenha) {
            alert("As senhas não coincidem! Verifique e tente novamente.");
            return;
        }

        // Validação: campos obrigatórios
        if (!nome || !email || !senha) {
            alert("Preencha todos os campos.");
            return;
        }

        try {
            setCarregando(true);
            // Envia os dados para a rota de cadastro no backend
            const response = await api.post("/cadastro", {
                nome: nome,
                email: email,
                senha: senha,
            });

            alert(response.data.mensagem);
            navigate("/"); // Redireciona para a tela de Login
        } catch (error) {
            const mensagemErro = error.response?.data?.mensagem || "Servidor Indisponível";
            alert(mensagemErro);
        } finally {
            setCarregando(false);
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
                                    <img src={img_cadastro} alt="Ilustração Cadastro" />
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
                                            <Form.Control 
                                                placeholder="Digite o Nome do Responsável" 
                                                value={nome}
                                                onChange={(e) => setNome(e.target.value)} 
                                            />
                                        </InputGroup>

                                        <InputGroup className="mb-3 prolicit-input-group">
                                            <InputGroup.Text><LuMail /></InputGroup.Text>
                                            <Form.Control 
                                                type="email" 
                                                placeholder="Digite o Email Empresarial" 
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)} 
                                            />
                                        </InputGroup>

                                        <InputGroup className="mb-3 prolicit-input-group">
                                            <InputGroup.Text><LuLock /></InputGroup.Text>
                                            <Form.Control 
                                                type="password" 
                                                placeholder="Digite uma Senha" 
                                                value={senha}
                                                onChange={(e) => setSenha(e.target.value)} 
                                            />
                                        </InputGroup>

                                        <InputGroup className="mb-3 prolicit-input-group">
                                            <InputGroup.Text><LuLock /></InputGroup.Text>
                                            <Form.Control 
                                                type="password" 
                                                placeholder="Confirme a Senha" 
                                                value={confirmarSenha}
                                                onChange={(e) => setConfirmarSenha(e.target.value)} 
                                            />
                                        </InputGroup>

                                        <div className="d-flex justify-content-between align-items-center">
                                            <Link to="/" className="link-login">
                                                Fazer o Login
                                            </Link>

                                            <Button type="submit" className="btn-cadastrar rounded-pill" disabled={carregando}>
                                                {carregando ? "Cadastrando..." : "Cadastrar"}
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
