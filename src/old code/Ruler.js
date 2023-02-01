ruler = {};
rulerSettingsDictionary = {};

ruler.create = function (containerId, inputSettings) {
    //margin-top:7rem;
    let rulerInstance = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    rulerInstance.setAttribute('width', layerWidth);
    rulerInstance.setAttribute('height', layerHeight);
    rulerInstance.setAttribute('style', `z-index:${inputSettings.zIndex};position:fixed;pointer-events: none;`);
    rulerInstance.id = inputSettings.id;

    let rootContainer = document.getElementById(containerId);
    rootContainer.appendChild(rulerInstance);

    rulerSettingsDictionary[inputSettings.id] = inputSettings;

    ruler.drawRuler(inputSettings.id);
}

ruler.delete = function (containerId, id) {

    let rootContainer = document.getElementById(containerId);
    let rulerInstance = document.getElementById(id);

    rootContainer.removeChild(rulerInstance);

    delete rulerSettingsDictionary[id];

}

ruler.drawRuler = function (id) {

    let rulerInstance = document.getElementById(id);

    if (rulerInstance) {
        let settings = rulerSettingsDictionary[id];

        let parentGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        parentGroup.id = `ruler#${id}`;
        parentGroup.setAttribute('style', `pointer-events: auto;`);
        parentGroup.setAttribute('onpointerdown', 'ruler.mouseDownRuler(event)');
        parentGroup.setAttribute('onpointermove', 'ruler.mouseMoveRuler(event)');
        parentGroup.setAttribute('onpointerup', 'ruler.mouseUpRuler(event)');
        parentGroup.setAttribute('onpointerover', 'ruler.mouseOverRuler(event)');
        parentGroup.setAttribute('onpointerout', 'ruler.mouseOutRuler(event)');
        parentGroup.setAttribute('onwheel', 'ruler.mouseWheel(event)');
        rulerInstance.appendChild(parentGroup);

        let group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.id = `ruler-sg#${id}`;
        group.setAttribute('style', `pointer-events: auto;transform-box: fill-box;transform-origin: center;transform: rotate(${settings.angle}deg`);
        group.setAttribute('onwheel', 'ruler.mouseWheel(event)');
        parentGroup.appendChild(group);

        ruler.drawRulerRectangle(group, settings);

        ruler.drawUpperMarkers(settings, group);

        ruler.drawLowerMarkers(settings, group);

        let canvas = document.createElement("canvas");
        let context = canvas.getContext("2d");
        context.font = '12px';
        let metrics = context.measureText(settings.angle + '°');

        ruler.drawAngleText(settings, group, metrics);

        metrics = context.measureText('0');
        ruler.drawAngleCircle(metrics, group, settings);
    }

}

ruler.extractId = function (value) {
    let arr = value.split("#");
    return arr[1];
}

ruler.setPosition = function (settings) {

    let rulerShape = document.getElementById(`ruler#${settings.id}`);

    if (settings.dragging && rulerShape) {
        rulerShape.setAttribute('style', `pointer-events: auto;transform-origin:0,0; transform:translate(${settings.dx}px, ${settings.dy}px);`);
    }
}

ruler.mouseOverRuler = function (e) {

    e.target.style.cursor = 'pointer';

}

ruler.mouseWheel = function (e) {
    e.preventDefault();
    e.stopPropagation();
    e.target.style.cursor = 'pointer';
    let id = ruler.extractId(e.currentTarget.id);
    let settings = rulerSettingsDictionary[id];
    settings.angle = (settings.angle + Math.sign(e.wheelDeltaY) * 1) % 360;

    //update group angle
    ruler.updateRotationSettings(settings);
    DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'UpdateRulerSettings', settings)
}

ruler.mouseOutRuler = function (e) {

    e.target.style.cursor = 'default';
}

ruler.mouseDownRuler = function (e) {

    event.stopPropagation();

    if (e.buttons == 1) {
        e.target.style.cursor = 'move';
        let id = ruler.extractId(e.currentTarget.id);
        let settings = rulerSettingsDictionary[id];
        settings.dragging = true;
        e.target.setPointerCapture(1);
        settings.previousPointerPosition = { x: e.clientX, y: e.clientY };

        //DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'OnMouseDownRuler', settings)
    }

}

