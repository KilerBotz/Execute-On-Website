const express = require('express');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const port = 3000;
const MAX_RESULTS = 3; // Maksimum jumlah hasil yang disimpan

app.set('view engine', 'ejs');
app.use(express.json());

let results = []; // Array untuk menyimpan hasil eksekusi perintah

app.get('/', (req, res) => {
  res.render('index', { results });
});

app.post('/exec', (req, res) => {
  const command = req.body.command;

  if (!command) {
    return res.status(400).send({ error: 'Command is required' });
  }

  const executeCommand = exec(command, { shell: '/bin/bash' });

  let output = '';

  executeCommand.stdout.on('data', (data) => {
    output += data;
    res.write(data);
  });

  executeCommand.stderr.on('data', (data) => {
    output += data;
    res.write(data);
  });

  executeCommand.on('close', (code) => {
    const result = {
      command,
      output,
      code,
      timestamp: new Date().toLocaleString("id", {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      })
    };

    // Tambahkan hasil ke array
    results.push(result);

    // Batasi panjang array results
    if (results.length > MAX_RESULTS) {
      results = results.slice(-MAX_RESULTS);
    }

    res.end(`Command exited with code ${code}`);
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
