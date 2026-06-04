# Projeto 2 - Programação Web Back-End (Express.js)

## Tema do Projeto 1
**Armazenamento de fotos**, inspirado em aplicações como o Google Fotos, com armazenamento e busca de fotos em álbuns.

## Descrição Curta
Esta é uma evolução do Projeto 1. A aplicação agora funciona como uma plataforma web completa que utiliza o framework **Express.js**. As classes e modelos originais (`Usuario`, `Album` e `Foto`) foram integradas e reutilizadas para persistência no MongoDB. A aplicação conta com interface gráfica em HTML/EJS e estilização em Vanilla CSS, permitindo cadastro, autenticação via sessão, criação de álbuns e gerenciamento de fotos.

## Tecnologias Utilizadas
- **Node.js**: Ambiente de execução.
- **Express.js**: Framework web para gerenciar rotas e requisições HTTP.
- **Express-Session**: Gerenciamento de sessões para controle de autenticação de usuários.
- **EJS**: Motor de templates para renderizar as páginas HTML.
- **MongoDB & Mongoose**: Banco de dados NoSQL e modelagem de objetos.
- **Vanilla CSS**: Estilização moderna e agradável da interface (sem dependência de frameworks externos).

## Instalação de Dependências
Certifique-se de ter o Node.js e o MongoDB instalados em seu ambiente.
```bash
npm install
```

## Como Executar o Projeto
Com o MongoDB em execução (porta padrão 27017), inicie o servidor rodando:
```bash
npm start
```
Acesse a aplicação através do navegador no endereço: [http://localhost:3000](http://localhost:3000)

*(Obs: Para rodar a interface CLI legada do Projeto 1, você ainda pode utilizar `npm run cli`).*

## Usuário e Senha Padrão para Teste
A aplicação possui uma tela de cadastro aberta. Para testar o sistema:
1. Acesse a rota pública **`/cadastro`** (ou clique em "Cadastrar" no cabeçalho).
2. Crie uma conta de teste, por exemplo:
   - **Nome:** Teste
   - **E-mail:** `teste@teste.com`
   - **Senha:** `123456`
3. Após criar, a sessão será iniciada automaticamente e você será redirecionado para o painel de álbuns. O login futuro pode ser feito com as mesmas credenciais.

## Lista de Rotas Implementadas

**Rotas Públicas:**
- `GET /login` : Renderiza o formulário de login.
- `POST /login` : Autentica o usuário e cria a sessão.
- `GET /cadastro` : Renderiza o formulário de cadastro de usuário.
- `POST /cadastro` : Recebe dados do formulário, cria usuário e inicia sessão.
- `GET /logout` : Destrói a sessão atual.

**Rotas Protegidas (Exigem Login):**
- `GET /` : Dashboard inicial. Lista todos os álbuns do usuário logado.
- `GET /albuns/novo` : Formulário para criação de um novo álbum.
- `POST /albuns/novo` : Processa a criação do álbum vinculado ao usuário atual.
- `GET /albuns/:id` : Visualiza os detalhes de um álbum e lista as fotos salvas nele.
- `POST /albuns/:id/deletar` : Remove um álbum e suas fotos em cascata.
- `POST /albuns/:id/fotos` : Adiciona uma nova foto ao álbum.
- `POST /fotos/:id/deletar` : Exclui uma foto específica do banco de dados.

## Requisitos Acadêmicos e Reaproveitamento
1. **Reaproveitamento:** As classes `Album`, `Foto` e `Usuario` do Projeto 1 foram preservadas no diretório `src/models/` com mínimas alterações.
2. **Senha e Autenticação:** Foi adicionado o campo de `senha` ao `Usuario.js` juntamente com um método `autenticar`, mantendo as validações e o estilo de retorno (`{ sucesso: true, dados: ... }`) existentes.
3. **Validações:** As validações de campos vazios lançam exceções que são tratadas nas rotas do Express e repassadas de forma amigável (alertas vermelhos) para a interface EJS.
4. **Sessão:** A proteção de rotas foi implementada com um middleware customizado em `src/middlewares/authMiddleware.js`, validando `req.session.usuarioId`.