ruler.mouseMoveRuler = function (e) {

    event.stopPropagation();
    let id = ruler.extractId(e.currentTarget.id);
    let settings = rulerSettingsDictionary[id];
    if (settings.dragging) {

        let dx = e.clientX - settings.previousPointerPosition.x;
        let dy = e.clientY - settings.previousPointerPosition.y;
        if (settings.dx === undefined) {
            settings.dx = dx
            settings.dy = dy;
        }
        else {
            settings.dx += dx
            settings.dy += dy;
        }
        ruler.setPosition(settings);
        settings.previousPointerPosition.x = e.clientX;
        settings.previousPointerPosition.y = e.clientY;

       // DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'UpdateRulerSettings', settings)
    }
}

ruler.mouseUpRuler = function (e) {

    e.target.style.cursor = 'default';
    event.stopPropagation();
    let id = ruler.extractId(e.currentTarget.id);
    let settings = rulerSettingsDictionary[id];
    if (settings.dragging) {

        settings.dragging = false;
        e.target.releasePointerCapture(1);
        DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'UpdateRulerSettings', settings)

    }
}

ruler.drawAngleCircle = function (metrics, group, settings) {

    let angleCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    group.appendChild(angleCircle);
    angleCircle.setAttribute('r', metrics.width * 3.5);
    angleCircle.setAttribute('cx', ((settings.x + settings.width) / 2));
    angleCircle.setAttribute('cy', (settings.y + settings.height / 2));
    angleCircle.setAttribute('fill', settings.fillColor);
    angleCircle.setAttribute('stroke', `red`);
    angleCircle.setAttribute('stroke-width', settings.strokeWidth);
}

ruler.drawUpperMarkers = function (settings, group) {
    let pathString = "";

    let skipMillimeterFrom = 2;
    for (let i = 1; i <= 301; ++i) {

        let markHeight = 4 / 0.2645833;

        let x = settings.x + (skipMillimeterFrom + i) / 0.2645833;

        if ((i - 1) % 10 === 0) {
            markHeight = 10 / 0.2645833;

            let indicatorText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            group.appendChild(indicatorText);
            indicatorText.setAttribute('x', x + 1);
            indicatorText.setAttribute('y', settings.y + markHeight);
            indicatorText.setAttribute('style', `font-size: 10px;pointer-events: none;`);
            let data = document.createTextNode(`index${i}mm`);
            indicatorText.appendChild(data);
            indicatorText.childNodes[0].nodeValue = (i - 1) / 10;

        }
        else if ((i - 1) % 5 === 0) {
            markHeight = 7 / 0.2645833;
        }


        pathString = ` M ${x} ${settings.y + markHeight} L ${x} ${settings.y}`;

        let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute('d', pathString);
        path.setAttribute('stroke', settings.marksStrokeColor);
        path.setAttribute('stroke-width', settings.strokeWidth);
        //   path.setAttribute('fill', settings.fillColor);
        group.appendChild(path);
    }
}

ruler.drawLowerMarkers = function (settings, group) {
    let pathString = "";
    for (let i = 1; i <= 119; ++i) {

        let markHeight = 4 / 0.2645833;

        let x = settings.x + 2.54 * (i) / 0.2645833;

        if ((i - 1) % 10 === 0) {
            markHeight = 10 / 0.2645833;

            let indicatorText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            group.appendChild(indicatorText);
            indicatorText.setAttribute('x', x + 1);
            indicatorText.setAttribute('y', settings.y + settings.height - markHeight + 10);
            indicatorText.setAttribute('style', `font-size: 10px;pointer-events: none;`);
            let data = document.createTextNode(`index${i}mm`);
            indicatorText.appendChild(data);
            indicatorText.childNodes[0].nodeValue = (i - 1) / 10;
        }
        else if ((i - 1) % 5 === 0) {
            markHeight = 7 / 0.2645833;
        }

        let angleCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");

        pathString = ` M ${x} ${settings.y + settings.height} L ${x} ${settings.y + settings.height - markHeight}`;

        let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute('d', pathString);
        path.setAttribute('stroke', settings.marksStrokeColor);
        path.setAttribute('stroke-width', settings.strokeWidth);
        //   path.setAttribute('fill', settings.fillColor);
        group.appendChild(path);
    }
    return pathString;
}

