import React from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Card from '../components/Card';

/**
 * Página do Perfil do Usuário.
 * Permite gerenciar as informações da conta, atualizar a senha ou deletar a conta.
 */
export default function Perfil() {
  return (
    <Layout>
      <Header 
        title="Meu Perfil" 
        subtitle="Gerencie suas informações Pessoais e empresariais." 
      />

      <div className="row g-4">
        {/* Coluna Esquerda */}
        <div className="col-md-7">
          
          {/* Card: Informações do Perfil */}
          <Card className="mb-4">
            <h5 className="fw-bold mb-2">Informações do Perfil</h5>
            <p className="text-muted small mb-4">
              Atualize as informações do perfil e o endereço de e-mail da sua conta.
            </p>

            <div className="mb-3">
              <label className="form-label fw-bold small">Nome</label>
              <input type="text" className="form-control" placeholder="Digite seu nome" />
            </div>
            
            <div className="mb-4">
              <label className="form-label fw-bold small">E-mail</label>
              <input type="email" className="form-control" placeholder="Digite seu E-mail" />
            </div>

            <button className="btn text-white rounded-pill px-4 fw-bold" style={{ backgroundColor: 'var(--prolicit-verde)' }}>
              Salvar
            </button>
          </Card>

          {/* Card: Atualizar Senha */}
          <Card>
            <h5 className="fw-bold mb-2">Atualizar Senha</h5>
            <p className="text-muted small mb-4">
              Certifique-se que sua conta esteja usando uma senha longa e aleatória para permanecer seguro.
            </p>

            <div className="mb-3">
              <label className="form-label fw-bold small">Senha Atual</label>
              <input type="password" className="form-control" />
            </div>
            
            <div className="mb-3">
              <label className="form-label fw-bold small">Nova Senha</label>
              {/* O placeholder foi ajustado de acordo com a observação (no protótipo estava "Digite seu E-mail") */}
              <input type="password" className="form-control" placeholder="Digite sua senha" />
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold small">Confirme a Nova Senha</label>
              <input type="password" className="form-control" placeholder="Confirme sua senha" />
            </div>

            <button className="btn text-white rounded-pill px-4 fw-bold" style={{ backgroundColor: 'var(--prolicit-verde)' }}>
              Salvar
            </button>
          </Card>

        </div>

        {/* Coluna Direita */}
        <div className="col-md-5">
          
          {/* Card: Excluir Conta */}
          <Card className="mb-4">
            <h5 className="fw-bold mb-3">Excluir a Conta</h5>
            <p className="text-muted small mb-4" style={{ lineHeight: '1.6' }}>
              Após a exclusão da conta, todos os seus recursos e dados serão excluídos permanentemente. 
              Antes de excluir sua conta, baixe todos os seus dados ou informações que deseja manter
            </p>

            <button className="btn btn-dark w-100 fw-bold py-2 rounded-pill">
              Deletar Conta
            </button>
          </Card>

          {/* Card: Sobre */}
          <Card>
            <h5 className="fw-bold mb-3">Sobre</h5>
            <p className="text-muted small mb-0" style={{ lineHeight: '1.6', textAlign: 'justify' }}>
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
              Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, 
              when an unknown printer took a galley of type and scrambled it to make a type 
              specimen book. It has survived not only five centuries, but also the leap into 
              electronic typesetting, remaining essentially unchanged. It was popularised in 
              the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, 
              and more recently with desktop publishing software like Aldus PageMaker 
              including versions of Lorem Ipsum.
            </p>
          </Card>

        </div>
      </div>
    </Layout>
  );
}
