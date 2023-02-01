var drawingboardContainer = {};
var LayersActiveElement = {};
var drawingContexts = {};

var layerWidth = 15000;
var layerHeight = 15000;
var rulerShift = 2;
var rulerCaptureDistance = 15;

var topMargin = 'margin-top:7rem;';

drawingboardContainer.clear = function (containerId) {

    let divContainer = document.getElementById('drawingLayersContainer');

    if (divContainer) {
        divContainer.replaceChildren();
    }
}

drawingboardContainer.getScrollPosition = function () {

    return {
        scrollLeft: document.documentElement.scrollLeft,
        scrollTop: document.documentElement.scrollTop
    }
}


drawingboardContainer.saveFile = function (fileName, content) {

    let fileLink = document.createElement("a");
    document.body.appendChild(fileLink);
    fileLink.href = "data:application/octet-stream;base64," + content;
    fileLink.download = fileName;
    fileLink.target = "_blank";
    fileLink.click();

    document.body.removeChild(fileLink);
}


drawingboardContainer.exportFile = function (fileName, layerId) {

    let canvas = document.getElementById(layerId);
    if (canvas) {
        let fileLink = document.createElement("a");
        document.body.appendChild(fileLink);
        fileLink.href = canvas.toDataURL('image/png');;
        fileLink.download = fileName;
        fileLink.target = "_blank";
        fileLink.click();

        document.body.removeChild(fileLink);
    }
}

drawingboardContainer.deleteLayersActiveElement = function (layerId) {

    if (LayersActiveElement[layerId]) {
        delete LayersActiveElement[layerId];
    }
}

drawingboardContainer.openFile = function () {
    let openFile = document.createElement("input");
    document.body.appendChild(openFile);
    openFile.type = "file";
    openFile.accept = ".fzgwb";
    
    openFile.onchange = function () {
        if (openFile.files && openFile.files.length == 1) {
            let file = openFile.files[0];
            let reader = new FileReader();

            reader.onload = function () {
                let data = reader.result;
                DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'LoadFile', file.name, data)

                document.body.removeChild(openFile);
            };
            reader.readAsText(file);

        }
    }
    openFile.click();
}

