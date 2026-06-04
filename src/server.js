const express = require('express');
const session = require('express-session');
const path = require('path');
const mongoose = require('mongoose');

const routes = require('./routes/index');
const { logError } = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/galeria_fotos';

// Configurações do EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares padrão
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Configuração da Sessão
app.use(session({
  secret: 'segredo_album_fotos_2026',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // false pois não estamos em HTTPS localmente
}));

// Middleware para passar informações da sessão para as views
app.use((req, res, next) => {
  res.locals.usuarioId = req.session.usuarioId || null;
  res.locals.usuarioNome = req.session.usuarioNome || null;
  next();
});

// Rotas principais
app.use('/', routes);

// Tratamento global de erros para Express
app.use((err, req, res, next) => {
  logError(err);
  console.error('Erro Express:', err.stack);
  res.status(500).send('Algo deu errado no servidor!');
});

// Conexão com o BD e start do servidor
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Conexão com MongoDB estabelecida com sucesso.');
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Acesse http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    logError(error);
    console.error(`Falha ao conectar ao MongoDB: ${error.message}`);
    process.exit(1);
  });
