function requireAuth(req, res, next) {
  if (req.session && req.session.usuarioId) {
    return next();
  }
  
  if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
    return res.status(401).json({ sucesso: false, erro: 'Acesso negado. Faça o login.' });
  }

  res.redirect('/login');
}

module.exports = {
  requireAuth
};