ruler.drawAngleText = function (settings, group, metrics) {

    let pathString = "";
    let indicatorText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    indicatorText.id = `angleIndicator#${settings.id}`;
    group.appendChild(indicatorText);
    indicatorText.setAttribute('x', (settings.x + settings.width) / 2 - metrics.width / 2);
    indicatorText.setAttribute('y', settings.y + settings.height / 2 + metrics.fontBoundingBoxAscent / 2);
    indicatorText.setAttribute('style', `font-size: 12px;font-weight;font-color:red; pointer-events: none;)`);
    let data = document.createTextNode(`angle${settings.id}`);
    indicatorText.appendChild(data);
    indicatorText.childNodes[0].nodeValue = settings.angle + '°';
}

ruler.drawRulerRectangle = function (group, settings) {
    let rulerShape = document.createElementNS("http://www.w3.org/2000/svg", "rect");

    rulerShape.setAttribute('width', settings.width);
    rulerShape.setAttribute('height', settings.height);
    rulerShape.setAttribute('x', settings.x);
    rulerShape.setAttribute('y', settings.y);
    rulerShape.setAttribute('fill', settings.fillColor);
    rulerShape.setAttribute('stroke', settings.strokeColor);
    rulerShape.setAttribute('stroke-width', settings.strokeWidth);

    group.appendChild(rulerShape);
}

ruler.updateSettings = function(settings) {

    ruler.setPosition(settings);
    ruler.updateRotationSettings(settings);
}

ruler.updateRotationSettings = function (settings) {
    let rulerShape = document.getElementById(`ruler-sg#${settings.id}`);
    rulerShape.setAttribute('style', `pointer-events: auto;transform-box: fill-box;transform-origin: center;transform: rotate(${settings.angle}deg`);

    let canvas = document.createElement("canvas");
    let context = canvas.getContext("2d");
    context.font = '12px';
    let metrics = context.measureText(settings.angle + '°');

    //update angle text
    let indicatorText = document.getElementById(`angleIndicator#${settings.id}`);
    indicatorText.setAttribute('x', (settings.x + settings.width) / 2 - metrics.width / 2);
    indicatorText.setAttribute('y', settings.y + settings.height / 2 + metrics.fontBoundingBoxAscent / 2);
    indicatorText.setAttribute('style', `font-size: 12px;font-weight;font-color:red; pointer-events: none;transform-box: fill-box;transform-origin: center;transform: rotate(${-1 * settings.angle}deg)`);
    indicatorText.childNodes[0].nodeValue = (-1)*settings.angle + '°';
}

ruler.calculateDistanceToRuler = function(settings, position){

    let distanceFromTopSide = Number.MAX_VALUE;
    let distanceFromBottomSide = Number.MAX_VALUE;

    if (settings.angle === 0) {
        distanceFromTopSide = Math.abs(position.y - (settings.y + settings.dy));
        distanceFromBottomSide = Math.abs(position.y - (settings.y + settings.dy + settings.height));
       
    }
    else if (settings.angle === -90 || settings.angle === 270) {
        distanceFromTopSide = Math.abs(position.x - (settings.center.x - settings.height / 2 + settings.dx));
        distanceFromBottomSide = Math.abs(position.x - (settings.center.x + settings.height / 2 + settings.dx));
       
    }

    else if (settings.angle === 90 || settings.angle === -270) {
        distanceFromTopSide = Math.abs(position.x - (settings.center.x + settings.height / 2 + settings.dx));
        distanceFromBottomSide = Math.abs(position.x - (settings.center.x - settings.height / 2 + settings.dx));

    }
    else if (settings.angle === 180 || settings.angle === -180) {
        distanceFromBottomSide = Math.abs(position.y - (settings.y + settings.dy));
        distanceFromTopSide = Math.abs(position.y - (settings.y + settings.dy + settings.height));
    }
    else{
        let translatedCurrentPositionX = position.x - settings.center.x - settings.dx;
        let translatedCurrentPositionY = -(position.y - settings.center.y - settings.dy);
        let angleInRadians = Math.PI * (-settings.angle) / 180;
        let theta = Math.PI / 2;
        let beta = angleInRadians + theta;
        let p = settings.height / 2;
        let s = Math.tan(beta);
        let b = translatedCurrentPositionY - s * translatedCurrentPositionX;
        let x = (p / Math.sin(beta) - b) / (s + 1 / Math.tan(beta));
        let y = Math.tan(beta) * x + b;
        distanceFromTopSide = Math.sqrt(Math.pow(translatedCurrentPositionY - y, 2) + Math.pow(translatedCurrentPositionX - x, 2));
 
        p = -settings.height / 2;
        s = Math.tan(beta);
        b = translatedCurrentPositionY - s * translatedCurrentPositionX;
        x = (p / Math.sin(beta) - b) / (s + 1 / Math.tan(beta));
        y = Math.tan(beta) * x + b;
        distanceFromBottomSide = Math.sqrt(Math.pow(translatedCurrentPositionY - y, 2) + Math.pow(translatedCurrentPositionX - x, 2));
    }
    if (distanceFromTopSide < distanceFromBottomSide) {
        return { id: settings.id, type: "ruler", side: "top", distance: distanceFromTopSide, settings: settings }
    }
    else {
        return { id: settings.id, type: "ruler", side: "bottom", distance: distanceFromBottomSide, settings: settings}
    }
}

