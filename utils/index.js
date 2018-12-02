const fs = require('fs');

const readFile = (path, transform = v => v) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, function(err, data) {
      if(err) reject(err);
      resolve(data.toString().split('\n').map(transform));
    });
  });
}

module.exports = {
  readFile,
}
