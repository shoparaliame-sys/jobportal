import fs from 'fs';
fetch('https://www.rekrute.com/offres.html', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
})
.then(r => r.text())
.then(html => {
  fs.writeFileSync('rekrute-sample.html', html);
  console.log('Saved rekrute-sample.html');
})
.catch(console.error);
