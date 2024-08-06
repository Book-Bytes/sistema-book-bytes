const prisma = require('../database/prismaClient')
const Joi = require('joi')

// Validação
const BookSchema = Joi.object({
    titulo: Joi.string().max(255).required(),
    autor: Joi.string().max(255).required(),
    genero: Joi.string().max(255).required(),
    ano_publicacao: Joi.number().integer().required()
})


// Busca todos os livros
const getAllBooks = async (request, response) => {
  try {
    const buscarLivros = await prisma.livros.findMany();
    response.json(buscarLivros);
  } catch (error) {
    response.status(500).json({ mensagem: 'Erro ao buscar livros.' });
  }
};


// Cadastrar um novo livro
const createBook = async (request, response) => {
    try {
        const { error, value } = BookSchema.validate(request.body);

        if (error){
            return response.status(400).json({error: error});
        }

        // Verifica se request.usuario existe e possui o ID
        if (!request.usuario || !request.usuario.id) {
          return response.status(401).json({ error: 'O ID do usuário está ausente ou não é autorizado' });
        }

        const novoLivro = await prisma.livros.create({
            data: {
                usuario_id: request.usuario.id,
                titulo: value.titulo,
                autor: value.autor,
                genero: value.genero,
                ano_publicacao: value.ano_publicacao
            }
        })
        response.status(201).json(novoLivro);
    } catch (error) {
        response.status(500).json({ error: 'Erro ao cadastrar livro', details: error.message });
    }
}

// Atualizar um livro
const updateBook = async (request, response) => {
    try {
        const { error, value } = BookSchema.validate(request.body);

        if (error) {
            return response.status(400).json({ error: error.details });
        }

        const { id } = request.params;
        const livro = await prisma.livros.findFirst({
            where: { id: parseInt(id) }
        });

        if (livro) {
            const atualizarLivro = await prisma.livros.update({
                where: { id: parseInt(id) },
                data: value
            });
            response.status(200).json({ message: 'Livro atualizado com sucesso', livro: atualizarLivro });
        } else {
            response.status(404).json({ error: 'Livro não encontrado' });
        }
    } catch (error) {
        response.status(500).json({ error: 'Erro ao atualizar o livro', details: error.message });
    }
}

// Excluir um livro
const deleteBook = async (request, response) => {
    try {
        const { id } = request.params;
        const livro = await prisma.livros.findFirst({
            where: { id: parseInt(id) }
        })
  
        if (livro) {
            await prisma.livros.delete({
                where: { id: parseInt(id) }
            });
            response.status(204).send();
        } else {
            response.status(404).json({ error: 'Livro não encontrado' });
        }
    } catch (error) {
        response.status(500).json({ error: 'Erro ao excluir o livro', details: error.message });
    }
}

// Informações de um livro específico
const getBook = async (request, response) => {
    const { id } = request.params;
    try {
        const buscarLivroPorId = await prisma.livros.findUnique({ 
            where: { id: parseInt(id) } 
        })
        if (!buscarLivroPorId) {
            return response.status(404).json({ mensagem: 'Livro não encontrado' })
        }
        response.json(buscarLivroPorId);
    } catch (error) {
        response.status(500).json({ mensagem: 'Erro ao buscar o livro' });
    }
};

// Buscar todos os livros de um usuário específico
const getUserBooks = async (request, response) => {
    try {
        const { id } = request.params;
        const livrosUsuarios = await prisma.livros.findMany({
            where: { usuario_id: parseInt(id) }
        })
        response.json(livrosUsuarios);
    } catch (error) {
      response.status(500).json({ mensagem: 'Erro ao buscar o livro' });
    }
};

module.exports = {
    getAllBooks,
    createBook,
    updateBook,
    deleteBook,
    getBook,
    getUserBooks
}