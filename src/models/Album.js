const mongoose = require('mongoose');
const { logError } = require('../utils/logger');

const albumSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: true,
      trim: true
    },
    descricao: {
      type: String,
      trim: true,
      default: ''
    },
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true
    },
    dataCriacao: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false
  }
);

function validarCamposObrigatoriosAlbum(dados) {
  if (!dados || !dados.titulo || !dados.titulo.trim()) {
    throw new Error('O campo titulo é obrigatório.');
  }

  if (!dados.usuario || !String(dados.usuario).trim()) {
    throw new Error('O campo usuario é obrigatório.');
  }
}

albumSchema.statics.criarAlbum = async function (dados) {
  try {
    validarCamposObrigatoriosAlbum(dados);

    if (!mongoose.Types.ObjectId.isValid(dados.usuario)) {
      throw new Error('ID do usuário inválido.');
    }

    const Usuario = require('./Usuario');

    const usuarioExiste = await Usuario.findById(dados.usuario);
    if (!usuarioExiste) {
      throw new Error('Usuário informado não existe.');
    }

    const novoAlbum = new this({
      titulo: dados.titulo.trim(),
      descricao: dados.descricao ? dados.descricao.trim() : '',
      usuario: dados.usuario
    });

    const albumSalvo = await novoAlbum.save();
    return { sucesso: true, dados: albumSalvo, erro: null };
  } catch (error) {
    logError(error);
    return { sucesso: false, erro: error.message };
  }
};

albumSchema.statics.buscarPorId = async function (id) {
  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('ID de álbum inválido.');
    }

    const album = await this.findById(id).populate('usuario', 'nome email');

    if (!album) {
      return { sucesso: false, erro: 'Álbum não encontrado.' };
    }

    return { sucesso: true, dados: album };
  } catch (error) {
    logError(error);
    return { sucesso: false, erro: error.message };
  }
};

albumSchema.statics.listarPorUsuario = async function (usuarioId) {
  try {
    if (!usuarioId || !mongoose.Types.ObjectId.isValid(usuarioId)) {
      throw new Error('ID de usuário inválido.');
    }

    const albuns = await this.find({ usuario: usuarioId })
      .populate('usuario', 'nome email')
      .sort({ dataCriacao: -1 });

    return { sucesso: true, dados: albuns };
  } catch (error) {
    logError(error);
    return { sucesso: false, erro: error.message };
  }
};

albumSchema.statics.listarTodos = async function () {
  try {
    const albuns = await this.find()
      .populate('usuario', 'nome email')
      .sort({ dataCriacao: -1 });

    return { sucesso: true, dados: albuns };
  } catch (error) {
    logError(error);
    return { sucesso: false, erro: error.message };
  }
};

albumSchema.statics.deletar = async function (id) {
  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('ID de álbum inválido.');
    }

    const Foto = require('./Foto');

    const album = await this.findById(id);
    if (!album) {
      return { sucesso: false, erro: 'Álbum não encontrado para remoção.' };
    }

    const totalFotos = await Foto.countDocuments({ album: id });

    const albumRemovido = await this.findByIdAndDelete(id);
    await Foto.deleteMany({ album: id });

    return {
      sucesso: true,
      dados: albumRemovido,
      aviso:
        totalFotos > 0
          ? `Álbum removido com sucesso. ${totalFotos} foto(s) associada(s) foram removidas em cascata.`
          : 'Álbum removido com sucesso. Nenhuma foto associada foi encontrada.'
    };
  } catch (error) {
    logError(error);
    return { sucesso: false, erro: error.message };
  }
};

const Album = mongoose.model('Album', albumSchema);

module.exports = Album;
