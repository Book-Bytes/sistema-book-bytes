const prisma = require('../database/prismaClient')
const bcrypt = require('bcryptjs')
const Joi = require('joi')

// Validação
const createUserSchema = Joi.object({
    nome: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    senha: Joi.string().min(5).required()
});

const updateUserSchema = Joi.object({
    nome: Joi.string().min(3).optional(),
    email: Joi.string().email().optional()
});

const updatePasswordSchema = Joi.object({
    senha: Joi.string().min(5).required()
});

// Busca todos os usuários
const getAllUsers = async (request, response) => {
    try {
        const buscarUsuarios = await prisma.usuarios.findMany({
            select: {
                id: true,
                nome: true,
                email: true
            }
        });
        response.status(200).json(buscarUsuarios);
    } catch (error) {
        response.status(500).json({ error: 'Erro ao buscar usuários', details: error.message });
    }
};

// Cadastra um novo usuário
const createUser = async (request, response) => {
    try {
        const { error, value } = createUserSchema.validate(request.body);

        if (error) {
            return response.status(400).json({ error: error.details });
        }

        const senhaHash = bcrypt.hashSync(value.senha, 10);

        const novoUsuario = await prisma.usuarios.create({
            data: {
                nome: value.nome,
                email: value.email,
                senha: senhaHash
            },
            select: {
                id: true,
                nome: true,
                email: true
            }
        });

        response.status(201).json(novoUsuario);
    } catch (error) {
        response.status(500).json({ error: 'Erro ao criar usuário', details: error.message });
    }
};

// Atualiza informações do usuário (exceto senha)
const updateUser = async (request, response) => {
    try {
        const { error, value } = updateUserSchema.validate(request.body);

        if (error) {
            return response.status(400).json({ error: error.details });
        }

        const { id } = request.params;
        const usuario = await prisma.usuarios.findFirst({
            where: { id: parseInt(id, 10) }
        });

        if (usuario) {
            const atualizarUsuario = await prisma.usuarios.update({
                data: value,
                select: {
                    nome: true,
                    email: true
                },
                where: { id: parseInt(id, 10) }
            });
            response.status(200).json({ message: 'Usuário atualizado com sucesso', usuario: atualizarUsuario });
        } else {
            response.status(404).json({ error: 'Usuário não encontrado' });
        }
    } catch (error) {
        response.status(500).json({ error: 'Erro ao atualizar o usuário', details: error.message });
    }
};

// Deleta um usuário
const deleteUser = async (request, response) => {
    try {
        const { id } = request.params;
        const usuario = await prisma.usuarios.findFirst({
            where: { id: parseInt(id, 10) }
        });

        if (usuario) {
            await prisma.usuarios.delete({
                where: { id: parseInt(id, 10) }
            });
            response.status(204).send();
        } else {
            response.status(404).json({ error: 'Usuário não encontrado' });
        }
    } catch (error) {
        response.status(500).json({ error: 'Erro ao excluir usuário', details: error.message });
    }
};

// Atualiza apenas a senha do usuário
const updatePassword = async (request, response) => {
    try {
        const { error, value } = updatePasswordSchema.validate(request.body);

        if (error) {
            return response.status(400).json({ error: error.details });
        }

        const { id } = request.params;
        const usuario = await prisma.usuarios.findFirst({
            where: { id: parseInt(id, 10) }
        });

        if (!usuario) {
            return response.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Verifica se a nova senha é diferente da senha atual
        const verificarSenha = await bcrypt.compare(value.senha, usuario.senha);
        if (verificarSenha) {
            return response.status(400).json({ error: 'A nova senha não pode ser igual à senha atual' });
        }

        const senhaHash = bcrypt.hashSync(value.senha, 10);
        await prisma.usuarios.update({
            where: { id: parseInt(id, 10) },
            data: { senha: senhaHash }
        });

        response.status(200).json({ message: 'Senha atualizada com sucesso' });
    } catch (error) {
        response.status(500).json({ error: 'Erro ao atualizar a senha', details: error.message });
    }
};

// Calcula a reputação do usuário com base nas avaliações
const calcularReputacao = async (usuarioId) => {
    const usuario = await prisma.usuarios.findUnique({
        where: { id: parseInt(usuarioId, 10) },
        include: { avaliacoes: true }
    });

    if (!usuario) throw new Error('Usuário não encontrado');

    const totalReview = usuario.avaliacoes.reduce((sum, avaliacao) => sum + avaliacao.nota, 0);
    return totalReview / usuario.avaliacoes.length || 0;
};

// Busca a reputação do usuário com base nas avaliações
const getUserReputation = async (request, response) => {
    try {
        const { id } = request.params;
        const reputacao = await calcularReputacao(id);
        response.json({ reputacao: reputacao });
    } catch (error) {
        response.status(500).json({ error: 'Erro ao calcular reputação', details: error.message });
    }
};

// Busca as informações do usuário, incluindo histórico de transações
const getUser = async (request, response) => {
    try {
        const { id } = request.params;
        const usuario = await prisma.usuarios.findUnique({
            where: { id: parseInt(id, 10) },
            include: { historicotransacoes: true }
        });

        if (!usuario) {
            return response.status(404).send('Usuário não encontrado');
        }

        const reputacao = await calcularReputacao(id);

        response.json({
            nome: usuario.nome,
            reputacao: reputacao,
            historico: usuario.historicotransacoes
        });
    } catch (error) {
        response.status(500).json({ error: 'Erro ao buscar usuário', details: error.message });
    }
};

module.exports = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    updatePassword,
    getUserReputation,
    getUser
};