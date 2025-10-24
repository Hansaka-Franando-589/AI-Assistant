const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "yRZW0AaY#0gwN69qF1eMOHcAjJEIZLyT6Nctmt9RdWBrCjU1huso",
SUDO_NB: process.env.SUDO_NB || "94779912589",
AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "true",
AUTO_BIO: process.env.AUTO_BIO || "false",
MODE: process.env.MODE || "public",
ALLWAYS_OFFLINE: process.env.AUTO_BIO || "false",

};
