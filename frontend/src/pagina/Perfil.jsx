import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Card from '../components/Card';
import api from '../services/api';
import Toast from '../components/Toast';
import ModalConfirmacao from '../components/ModalConfirmacao';

export default function Perfil() {
  // Dados do perfil
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);

  // Dados da senha
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  // 1. Estado único do Toast (padronizado com 'visivel')
  const [toast, setToast] = useState({ visivel: false, mensagem: '' });

  // 2. Estado para controlar abertura/fechamento do Modal
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  
  // 3. Dispara a mensagem e esconde automaticamente após 3.5 segundos
  function exibirToast(mensagem) {
    setToast({ visivel: true, mensagem });
    setTimeout(() => setToast({ visivel: false, mensagem: '' }), 3500);
  }

  useEffect(() => {
    async function carregarPerfil() {
      try {
        const resposta = await api.get('/perfil');
        setNome(resposta.data.nome);
        setEmail(resposta.data.email);
      } catch (erro) {
        console.error("Erro ao carregar perfil:", erro);
        const dadosUsuario = localStorage.getItem('usuario');
        if (dadosUsuario) {
          const usuario = JSON.parse(dadosUsuario);
          setNome(usuario.nome || '');
          setEmail(usuario.email || '');
        }
      }
    }
    carregarPerfil();
  }, []);

  async function salvarPerfil() {
    if (!nome || !email) {
      exibirToast("Nome e e-mail são obrigatórios.");
      return;
    }

    try {
      setSalvandoPerfil(true);
      await api.put('/perfil', { nome, email });
      
      const dadosUsuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      dadosUsuario.nome = nome;
      dadosUsuario.email = email;
      localStorage.setItem('usuario', JSON.stringify(dadosUsuario));
      
      exibirToast("Perfil atualizado com sucesso!");
    } catch (erro) {
      console.error("Erro ao atualizar perfil:", erro);
      exibirToast(erro.response?.data?.mensagem || "Erro ao atualizar perfil.");
    } finally {
      setSalvandoPerfil(false);
    }
  }

  async function atualizarSenha() {
    if (!senhaAtual || !novaSenha) {
      exibirToast("Preencha a senha atual e a nova senha.");
      return;
    }

    if (novaSenha !== confirmarNovaSenha) {
      exibirToast("As novas senhas não coincidem!");
      return;
    }

    try {
      setSalvandoSenha(true);
      await api.put('/perfil/senha', { senhaAtual, novaSenha });
      exibirToast("Senha atualizada com sucesso!");
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarNovaSenha('');
    } catch (erro) {
      console.error("Erro ao atualizar senha:", erro);
      exibirToast(erro.response?.data?.mensagem || "Erro ao atualizar senha.");
    } finally {
      setSalvandoSenha(false);
    }
  }

  // 4. Executado somente quando o usuário confirma dentro do Modal
  const confirmarExclusao = async () => {
    setModalExcluirAberto(false); // Fecha o modal primeiro
    try {
      await api.delete('/perfil');
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/';
    } catch (erro) {
      console.error("Erro ao excluir conta:", erro);
      exibirToast("Erro ao excluir conta.");
    }
  };

  return (
    <Layout>
      <Header 
        title="Meu Perfil" 
        subtitle="Gerencie suas informações Pessoais e empresariais." 
      />

      <div className="row g-4">
        {/* Coluna Esquerda */}
        <div className="col-md-7">
          
          <Card className="mb-4">
            <h5 className="fw-bold mb-2">Informações do Perfil</h5>
            <p className="text-muted small mb-4">
              Atualize as informações do perfil e o endereço de e-mail da sua conta.
            </p>

            <div className="mb-3">
              <label className="form-label fw-bold small">Nome</label>
              <input 
                type="text" 
                className="form-control" 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Digite seu nome" 
              />
            </div>
            
            <div className="mb-4">
              <label className="form-label fw-bold small">E-mail</label>
              <input 
                type="email" 
                className="form-control" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu E-mail" 
              />
            </div>

            <button 
              className="btn text-white rounded-pill px-4 fw-bold" 
              style={{ backgroundColor: 'var(--prolicit-verde)' }}
              onClick={salvarPerfil}
              disabled={salvandoPerfil}
            >
              {salvandoPerfil ? "Salvando..." : "Salvar"}
            </button>
          </Card>

          <Card>
            <h5 className="fw-bold mb-2">Atualizar Senha</h5>
            <p className="text-muted small mb-4">
              Certifique-se que sua conta esteja usando uma senha longa e aleatória para permanecer seguro.
            </p>

            <div className="mb-3">
              <label className="form-label fw-bold small">Senha Atual</label>
              <input 
                type="password" 
                className="form-control" 
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label fw-bold small">Nova Senha</label>
              <input 
                type="password" 
                className="form-control" 
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Digite sua nova senha" 
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold small">Confirme a Nova Senha</label>
              <input 
                type="password" 
                className="form-control" 
                value={confirmarNovaSenha}
                onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                placeholder="Confirme sua senha" 
              />
            </div>

            <button 
              className="btn text-white rounded-pill px-4 fw-bold" 
              style={{ backgroundColor: 'var(--prolicit-verde)' }}
              onClick={atualizarSenha}
              disabled={salvandoSenha}
            >
              {salvandoSenha ? "Salvando..." : "Atualizar Senha"}
            </button>
          </Card>
        </div>

        {/* Coluna Direita */}
        <div className="col-md-5">
          
          <Card className="mb-4">
            <h5 className="fw-bold mb-3">Excluir a Conta</h5>
            <p className="text-muted small mb-4" style={{ lineHeight: '1.6' }}>
              Após a exclusão da conta, todos os seus recursos e dados serão excluídos permanentemente. 
              Antes de excluir sua conta, baixe todos os seus dados ou informações que deseja manter.
            </p>

            {/* Apenas abre o modal visual */}
            <button 
              className="btn btn-dark w-100 fw-bold py-2 rounded-pill"
              onClick={() => setModalExcluirAberto(true)}
            >
              Deletar Conta
            </button>
          </Card>

          <Card>
            <h5 className="fw-bold mb-3">Sobre o PROLICIT</h5>
            <p className="text-muted small mb-0" style={{ lineHeight: '1.6', textAlign: 'justify' }}>
              O PROLICIT é um sistema de gestão de licitações desenvolvido para micro, pequenas e médias empresas. 
              Ele substitui o controle manual em Excel por uma plataforma digital profissional, 
              organizando itens, lotes e processos licitatórios de forma centralizada e segura.
            </p>
          </Card>
        </div>
      </div>

      {/* Renderização do Toast Global */}
      {toast.visivel && (
        <Toast>
          {toast.mensagem}
        </Toast>
      )}

      {/* 5. Renderização do Modal de Confirmação */}
      <ModalConfirmacao
        isOpen={modalExcluirAberto}
        title="Excluir Conta"
        message="Tem certeza que deseja excluir sua conta? Esta ação é irreversível e todos os dados serão perdidos."
        confirmText="Sim, excluir"
        cancelText="Cancelar"
        confirmVariant="danger"
        onConfirm={confirmarExclusao}
        onCancel={() => setModalExcluirAberto(false)}
      />
    </Layout>
  );
}
