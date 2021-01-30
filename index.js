const { ipcMain } = require('electron');
if(ipcMain) {
    module.exports = require("./main")
}
else {
    module.exports = require("./render");
}