
/*
 * drawingLayerSettings
 *  id
 *  width
 *  height
 *  CssClassList
 *  DrawGridLines
 *  LineWidth
 *  Color, 
 *  HorizontalSpacing, VerticalSpacing
 */
var drawingLayer = {};
var drawingLayerSettings = {};


var activeLayerId = "";


drawingLayer.mapWindowMousePositionToCanvas1 = function (layerId, x, y) {

    let canvasElement = document.getElementById(layerId);

    if (canvasElement) {
        var bbox = canvasElement.getBoundingClientRect();

        return {
            x: x - bbox.left * (canvasElement.width / bbox.width),
            y: y - bbox.top * (canvasElement.height / bbox.height)
        };
    }
    else {

        return {
            x: -1,
            y: -1
        };
    }
}

drawingLayer.mapWindowMousePositionToCanvas = function (canvasElement, x, y) {

    if (canvasElement) {
        var bbox = canvasElement.getBoundingClientRect();

        return {
            x: x - bbox.left * (canvasElement.width / bbox.width),
            y: y - bbox.top * (canvasElement.height / bbox.height)
        };
    }
    else {

        return {
            x: -1,
            y: -1
        };
    }
}

drawingLayer.drawGridLines = function(context, settings) {

    context.save();

    context.clearRect(0, 0, settings.width, settings.height);
    context.strokeStyle = settings.gridLines.color;
    context.lineWidth = settings.gridLines.lineWidth;

    for (var y = 0 ; y <= settings.height; y += settings.gridLines.verticalSpacing) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(settings.width, y);
        context.stroke();
    }

    for (var x = 0; x <= settings.width; x += settings.gridLines.horizontalSpacing) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, settings.height);
        context.stroke();
    }
    context.restore();
}

drawingLayer.createLayer = function (containerId, layerId, drawingLayerSettings) {
    let divContainer = document.getElementById(containerId)
    if (divContainer) {
        let canvas = document.createElement("canvas");

        canvas.id = layerId;
        canvas.width = drawingLayerSettings.width;
        canvas.height = drawingLayerSettings.height;
        canvas.style = `z-index:${1};position:fixed;pointer-events: auto;`;

        for (let cssClass in drawingLayerSettings.cssClassList) {
            canvas.classList.add(cssClass);
        }

        divContainer.appendChild(canvas);

        canvas.addEventListener("mousedown", drawingLayer.mouseDown, false);
        canvas.addEventListener("mouseup", drawingLayer.mouseUp, false);
        canvas.addEventListener("mousemove", drawingLayer.mouseMove, false);

        canvas.addEventListener("touchstart", drawingLayer.touchStart, false);
        canvas.addEventListener("touchend", drawingLayer.touchEnd, false);
        canvas.addEventListener("touchcancel", drawingLayer.touchCancel, false);
        canvas.addEventListener("touchmove", drawingLayer.touchMove, false);
       
        let context = canvas.getContext("2d");
        window.drawingContexts[layerId] = context;

        window.drawingLayerSettings[layerId] = drawingLayerSettings;

        if (drawingLayerSettings.drawGridLines) {
            drawingLayer.drawGridLines(context, drawingLayerSettings);
        }

        activeLayerId = layerId;
    }
}

drawingLayer.deleteLayer =  function(containerId, layerId) {
    let divContainer = document.getElementById(containerId)
    if (divContainer) {
        let layer = document.getElementById(layerId)
        if (layer) {
            divContainer.removeChild(layer);
            delete drawingLayerSettings[layerId];
            delete drawingContexts[layerId];
        }
    }
}

drawingLayer.showHideLayer = function (layerId, visibility) {
    let layer = document.getElementById(layerId)
    if (layer) {
        layer.style.visibility = visibility;
    }
}

drawingLayer.enableDisableLayer =  function (layerId, disable) {
    let layer = document.getElementById(layerId)
    if (layer) {
        layer.disabled = disable;
    }
}

