-- ============================================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS - PROLICIT
-- Banco: prolicit
-- Conexão: localhost, root, sem senha
-- ============================================================

CREATE DATABASE IF NOT EXISTS prolicit;
USE prolicit;

-- ============================================================
-- TABELA: administrador
-- Armazena os dados de acesso do responsável pela empresa.
-- Sistema single-user: apenas um acesso por empresa.
-- ============================================================
CREATE TABLE administrador (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABELA: licitacao
-- Dados gerais do edital de licitação já ganha.
-- Status: Ativa (em andamento) ou Finalizada (concluída).
-- ============================================================
CREATE TABLE licitacao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    administrador_id INT NOT NULL,
    numero_processo VARCHAR(50) NOT NULL,
    orgao_publico VARCHAR(150) NOT NULL,
    data_abertura DATE,
    data_vigencia DATE,
    valor_estimado DECIMAL(12,2),
    status ENUM('Ativa', 'Finalizada') DEFAULT 'Ativa',
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (administrador_id) REFERENCES administrador(id) ON DELETE CASCADE
);

-- ============================================================
-- TABELA: lote
-- Divide a licitação em partes financeiras.
-- Cada lote guarda o valor arrematado e seus itens.
-- ============================================================
CREATE TABLE lote (
    id INT AUTO_INCREMENT PRIMARY KEY,
    licitacao_id INT NOT NULL,
    numero_lote VARCHAR(50),
    valor_total_arrematado DECIMAL(12,2) DEFAULT 0,
    descricao VARCHAR(200),
    FOREIGN KEY (licitacao_id) REFERENCES licitacao(id) ON DELETE CASCADE
);

-- ============================================================
-- TABELA: item
-- Controle de quantidade e saldo de cada item dentro de um lote.
-- saldo_disponivel = quantidade_ganha - quantidade_executada
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
-- TABELA: servico
-- Registra cada execução técnica (baixa operacional).
-- Vincula o serviço a um item específico, registrando a "baixa".
-- ============================================================
CREATE TABLE servico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    administrador_id INT NOT NULL,
    nome_servico VARCHAR(150) NOT NULL,
    valor_fixo DECIMAL(10,2) DEFAULT 0,
    quantidade INT DEFAULT 0,
    data_execucao DATE,
    descricao_detalhada TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES item(id) ON DELETE CASCADE,
    FOREIGN KEY (administrador_id) REFERENCES administrador(id)
);

-- ============================================================
-- TABELA: documento
-- Armazena metadados de orçamentos e certidões.
-- data_vencimento permite alertas de prazo de validade.
-- ============================================================
CREATE TABLE documento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    licitacao_id INT NOT NULL,
    nome VARCHAR(150) NOT NULL,
    tipo VARCHAR(50),
    arquivo_path VARCHAR(255),
    data_vencimento DATE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (licitacao_id) REFERENCES licitacao(id) ON DELETE CASCADE
);

-- ============================================================
-- TABELA: entrega
-- Registra quem recebeu o serviço e o responsável pela entrega.
-- Tabela separada para permitir múltiplos recebimentos por serviço.
-- ============================================================
CREATE TABLE entrega (
    id INT AUTO_INCREMENT PRIMARY KEY,
    servico_id INT NOT NULL,
    quem_recebeu VARCHAR(150),
    telefone VARCHAR(20),
    responsavel_entrega VARCHAR(150),
    data_recebimento DATE,
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (servico_id) REFERENCES servico(id) ON DELETE CASCADE
);

-- ============================================================
-- DADOS INICIAIS (usuário padrão para teste)
-- ============================================================
INSERT INTO administrador (nome, email, senha) VALUES
('Administrador', 'admin@prolicit.com', '$2b$10$placeholder_hash');

-- ============================================================
-- CORREÇÕES PARA BANCOS EXISTENTES:
-- ALTER TABLE licitacao MODIFY COLUMN data_abertura DATE;
-- ALTER TABLE licitacao ADD COLUMN administrador_id INT NOT NULL AFTER id;
-- ALTER TABLE licitacao ADD FOREIGN KEY (administrador_id) REFERENCES administrador(id) ON DELETE CASCADE;
-- UPDATE licitacao SET administrador_id = 1 WHERE administrador_id IS NULL;
-- ============================================================
