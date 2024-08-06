const prisma = require('../database/prismaClient')
const Joi = require('joi')

// Validação
const exchangeSchema = Joi.object({
    livro_solicitado_id: Joi.number().integer().required()
})


const getAllExchanges = async (request, response) => {
    try {
      const listartrocas = await prisma.trocas.findMany();
      response.json(listartrocas);
    } catch (error) {
      response.status(500).json({ mensagem: 'Erro ao listar trocas.' });
    }
  };

const createExchange = async (request, response) => {
    const { livro_solicitado_id } = request.body; // ID do livro solicitado pelo usuário
    const solicitante_id = request.usuario.id; // ID do usuário solicitante

    try {
        const { error } = exchangeSchema.validate(request.body);

        if (error){
            return response.status(400).json({error: error});
        }

        // Verificar se o livro solicitado existe
        const livroSolicitado = await prisma.livros.findUnique({
            where: { id: livro_solicitado_id }
        });

        if (!livroSolicitado) {
            return response.status(404).json({ error: 'Livro solicitado não encontrado' });
        }

        // Verificar se o livro solicitado já está em uma troca pendente
        const trocaExistente = await prisma.trocas.findFirst({
            where: {
                livro_id: livro_solicitado_id,
                status: 'pendente'
            }
        });

        if (trocaExistente) {
            return response.status(400).json({ error: 'O livro solicitado já está envolvido em uma troca pendente' });
        }

        // Verificar se o solicitante não está tentando trocar seu próprio livro
        if (livroSolicitado.usuario_id === solicitante_id) {
            return response.status(400).json({ error: 'Você não pode solicitar a troca do seu próprio livro' });
        }

        // Criar a nova troca
        const novaTroca = await prisma.trocas.create({
            data: {
                livro_id: livro_solicitado_id,
                usuario_id: solicitante_id,
                status: 'pendente'
            }
        });

        response.status(201).json(novaTroca);
    } catch (error) {
        response.status(500).json({ error: 'Erro ao criar troca', details: error.message });
    }
};

const cancelExchange = async (request, response) => {
    const { id } = request.params;
    const usuarioId = request.usuario.id; // ID do usuário autenticado

    try {
        const troca = await prisma.trocas.findUnique({
            where: { id: parseInt(id) }
        });

        if (!troca) {
            return response.status(404).json({ error: 'Troca não encontrada' });
        }

        // Verifica se o usuário é o proprietário da troca ou se a troca está pendente
        if (troca.status !== 'pendente' || troca.usuario_id !== usuarioId) {
            return response.status(403).json({ error: 'Não autorizado a cancelar esta troca' });
        }

        await prisma.trocas.delete({
            where: { id: parseInt(id) }
        });

        response.status(200).json({ message: 'Troca cancelada com sucesso' });
    } catch (error) {
        response.status(500).json({ error: 'Erro ao cancelar a troca', details: error.message });
    }
};



const getUserExchanges = async (request, response) => {
    try {
        const { id } = request.params;
        
        // Buscar todas as trocas onde o usuário é o solicitante ou o receptor
        const trocasUsuarios = await prisma.trocas.findMany({
            where: {
                OR: [
                    { usuario_id: parseInt(id) },
                    { livros: { usuario_id: parseInt(id) } }
                ]
            },
            include: {
                livros: { // Inclui detalhes do livro associado à troca
                    select: { 
                        id: true,
                        titulo: true,
                        autor: true
                    }
                },
                usuarios: { // Inclui detalhes do usuário associado à troca
                    select: { 
                        id: true,
                        nome: true
                    }
                }
            }
        });
        
        // Adiciona o campo 'role' para diferenciar quem solicitou a troca e recebeu a troca
        const trocasComRole = trocasUsuarios.map(troca => {
            return {
                ...troca,
                role: troca.usuario_id === parseInt(id) ? 'Solicitou a troca' : 'Recebeu a solicitação'
            };
        });
        
        response.json(trocasComRole);
    } catch (error) {
        response.status(500).json({ error: 'Erro ao buscar trocas do usuário', details: error.message });
    }
}; 

const updateExchange = async (request, response) => {
    try {
        const { id } = request.params; // ID da troca a ser atualizada
        const { status } = request.body; // Novo status da troca (aprovado ou rejeitado)
        const usuarioId = request.usuario.id; // ID do usuário autenticado

        // Verificar se o status fornecido é válido
        if (!['aprovado', 'rejeitado'].includes(status)) {
            return response.status(400).json({ error: 'Status inválido. Use "aprovado" ou "rejeitado".' });
        }

        // Buscar a troca com a relação livros
        const troca = await prisma.trocas.findUnique({
            where: { id: parseInt(id) },
            include: { livros: true } // Inclui a relação livros
        });

        if (!troca) {
            return response.status(404).json({ error: 'Troca não encontrada' });
        }

        // Verifica se a troca está pendente e se o usuário é o receptor da troca
        if (troca.status !== 'pendente' || troca.livros.usuario_id !== usuarioId) {
            return response.status(403).json({ error: 'Não autorizado a atualizar esta troca' });
        }

        // Atualiza o status da troca
        const trocaAtualizada = await prisma.trocas.update({
            where: { id: parseInt(id) },
            data: { status }
        });

        response.status(200).json(trocaAtualizada);
    } catch (error) {
        response.status(500).json({ error: 'Erro ao atualizar a troca', details: error.message });
    }
};

module.exports = {
    getAllExchanges,
    createExchange,
    cancelExchange,
    getUserExchanges,
    updateExchange
}