var setSquareRuler = {};

setSquareRulerSettingsDictionary = {};

setSquareRuler.create = function (containerId, inputSettings) {

    let setSquareRulerInstance = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    setSquareRulerInstance.setAttribute('width', layerWidth);
    setSquareRulerInstance.setAttribute('height', layerHeight);
    setSquareRulerInstance.setAttribute('style', `z-index:${inputSettings.zIndex};position:fixed;pointer-events: none`);
    setSquareRulerInstance.id = inputSettings.id;

    let rootContainer = document.getElementById(containerId);
    rootContainer.appendChild(setSquareRulerInstance);

    setSquareRulerSettingsDictionary[inputSettings.id] = inputSettings;

    setSquareRuler.drawSetSquareRuler(inputSettings.id);
}

setSquareRuler.delete = function (containerId, id) {

    let rootContainer = document.getElementById(containerId);
    let setSquareRulerInstance = document.getElementById(id);

    rootContainer.removeChild(setSquareRulerInstance);

    delete setSquareRulerSettingsDictionary[id];

}

setSquareRuler.drawSetSquareRuler = function (id) {

    let setSquareRulerInstance = document.getElementById(id);

    if (setSquareRulerInstance) {
        let settings = setSquareRulerSettingsDictionary[id];

        let parentGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        
        //parentGroup.setAttribute('style', `pointer-events: auto;transform-box: fill-box;transform-origin: center;transform: rotate(${settings.angle}deg`);
        parentGroup.setAttribute('style', `pointer-events: auto;`);

        parentGroup.setAttribute('onmousedown', 'setSquareRuler.mouseDownSetSquareRuler(event)');
        parentGroup.setAttribute('onmousemove', 'setSquareRuler.mouseMoveSetSquareRuler(event)');
        parentGroup.setAttribute('onmouseup', 'setSquareRuler.mouseUpSetSquareRuler(event)');
        parentGroup.setAttribute('onmouseover', 'setSquareRuler.mouseOverSetSquareRuler(event)');
        parentGroup.setAttribute('onmouseout', 'setSquareRuler.mouseOutSetSquareRuler(event)');
        parentGroup.setAttribute('onwheel', 'setSquareRuler.mouseWheel(event)');

        parentGroup.id = `setSquareRuler#${id}`;
        setSquareRulerInstance.appendChild(parentGroup);

        let group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        parentGroup.appendChild(group);
        group.setAttribute('style', `pointer-events: auto;transform-box: fill-box;transform-origin: center;transform: rotate(${settings.angle}deg`);
        group.setAttribute('onwheel', 'setSquareRuler.mouseWheel(event)');

        group.id = `setSquareRuler-sg#${id}`;

        let setSquareRulerShape = document.createElementNS("http://www.w3.org/2000/svg", "path");

        setSquareRulerShape.setAttribute('d', `M ${settings.x} ${settings.y} L ${settings.x + settings.width} ${settings.y}
                                           L ${settings.x + settings.width / 2} ${settings.y - settings.height}
                                           L ${settings.x} ${settings.y} Z`);

        setSquareRulerShape.setAttribute('style', `pointer - events: auto`);


        setSquareRulerShape.setAttribute('fill', settings.fillColor);
        setSquareRulerShape.setAttribute('stroke', settings.strokeColor);
        setSquareRulerShape.setAttribute('stroke-width', settings.strokeWidth);
        group.appendChild(setSquareRulerShape);

        let shiftFromSide = 20 / 0.2645833;

        let sideB = sideC = Math.sin(Math.PI / 4) * settings.width;

        let cosB = sinB = Math.PI / 4;
        let tanB = 1;

        let cosC = sinC = Math.PI / 4;
        let tanC = 1;

        let segementBM = settings.width / 2;

        //let vertexB = { x: settings.x, y: settings.y };
        //let vertexC = { x: settings.x + settings.width, y: settings.y };
        //let vertexA = { x: settings.x + settings.width / 2, y: settings.y - settings.height };

        let vertexB = settings.vertexB;
        let vertexC = settings.vertexC;
        let vertexA = settings.vertexA;

        let BB1C = shiftFromSide;
        let CC1B = shiftFromSide;

        let B1C1 = settings.width - BB1C - CC1B;

        let B1M1 = B1C1 / 2;
        let h1 = B1M1 - shiftFromSide;


        let Bp = { x: vertexB.x + 2 * BB1C, y: vertexB.y - shiftFromSide };
        let Cp = { x: vertexC.x - 2 * BB1C, y: vertexB.y - shiftFromSide };
        let Ap = { x: settings.x + settings.width / 2, y: vertexB.y - h1 - shiftFromSide };


        setSquareRulerShape = document.createElementNS("http://www.w3.org/2000/svg", "path");

        setSquareRulerShape.setAttribute('d', `M ${Ap.x} ${Ap.y} L ${Bp.x} ${Bp.y}
                                           L ${Cp.x} ${Cp.y}
                                           L ${Ap.x} ${Ap.y} Z`);

        setSquareRulerShape.setAttribute('style', `pointer - events: auto`);


        setSquareRulerShape.setAttribute('fill', settings.fillColor);
        setSquareRulerShape.setAttribute('stroke', settings.strokeColor);
        setSquareRulerShape.setAttribute('stroke-width', settings.strokeWidth);
        group.appendChild(setSquareRulerShape);

        setSquareRuler.drawSideABUnits(settings, group, vertexA, vertexB);
        setSquareRuler.drawSideACUnits(settings, group, vertexA, vertexC);

        let canvas = document.createElement("canvas");
        let context = canvas.getContext("2d");
        context.font = '12px';
        let metrics = context.measureText(settings.angle + '°');
        setSquareRuler.drawAngleText(settings, group, metrics)

        metrics = context.measureText('0');
        setSquareRuler.drawAngleCircle(metrics, group, settings);
    }

}

