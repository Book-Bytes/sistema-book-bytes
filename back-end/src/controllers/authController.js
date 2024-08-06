const prisma = require('../database/prismaClient')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const login = async (request, response) => {
    try{
        const { email, senha } = request.body
        
        const usuario = await prisma.usuarios.findFirst({ where: { email } })

        if(!usuario){
            return response.status(401).json({ error: "Não autorizado" })
        }

        validarSenha = bcrypt.compareSync(senha, usuario.senha)
        
        if(!validarSenha){
            return response.status(401).json({ error: "Não autorizado" })
        }

        const token = jwt.sign({usuarioId: usuario.id, usuario: usuario.nome}, process.env.SECRET_JWT, { expiresIn: '3h' })

        return response.status(200).json({id: usuario.id, usuario: usuario.nome, token: token})

    } catch(error){
        return response.status(500).json({ error: "Erro interno do servidor" })
    }

}

module.exports = {
    login
}