const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
let users = [];

// Function to check if the username is valid (not already registered)
const isValid = (username) => {
  return !users.some(user => user.username === username);
};

// Function to authenticate a user (check if username and password match)
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// Only registered users can log in
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    // Generate a JWT token
    const accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });

    // Store the token in the session
    req.session.authorization = { accessToken };

    return res.status(200).json({ message: "User logged in successfully" });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// Register a new user
regd_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  // Add the new user to the users array
  users.push({ username, password });

  return res.status(201).json({ message: "User registered successfully" });
});

// Add or update a book review
// Endpoint para adicionar ou atualizar uma avaliação de livro
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn; // Obtém o ISBN da URL
    const review = req.query.review; // Obtém a avaliação da query string
    const username = req.user ? req.user.username : null; // Obtém o nome de usuário da sessão
  
    // Verifica se o usuário está autenticado
    if (!username) {
      return res.status(401).json({ message: "User not authenticated" });
    }
  
    // Verifica se o livro existe
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    // Adiciona ou atualiza a avaliação do livro
    books[isbn].reviews[username] = review;
  
    // Retorna uma mensagem de sucesso
    return res.status(200).json({
      message: "Review added/updated successfully",
      reviews: books[isbn].reviews
    });
  });

// Endpoint para deletar uma avaliação de livro
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn; // Obtém o ISBN da URL
    const username = req.user ? req.user.username : null; // Obtém o nome de usuário da sessão
  
    // Verifica se o usuário está autenticado
    if (!username) {
      return res.status(401).json({ message: "User not authenticated" });
    }
  
    // Verifica se o livro existe
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    // Verifica se o usuário tem uma avaliação para o livro
    if (!books[isbn].reviews[username]) {
      return res.status(404).json({ message: "Review not found for the user" });
    }
  
    // Deleta a avaliação do usuário
    delete books[isbn].reviews[username];
  
    // Retorna uma mensagem de sucesso
    return res.status(200).json({
      message: "Review deleted successfully",
      reviews: books[isbn].reviews
    });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;