drawingLayer.mouseDown = function (e) {

    e.preventDefault();

    let layerId = e.target.id;

    //let relativePosition = drawingLayer.mapWindowMousePositionToCanvas(e.target, e.clientX, e.clientY);
    //let pointer = { pointerId: 0, x: relativePosition.x, y: relativePosition.y, pointerType: "mouse", buttons: e.buttons };;

    let pointer = { pointerId: 0, x: e.offsetX, y: e.offsetY, pointerType: "mouse", buttons: e.buttons };;

    let activeDrawingElement = LayersActiveElement[layerId];
    if (activeDrawingElement) {
        activeDrawingElement.mouseDown(pointer);
    }

    DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'HandleOnMouseDown', layerId, pointer)
}

drawingLayer.mouseMove = function (e) {

    e.stopPropagation();

    let layerId = e.target.id;

    let relativePosition = drawingLayer.mapWindowMousePositionToCanvas(e.target, e.clientX, e.clientY);

    let pointer = { pointerId: 0, x: relativePosition.x, y: relativePosition.y, pointerType: "mouse", buttons: e.buttons };;

    let activeDrawingElement = LayersActiveElement[layerId];
    if (activeDrawingElement) {
        activeDrawingElement.mouseMove(pointer);
    }

    DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'HandleOnMouseMove', layerId, pointer)
}

drawingLayer.mouseUp = function (e) {

    e.preventDefault();

    let layerId = e.target.id;

    let relativePosition = drawingLayer.mapWindowMousePositionToCanvas(e.target, e.clientX, e.clientY);

    let pointer = { pointerId: 0, x: relativePosition.x, y: relativePosition.y, pointerType: "mouse", buttons: e.buttons };;

    let activeDrawingElement = LayersActiveElement[layerId];
    if (activeDrawingElement) {
        activeDrawingElement.mouseUp(pointer);
    }

    DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'HandleOnMouseUp', layerId, pointer)

}

drawingLayer.touchStart = function (e) {
    e.preventDefault();

    let layerId = e.target.id;

    let relativePosition = drawingLayer.mapWindowMousePositionToCanvas(e.target, e.touches[0].clientX, e.touches[0].clientY);

    let pointer = { pointerId: e.touches[0].pointerId, x: relativePosition.x, y: relativePosition.y, pointerType: "touch", buttons: e.buttons };;

    let activeDrawingElement = LayersActiveElement[layerId];
    if (activeDrawingElement) {
        activeDrawingElement.mouseDown(pointer);
    }

    DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'HandleOnMouseDown', layerId, pointer)

}


drawingLayer.touchMove = function (e) {

    e.preventDefault();

    let layerId = e.target.id;

    let relativePosition = drawingLayer.mapWindowMousePositionToCanvas(e.target, e.touches[0].clientX, e.touches[0].clientY);

    let pointer = { pointerId: 1, x: relativePosition.x, y: relativePosition.y, pointerType: "touch", buttons: e.buttons };;

    let activeDrawingElement = LayersActiveElement[layerId];
    if (activeDrawingElement) {
        activeDrawingElement.mouseMove(pointer);
    }

    DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'HandleOnMouseMove', layerId, pointer)

}

drawingLayer.touchEnd = function (e) {
    e.preventDefault();

    let layerId = e.target.id;

    let pointer = { pointerId: 1, x: -1, y: -1, pointerType: "touch", buttons: e.buttons };; let activeDrawingElement = LayersActiveElement[layerId];

    if (activeDrawingElement) {
        activeDrawingElement.mouseUp(pointer);
    }

    DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'HandleOnMouseUp', layerId, pointer)

}


drawingLayer.touchCancel = function (e) {
    e.preventDefault();

    let layerId = e.target.id;

    let relativePosition = drawingLayer.mapWindowMousePositionToCanvas(e.target, e.touches[0].clientX, e.touches[0].clientY);

    let pointer = { pointerId: 1, x: -1, y: -1, pointerType: "touch", buttons: e.buttons };;

    DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'HandleOnMouseUp', layerId, pointer)

    let activeDrawingElement = LayersActiveElement[layerId];
    if (activeDrawingElement) {
        activeDrawingElement.mouseUp(pointer);
    }
}

drawingLayer.clear= function(layerId)
{
    let context = drawingContexts[layerId];
    if (context) {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        drawingLayer.drawGridLines(context, drawingLayerSettings[layerId]);
    }
}


