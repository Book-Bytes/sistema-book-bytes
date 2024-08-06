const Router = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const bookController = require('../controllers/bookController');
const exchangesController = require('../controllers/exchangesController');
const transactionHistoryController = require('../controllers/transactionHistoryController');
const reviewController = require('../controllers/reviewController');
const chatController = require('../controllers/chatController');

const authenticate = require('../middlewares/authenticate');
const { authorization } = require('../middlewares/authorization');
const { authorizationBook } = require('../middlewares/authorization');

const router = Router();

// Rotas para operações de autenticação
router.post(("/login"), authController.login);

// Rotas para operações relacionadas ao usuário
router.get(("/usuarios"), userController.getAllUsers);
router.post(("/usuarios/cadastrar"), userController.createUser);
router.put(("/usuarios/:id"), authenticate, authorization, userController.updateUser);
router.delete(("/usuarios/:id"), authenticate, authorization, userController.deleteUser);
router.put(("/usuarios/:id/senha"), authenticate, authorization, userController.updatePassword);
router.get("/usuarios/:id/reputacao", userController.getUserReputation);
router.get(("/usuarios/:id"), userController.getUser);

// Rotas para operações relacionadas a livros
router.get(("/livros"), bookController.getAllBooks);
router.post(("/livros/cadastrar"), authenticate, bookController.createBook);
router.put(("/livros/:id"), authenticate, authorizationBook, bookController.updateBook);
router.delete(("/livros/:id"), authenticate, authorizationBook, bookController.deleteBook);
router.get(("/livros/:id"), bookController.getBook);
router.get(("/usuarios/:id/livros"), bookController.getUserBooks);

// Rotas para operações relacionadas a trocas
router.get(("/trocas"), exchangesController.getAllExchanges);
router.post(("/trocas"), authenticate, exchangesController.createExchange);
router.delete("/trocas/:id", authenticate, exchangesController.cancelExchange);
router.get(("/usuarios/trocas/:id"), authenticate, exchangesController.getUserExchanges);
router.put(("/trocas/:id/status"), authenticate, exchangesController.updateExchange);

// Rotas para operações relacionadas ao histórico de transações
router.get(("/usuarios/:id/historico"), transactionHistoryController.getUserHistory);
router.post(("/historico/add"), transactionHistoryController.addToHistory);

// Rotas para operações relacionadas a avaliações
router.get(("/trocas/:troca_id/avaliacoes"), reviewController.getReviewsExchange);
router.post(("/avaliacoes/:troca_id"), authenticate, reviewController.createReview);


// Rotas para operações relacionadas a mensagens de chat
router.get(("/trocas/:troca_id/mensagens"), authenticate, chatController.listMessages);
router.post(("/trocas/:troca_id/mensagens"), authenticate, chatController.sendMenssage);

module.exports = router;