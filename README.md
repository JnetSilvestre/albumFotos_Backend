# Projeto 1 - Programação Web Back-End

## Descrição

Este projeto foi desenvolvido para a disciplina **Programação Web Back-End** e tem como tema **armazenamento de fotos**, com foco no cadastro e na busca de fotos em álbuns.

A proposta consiste na implementação de uma **biblioteca de classes de acesso a SGDB**, utilizando **Node.js**, em que as classes representam entidades do banco de dados e implementam operações de inserção, busca e remoção. 

## Objetivo

Implementar uma biblioteca de acesso ao banco de dados para a temática escolhida, contemplando: 

- representação das entidades da aplicação; 
- métodos de inserção, busca e deleção; 
- validação de campos obrigatórios; 
- tratamento de exceções; 
- armazenamento de logs de erro. 

## Tema escolhido

**Armazenamento de fotos**, inspirado em aplicações como o Google Fotos, com armazenamento e busca de fotos em álbuns.

## Estrutura do projeto

```text
projeto1/
├── package.json
├── README.md
├── errors.log
└── src/
    ├── app.js
    ├── models/
    │   ├── Usuario.js
    │   ├── Album.js
    │   └── Foto.js
    └── utils/
        └── logger.js
```

## Classes implementadas

O projeto contempla três classes principais de armazenamento, conforme exigido pela proposta. 

### Usuario

Representa os usuários do sistema.

**Campos:**
- `nome`
- `email`
- `dataCriacao`

**Métodos:**
- `criarUsuario(dados)`
- `buscarPorId(id)`
- `listarTodos()`
- `deletar(id)`

### Album

Representa os álbuns de fotos vinculados a um usuário.

**Campos:**
- `titulo`
- `descricao`
- `usuario`
- `dataCriacao`

**Métodos:**
- `criarAlbum(dados)`
- `buscarPorId(id)`
- `listarPorUsuario(usuarioId)`
- `listarTodos()`
- `deletar(id)`

### Foto

Representa as fotos armazenadas em um álbum.

**Campos:**
- `titulo`
- `url`
- `album`
- `tags`
- `dataUpload`

**Métodos:**
- `criarFoto(dados)`
- `buscarPorId(id)`
- `listarPorAlbum(albumId)`
- `buscarPorTag(tag)`
- `listarTodas()`
- `deletar(id)`

## Requisitos contemplados

O projeto atende aos critérios centrais definidos na proposta.

- Implementação de classes de acesso ao banco de dados. 
- Presença de pelo menos três classes de armazenamento. 
- Implementação dos casos de uso da temática escolhida. 
- Verificação de preenchimento de campos obrigatórios. 
- Tratamento de exceções nas operações.
- Registro de erros em arquivo de log.

## Validação e tratamento de erros

Os campos obrigatórios são validados antes da persistência dos dados. Quando ocorre alguma falha, a exceção é tratada com `try/catch` e registrada em arquivo de log.

O arquivo de log utilizado é:

```text
errors.log
```

O registro contém data/hora, mensagem do erro e stack trace.

## Observação sobre a arquitetura

O núcleo do trabalho está nas classes localizadas em `src/models` e no utilitário `src/utils/logger.js`, que compõem a biblioteca de acesso ao banco. O arquivo `src/app.js` foi incluído como uma interface de teste em terminal para demonstrar o funcionamento das operações implementadas.

## Tecnologias utilizadas

- Node.js 
- MongoDB 
- Mongoose
- Módulos nativos do Node.js (`fs`, `readline`, `path`)

## Execução do projeto

Com o MongoDB em execução localmente, instalar as dependências e iniciar a aplicação com os comandos:

```bash
npm install
npm start
```

A conexão utilizada é:

```text
mongodb://localhost:27017/galeria_fotos
```

## Autor(es)

- Aluno: João Victor da Cruz Silvestre          RA:2144263