setSquareRuler.drawAngleText = function (settings, group, metrics) {

    let pathString = "";
    let indicatorText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    indicatorText.id = `angleIndicator#${settings.id}`;
    group.appendChild(indicatorText);
    indicatorText.setAttribute('x', settings.x + settings.width / 2 - metrics.width / 2);
    indicatorText.setAttribute('y', settings.y - 10 / 0.2645833 + metrics.fontBoundingBoxAscent / 2);
    indicatorText.setAttribute('style', `font-size: 12px;font-weight;font-color:red; pointer-events: none;)`);
    let data = document.createTextNode(`angle${settings.id}`);
    indicatorText.appendChild(data);
    indicatorText.childNodes[0].nodeValue = settings.angle + '°';
}

setSquareRuler.drawAngleCircle = function (metrics, group, settings) {
    let angleCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    group.appendChild(angleCircle);
    angleCircle.setAttribute('r', metrics.width * 3.5);
    angleCircle.setAttribute('cx', settings.x + settings.width / 2);
    angleCircle.setAttribute('cy', (settings.y - 10 / 0.2645833));
    angleCircle.setAttribute('fill', settings.fillColor);
    angleCircle.setAttribute('stroke', `red`);
    angleCircle.setAttribute('stroke-width', settings.strokeWidth);
}

setSquareRuler.drawSideABUnits = function (settings, group, vertexA, vertexB) {
    let angleB = Math.PI / 4;
    let AB = Math.floor(Math.sqrt(Math.pow((vertexA.x - vertexB.x), 2) + Math.pow((vertexA.y - vertexB.y), 2)));

    AB = Math.floor((AB - 25 / 0.2645833) * 0.2645833);
    let skipMillimeterFromB = 15;
    for (let i = 1; i <= AB; ++i) {

        let markHeight = 4 / 0.2645833;

        let x = vertexB.x + (i + skipMillimeterFromB) * Math.cos(angleB) / 0.2645833;
        let y = vertexB.y - (i + skipMillimeterFromB) * Math.cos(angleB) / 0.2645833;

        if ((i - 1) % 10 === 0) {
            markHeight = 8 / 0.2645833;

            let indicatorText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            group.appendChild(indicatorText);
            indicatorText.setAttribute('x', x + markHeight + 1);
            indicatorText.setAttribute('y', y + markHeight);
            indicatorText.setAttribute('style', `font-size: 10px;pointer-events: none;`);
            let data = document.createTextNode(`index${i}mm`);
            indicatorText.appendChild(data);
            indicatorText.childNodes[0].nodeValue = (i - 1) / 10;

        }
        else if ((i - 1) % 5 === 0) {
            markHeight = 6 / 0.2645833;
        }



        pathString = ` M ${x} ${y} L ${x + markHeight} ${y + markHeight}`

        let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute('d', pathString);
        path.setAttribute('stroke', settings.marksStrokeColor);
        path.setAttribute('stroke-width', settings.strokeWidth);
        //   path.setAttribute('fill', settings.fillColor);
        group.appendChild(path);
    }
}

