const path = require('path');
const fs = require('fs');

function getVersion() {
    try {
        const packagePath = path.join(__dirname, '../../package.json');
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        return packageJson.version;
    } catch (error) {
        return '1.0.0';
    }
}

module.exports = { getVersion };
