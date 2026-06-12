import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import './ccs/cabecalho.css';

/**
 * Componente Header reutilizável.
 * Exibe o título da página atual, subtítulo e o botão de "Sair".
 * 
 * @param {string} title O título principal da página
 * @param {string} subtitle O texto descritivo abaixo do título
 */
export default function Header({ title, subtitle }) {
  const navigate = useNavigate();

  // Função para simular o logout e voltar para a tela de login
  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 className="fw-bold mb-1">{title}</h2>
        <p className="text-muted mb-0">{subtitle}</p>
      </div>
      
      
    </div>
  );
}
