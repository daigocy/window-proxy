const { ipcMain, BrowserWindow } = require('electron');

ipcMain.on('plaso-create-window', function(e, params) {
    const sender = e.sender;
    const { windowOptions={}, options, isChildWindow, path, debug, maximize } = params;
    if(isChildWindow) {
        windowOptions.parent = BrowserWindow.fromWebContents(sender);
    }
    const $win = new BrowserWindow(windowOptions);
    sender.send('plaso-window-opened', $win.id);
    $win.webContents.on('dom-ready', () => {
        $win.show();
        maximize && $win.maximize();
        debug && $win.webContents.openDevTools({mode: 'detach'});
        $win.webContents.send('plaso-window-initOptions', options);
    })
    path && $win.loadURL(path)
});

ipcMain.on('plaso-move-window', function(e, params) {
    let allWins = BrowserWindow.getAllWindows()
    const { id, x, y } = params;
    let win = allWins.find(w => w.id==id);
    if(!win) return;
    win.setPosition(x, y);
});
ipcMain.on('plaso-resize-window', function(e, params) {
    let allWins = BrowserWindow.getAllWindows()
    const { id, width, height } = params;
    let win = allWins.find(w => w.id==id);
    if(!win) return;
    win.setBounds({width, height});
});

ipcMain.on('plaso-close-window', function(e, id) {
    let allWins = BrowserWindow.getAllWindows()
    let win = allWins.find(w => w.id==id);
    if(!win) return;
    win.close();
});

ipcMain.on('plaso-window-on', function(e, {id, eventName}) {
    console.log('plaso-window-on', id, eventName);
    const sender = e.sender;
    let allWins = BrowserWindow.getAllWindows()
    let win = allWins.find(w => w.id==id);
    if(!win) return;
    win.on(eventName, (e) => {
        console.log('plaso-window-event', id, eventName);
        let w = BrowserWindow.fromWebContents(sender);
        if(w&&!w.isDestroyed()) sender.send('plaso-window-event',{id, eventName});
    })
});


module.exports = {};


