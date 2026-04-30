const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { logError } = require('../utils/logger');

const usuarioSchema = new mongoose.Schema(
  {
    _id: Number,
    nome: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    dataCriacao: {
      type: Date,
      default: Date.now
    }
  },
  {
    _id: false,
    versionKey: false
  }
);

usuarioSchema.plugin(AutoIncrement, { id: 'usuario_seq', inc_field: '_id' });

function validarCamposObrigatoriosUsuario(dados) {
  if (!dados || !dados.nome || !dados.nome.trim()) {
    throw new Error('O campo nome é obrigatório.');
  }

  if (!dados.email || !dados.email.trim()) {
    throw new Error('O campo email é obrigatório.');
  }
}

usuarioSchema.statics.criarUsuario = async function (dados) {
  try {
    validarCamposObrigatoriosUsuario(dados);

    const novoUsuario = new this({
      nome: dados.nome.trim(),
      email: dados.email.trim().toLowerCase()
    });

    const usuarioSalvo = await novoUsuario.save();
    return { sucesso: true, dados: usuarioSalvo, erro: null };
  } catch (error) {
    logError(error);

    if (error.code === 11000) {
      return { sucesso: false, erro: 'Já existe um usuário cadastrado com este email.' };
    }

    return { sucesso: false, erro: error.message };
  }
};

usuarioSchema.statics.buscarPorId = async function (id) {
  try {
    if (!id || isNaN(id)) {
      throw new Error('ID de usuário inválido.');
    }

    const usuario = await this.findById(id);

    if (!usuario) {
      return { sucesso: false, erro: 'Usuário não encontrado.' };
    }

    return { sucesso: true, dados: usuario };
  } catch (error) {
    logError(error);
    return { sucesso: false, erro: error.message };
  }
};

usuarioSchema.statics.listarTodos = async function () {
  try {
    const usuarios = await this.find().sort({ dataCriacao: -1 });
    return { sucesso: true, dados: usuarios };
  } catch (error) {
    logError(error);
    return { sucesso: false, erro: error.message };
  }
};

usuarioSchema.statics.deletar = async function (id) {
  try {
    if (!id || isNaN(id)) {
      throw new Error('ID de usuário inválido.');
    }

    const usuarioRemovido = await this.findByIdAndDelete(id);

    if (!usuarioRemovido) {
      return { sucesso: false, erro: 'Usuário não encontrado para remoção.' };
    }

    return { sucesso: true, dados: usuarioRemovido };
  } catch (error) {
    logError(error);
    return { sucesso: false, erro: error.message };
  }
};

const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario;