setSquareRuler.drawSideACUnits = function (settings, group, vertexA, vertexC) {
    let angleB = Math.PI / 4;
    let AC = Math.floor(Math.sqrt(Math.pow((vertexA.x - vertexC.x), 2) + Math.pow((vertexA.y - vertexC.y), 2)));

    AC = Math.floor((AC - 25 / 0.2645833) * 0.2645833);
    let skipMillimeterFromB = 15;
    for (let i = 1; i <= AC; ++i) {

        let markHeight = 4 / 0.2645833;

        let x = vertexC.x - (i + skipMillimeterFromB) * Math.cos(angleB) / 0.2645833;
        let y = vertexC.y - (i + skipMillimeterFromB) * Math.cos(angleB) / 0.2645833;

        if ((i - 1) % 10 === 0) {
            markHeight = 8 / 0.2645833;

            let indicatorText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            group.appendChild(indicatorText);
            indicatorText.setAttribute('x', x - markHeight - 4);
            indicatorText.setAttribute('y', y + markHeight);
            indicatorText.setAttribute('style', `font-size: 10px;pointer-events: none;`);
            let data = document.createTextNode(`index${i}mm`);
            indicatorText.appendChild(data);
            indicatorText.childNodes[0].nodeValue = (i - 1) / 10;

        }
        else if ((i - 1) % 5 === 0) {
            markHeight = 6 / 0.2645833;
        }



        pathString = ` M ${x} ${y} L ${x - markHeight} ${y + markHeight}`

        let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute('d', pathString);
        path.setAttribute('stroke', settings.marksStrokeColor);
        path.setAttribute('stroke-width', settings.strokeWidth);
        //   path.setAttribute('fill', settings.fillColor);
        group.appendChild(path);
    }
}

setSquareRuler.setPosition = function (settings) {

    let setSquareRulerShape = document.getElementById(`setSquareRuler#${settings.id}`);

    if (settings.dragging && setSquareRulerShape) {
        setSquareRulerShape.setAttribute('style', `pointer-events: auto;transform-origin:0,0; transform:translate(${settings.dx}px, ${settings.dy}px);`);
    }
}

setSquareRuler.mouseOverSetSquareRuler = function (e) {

    e.target.style.cursor = 'pointer';

}

setSquareRuler.mouseOutSetSquareRuler = function (e) {

    e.target.style.cursor = 'default';
}

setSquareRuler.mouseDownSetSquareRuler = function (e) {

    event.stopPropagation();

    //    DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'HandleOnMouseDown', layerId, pointer)

    if (e.buttons == 1) {
        e.target.style.cursor = 'move';
        let id = setSquareRuler.extractId(e.currentTarget.id);
        let settings = setSquareRulerSettingsDictionary[id];
        settings.dragging = true;
        e.target.setPointerCapture(1);
        settings.previousPointerPosition = { x: e.clientX, y: e.clientY };

        //DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'OnMouseDownSetSquare', settings);
    }

}

setSquareRuler.mouseMoveSetSquareRuler = function (e) {
    event.stopPropagation();
    let id = setSquareRuler.extractId(e.currentTarget.id);
    let settings = setSquareRulerSettingsDictionary[id];
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
        setSquareRuler.setPosition(settings);
        settings.previousPointerPosition.x = e.clientX;
        settings.previousPointerPosition.y = e.clientY;

        //DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'OnMouseMoveSetSquare', settings);
    }
}

