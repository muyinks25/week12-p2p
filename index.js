const express = require('express');
const app = express();
const fs = require('fs').promises;
const path = require('path');

const dataFilePath = path.join(__dirname, 'data.json');

// Middleware to parse JSON requests
app.use(express.json());

// Function to read products from data.json
const getProducts = async () => {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(data).products;
  } catch (error) {
    console.error('Error reading data.json:', error);
    return [];
  }
};

// Function to write products to data.json
const writeProducts = async (products) => {
  try {
    const data = JSON.stringify({ products }, null, 2);
    await fs.writeFile(dataFilePath, data, 'utf-8');
  } catch (error) {
    console.error('Error writing to data.json:', error);
  }
};

// Route to get all products
app.get('/api/products', async (req, res) => {
  const products = await getProducts();
  res.json(products);
});

// Route to create a new product
app.post('/api/products', async (req, res) => {
  const newProduct = req.body;
  const products = await getProducts();

  // Assign a unique ID to the new product
  newProduct.id = products.length + 1;

  products.push(newProduct);
  await writeProducts(products);

  res.json(newProduct);
});

// Route to update a product
app.put('/api/products/:id', async (req, res) => {
  const productId = parseInt(req.params.id);
  const updatedProduct = req.body;
  let products = await getProducts();

  // Find the index of the product with the given ID
  const productIndex = products.findIndex((product) => product.id === productId);

  if (productIndex !== -1) {
    // Update the product
    products[productIndex] = { ...products[productIndex], ...updatedProduct };
    await writeProducts(products);

    res.json({ message: `Updated product with ID ${productId}` });
  } else {
    res.status(404).json({ message: `Product with ID ${productId} not found` });
  }
});

// Route to delete a product
app.delete('/api/products/:id', async (req, res) => {
  const productId = parseInt(req.params.id);
  let products = await getProducts();

  // Filter out the product with the given ID
  products = products.filter((product) => product.id !== productId);

  await writeProducts(products);

  res.json({ message: `Deleted product with ID ${productId}` });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
