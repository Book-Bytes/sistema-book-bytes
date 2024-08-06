const prisma = require('../database/prismaClient');
const Joi = require('joi');

// Validação
const MessageSchema = Joi.object({
    mensagem: Joi.string().min(1).required()
})

const sendMenssage = async (request, response) => {
    try {
        // Validação da mensagem
        const { error, value } = MessageSchema.validate(request.body);
        if (error) {
            return response.status(400).json({ error: error.details[0].message });
        }

        const { troca_id } = request.params;  // ID da troca para a qual a mensagem está sendo enviada
        const usuarioId = request.usuario.id;  // ID do usuário autenticado

        // Certificar-se de que o ID da troca é um número inteiro
        const trocaId = parseInt(troca_id, 10);
        if (isNaN(trocaId)) {
            return response.status(400).json({ error: 'ID da troca inválido' });
        }

        // Verificar se a troca existe e se o usuário está associado à troca
        const troca = await prisma.trocas.findUnique({
            where: { id: trocaId }
        });

        if (!troca) {
            return response.status(404).json({ error: 'Troca não encontrada' });
        }

        // Verificar se o usuário está envolvido na troca
        if (troca.usuario_id !== usuarioId && troca.livro_id !== usuarioId) {
            return response.status(403).json({ error: 'Usuário não está associado a esta troca' });
        }

        // Adicionar a nova mensagem
        const mensagem = await prisma.mensagenschat.create({
            data: {
                mensagem: value.mensagem,
                usuario_id: usuarioId,
                // Associa a mensagem à troca
                // Observe que a associação pode ser feita diretamente ou através de um histórico, dependendo da lógica do seu sistema
            }
        });

        response.status(201).json(mensagem);
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        response.status(500).json({ error: 'Erro ao enviar mensagem', details: error.message });
    }
};

const listMessages = async (request, response) => {
    try {
        const { troca_id } = request.params;  // ID da troca para a qual as mensagens estão sendo listadas
        const usuarioId = request.usuario.id;  // ID do usuário autenticado

        // Certificar-se de que o ID da troca é um número inteiro
        const trocaId = parseInt(troca_id, 10);
        if (isNaN(trocaId)) {
            return response.status(400).json({ error: 'ID da troca inválido' });
        }

        // Verificar se a troca existe e se o usuário está associado à troca
        const troca = await prisma.trocas.findUnique({
            where: { id: trocaId }
        });

        if (!troca) {
            return response.status(404).json({ error: 'Troca não encontrada' });
        }

        // Verificar se o usuário está envolvido na troca
        if (troca.usuario_id !== usuarioId && troca.livro_id !== usuarioId) {
            return response.status(403).json({ error: 'Usuário não está associado a esta troca' });
        }

        // Listar todas as mensagens do usuário para essa troca
        const mensagens = await prisma.mensagenschat.findMany({
            where: {
                usuario_id: usuarioId // Filtra por ID do usuário
            },
            // Ordena pelas colunas disponíveis
            orderBy: {
                id: 'asc' // Ou use algum outro campo existente no modelo
            }
        });

        response.status(200).json(mensagens);
    } catch (error) {
        console.error('Erro ao listar mensagens:', error);
        response.status(500).json({ error: 'Erro ao listar mensagens', details: error.message });
    }
};

module.exports ={
    sendMenssage,
    listMessages
}