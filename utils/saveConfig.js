const fs = require('fs');
const path = './config.env';

// Object -> ENV format
function saveConfig(configObj) {
    let envText = "";
    for (let key in configObj) {
        envText += `${key}=${configObj[key]}\n`;
    }
    fs.writeFileSync(path, envText, 'utf8');
}

module.exports = { saveConfig };
