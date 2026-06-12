import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importando páginas de autenticação já existentes
import Login from './pagina/login';
import Cadastro from './pagina/Cadastro';
import Esqueci_Senha from './pagina/EsqueciSenha';
import Redefinir_Senha from './pagina/RedefinirSenha';

// Importando as novas páginas criadas para o painel
import Dashboard from './pagina/Dashboard';
import Licitacoes from './pagina/Licitacoes';
import LicitacaoAdicionar from './pagina/LicitacaoAdicionar';
import Servicos from './pagina/Servicos';
import ServicoAdicionar from './pagina/ServicoAdicionar';
import Relatorios from './pagina/Relatorios';
import Perfil from './pagina/Perfil';
import Configuracao from './pagina/Configuracao';

/**
 * Componente principal da aplicação (App).
 * Gerencia todas as rotas do sistema.
 */
export default function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas de Autenticação (Públicas) */}
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path='/esqueci-senha' element={<Esqueci_Senha />}/>
        <Route path='/redefinir-senha' element={<Redefinir_Senha/>}/>

        {/* Rotas Protegidas (Painel/Dashboard) */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/licitacoes" element={<Licitacoes />} />
        <Route path="/licitacoes/nova" element={<LicitacaoAdicionar />} />
        <Route path="/servicos" element={<Servicos />} />
        <Route path="/servicos/novo" element={<ServicoAdicionar />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/configuracao" element={<Configuracao />} />
      </Routes>
    </Router>
  );
}