setSquareRuler.mouseUpSetSquareRuler = function (e) {

    e.target.style.cursor = 'default';
    event.stopPropagation();
    let id = setSquareRuler.extractId(e.currentTarget.id);
    let settings = setSquareRulerSettingsDictionary[id];
    if (settings.dragging) {

        settings.dragging = false;
        e.target.releasePointerCapture(1);

        DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'UpdateSetSquareSettings', settings);
    }
}

setSquareRuler.mouseWheel = function (e) {
    e.preventDefault();
    e.stopPropagation();
    e.target.style.cursor = 'pointer';
    let id = setSquareRuler.extractId(e.currentTarget.id);
    let settings = setSquareRulerSettingsDictionary[id];
    settings.angle = (settings.angle + Math.sign(e.wheelDeltaY) * 1) % 360;

    setSquareRuler.updateRotationSettings(settings);

    DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'UpdateSetSquareSettings', settings);

}

setSquareRuler.extractId = function (value) {
    let arr = value.split("#");
    return arr[1];
}

setSquareRuler.updateSettings = function(settings){
    setSquareRuler.setPosition(settings);
    setSquareRuler.updateRotationSettings(settings);
}

setSquareRuler.updateRotationSettings = function(settings){
    let rulerShape = document.getElementById(`setSquareRuler-sg#${settings.id}`);
    let canvas = document.createElement("canvas");
    let context = canvas.getContext("2d");

    //let x = 100 * (settings.center.x) / layerWidth;
    //let y = 100 * (settings.center.y) / layerHeight;

    //rulerShape.setAttribute('style', `pointer-events: auto;transform-box: fill-box;transform-origin: ${x}% ${y}%;transform: rotate(${settings.angle}deg`);
    rulerShape.setAttribute('style', `pointer-events: auto;transform-box: fill-box;transform-origin: center;transform: rotate(${settings.angle}deg`);

    context.font = '12px';
    let metrics = context.measureText(settings.angle + '°');

    //update angle text
    let indicatorText = document.getElementById(`angleIndicator#${settings.id}`);
    indicatorText.setAttribute('x', settings.x + settings.width / 2 - metrics.width / 2);
    indicatorText.setAttribute('y', settings.y - 10 / 0.2645833 + metrics.fontBoundingBoxAscent / 2);
    indicatorText.setAttribute('style', `font-size: 12px;font-weight;font-color:red; pointer-events: none;transform-box: fill-box;transform-origin: center;transform: rotate(${-1 * settings.angle}deg)`);
    indicatorText.childNodes[0].nodeValue = settings.angle + '°';
}

setSquareRuler.calculateDistanceToRulerRightSide= function (settings, position) {
    let va_tx = settings.vertexA.x - settings.center.x - settings.dx;
    let va_ty = settings.vertexA.y - settings.center.y - settings.dy;

    let vc_tx = settings.vertexC.x - settings.center.x - settings.dx;
    let vc_ty = settings.vertexC.y - settings.center.y - settings.dy;

    let p_tx = position.x - settings.center.x - settings.dx;
    let p_ty = position.y - settings.center.y - settings.dy;

    let angle = Math.PI * settings.angle / 180;

    let va_x = Math.cos(angle) * va_tx - Math.sin(angle) * va_ty;
    let va_y = Math.sign(angle) * va_tx + Math.cos(angle) * va_ty;

    let vc_x = Math.cos(angle) * vc_tx - Math.sin(angle) * vc_ty;
    let vc_y = Math.sign(angle) * vc_tx + Math.cos(angle) * vc_ty;

    if (vc_x - va_x != 0) {
        slope = (vc_y - va_y) / (vc_x - va_x);
        p_slope = -1 / slope;
        let b = va_y - va_x * slope;
        let p_b = p_ty - p_tx * p_slope;

        let x = (p_b - b) / (slope - p_slope);
        let y = x * slope + b;
        if ((p_tx >= va_x && p_tx <= vc_x) || (p_tx >= vc_x && p_tx <= va_x)) {
            return Math.sqrt(Math.pow((p_ty - y), 2) + Math.pow((p_tx - x), 2));
        }
        else {
            return Number.MAX_VALUE;
        }
    }
    else {
        return Math.abs(p_tx);
    }
}

