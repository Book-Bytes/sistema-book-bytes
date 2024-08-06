const prisma = require('../database/prismaClient');

// Busca o histórico de trocas de um usuário
const getUserHistory = async (request, response) => {
    try {
        const { id } = request.params;

        // Verifica se o ID do usuário foi fornecido
        if (!id) {
            return response.status(400).json({ error: 'O ID do usuário é obrigatório' });
        }

        // Busca todas as trocas do histórico onde o usuário está associado
        const historicoTrocas = await prisma.historicotransacoes.findMany({
            where: {
                usuario_id: parseInt(id, 10) // Garante que o ID é tratado como número
            },
            include: { 
                trocas: {
                    select: {
                        id: true,
                        status: true,
                        livros: {
                            select: {
                                titulo: true,
                                autor: true
                            }
                        },
                        usuarios: {
                            select: {
                                nome: true
                            }
                        }
                    }
                }
            }
        });

        // Verifica se o histórico está vazio
        if (historicoTrocas.length === 0) {
            return response.status(404).json({ message: 'Nenhum histórico encontrado' });
        }

        // Retorna o histórico de trocas
        response.json(historicoTrocas);
    } catch (error) {
        response.status(500).json({ error: 'Erro ao buscar histórico', details: error.message });
    }
};

// Adiciona trocas ao histórico
const addToHistory = async (request, response) => {
    try {
        // Busca trocas com status "aprovado" ou "rejeitado"
        const trocasAdd = await prisma.trocas.findMany({
            where: {
                status: {
                    in: ['aprovado', 'rejeitado']
                }
            }
        });

        // Adiciona cada troca à tabela historicotransacoes, se ainda não estiver adicionada
        for (const troca of trocasAdd) {
            // Verifica se já existe um registro na tabela historicotransacoes
            const registroExistente = await prisma.historicotransacoes.findFirst({
                where: {
                    troca_id: troca.id
                }
            });

            // Adiciona o registro se não existir
            if (!registroExistente) {
                await prisma.historicotransacoes.create({
                    data: {
                        troca_id: troca.id,
                        usuario_id: troca.usuario_id
                    }
                });
            }
        }

        response.status(200).json({ message: 'Histórico atualizado com sucesso.' });
    } catch (error) {
        response.status(500).json({ error: 'Erro ao atualizar o histórico', details: error.message });
    }
};

module.exports = {
    getUserHistory,
    addToHistory
};