const prisma = require('../database/prismaClient');

// Verificar autorização de usuário, se o usuário autenticado é o proprietário do recurso solicitado.
const authorization = async (request, response, next) => {
    try {
        const { id } = request.params;
        const usuario = await prisma.usuarios.findFirst({
            where: { id: parseInt(id) }
        });

        // Verifica se o usuário existe
        if (!usuario) {
            return response.status(404).json({ message: 'Usuário não encontrado' });
        }

        // Compara o ID do usuário autenticado com o ID do usuário do recurso
        if (request.usuario.id !== usuario.id) {
            return response.status(403).json({ message: 'Proibido: você não tem permissão para acessar este recurso' });
        }

        next();
    } catch (error) {
        return response.status(500).json({ message: 'Erro ao verificar permissão', details: error.message });
    }
};

// Verificar autorização de livro, se o usuário autenticado é o proprietário do livro solicitado.
const authorizationBook = async (request, response, next) => {
    try {
        const { id } = request.params;
        const livro = await prisma.livros.findUnique({
            where: { id: parseInt(id) }
        });

        // Verifica se o livro existe
        if (!livro) {
            return response.status(404).json({ message: 'Livro não encontrado' });
        }

        // Compara o ID do usuário autenticado com o ID do proprietário do livro
        if (livro.usuario_id !== request.usuario.id) {
            return response.status(403).json({ message: 'Proibido: você não tem permissão para acessar este recurso' });
        }

        next();
    } catch (error) {
        response.status(500).json({ error: 'Erro durante a autorização', details: error.message });
    }
}

module.exports = {
    authorization,
    authorizationBook
};