setSquareRuler.calculateDistanceToRulerLeftSide = function (settings, position) {
    let va_tx = settings.vertexA.x - settings.center.x - settings.dx;
    let va_ty = settings.vertexA.y - settings.center.y - settings.dy;

    let vb_tx = settings.vertexB.x - settings.center.x - settings.dx;
    let vb_ty = settings.vertexB.y - settings.center.y - settings.dy;

    let p_tx = position.x - settings.center.x - settings.dx;
    let p_ty = position.y - settings.center.y - settings.dy;

    let angle = Math.PI * settings.angle / 180;
    let va_x = Math.cos(angle) * va_tx - Math.sin(angle) * va_ty;
    let va_y = Math.sign(angle) * va_tx + Math.cos(angle) * va_ty;

    let vb_x = Math.cos(angle) * vb_tx - Math.sin(angle) * vb_ty;
    let vb_y = Math.sign(angle) * vb_tx + Math.cos(angle) * vb_ty;

    let slope = 0;
    let p_slope = 0
    if (settings.angle != 45) {
        slope = (vb_y - va_y) / (vb_x - va_x);
        p_slope = -1 / slope;
        let b = va_y - va_x * slope;
        let p_b = p_ty - p_tx * p_slope;

        let x = (p_b - b) / (slope - p_slope);
        let y = x * slope + b;
        if ((p_tx >= va_x && p_tx <= vb_x) || (p_tx >= vb_x && p_tx <= va_x)) {
            return Math.sqrt(Math.pow((p_ty - y), 2) + Math.pow((p_tx - x), 2));
        }
        else {
            return Number.MAX_VALUE;
        }
    }
    else if (settings.angle == 45) {
        return Math.abs(p_tx - vb_y);
    }
}

setSquareRuler.calculateDistanceToRulerBottomSide = function (settings, position) {

    let px = position.x - settings.center.x - settings.dx;
    let py = position.y - settings.center.y - settings.dy;

    let height = settings.vertexB.y - settings.center.y;

    if (settings.angle === 0) {
        return Math.abs(py - height);

    }
    else if (settings.angle === -90 || settings.angle === 270) {
        return Math.abs(px - height);
    }
    else if (settings.angle === 90 || settings.angle === -270) {
        return Math.abs(px + height);
    }
    else if (settings.angle === 180 || settings.angle === -180) {
        return Math.abs(py + height );
    }
    else {
        let translatedCurrentPositionX = position.x - settings.center.x - settings.dx;
        let translatedCurrentPositionY = -(position.y - settings.center.y - settings.dy);
        let angleInRadians = Math.PI * (-settings.angle) / 180;
        let theta = Math.PI / 2;
        let beta = angleInRadians + theta;
        p = -height;
        s = Math.tan(beta);
        b = translatedCurrentPositionY - s * translatedCurrentPositionX;
        x = (p / Math.sin(beta) - b) / (s + 1 / Math.tan(beta));
        y = Math.tan(beta) * x + b;
 
        return Math.sqrt(Math.pow(translatedCurrentPositionY - y, 2) + Math.pow(translatedCurrentPositionX - x, 2));
    }
}

