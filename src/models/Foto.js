const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { logError } = require('../utils/logger');

const fotoSchema = new mongoose.Schema(
  {
    _id: Number,
    titulo: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    album: {
      type: Number,
      ref: 'Album',
      required: true
    },
    tags: {
      type: [String],
      default: []
    },
    dataUpload: {
      type: Date,
      default: Date.now
    }
  },
  {
    _id: false,
    versionKey: false
  }
);

fotoSchema.plugin(AutoIncrement, { id: 'foto_seq', inc_field: '_id' });

function validarCamposObrigatoriosFoto(dados) {
  if (!dados || !dados.titulo || !dados.titulo.trim()) {
    throw new Error('O campo titulo é obrigatório.');
  }

  if (!dados.url || !dados.url.trim()) {
    throw new Error('O campo url é obrigatório.');
  }

  if (!dados.album || !String(dados.album).trim()) {
    throw new Error('O campo album é obrigatório.');
  }
}

fotoSchema.statics.criarFoto = async function (dados) {
  try {
    validarCamposObrigatoriosFoto(dados);

    if (isNaN(dados.album)) {
      throw new Error('ID do álbum inválido.');
    }

    const Album = require('./Album');

    const albumExiste = await Album.findById(dados.album);
    if (!albumExiste) {
      throw new Error('Álbum informado não existe.');
    }

    let tagsTratadas = [];

    if (Array.isArray(dados.tags)) {
      tagsTratadas = dados.tags
        .map(tag => String(tag).trim())
        .filter(tag => tag.length > 0);
    }

    const novaFoto = new this({
      titulo: dados.titulo.trim(),
      url: dados.url.trim(),
      album: dados.album,
      tags: tagsTratadas
    });

    const fotoSalva = await novaFoto.save();
    return { sucesso: true, dados: fotoSalva, erro: null };
  } catch (error) {
    logError(error);
    return { sucesso: false, erro: error.message };
  }
};

fotoSchema.statics.buscarPorId = async function (id) {
  try {
    if (!id || isNaN(id)) {
      throw new Error('ID de foto inválido.');
    }

    const foto = await this.findById(id).populate({
      path: 'album',
      populate: {
        path: 'usuario',
        select: 'nome email'
      }
    });

    if (!foto) {
      return { sucesso: false, erro: 'Foto não encontrada.' };
    }

    return { sucesso: true, dados: foto };
  } catch (error) {
    logError(error);
    return { sucesso: false, erro: error.message };
  }
};

fotoSchema.statics.listarPorAlbum = async function (albumId) {
  try {
    if (!albumId || isNaN(albumId)) {
      throw new Error('ID de álbum inválido.');
    }

    const fotos = await this.find({ album: albumId })
      .populate('album', 'titulo')
      .sort({ dataUpload: -1 });

    return { sucesso: true, dados: fotos };
  } catch (error) {
    logError(error);
    return { sucesso: false, erro: error.message };
  }
};

fotoSchema.statics.buscarPorTag = async function (tag) {
  try {
    if (!tag || !tag.trim()) {
      throw new Error('A tag informada é obrigatória.');
    }

    const fotos = await this.find({ tags: tag.trim() })
      .populate('album', 'titulo')
      .sort({ dataUpload: -1 });

    return { sucesso: true, dados: fotos };
  } catch (error) {
    logError(error);
    return { sucesso: false, erro: error.message };
  }
};

fotoSchema.statics.listarTodas = async function () {
  try {
    const fotos = await this.find()
      .populate('album', 'titulo')
      .sort({ dataUpload: -1 });

    return { sucesso: true, dados: fotos };
  } catch (error) {
    logError(error);
    return { sucesso: false, erro: error.message };
  }
};

fotoSchema.statics.deletar = async function (id) {
  try {
    if (!id || isNaN(id)) {
      throw new Error('ID de foto inválido.');
    }

    const fotoRemovida = await this.findByIdAndDelete(id);

    if (!fotoRemovida) {
      return { sucesso: false, erro: 'Foto não encontrada para remoção.' };
    }

    return { sucesso: true, dados: fotoRemovida };
  } catch (error) {
    logError(error);
    return { sucesso: false, erro: error.message };
  }
};

const Foto = mongoose.model('Foto', fotoSchema);

module.exports = Foto;
