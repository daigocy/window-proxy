const { ipcRenderer } = require('electron')

function createWindow(params, cb) {
    ipcRenderer.once("plaso-window-opened", (e,id) => cb&&cb(id));
    ipcRenderer.send("plaso-create-window", params);
}

function moveWindow(params) {
    ipcRenderer.send("plaso-move-window", params);
}
function resizeWindow(params) {
    ipcRenderer.send("plaso-resize-window", params);
}

function closeWindow(id) {
    ipcRenderer.send("plaso-close-window", id);
}

const windowListenerMap = {};
ipcRenderer.on("plaso-window-event", (e, params) => {
    const { id, eventName, args=[] } = params;
    console.log('ipcRenderer on plaso-window-event', id, eventName);
    let win = windowListenerMap[id];
    if(!win) return;
    let listeners = win[eventName];
    if(!listeners) return;
    listeners.forEach(cb => {
        cb(...args);
    });
})

function addWinEventListener(id, eventName, cb) {
    let win = windowListenerMap[id];
    if(!win) win =  windowListenerMap[id] = {};
    let listeners = win[eventName];
    if(!listeners) {
        listeners = win[eventName] = [];
        ipcRenderer.send("plaso-window-on", {id, eventName});
    }
    listeners.indexOf(cb)<0 && listeners.push(cb);

}

function removeWinEventListener(id, eventName, cb) {
    let win = windowListenerMap[id];
    if(!win) return;
    let listeners = win[eventName];
    if(!listeners) return;
    let index = listeners.indexOf(cb);
    index >= 0 && listeners.splice(index, 1);
    if(listeners.length==0) {
        delete win[eventName];
        ipcRenderer.send("plaso-window-off", {id, eventName});
    }
}



module.exports = {
    createWindow,
    moveWindow,
    closeWindow,
    resizeWindow,
    addWinEventListener,
    removeWinEventListener
}