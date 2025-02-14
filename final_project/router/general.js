const express = require('express');
const axios = require('axios'); // Importa Axios
let books = require("./booksdb.js");
const public_users = express.Router();

// Função para buscar livros usando Axios e Async-Await
const getBooks = async () => {
  try {
    // Simula uma chamada assíncrona (por exemplo, a um banco de dados ou API externa)
    const response = await axios.get("https://example.com/api/books"); // Substitua pela URL real, se aplicável
    return response.data; // Retorna os dados dos livros
  } catch (error) {
    console.error("Error fetching books:", error);
    throw new Error("Failed to fetch books");
  }
};

// Endpoint para listar todos os livros disponíveis na loja
public_users.get('/', async (req, res) => {
  try {
    // Chama a função assíncrona para obter os livros
    const bookList = await getBooks();

    // Verifica se há livros disponíveis
    if (!bookList || Object.keys(bookList).length === 0) {
      return res.status(404).json({ message: "No books available in the shop." });
    }

    // Retorna a lista de livros formatada com JSON.stringify
    const formattedBooks = JSON.stringify(bookList, null, 2); // Formata com 2 espaços de indentação
    return res.status(200).send(formattedBooks);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports.general = public_users;
