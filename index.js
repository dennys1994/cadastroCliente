const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Rota para página inicial (login)
app.get('/', (req, res) => {
  res.render('login');
});

// Rota para página de cadastro
app.get('/cadastro', (req, res) => {
  res.render('cadastro');
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
