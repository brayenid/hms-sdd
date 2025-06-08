const fs = require('fs')
const path = require('path')

const errorViewer = (req, res) => {
  const logFilePath = path.join(__dirname, '..', '..', 'logs', 'error.log')
  if (!fs.existsSync(logFilePath)) return res.send('<p>No logs available</p>')

  const content = fs.readFileSync(logFilePath, 'utf-8')
  const logs = content
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      try {
        const obj = JSON.parse(line)
        return `<pre style="background:#f4f4f4;padding:8px;border-radius:4px;margin-bottom:6px;max-width:100%;overflow-x:auto;white-space:pre-wrap;word-break:break-word;font-family:monospace;font-size:14px">${JSON.stringify(
          obj,
          null,
          2
        )}</pre>`
      } catch (e) {
        return `<pre style="overflow-x:auto;white-space:pre-wrap;word-break:break-word">${line}</pre>`
      }
    })
    .join('')

  res.send(`
    <html>
      <head>
        <title>Log Viewer</title>
        <style>
          body {
            font-family: sans-serif;
            padding: 20px;
            margin: 0;
            max-width: 100%;
            overflow-x: hidden;
          }
        </style>
      </head>
      <body>
        <h2>Error Logs</h2>
        ${logs || '<p>No logs found.</p>'}
      </body>
    </html>
  `)
}

module.exports = errorViewer
