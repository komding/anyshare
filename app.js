const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err.message);
  } else {
    db.exec(`
      CREATE TABLE IF NOT EXISTS texts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        identifier TEXT UNIQUE,
        content TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('SQLite database and table created.');
  }
});

// Schedule a task to delete data older than 15 minutes every 10 minutes
setInterval(cleanupOldRecords, 600000);

async function cleanupOldRecords() {
  try {
    console.log('Cleaning up old records...');
    // Delete records older than 15 minutes
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM texts WHERE strftime("%s", "now") - strftime("%s", createdAt) > 900', [], function (err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
    console.log('Old records cleaned up.');
  } catch (error) {
    console.error('Error cleaning up old records:', error);
  }
}

app.post('/publish', async (req, res) => {
  const text = req.body.text;
  const identifier = req.body.identifier;

  try {
    const existingRecord = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM texts WHERE identifier = ?', [identifier], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existingRecord) {
      return res.status(400).send('Identifier already used. Choose another one.');
    }

    await new Promise((resolve, reject) => {
      db.run('INSERT INTO texts (identifier, content, createdAt) VALUES (?, ?, datetime("now"))', [identifier, text], function (err) {
        if (err) reject(err);
        else resolve(this);
      });
    });

    const accessLink = `http://localhost:${port}/access/${identifier}`;
    res.send(`Text published successfully. Access link: ${accessLink}`);
  } catch (err) {
    res.status(500).send('Error publishing text.');
  }
});

app.get('/access/:identifier', async (req, res) => {
  const identifier = req.params.identifier;

  try {
    const row = await new Promise((resolve, reject) => {
      db.get('SELECT content FROM texts WHERE identifier = ?', [identifier], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!row) {
      return res.status(404).send('Text not found.');
    }

    res.send(row.content);
  } catch (err) {
    res.status(500).send('Error accessing text.');
  }
});

app.use(express.static('public'));

// Redirect root URL to the home section
app.get('/', (req, res) => {
  res.redirect('/index.html');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
