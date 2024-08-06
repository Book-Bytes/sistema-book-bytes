const prisma = require('../database/prismaClient');
const Joi = require('joi');

// Validação para avaliações
const ReviewSchema = Joi.object({
    nota: Joi.number().integer().min(1).max(5).required(),
    comentario: Joi.string().max(255).optional(),
});

// Criar uma nova avaliação para uma troca específica
const createReview = async (request, response) => {
    try {
        const { error, value } = ReviewSchema.validate(request.body);
        if (error) {
            return response.status(400).json({ error: error.details[0].message });
        }

        const { troca_id } = request.params;  // ID da troca a ser avaliada
        const usuarioId = request.usuario.id;  // ID do usuário autenticado

        // Certificar-se de que o ID da troca é um número inteiro
        const trocaId = parseInt(troca_id, 10);
        if (isNaN(trocaId)) {
            return response.status(400).json({ error: 'ID da troca inválido' });
        }

        // Verificar se a troca existe
        const troca = await prisma.trocas.findUnique({
            where: { id: trocaId }
        });

        if (!troca) {
            return response.status(404).json({ error: 'Troca não encontrada' });
        }

        // Verificar se o usuário está envolvido na troca
        if (troca.usuario_id !== usuarioId && troca.livro_id !== usuarioId) {
            return response.status(403).json({ error: 'Usuário não está envolvido na troca' });
        }

        // Encontrar ou criar um registro de histórico de transações para a troca
        const historicoSolicitante = await prisma.historicotransacoes.findFirst({
            where: {
                troca_id: trocaId,
                usuario_id: troca.usuario_id
            }
        });

        const historicoDono = await prisma.historicotransacoes.findFirst({
            where: {
                troca_id: trocaId,
                usuario_id: troca.livro_id
            }
        });

        // Verificar se o histórico de transações existe para ambos os usuários
        if (!historicoSolicitante || !historicoDono) {
            return response.status(404).json({ error: 'Histórico de transações não encontrado' });
        }

        // Verificar se o usuário já avaliou essa troca
        const avaliacaoExistente = await prisma.avaliacoes.findFirst({
            where: {
                usuario_id: usuarioId,
                troca_id: trocaId  // Associar avaliação diretamente à troca
            }
        });

        if (avaliacaoExistente) {
            return response.status(400).json({ error: 'Usuário já avaliou esta troca' });
        }

        // Criar a avaliação
        const avaliacao = await prisma.avaliacoes.create({
            data: {
                nota: value.nota,
                comentario: value.comentario,
                usuario_id: usuarioId,
                troca_id: trocaId  // Associar avaliação diretamente à troca
            }
        });

        response.status(201).json(avaliacao);
    } catch (error) {
        console.error('Erro ao criar avaliação:', error);
        response.status(500).json({ error: 'Erro ao criar avaliação', details: error.message });
    }
};

// Listar avaliações relacionadas a uma troca específica
const getReviewsExchange = async (request, response) => {
    try {
        response.status(200).json(avaliacoes);
    } catch (error) {
        console.error('Erro ao buscar avaliações:', error);
        response.status(500).json({ error: 'Erro ao buscar avaliações', details: error.message });
    }
};


module.exports = {
    createReview,
    getReviewsExchange
};
