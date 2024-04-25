const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const port = 3000;

// Configura o body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configura a pasta 'public' para servir arquivos estáticos (css, js, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Configura o diretório de views para o EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Cria e abre uma conexão com o banco de dados
const db = new sqlite3.Database('./database.sqlite');

// Função para criar a tabela de usuários
const createUsersTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      cep TEXT NOT NULL,
      street TEXT,
      neighborhood TEXT,
      city TEXT,
      state TEXT,
      number TEXT,
      password TEXT NOT NULL
    );
  `;

  db.run(query, (err) => {
    if (err) {
      console.error('Erro ao criar a tabela de usuários:', err.message);
    } else {
      console.log('Tabela de usuários criada com sucesso.');
    }
  });
};

// Função para inserir um novo usuário no banco de dados
const insertUser = (user, callback) => {
  const query = `
    INSERT INTO users (name, email, cep, street, neighborhood, city, state, number, password)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
  `;

  db.run(query, [
    user.name,
    user.email,
    user.cep,
    user.street,
    user.neighborhood,
    user.city,
    user.state,
    user.number,
    user.password
  ], function(err) {
    if (err) {
      console.error('Erro ao inserir usuário:', err.message);
      return callback(false);
    } else {
      console.log('Novo usuário inserido com sucesso. ID:', this.lastID);
      return callback(true);
    }
  });
};

// Função para verificar se o email já existe no banco de dados
const checkEmailExists = (email, callback) => {
  const query = `SELECT * FROM users WHERE email = ?`;
  db.get(query, [email], (err, row) => {
    if (err) {
      console.error('Erro ao verificar email:', err.message);
      return callback(err, null);
    }
    return callback(null, row !== undefined);
  });
};

// Rota para página inicial (login)
app.get('/', (req, res) => {
  res.render('login');
});

// Rota para página inicial (login)
app.get('/login', (req, res) => {
  res.render('login');
});

// Rota para página de cadastro
app.get('/cadastro', (req, res) => {
  res.render('cadastro', { error: null });
});

// Rota para cadastrar um novo usuário
app.post('/cadastro', (req, res) => {
  const newUser = {
    name: req.body.name,
    email: req.body.email,
    cep: req.body.cep,
    street: req.body.street,
    neighborhood: req.body.neighborhood,
    city: req.body.city,
    state: req.body.state,
    number: req.body.number,
    password: req.body.password
  };

  // Verifica se o email já existe no banco de dados
  checkEmailExists(newUser.email, (err, exists) => {
    if (err) {
      return res.status(500).send('Erro ao verificar email.');
    }

    if (exists) {
      return res.render('cadastro', { error: 'Este email já está cadastrado. Por favor, faça login ou utilize outro email.' });
    }
    // Insere o novo usuário no banco de dados
    insertUser(newUser, (success) => {
      if (success) {
        res.send('Usuário cadastrado com sucesso.');
      } else {
        res.status(500).send('Erro ao cadastrar usuário.');
      }
    });
  });
});

// Inicia o servidor e cria a tabela de usuários
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  // Cria a tabela de usuários ao iniciar o servidor
  createUsersTable();
});