setSquareRuler.mapDistanceToRulerRightSide = function (settings, position, strokeThickness) {
    
    let center = { x: settings.vertexA.x, y: (settings.vertexA.y + settings.vertexB.y)/2 }
    let va_tx = settings.vertexA.x - center.x - settings.dx;
    let va_ty = settings.vertexA.y - center.y - settings.dy - (strokeThickness / 2 + rulerShift) / Math.cos(Math.PI / 4);

    let vc_tx = settings.vertexC.x + (strokeThickness / 2 + rulerShift) / Math.cos(Math.PI / 4) - settings.center.x - settings.dx;
    let vc_ty = settings.vertexC.y - center.y - settings.dy;

    let p_tx = position.x - center.x - settings.dx;
    let p_ty = position.y - center.y - settings.dy;

    let angle = Math.PI * settings.angle / 180;
    let va_x = Math.cos(angle) * va_tx - Math.sin(angle) * va_ty;
    let va_y = Math.sin(angle) * va_tx + Math.cos(angle) * va_ty;

    let vc_x = Math.cos(angle) * vc_tx - Math.sin(angle) * vc_ty;
    let vc_y = Math.sin(angle) * vc_tx + Math.cos(angle) * vc_ty;

    if (vc_x - va_x != 0) {
        let translatedCurrentPositionX = position.x - center.x - settings.dx;
        let translatedCurrentPositionY = -(position.y - center.y - settings.dy);
        let angleInRadians = Math.PI * (-settings.angle) / 180;
        let theta =  Math.PI / 4;
        let beta = angleInRadians + theta;
        // let oa = va_ty - (rulerShift + strokeThickness) / Math.sign(Math.PI / 4);
        let p = -(va_ty) * Math.sin(Math.PI / 4);
        let s = Math.tan(beta);
        let b = translatedCurrentPositionY - s * translatedCurrentPositionX;
        let x = (p / Math.sin(beta) - b) / (s + 1 / Math.tan(beta));
        let y = Math.tan(beta) * x + b;
        return { x: center.x + settings.dx + x, y: center.y + settings.dy - y };
    }
    else {
        return { x: settings.vertexA.x + (strokeThickness / 2 + rulerShift) / Math.sign(Math.PI / 4), y: position.y };
    }
}

setSquareRuler.mapDistanceToRulerLeftSide = function (settings, position, strokeThickness) {

    let center = { x: settings.vertexA.x, y: (settings.vertexA.y + settings.vertexB.y) / 2 }

    let va_tx = settings.vertexA.x  - center.x - settings.dx;
    let va_ty = settings.vertexA.y - center.y - settings.dy - (strokeThickness / 2 + rulerShift) / Math.cos(Math.PI / 4);

    let vb_tx = settings.vertexB.x - (strokeThickness / 2 + rulerShift) / Math.cos(Math.PI / 4) - center.x - settings.dx;
    let vb_ty = settings.vertexB.y - center.y - settings.dy;

    let p_tx = position.x - center.x - settings.dx;
    let p_ty = position.y - center.y - settings.dy;

    let angle = Math.PI * settings.angle / 180;
    let va_x = Math.cos(angle) * va_tx - Math.sin(angle) * va_ty;
    let va_y = Math.sin(angle) * va_tx + Math.cos(angle) * va_ty;

    let vb_x = Math.cos(angle) * vb_tx - Math.sin(angle) * vb_ty;
    let vb_y = Math.sin(angle) * vb_tx + Math.cos(angle) * vb_ty;

    if (settings.angle != 45) {
        let translatedCurrentPositionX = position.x - center.x - settings.dx;
        let translatedCurrentPositionY = -(position.y - center.y - settings.dy);
        let angleInRadians = Math.PI * (-settings.angle) / 180;
        let theta =Math.PI -  Math.PI / 4;
        let beta = angleInRadians + theta;
        // let oa = va_ty - (rulerShift + strokeThickness) / Math.sign(Math.PI / 4);
        let p = - (va_ty) * Math.sin(Math.PI / 4);
        if (settings.angle > 45) {
            // let oa = va_ty - (rulerShift + strokeThickness) / Math.sign(Math.PI / 4);
            p = (va_ty) * Math.sin(Math.PI / 4);
        }
        let s = Math.tan(beta);
        let b = translatedCurrentPositionY - s * translatedCurrentPositionX;
        let x = (p / Math.sin(beta) - b) / (s + 1 / Math.tan(beta));
        let y = Math.tan(beta) * x + b;
        return { x: center.x + settings.dx + x, y: center.y + settings.dy - y };

    }
    else {
        let vb_y = Math.sin(angle) * vb_tx + Math.cos(angle) * vb_ty;

        return { x: position.x, y: settings.center.y + settings.dy+ vb_y - strokeThickness/2 - rulerShift };
    }
}