ruler.capturePen = function (layerId, position) {

    let minCapturedResult = null;
    for (var key in rulerSettingsDictionary) {
        let settings = rulerSettingsDictionary[key];
        if (settings.layerId === layerId) {
            let result = ruler.calculateDistanceToRuler(settings, position);
            if (result.distance <= rulerCaptureDistance) {
                if (minCapturedResult == null) {
                    minCapturedResult = result;
                }
                else if (minCapturedResult.distance > result.distance) {
                    minCapturedResult = result;
                }
                console.log(minCapturedResult = result);
            }
            
        }
    }

    return minCapturedResult;
}

ruler.mapMousePosition = function (capturedObject, strokeThickness, position) {
    let settings = rulerSettingsDictionary[capturedObject.id];
    if (settings) {
        let result = ruler.calculateDistanceToRuler(settings, position);
        if (result.distance <= rulerCaptureDistance) {
            if (settings.angle === 0) {
                if (capturedObject.side === "top") {
                    return { x: position.x, y: settings.y + settings.dy - rulerShift - strokeThickness / 2 };
                }
                else if (capturedObject.side === "bottom") {

                    return { x: position.x, y: settings.y + settings.height + settings.dy + rulerShift + strokeThickness / 2 };

                }
            }

            if (settings.angle === 180 || settings.angle === -180) {
                if (capturedObject.side === "top") {
                    return { x: position.x, y: settings.y + settings.height + settings.dy + rulerShift + strokeThickness / 2 };
                }
                else if (capturedObject.side === "bottom") {
                    return { x: position.x, y: settings.y + settings.dy - rulerShift - strokeThickness / 2 };
                }
            }

            if (settings.angle === -90 || settings.angle === 270) {
                if (capturedObject.side === "top") {
                    return { x: settings.center.x - settings.height / 2 - rulerShift - strokeThickness / 2 + settings.dx, y: position.y };
                }
                else if (capturedObject.side === "bottom") {
                    return { x: settings.center.x + settings.height / 2 + settings.dx + rulerShift + strokeThickness / 2, y: position.y };
                }
            }

            if (settings.angle === 90 || settings.angle === -270) {
                if (capturedObject.side === "top") {
                    return { x: settings.center.x + settings.height / 2 + settings.dx + rulerShift + strokeThickness / 2, y: position.y };
                }
                else if (capturedObject.side === "bottom") {
                    return { x: settings.center.x - settings.height / 2 - rulerShift - strokeThickness / 2 + settings.dx, y: position.y };
                }
            }

            else {
                let translatedCurrentPositionX = position.x - settings.center.x - settings.dx;
                let translatedCurrentPositionY = -(position.y - settings.center.y - settings.dy);
                let angleInRadians = Math.PI * (-settings.angle) / 180;
                let theta = Math.PI / 2;
                let beta = angleInRadians + theta;
                if (capturedObject.side === "top") {
                    let p = strokeThickness / 2 + settings.height / 2 + rulerShift;
                    let s = Math.tan(beta);
                    let b = translatedCurrentPositionY - s * translatedCurrentPositionX;
                    let x = (p / Math.sin(beta) - b) / (s + 1 / Math.tan(beta));
                    let y = Math.tan(beta) * x + b;
                    return { x: settings.center.x + settings.dx + x, y: settings.center.y + settings.dy - y };
                }
                else {
                    let p = -(strokeThickness / 2 + settings.height / 2 + rulerShift);
                    let s = Math.tan(beta);
                    let b = translatedCurrentPositionY - s * translatedCurrentPositionX;
                    let x = (p / Math.sin(beta) - b) / (s + 1 / Math.tan(beta));
                    let y = Math.tan(beta) * x + b;
                    return { x: settings.center.x + settings.dx + x, y: settings.center.y + settings.dy - y };
                }
            }
        }
    }

    return null;
}
