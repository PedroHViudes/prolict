import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // Adicionado useNavigate
import './ccs/sidebar.css';
import documento from '../assets/documento.png';
import { 
  FaHome, 
  FaGavel, 
  FaTools, 
  FaChartBar, 
  FaUser, 
  FaCog,
  FaSignOutAlt // Adicionado este ícone
} from 'react-icons/fa';

export default function Sidebar() {
  const navigate = useNavigate();

  // Função necessária para o botão funcionar
  const handleLogout = () => {
    // Adicione aqui a lógica de limpeza (ex: localStorage.clear())
    console.log("Deslogado com sucesso");
    navigate('/'); // Redireciona para a tela de login
  };

  return (
    <div className="d-flex flex-column  flex-shrink-0 area-sidebar vh-100">
      
      {/* Área do Logo */}
      <div className="d-flex align-items-center justify-content-center p-5 header-sidebar">
        <div className="text-center">
          <div className="mb-2">
            <img src={documento} alt="ProLicit" className='w-50 bg-light p-2 rounded-3' />
          </div>
          <h4 className="m-0 fs-2 fw-bold">ProLicit</h4>
        </div>
      </div>

      {/* Links de Navegação */}
      <ul className="nav nav-pills flex-column mt-3 px-2">
        <li className="nav-item mb-1">
          <NavLink to="/dashboard" className={({isActive}) => `nav-link d-flex align-items-center ${isActive ? 'active bg-light text-dark fw-bold border-start border-4 border-primary' : 'text-dark'}`}>
            <FaHome className="me-3" size={20}/> Dashboard
          </NavLink>
        </li>
        <li className="nav-item mb-1">
          <NavLink to="/licitacoes" className={({isActive}) => `nav-link d-flex align-items-center ${isActive ? 'active bg-light text-dark fw-bold border-start border-4 border-primary' : 'text-dark'}`}>
            <FaGavel className="me-3" size={20}/> Licitações
          </NavLink>
        </li>
        <li className="nav-item mb-1">
          <NavLink to="/servicos" className={({isActive}) => `nav-link d-flex align-items-center ${isActive ? 'active bg-light text-dark fw-bold border-start border-4 border-primary' : 'text-dark'}`}>
            <FaTools className="me-3" size={20}/> Serviços
          </NavLink>
        </li>
        <li className="nav-item mb-1">
          <NavLink to="/relatorios" className={({isActive}) => `nav-link d-flex align-items-center ${isActive ? 'active bg-light text-dark fw-bold border-start border-4 border-primary' : 'text-dark'}`}>
            <FaChartBar className="me-3" size={20}/> Relatórios
          </NavLink>
        </li>
        
        <li className="mt-4 mb-2 px-3 text-muted texto-sidebar">
          CONFIGURAÇÕES
        </li>
        
        <li className="nav-item mb-1">
          <NavLink to="/perfil" className={({isActive}) => `nav-link d-flex align-items-center ${isActive ? 'active bg-light text-dark fw-bold border-start border-4 border-primary' : 'text-dark'}`}>
            <FaUser className="me-3" size={20}/> Perfil
          </NavLink>
        </li>
        <li className="nav-item mb-1">
          <NavLink to="/configuracao" className={({isActive}) => `nav-link d-flex align-items-center ${isActive ? 'active bg-light text-dark fw-bold border-start border-4 border-primary' : 'text-dark'}`}>
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