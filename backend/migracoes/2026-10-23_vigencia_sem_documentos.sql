-- ============================================================
-- MIGRAÇÃO PROLICIT – 23/10/2026
-- Para bancos criados com a versão anterior do banco.sql.
-- Rode UMA vez no MySQL Workbench / phpMyAdmin com o banco "prolicit" selecionado.
-- (Quem recriar o banco do zero com o banco.sql novo não precisa rodar este arquivo.)
-- ============================================================
USE prolicit;

-- 1) RN08: serviços executados depois do fim da vigência ficam marcados
ALTER TABLE servico
    ADD COLUMN fora_da_vigencia TINYINT(1) NOT NULL DEFAULT 0 AFTER descricao_detalhada;

-- marca os serviços já existentes que foram executados depois da vigência
UPDATE servico s
JOIN item i ON s.item_id = i.id
JOIN lote lo ON i.lote_id = lo.id
JOIN licitacao lic ON lo.licitacao_id = lic.id
SET s.fora_da_vigencia = (lic.data_vigencia IS NOT NULL AND s.data_execucao IS NOT NULL AND s.data_execucao > lic.data_vigencia);

-- 2) Gestão documental saiu do escopo desta versão (trabalho futuro)
DROP TABLE IF EXISTS documento;
