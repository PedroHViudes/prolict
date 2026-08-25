import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './ccs/sidebar.css';
import documento from '../assets/documento.png';
import logobranco from '../assets/logo_branco.png';
import { 
  FaHome, 
  FaGavel, 
  FaTools, 
  FaChartBar, 
  FaUser, 
  FaCog,
  FaSignOutAlt
} from 'react-icons/fa';

/**
 * Componente Sidebar (Menu Lateral).
 * Exibe os links de navegação do sistema e o botão de sair.
 * O botão "Sair" limpa o token JWT e redireciona para o login.
 */
export default function Sidebar() {
  const navigate = useNavigate();

  /**
   * Realiza o logout do usuário.
   * Remove o token e os dados do usuário do localStorage,
   * depois redireciona para a tela de login.
   */
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/');
  };

  return (
    <div className="d-flex flex-column flex-shrink-0 area-sidebar vh-100">
      
      {/* Área do Logo */}
      <div className="d-flex align-items-center justify-content-center p-5 header-sidebar">
        <div className="text-center">
          <div className="mb-2">
            <img src={logobranco} alt="ProLicit" className='w-25 ' />
          </div>
          <h4 className="m-0 fs-2 fw-bold">ProLicit</h4>
        </div>
      </div>

      {/* Links de Navegação */}
      <ul className="nav nav-pills flex-column mt-3 px-2">
        <li className="nav-item mb-1">
          <NavLink to="/dashboard" className={({isActive}) => `nav-link d-flex align-items-center ${isActive ? 'active nav-link text-dark fw-bold  border-4 ' : 'text-dark'}`}>
            <FaHome className="me-3" size={20}/> Dashboard
          </NavLink>
        </li>
        <li className="nav-item mb-1">
          <NavLink to="/licitacoes" className={({isActive}) => `nav-link d-flex align-items-center ${isActive ? 'active bg-light text-dark fw-bold border-4 ' : 'text-dark'}`}>
            <FaGavel className="me-3" size={20}/> Licitações
          </NavLink>
        </li>
        <li className="nav-item mb-1">
          <NavLink to="/servicos" className={({isActive}) => `nav-link d-flex align-items-center ${isActive ? 'active bg-light text-dark fw-bold border-4 ' : 'text-dark'}`}>
            <FaTools className="me-3" size={20}/> Serviços
          </NavLink>
        </li>
        <li className="nav-item mb-1">
          <NavLink to="/relatorios" className={({isActive}) => `nav-link d-flex align-items-center ${isActive ? 'active bg-light text-dark fw-bold  border-4 ' : 'text-dark'}`}>
            <FaChartBar className="me-3" size={20}/> Relatórios
          </NavLink>
        </li>

        <li className="nav-item mb-1">
          <NavLink to="/relatorios/licitacoes" className={({isActive}) => `nav-link d-flex align-items-center ${isActive ? 'active bg-light text-dark fw-bold  border-4 ' : 'text-dark'}`}>
            <FaChartBar className="me-3" size={20}/> Relatórios Licitação
          </NavLink>
        </li>
        
        
        <li className="mt-4 mb-2 px-3 text-muted texto-sidebar">
          CONFIGURAÇÕES
        </li>
        
        <li className="nav-item mb-1">
          <NavLink to="/perfil" className={({isActive}) => `nav-link d-flex align-items-center ${isActive ? 'active bg-light text-dark fw-bold  border-4 ' : 'text-dark'}`}>
            <FaUser className="me-3" size={20}/> Perfil
          </NavLink>
        </li>
        <li className="nav-item mb-1">
          <NavLink to="/configuracao" className={({isActive}) => `nav-link d-flex align-items-center ${isActive ? 'active bg-light text-dark fw-bold  border-4 ' : 'text-dark'}`}>
            <FaCog className="me-3" size={20}/> Configuração
          </NavLink>
        </li>
      </ul>
      
      {/* Botão Sair */}
      <ul className="nav nav-pills flex-column mt-auto px-3 mb-4">
        <li>
          <button 
            onClick={handleLogout}
            className="btn rounded-pill px-4 d-flex align-items-center fw-bold shadow-sm w-100 justify-content-center btn-sair"
          >
            Sair <FaSignOutAlt className="ms-2" />
          </button>
        </li>
      </ul>
    </div>
  );
}
