const jwt = require('jsonwebtoken');

module.exports = function (request, response, next) {
    try {
        const { authorization } = request.headers;

        // Verifica se o cabeçalho de autorização está presente
        if (!authorization) {
            return response.status(401).json('Não autorizado');
        }

        // Extrai o token do cabeçalho de autorização
        const token = authorization.replace('Bearer ', '').trim();
        const decodedToken = jwt.verify(token, process.env.SECRET_JWT);

        // Verifica se o token contém o ID do usuário
        if (!decodedToken.usuarioId) {
            return response.status(401).json('Token inválido');
        }

        // Define o usuário autenticado a partir do payload do token
        request.usuario = { id: decodedToken.usuarioId, nome: decodedToken.usuario };

        return next();
    } catch (error) {
        return response.status(401).send();
    }
};
