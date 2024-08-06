-- CreateEnum
CREATE TYPE "status_enum" AS ENUM ('pendente', 'aprovado', 'rejeitado');

-- CreateTable
CREATE TABLE "avaliacoes" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "nota" INTEGER NOT NULL,
    "comentario" TEXT,

    CONSTRAINT "avaliacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historicotransacoes" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "troca_id" INTEGER NOT NULL,

    CONSTRAINT "historicotransacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "livros" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "autor" VARCHAR(255) NOT NULL,
    "genero" VARCHAR(255) NOT NULL,
    "ano_publicacao" INTEGER NOT NULL,

    CONSTRAINT "livros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensagenschat" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "mensagem" TEXT NOT NULL,

    CONSTRAINT "mensagenschat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trocas" (
    "id" SERIAL NOT NULL,
    "livro_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "status" "status_enum" NOT NULL DEFAULT 'pendente',

    CONSTRAINT "trocas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "senha" VARCHAR(255) NOT NULL,
    "reputacao" DOUBLE PRECISION NOT NULL DEFAULT 0.0,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_avaliacoes_usuario_id" ON "avaliacoes"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_livros_usuario_id" ON "livros"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_mensagenschat_usuario_id" ON "mensagenschat"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_trocas_livro_id" ON "trocas"("livro_id");

-- CreateIndex
CREATE INDEX "idx_trocas_usuario_id" ON "trocas"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "historicotransacoes" ADD CONSTRAINT "historicotransacoes_troca_id_fkey" FOREIGN KEY ("troca_id") REFERENCES "trocas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "historicotransacoes" ADD CONSTRAINT "historicotransacoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "livros" ADD CONSTRAINT "livros_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "mensagenschat" ADD CONSTRAINT "mensagenschat_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "trocas" ADD CONSTRAINT "trocas_livro_id_fkey" FOREIGN KEY ("livro_id") REFERENCES "livros"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "trocas" ADD CONSTRAINT "trocas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
