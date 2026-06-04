const mongoose = require('mongoose');
const readline = require('readline');

const Usuario = require('./models/Usuario');
const Album = require('./models/Album');
const Foto = require('./models/Foto');
const { logError } = require('./utils/logger');

const MONGO_URI = 'mongodb://localhost:27017/galeria_fotos';

const CORES = {
  reset: '\x1b[0m',
  brilhante: '\x1b[1m',
  vermelho: '\x1b[31m',
  verde: '\x1b[32m',
  amarelo: '\x1b[33m',
  azul: '\x1b[34m',
  magenta: '\x1b[35m',
  ciano: '\x1b[36m',
  branco: '\x1b[37m'
};

function colorir(texto, cor) {
  return `${cor}${texto}${CORES.reset}`;
}

function titulo(texto) {
  return colorir(`\n=== ${texto} ===\n`, CORES.ciano + CORES.brilhante);
}

function sucesso(texto) {
  console.log(colorir(texto, CORES.verde));
}

function erro(texto) {
  console.log(colorir(texto, CORES.vermelho));
}

function aviso(texto) {
  console.log(colorir(texto, CORES.amarelo));
}

function destaque(texto) {
  console.log(colorir(texto, CORES.ciano));
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function perguntar(pergunta) {
  return new Promise((resolve) => {
    rl.question(colorir(pergunta, CORES.amarelo), (resposta) => {
      resolve(resposta.trim());
    });
  });
}

async function perguntarObrigatorio(pergunta) {
  let valor = '';

  while (!valor) {
    valor = await perguntar(pergunta);
    if (!valor) {
      erro('Este campo é obrigatório. Tente novamente.');
    }
  }

  return valor;
}

function exibirMenu() {
  console.log(titulo('GALERIA DE FOTOS - MENU PRINCIPAL'));
  console.log(colorir('1. Cadastrar usuário', CORES.branco));
  console.log(colorir('2. Criar álbum', CORES.branco));
  console.log(colorir('3. Adicionar foto', CORES.branco));
  console.log(colorir('4. Listar usuários', CORES.branco));
  console.log(colorir('5. Listar álbuns de um usuário', CORES.branco));
  console.log(colorir('6. Listar fotos de um álbum', CORES.branco));
  console.log(colorir('7. Buscar foto por tag', CORES.branco));
  console.log(colorir('8. Deletar foto', CORES.branco));
  console.log(colorir('9. Deletar álbum', CORES.branco));
  console.log(colorir('0. Sair', CORES.branco));
}

function formatarData(data) {
  try {
    return new Date(data).toLocaleString('pt-BR');
  } catch {
    return String(data);
  }
}

async function opcaoCadastrarUsuario() {
  try {
    console.log(titulo('Cadastro de Usuário'));

    const nome = await perguntarObrigatorio('Nome: ');
    const email = await perguntarObrigatorio('Email: ');

    const resultado = await Usuario.criarUsuario({ nome, email });

    if (resultado.sucesso) {
      sucesso('Usuário cadastrado com sucesso.');
      destaque(`ID: ${resultado.dados._id}`);
      destaque(`Nome: ${resultado.dados.nome}`);
      destaque(`Email: ${resultado.dados.email}`);
    } else {
      erro(`Erro ao cadastrar usuário: ${resultado.erro}`);
    }
  } catch (error) {
    logError(error);
    erro(`Erro inesperado: ${error.message}`);
  }
}

async function opcaoCriarAlbum() {
  try {
    console.log(titulo('Criação de Álbum'));

    const tituloAlbum = await perguntarObrigatorio('Título do álbum: ');
    const descricao = await perguntar('Descrição (opcional): ');
    const usuario = await perguntarObrigatorio('ID do usuário dono do álbum: ');

    const resultado = await Album.criarAlbum({
      titulo: tituloAlbum,
      descricao,
      usuario
    });

    if (resultado.sucesso) {
      sucesso('Álbum criado com sucesso.');
      destaque(`ID: ${resultado.dados._id}`);
      destaque(`Título: ${resultado.dados.titulo}`);
    } else {
      erro(`Erro ao criar álbum: ${resultado.erro}`);
    }
  } catch (error) {
    logError(error);
    erro(`Erro inesperado: ${error.message}`);
  }
}

async function opcaoAdicionarFoto() {
  try {
    console.log(titulo('Adicionar Foto'));

    const tituloFoto = await perguntarObrigatorio('Título da foto: ');
    const url = await perguntarObrigatorio('URL/caminho da foto: ');
    const album = await perguntarObrigatorio('ID do álbum: ');
    const tagsTexto = await perguntar('Tags separadas por vírgula (opcional): ');

    const tags = tagsTexto
      ? tagsTexto.split(',').map(tag => tag.trim()).filter(Boolean)
      : [];

    const resultado = await Foto.criarFoto({
      titulo: tituloFoto,
      url,
      album,
      tags
    });

    if (resultado.sucesso) {
      sucesso('Foto adicionada com sucesso.');
      destaque(`ID: ${resultado.dados._id}`);
      destaque(`Título: ${resultado.dados.titulo}`);
      destaque(`URL: ${resultado.dados.url}`);
    } else {
      erro(`Erro ao adicionar foto: ${resultado.erro}`);
    }
  } catch (error) {
    logError(error);
    erro(`Erro inesperado: ${error.message}`);
  }
}

async function opcaoListarUsuarios() {
  try {
    console.log(titulo('Lista de Usuários'));

    const resultado = await Usuario.listarTodos();

    if (!resultado.sucesso) {
      erro(`Erro ao listar usuários: ${resultado.erro}`);
      return;
    }

    if (!resultado.dados.length) {
      aviso('Nenhum usuário cadastrado.');
      return;
    }

    resultado.dados.forEach((usuario, indice) => {
      console.log(colorir(`Usuário ${indice + 1}`, CORES.ciano));
      console.log(`ID: ${usuario._id}`);
      console.log(`Nome: ${usuario.nome}`);
      console.log(`Email: ${usuario.email}`);
      console.log(`Criado em: ${formatarData(usuario.dataCriacao)}`);
      console.log('-'.repeat(40));
    });
  } catch (error) {
    logError(error);
    erro(`Erro inesperado: ${error.message}`);
  }
}

async function opcaoListarAlbunsUsuario() {
  try {
    console.log(titulo('Álbuns de um Usuário'));

    const usuarioId = await perguntarObrigatorio('Informe o ID do usuário: ');
    const resultado = await Album.listarPorUsuario(usuarioId);

    if (!resultado.sucesso) {
      erro(`Erro ao listar álbuns: ${resultado.erro}`);
      return;
    }

    if (!resultado.dados.length) {
      aviso('Nenhum álbum encontrado para este usuário.');
      return;
    }

    resultado.dados.forEach((album, indice) => {
      console.log(colorir(`Álbum ${indice + 1}`, CORES.ciano));
      console.log(`ID: ${album._id}`);
      console.log(`Título: ${album.titulo}`);
      console.log(`Descrição: ${album.descricao || 'Sem descrição'}`);
      console.log(`Usuário: ${album.usuario?.nome || 'N/D'} (${album.usuario?._id || 'N/D'})`);
      console.log(`Criado em: ${formatarData(album.dataCriacao)}`);
      console.log('-'.repeat(40));
    });
  } catch (error) {
    logError(error);
    erro(`Erro inesperado: ${error.message}`);
  }
}

async function opcaoListarFotosAlbum() {
  try {
    console.log(titulo('Fotos de um Álbum'));

    const albumId = await perguntarObrigatorio('Informe o ID do álbum: ');
    const resultado = await Foto.listarPorAlbum(albumId);

    if (!resultado.sucesso) {
      erro(`Erro ao listar fotos: ${resultado.erro}`);
      return;
    }

    if (!resultado.dados.length) {
      aviso('Nenhuma foto encontrada para este álbum.');
      return;
    }

    resultado.dados.forEach((foto, indice) => {
      console.log(colorir(`Foto ${indice + 1}`, CORES.ciano));
      console.log(`ID: ${foto._id}`);
      console.log(`Título: ${foto.titulo}`);
      console.log(`URL: ${foto.url}`);
      console.log(`Álbum: ${foto.album?.titulo || 'N/D'}`);
      console.log(`Tags: ${foto.tags && foto.tags.length ? foto.tags.join(', ') : 'Sem tags'}`);
      console.log(`Upload em: ${formatarData(foto.dataUpload)}`);
      console.log('-'.repeat(40));
    });
  } catch (error) {
    logError(error);
    erro(`Erro inesperado: ${error.message}`);
  }
}

async function opcaoBuscarFotoPorTag() {
  try {
    console.log(titulo('Buscar Foto por Tag'));

    const tag = await perguntarObrigatorio('Informe a tag: ');
    const resultado = await Foto.buscarPorTag(tag);

    if (!resultado.sucesso) {
      erro(`Erro ao buscar fotos por tag: ${resultado.erro}`);
      return;
    }

    if (!resultado.dados.length) {
      aviso('Nenhuma foto encontrada com esta tag.');
      return;
    }

    resultado.dados.forEach((foto, indice) => {
      console.log(colorir(`Foto ${indice + 1}`, CORES.ciano));
      console.log(`ID: ${foto._id}`);
      console.log(`Título: ${foto.titulo}`);
      console.log(`URL: ${foto.url}`);
      console.log(`Álbum: ${foto.album?.titulo || 'N/D'}`);
      console.log(`Tags: ${foto.tags && foto.tags.length ? foto.tags.join(', ') : 'Sem tags'}`);
      console.log('-'.repeat(40));
    });
  } catch (error) {
    logError(error);
    erro(`Erro inesperado: ${error.message}`);
  }
}

async function opcaoDeletarFoto() {
  try {
    console.log(titulo('Deletar Foto'));

    const id = await perguntarObrigatorio('Informe o ID da foto a ser removida: ');
    const resultado = await Foto.deletar(id);

    if (resultado.sucesso) {
      sucesso('Foto removida com sucesso.');
      destaque(`Foto removida: ${resultado.dados.titulo}`);
    } else {
      erro(`Erro ao deletar foto: ${resultado.erro}`);
    }
  } catch (error) {
    logError(error);
    erro(`Erro inesperado: ${error.message}`);
  }
}

async function opcaoDeletarAlbum() {
  try {
    console.log(titulo('Deletar Álbum'));

    const id = await perguntarObrigatorio('Informe o ID do álbum a ser removido: ');
    const resultado = await Album.deletar(id);

    if (resultado.sucesso) {
      sucesso('Álbum removido com sucesso.');
      if (resultado.aviso) {
        aviso(resultado.aviso);
      }
      destaque(`Álbum removido: ${resultado.dados.titulo}`);
    } else {
      erro(`Erro ao deletar álbum: ${resultado.erro}`);
    }
  } catch (error) {
    logError(error);
    erro(`Erro inesperado: ${error.message}`);
  }
}

async function processarOpcao(opcao) {
  switch (opcao) {
    case '1':
      await opcaoCadastrarUsuario();
      break;
    case '2':
      await opcaoCriarAlbum();
      break;
    case '3':
      await opcaoAdicionarFoto();
      break;
    case '4':
      await opcaoListarUsuarios();
      break;
    case '5':
      await opcaoListarAlbunsUsuario();
      break;
    case '6':
      await opcaoListarFotosAlbum();
      break;
    case '7':
      await opcaoBuscarFotoPorTag();
      break;
    case '8':
      await opcaoDeletarFoto();
      break;
    case '9':
      await opcaoDeletarAlbum();
      break;
    case '0':
      sucesso('Encerrando a aplicação...');
      await mongoose.connection.close();
      rl.close();
      process.exit(0);
      break;
    default:
      erro('Opção inválida. Escolha uma opção do menu.');
  }
}

async function iniciarMenu() {
  while (true) {
    exibirMenu();
    const opcao = await perguntar('\nEscolha uma opção: ');
    await processarOpcao(opcao);
  }
}

async function iniciarAplicacao() {
  try {
    console.log(titulo('Conectando ao MongoDB'));
    await mongoose.connect(MONGO_URI);
    sucesso('Conexão com MongoDB estabelecida com sucesso.');
    await iniciarMenu();
  } catch (error) {
    logError(error);
    erro(`Falha ao conectar ao MongoDB: ${error.message}`);
    rl.close();
    process.exit(1);
  }
}

iniciarAplicacao();