setSquareRuler.mapDistanceToRulerBottomSide = function (settings, position, strokeThickness) {
    let height = settings.y - settings.center.y;
    if (settings.angle === 0) {
        return { x: position.x, y: settings.y + settings.dy + rulerShift + strokeThickness / 2 };
    }

    if (settings.angle === 180 || settings.angle === -180) {
        return { x: position.x, y: settings.y + settings.dy - rulerShift - strokeThickness / 2 };
    }

    if (settings.angle === -90 || settings.angle === 270) {
        return { x: settings.center.x + height + settings.dx + rulerShift + strokeThickness / 2, y: position.y };
    }

    if (settings.angle === 90 || settings.angle === -270) {
        return { x: settings.center.x - height - rulerShift - strokeThickness / 2 + settings.dx, y: position.y };
    }

    else {
        let translatedCurrentPositionX = position.x - settings.center.x - settings.dx;
        let translatedCurrentPositionY = -(position.y - settings.center.y - settings.dy);
        let angleInRadians = Math.PI * (-settings.angle) / 180;
        let theta = Math.PI / 2;
        let beta = angleInRadians + theta;

        let p = -(strokeThickness / 2 + height + rulerShift);
        let s = Math.tan(beta);
        let b = translatedCurrentPositionY - s * translatedCurrentPositionX;
        let x = (p / Math.sin(beta) - b) / (s + 1 / Math.tan(beta));
        let y = Math.tan(beta) * x + b;
        return { x: settings.center.x + settings.dx + x, y: settings.center.y + settings.dy - y };

    }
}

setSquareRuler.calculateDistanceToRuler = function (settings, position) {

    let distanceFromLeftSide = setSquareRuler.calculateDistanceToRulerLeftSide(settings, position);
    let distanceFromRightSide = setSquareRuler.calculateDistanceToRulerRightSide(settings, position);
    let distanceFromBottomSide = setSquareRuler.calculateDistanceToRulerBottomSide(settings, position);

    let side = "bottom";
    let distance = distanceFromBottomSide;
    if (distanceFromLeftSide < distanceFromBottomSide) {
        side = "left";
        distance = distanceFromLeftSide;
        if (distanceFromRightSide < distanceFromLeftSide) {
            side = "right";
            distance = distanceFromRightSide;
        }
    }
    else {
        if (distanceFromRightSide < distanceFromBottomSide) {
            side = "right";
            distance = distanceFromRightSide;
        }
    }


    return { id: settings.id, type: "setSquare", side: side, distance: distance, settings: settings }
   
}

setSquareRuler.capturePen = function (layerId, position) {

    let minCapturedResult = null;
    for (var key in setSquareRulerSettingsDictionary) {
        let settings = setSquareRulerSettingsDictionary[key];
        if (settings.layerId === layerId) {
            let result = setSquareRuler.calculateDistanceToRuler(settings, position);
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

setSquareRuler.mapMousePosition = function (capturedObject, strokeThickness, position) {
    let settings = setSquareRulerSettingsDictionary[capturedObject.id];
    if (settings) {
        let result = setSquareRuler.calculateDistanceToRuler(settings, position);
        if (result.distance <= rulerCaptureDistance) {
            if (capturedObject.side === "right") {
                let point = setSquareRuler.mapDistanceToRulerRightSide(settings, position, strokeThickness);
                return { x: point.x, y: point.y };

            }
            if (capturedObject.side === "left") {
                let point = setSquareRuler.mapDistanceToRulerLeftSide(settings, position, strokeThickness);
                return { x: point.x, y: point.y };

            }
            if (capturedObject.side === "bottom") {
                let point = setSquareRuler.mapDistanceToRulerBottomSide(settings, position, strokeThickness);
                return { x: point.x, y: point.y };
            }
        }
    }

    return null;
}
