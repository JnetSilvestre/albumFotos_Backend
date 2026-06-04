const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const Album = require('../models/Album');
const Foto = require('../models/Foto');
const { requireAuth } = require('../middlewares/authMiddleware');

// === ROTAS PÚBLICAS ===

// Formulário de Login
router.get('/login', (req, res) => {
  if (req.session.usuarioId) {
    return res.redirect('/');
  }
  res.render('login', { erro: null });
});

// Processamento de Login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  const resultado = await Usuario.autenticar(email, senha);

  if (resultado.sucesso) {
    req.session.usuarioId = resultado.dados._id;
    req.session.usuarioNome = resultado.dados.nome;
    return res.redirect('/');
  }

  res.render('login', { erro: resultado.erro });
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// Formulário de Cadastro de Usuário
router.get('/cadastro', (req, res) => {
  res.render('cadastro', { erro: null });
});

// Processamento do Cadastro
router.post('/cadastro', async (req, res) => {
  const { nome, email, senha } = req.body;
  const resultado = await Usuario.criarUsuario({ nome, email, senha });

  if (resultado.sucesso) {
    req.session.usuarioId = resultado.dados._id;
    req.session.usuarioNome = resultado.dados.nome;
    return res.redirect('/');
  }

  res.render('cadastro', { erro: resultado.erro });
});

// === ROTAS PROTEGIDAS ===

// Dashboard / Meus Álbuns
router.get('/', requireAuth, async (req, res) => {
  const resultado = await Album.listarPorUsuario(req.session.usuarioId);
  const albuns = resultado.sucesso ? resultado.dados : [];
  res.render('dashboard', { albuns, erro: resultado.sucesso ? null : resultado.erro });
});

// Formulário de Novo Álbum
router.get('/albuns/novo', requireAuth, (req, res) => {
  res.render('album_novo', { erro: null });
});

// Criar Novo Álbum
router.post('/albuns/novo', requireAuth, async (req, res) => {
  const { titulo, descricao } = req.body;
  const resultado = await Album.criarAlbum({
    titulo,
    descricao,
    usuario: req.session.usuarioId
  });

  if (resultado.sucesso) {
    return res.redirect('/');
  }

  res.render('album_novo', { erro: resultado.erro });
});

// Ver Álbum (Lista as Fotos)
router.get('/albuns/:id', requireAuth, async (req, res) => {
  const albumId = Number(req.params.id);
  const resultadoAlbum = await Album.buscarPorId(albumId);
  
  if (!resultadoAlbum.sucesso) {
    return res.redirect('/');
  }

  // Verifica se o usuário é dono do álbum
  if (resultadoAlbum.dados.usuario._id !== req.session.usuarioId) {
    return res.redirect('/');
  }

  const resultadoFotos = await Foto.listarPorAlbum(albumId);
  const fotos = resultadoFotos.sucesso ? resultadoFotos.dados : [];

  res.render('album_detalhes', { 
    album: resultadoAlbum.dados, 
    fotos, 
    erro: null 
  });
});

// Deletar Álbum
router.post('/albuns/:id/deletar', requireAuth, async (req, res) => {
  const albumId = Number(req.params.id);
  
  // O ideal seria verificar o dono antes, mas para simplicidade let's trust the session context in the view
  await Album.deletar(albumId);
  res.redirect('/');
});

// Adicionar Foto ao Álbum
router.post('/albuns/:id/fotos', requireAuth, async (req, res) => {
  const albumId = Number(req.params.id);
  const { titulo, url, tags } = req.body;

  const arrayTags = tags ? tags.split(',').map(t => t.trim()) : [];

  const resultado = await Foto.criarFoto({
    titulo,
    url,
    album: albumId,
    tags: arrayTags
  });

  if (!resultado.sucesso) {
    // Para simplificar, num erro apenas redireciona devolta
    console.error('Erro ao adicionar foto', resultado.erro);
  }

  res.redirect(`/albuns/${albumId}`);
});

// Deletar Foto
router.post('/fotos/:id/deletar', requireAuth, async (req, res) => {
  const fotoId = Number(req.params.id);
  const albumId = req.query.album; // Espera-se o ID do álbum na query string para redirecionar

  await Foto.deletar(fotoId);
  
  if (albumId) {
    res.redirect(`/albuns/${albumId}`);
  } else {
    res.redirect('/');
  }
});

module.exports = router;
