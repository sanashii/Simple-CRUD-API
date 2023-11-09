const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs'); // Add the fs module
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(bodyParser.json());

const dbFilePath = './db.json';

function readData() {
    try {
      const data = fs.readFileSync(dbFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }
  
  // Function to write data to the file
  function writeData(data) {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf8');
  }

// API endpoints
/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks
 *     responses:
 *       200:
 *         description: A list of tasks
 */

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *             required:
 *               - title
 *     responses:
 *       201:
 *         description: The created task
 */
app.post('/tasks', (req, res) => {
    const data = readData(); // Read data from the file
  
    const newTask = {
      id: data.length > 0 ? data[data.length - 1].id + 1 : 1,
      title: req.body.title,
      completed: false,
    };
  
    data.push(newTask);
    writeData(data); // Write data back to the file
  
    res.status(201).json(newTask);
  });

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A task
 *       404:
 *         description: Task not found
 */
// Corrected API endpoints
app.get('/tasks', (req, res) => {
    const data = readData(); // Read data from the file
    res.json(data);
  });
  
app.get('/tasks/:id', (req, res) => {
  const data = readData(); // Read data from the file
  const taskId = parseInt(req.params.id);
  const task = data.find((t) => t.id === taskId);
  if (task) {
    res.json(task);
  } else {
    res.status(404).json({ message: 'Task not found' });
  }
 });
  

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update a task by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               completed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: The updated task
 *       404:
 *         description: Task not found
 */
app.put('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const data = readData(); // Read data from the file
    const taskIndex = data.findIndex((t) => t.id === taskId);
  
    if (taskIndex !== -1) {
      // Update the task if found
      data[taskIndex].title = req.body.title || data[taskIndex].title;
      data[taskIndex].completed = req.body.completed || data[taskIndex].completed;
  
      writeData(data); // Write updated data back to the file
  
      res.json(data[taskIndex]);
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  });  

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Task deleted
 *       404:
 *         description: Task not found
 */
app.delete('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const data = readData(); // Read data from the file
    const taskIndex = data.findIndex((t) => t.id === taskId);
  
    if (taskIndex !== -1) {
      data.splice(taskIndex, 1);
      writeData(data); // Write updated data back to the file
  
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  });
  

// Swagger setup
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title: 'Simple Task API',
      version: '1.0.0',
      description: 'A simple CRUD API for managing tasks',
    },
  };
  
  const options = {
    swaggerDefinition,
    apis: [__filename], // Reference this file for swagger comments
  };
  
  const swaggerSpec = swaggerJSDoc(options);
  app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
  
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
