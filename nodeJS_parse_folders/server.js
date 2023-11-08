const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

// add a configuration to serve static files located in ./soundloops
app.use(express.static('soundloops')); // ICI IMPORTANT !

// Avec la règle ci-dessous on peut redéfinir la page d’accueil
app.get('/', (req, res) => { // Page d’accueil
   res.sendFile(__dirname + "/soundloops/index.html");
});


function generateFolderStructure(rootFolder) {
  const stats = fs.statSync(rootFolder);

  if (!stats.isDirectory()) {
    return null;
  }

  const folderName = path.basename(rootFolder);
  const contents = fs.readdirSync(rootFolder);
  const structure = {
    name: folderName,
    type: 'folder',
    children: [],
  };

  contents.forEach((item) => {
    const itemPath = path.join(rootFolder, item);
    const itemStats = fs.statSync(itemPath);

    if (itemStats.isDirectory()) {
      const subStructure = generateFolderStructure(itemPath);
      if (subStructure) {
        structure.children.push(subStructure);
      }
    } else if (itemStats.isFile()) {
      structure.children.push({
        name: item,
        type: 'file',
        // On ajoute le chemin du fichier sous forme d'url relatif
        url: `${folderName}/${item}`,
      });
    }
  });

  return structure;
}
// On autorise les requêtes provenant d'autres serveurs
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

// routes des web services
app.get('/api/audioloops', (req, res) => {
  const rootFolder = './soundloops'; // Replace with your root folder path

  const folderStructure = generateFolderStructure(rootFolder);

  if (folderStructure) {
    res.json(folderStructure);
  } else {
    res.status(404).json({ error: 'Invalid root folder' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

