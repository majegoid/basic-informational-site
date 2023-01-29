const http = require('http');
const url = require('url');
const fs = require('fs/promises');
const path = require('path');

const staticFiles = {};

// Load the files from the pages directory into the "staticFiles" object.
async function loadPages() {
  try {
    const filenames = await fs.readdir('./pages');
    for (const filename of filenames) {
      const filepath = path.join(process.cwd(), 'pages', filename);
      const filedata = await fs.readFile(filepath, { encoding: 'utf8' });
      staticFiles[filename] = {
        name: filename,
        filepath: filepath,
        data: filedata,
      };
    }
  } catch (err) {
    console.error(err);
  }
}

// Start the server.
(async function startServer() {
  await loadPages();
  http
    .createServer((req, res) => {
      // parse the request url into an object
      let reqUrl = url.parse(req.url);
      let route = reqUrl.pathname.replace('/', ''); //get the route
      if (!route.includes('.html')) route += '.html';
      // handle success
      if (staticFiles[route] !== undefined) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(staticFiles[route].data);
      }
      // handle not found
      if (staticFiles[route] === undefined) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        return res.end(staticFiles['404.html'].data);
      }
    })
    .listen(8080);
})();
