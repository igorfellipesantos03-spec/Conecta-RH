-- Renomear tabela cost_centers → departments
ALTER TABLE "cost_centers" RENAME TO "departments";

-- Renomear colunas
ALTER TABLE "departments" RENAME COLUMN "cost_center_code" TO "department_code";
ALTER TABLE "departments" RENAME COLUMN "cost_center_description" TO "department_description";

-- Recriar o índice unique com novo nome
DROP INDEX IF EXISTS "cost_centers_cost_center_code_empresa_id_filial_id_key";
CREATE UNIQUE INDEX "departments_department_code_empresa_id_filial_id_key" ON "departments"("department_code", "empresa_id", "filial_id");
