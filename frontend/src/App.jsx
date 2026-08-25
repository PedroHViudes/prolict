import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importando páginas de autenticação
import Login from './pagina/login';
import Cadastro from './pagina/Cadastro';
import Esqueci_Senha from './pagina/EsqueciSenha';
import Redefinir_Senha from './pagina/RedefinirSenha';

// Importando páginas do painel
import Dashboard from './pagina/Dashboard';
import Licitacoes from './pagina/Licitacoes';
import LicitacaoAdicionar from './pagina/LicitacaoAdicionar';
import Servicos from './pagina/Servicos';
import ServicoAdicionar from './pagina/ServicoAdicionar';
import Relatorios from './pagina/Relatorios';
import Perfil from './pagina/Perfil';
import Configuracao from './pagina/Configuracao';
import RelatorioLicitacao from './pagina/RelatorioLicitacao';

/**
 * Componente que protege rotas que exigem login.
 * Se o usuário não estiver autenticado (sem token JWT),
 * redireciona para a tela de login.
 */
function RotaProtegida({ children }) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

/**
 * Componente que redireciona usuários logados.
 * Se o usuário já estiver autenticado (com token JWT),
 * redireciona para o Dashboard em vez de mostrar login/cadastro.
 */
function RotaPublica({ children }) {
  const token = localStorage.getItem('token');
  
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

/**
 * Componente principal da aplicação (App).
 * Gerencia todas as rotas do sistema com proteção de autenticação.
 */
export default function App() {
  return (
    <Router>
      <Routes>
        {/* ========== ROTAS PÚBLICAS ========== */}
        {/* Estas rotas só são acessíveis quando NÃO está logado */}
        <Route path="/" element={
          <RotaPublica><Login /></RotaPublica>
        } />
        <Route path="/cadastro" element={
          <RotaPublica><Cadastro /></RotaPublica>
        } />
        <Route path='/esqueci-senha' element={
          <RotaPublica><Esqueci_Senha /></RotaPublica>
        }/>
        <Route path='/redefinir-senha' element={
          <RotaPublica><Redefinir_Senha/></RotaPublica>
        }/>

        {/* ========== ROTAS PROTEGIDAS ========== */}
        {/* Estas rotas exigem token JWT para serem acessadas */}
        <Route path="/dashboard" element={
          <RotaProtegida><Dashboard /></RotaProtegida>
        } />
        <Route path="/licitacoes" element={
          <RotaProtegida><Licitacoes /></RotaProtegida>
        } />
        <Route path="/licitacoes/nova" element={
          <RotaProtegida><LicitacaoAdicionar /></RotaProtegida>
        } />
        <Route path="/licitacoes/editar/:id" element={
          <RotaProtegida><LicitacaoAdicionar /></RotaProtegida>
        } />
        <Route path="/servicos" element={
          <RotaProtegida><Servicos /></RotaProtegida>
        } />
        <Route path="/servicos/novo" element={
          <RotaProtegida><ServicoAdicionar /></RotaProtegida>
        } />
        <Route path="/servicos/editar/:id" element={
          <RotaProtegida><ServicoAdicionar /></RotaProtegida>
        } />
        <Route path="/relatorios" element={
          <RotaProtegida><Relatorios /></RotaProtegida>
        } />
        <Route path="/perfil" element={
          <RotaProtegida><Perfil /></RotaProtegida>
        } />
        <Route path="/configuracao" element={
          <RotaProtegida><Configuracao /></RotaProtegida>
        } />
        <Route path="/relatorios/licitacoes" element={
          <RotaProtegida><RelatorioLicitacao /></RotaProtegida>
        } />
      </Routes>
    </Router>
  );
}
