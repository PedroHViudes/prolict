-- ============================================================
-- SCRIPT OFICIAL DE CRIAÇÃO DO BANCO DE DADOS - PROLICIT
-- Banco: prolicit
-- Conexão: localhost, root, sem senha
-- ============================================================

CREATE DATABASE IF NOT EXISTS prolicit;
USE prolicit;

-- Desabilita checagem de chaves estrangeiras para permitir recriação limpa
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS entrega;
DROP TABLE IF EXISTS documento;
DROP TABLE IF EXISTS servico;
DROP TABLE IF EXISTS item;
DROP TABLE IF EXISTS lote;
DROP TABLE IF EXISTS licitacao;
DROP TABLE IF EXISTS administrador;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 1. TABELA: administrador
-- Armazena os dados de acesso do responsável pela empresa.
-- ============================================================
CREATE TABLE administrador (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    reset_token VARCHAR(255) NULL,
    reset_token_expires DATETIME NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. TABELA: licitacao
-- Dados gerais do contrato ganho pela empresa.
-- ============================================================
CREATE TABLE licitacao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    administrador_id INT NOT NULL,
    numero_processo VARCHAR(50) NOT NULL,
    orgao_publico VARCHAR(150) NOT NULL,
    data_abertura DATE NULL,
    data_vigencia DATE NULL,
    valor_estimado DECIMAL(12,2) DEFAULT 0,
    status ENUM('Ativa', 'Finalizada') DEFAULT 'Ativa',
    tipo ENUM('Serviços', 'Equipamentos', 'Ambos') DEFAULT 'Serviços',
    observacoes TEXT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (administrador_id) REFERENCES administrador(id) ON DELETE CASCADE
);

-- ============================================================
-- 3. TABELA: lote
-- Divisão financeira e estrutural da licitação.
-- ============================================================
CREATE TABLE lote (
    id INT AUTO_INCREMENT PRIMARY KEY,
    licitacao_id INT NOT NULL,
    numero_lote VARCHAR(50) NULL,
    valor_total_arrematado DECIMAL(12,2) DEFAULT 0,
    descricao VARCHAR(200) NULL,
    FOREIGN KEY (licitacao_id) REFERENCES licitacao(id) ON DELETE CASCADE
);

-- ============================================================
-- 4. TABELA: item
-- Produtos ou serviços específicos dentro de um lote.
-- ============================================================
CREATE TABLE item (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lote_id INT NOT NULL,
    descricao VARCHAR(200) NOT NULL,
    quantidade_ganha INT NOT NULL DEFAULT 0,
    quantidade_executada INT NOT NULL DEFAULT 0,
    valor_unitario DECIMAL(10,2) DEFAULT 0,
    FOREIGN KEY (lote_id) REFERENCES lote(id) ON DELETE CASCADE
);

-- ============================================================
-- 5. TABELA: servico
-- Registro da execução ou baixa operacional de um item.
-- ============================================================
CREATE TABLE servico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    administrador_id INT NOT NULL,
    nome_servico VARCHAR(150) NOT NULL,
    valor_fixo DECIMAL(10,2) DEFAULT 0,
    quantidade INT DEFAULT 0,
    data_execucao DATE NULL,
    descricao_detalhada TEXT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES item(id) ON DELETE CASCADE,
    FOREIGN KEY (administrador_id) REFERENCES administrador(id) ON DELETE CASCADE
);

-- ============================================================
-- 6. TABELA: entrega
-- Comprovante de quem recebeu e quem entregou o serviço/produto.
-- ============================================================
CREATE TABLE entrega (
    id INT AUTO_INCREMENT PRIMARY KEY,
    servico_id INT NOT NULL,
    quem_recebeu VARCHAR(150) NULL,
    telefone VARCHAR(20) NULL,
    responsavel_entrega VARCHAR(150) NULL,
    data_recebimento DATE NULL,
    observacoes TEXT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (servico_id) REFERENCES servico(id) ON DELETE CASCADE
);

-- ============================================================
-- 7. TABELA: documento
-- Arquivos, certidões e orçamentos vinculados à licitação.
-- ============================================================
CREATE TABLE documento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    licitacao_id INT NOT NULL,
    nome VARCHAR(150) NOT NULL,
    tipo VARCHAR(50) NULL,
    arquivo_path VARCHAR(255) NULL,
    data_vencimento DATE NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (licitacao_id) REFERENCES licitacao(id) ON DELETE CASCADE
);

-- ============================================================
-- DADOS INICIAIS DE TESTE (Opcional)
-- Usuário padrão de teste: admin@prolicit.com / Senha: 123
-- ============================================================
INSERT INTO administrador (nome, email, senha) VALUES
('Administrador Prolicit', 'admin@prolicit.com', '$2b$10$ot6oaSR6LCs6AiLivhDR4uMIuSC78JGZkBG91UwjNEITWcmv8DiYi');
