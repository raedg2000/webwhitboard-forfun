compass = {};

var compassSettingsDictionary = {};

compass.create = function (containerId, inputSettings) {


    let compassInstance = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    compassInstance.setAttribute('width', layerWidth);
    compassInstance.setAttribute('height', layerHeight);
    compassInstance.setAttribute('style', `z-index:${inputSettings.zIndex};position:fixed;pointer-events: none;`);
    compassInstance.id = inputSettings.id;

    let rootContainer = document.getElementById(containerId);
    rootContainer.appendChild(compassInstance);
    inputSettings.pencilDragging = false;
    inputSettings.lineDragging = false;
    inputSettings.centerDragging = false;
    inputSettings.indicatorDragging = false;
    inputSettings.drawing = false;
    compassSettingsDictionary[inputSettings.id] = inputSettings;

    compass.createCompassParts(inputSettings.id);
}

compass.createCompassParts = function (id) {

    let compassInstance = document.getElementById(id);

    if (compassInstance) {

        let compassSettings = compassSettingsDictionary[id];

        if (compassSettings) {
            let lockImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
            lockImage.setAttribute('href', '_content/KueMinds.FillZGap.BlazorComponents/Drawingboard/Images/lock.svg');
            lockImage.setAttribute('width', compassSettings.lockProperties.width);
            lockImage.setAttribute('height', compassSettings.lockProperties.height);
            lockImage.setAttribute('onmouseup', 'compass.mouseUpLock(event)');
            lockImage.setAttribute('style', `pointer-events: auto`);

            compassInstance.appendChild(lockImage);

            lockImage.id = `compassLock#${id}`;
            compass.setLockImageAttributes(compassSettings);

            let centerImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
            centerImage.setAttribute('href', '_content/KueMinds.FillZGap.BlazorComponents/Drawingboard/Images/center.svg');
            centerImage.setAttribute('style', `pointer-events: auto`);
            centerImage.setAttribute('width', compassSettings.compassCenterProperties.diameter);
            centerImage.setAttribute('height', compassSettings.compassCenterProperties.diameter);
            centerImage.setAttribute('onmousedown', 'compass.mouseDownCenter(event)');
            centerImage.setAttribute('onmousemove', 'compass.mouseMoveCenter(event)');
            centerImage.setAttribute('onmouseup', 'compass.mouseUpCenter(event)');
            centerImage.setAttribute('onmouseover', 'compass.mouseOver(event)');
            centerImage.setAttribute('onmouseout', 'compass.mouseOut(event)');
            centerImage.setAttribute('onwheel', 'compass.onWheel(event)');
            compassInstance.appendChild(centerImage);
            centerImage.id = `compassCenter#${id}`;
            compass.setCenterImagePositionAttributes(compassSettings);

            let compassLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
            compassLine.setAttribute('style', `pointer-events: auto`);
            compassLine.setAttribute('stroke', compassSettings.lineProperties.strokeColor);
            compassLine.setAttribute('stroke-width', compassSettings.lineProperties.strokeWidth);
            compassInstance.appendChild(compassLine);
            compassLine.id = `compassLine#${id}`;

            let compassLineIndicator = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            compassLineIndicator.setAttribute('style', `pointer-events: auto`);
            compassLineIndicator.setAttribute('stroke', compassSettings.lineProperties.strokeColor);
            compassLineIndicator.setAttribute('stroke-width', compassSettings.lineProperties.strokeWidth);
            compassLineIndicator.setAttribute('width', compassSettings.lineProperties.indicatorWidth);
            compassLineIndicator.setAttribute('height', compassSettings.lineProperties.indicatorHeight);
            compassLineIndicator.setAttribute('onmousedown', 'compass.mouseDownLine(event)');
            compassLineIndicator.setAttribute('onmousemove', 'compass.mouseMoveLine(event)');
            compassLineIndicator.setAttribute('onmouseup', 'compass.mouseUpLine(event)');
            compassLineIndicator.setAttribute('onmouseover', 'compass.mouseOver(event)');
            compassLineIndicator.setAttribute('onmouseout', 'compass.mouseOut(event)');
            compassInstance.appendChild(compassLineIndicator);
            compassLineIndicator.id = `compassLineIndicator#${id}`;

            let compassLineIndicatorText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            compassLineIndicatorText.setAttribute('style', `pointer-events: none`);
            compassLineIndicatorText.id = `compassLineIndicatorText#${id}`;
            //compassLineIndicatorText.setAttribute('onmousedown', 'compass.mouseDownLine(event)');
            //compassLineIndicatorText.setAttribute('onmousemove', 'compass.mouseMoveLine(event)');
            //compassLineIndicatorText.setAttribute('onmouseup', 'compass.mouseUpLine(event)');
            //compassLineIndicatorText.setAttribute('onmouseover', 'compass.mouseOver(event)');
            //compassLineIndicatorText.setAttribute('onmouseout', 'compass.mouseOut(event)');
            compassInstance.appendChild(compassLineIndicatorText);
            let data = document.createTextNode("length");
            compassLineIndicatorText.appendChild(data);
            compass.setLinePositionAttributes(compassSettings);


            let colorBox = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            colorBox.setAttribute('style', `pointer-events: auto`);

            colorBox.setAttribute('width', compassSettings.pencilColorBoxProperties.width);
            colorBox.setAttribute('height', compassSettings.pencilColorBoxProperties.height);
            colorBox.setAttribute('stroke', compassSettings.pencilColorBoxProperties.strokeColor);
            colorBox.setAttribute('stroke-width', compassSettings.pencilColorBoxProperties.strokeWidth);

            colorBox.setAttribute('onmouseup', 'compass.mouseUpColorBox(event)');
            compassInstance.appendChild(colorBox);
            colorBox.id = `compassColorBox#${id}`;
            compass.setPencilColorBoxAttributes(compassSettings);

            let pencilImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
            pencilImage.setAttribute('style', `pointer-events: auto`);
            pencilImage.setAttribute("href", "_content/KueMinds.FillZGap.BlazorComponents/Drawingboard/Images/pencil.svg");
            pencilImage.setAttribute('width', compassSettings.pencilProperties.width);
            pencilImage.setAttribute('height', compassSettings.pencilProperties.height);
            pencilImage.setAttribute('onpointerdown', 'compass.mouseDownPencil(event)');
            pencilImage.setAttribute('onpointermove', 'compass.mouseMovePencil(event)');
            pencilImage.setAttribute('onpointerup', 'compass.mouseUpPencil(event)');
            pencilImage.setAttribute('onmouseover', 'compass.mouseOver(event)');
            pencilImage.setAttribute('onmouseout', 'compass.mouseOut(event)');

            //pencilImage.setAttribute('onpointerdown', 'compass.mouseDownPencil(event)');
            //pencilImage.setAttribute('onpointermove', 'compass.mouseMovePencil(event)');
            //pencilImage.setAttribute('onpointerup', 'compass.mouseUpPencil(event)');
            //pencilImage.setAttribute('onmouseover', 'compass.mouseOver(event)');
            //pencilImage.setAttribute('onmouseout', 'compass.mouseOut(event)');
           // pencilImage.setAttribute('onwheel', 'compass.onWheel(event)');
            compassInstance.appendChild(pencilImage);
            pencilImage.id = `compassPencil#${id}`;
            compass.setPencilImagePositionAttributes(compassSettings);
        }
    }
}

compass.delete = function (containerId, id){

    let rootContainer = document.getElementById(containerId);
    let compassInstance = document.getElementById(id);

    rootContainer.removeChild(compassInstance);

    delete compassSettingsDictionary[id];

}

compass.extractId = function (value) {
    let arr = value.split("#");
    return arr[1];
}

compass.setCenterImagePositionAttributes = function (compassSettings) {
    let compassCenter = document.getElementById(`compassCenter#${compassSettings.id}`);

    if (compassCenter) {
        compassCenter.setAttribute('x', compassSettings.compassCenterProperties.x);
        compassCenter.setAttribute('y', compassSettings.compassCenterProperties.y);
    }
}

compass.setLinePositionAttributes = function (compassSettings) {

    let compassLine = document.getElementById(`compassLine#${compassSettings.id}`);

    if (compassLine) {
        compassLine.setAttribute('x1', compassSettings.lineProperties.x1);
        compassLine.setAttribute('y1', compassSettings.lineProperties.y1);
        compassLine.setAttribute('x2', compassSettings.lineProperties.x2);
        compassLine.setAttribute('y2', compassSettings.lineProperties.y2);
    }

    let compassLineIndicator = document.getElementById(`compassLineIndicator#${compassSettings.id}`);

    if (compassLineIndicator) {
        compassLineIndicator.setAttribute('x', (compassSettings.lineProperties.x1 + compassSettings.lineProperties.x2) / 2 - compassSettings.lineProperties.indicatorWidth / 2);
        compassLineIndicator.setAttribute('y', (compassSettings.lineProperties.y1 + compassSettings.lineProperties.y2) / 2 - compassSettings.lineProperties.indicatorHeight / 2);
        compassLineIndicator.setAttribute('fill', 'white');

    }

    if (!compassSettings.isLocked) {

        compassSettings.radius = Math.sqrt(Math.pow(compassSettings.lineProperties.x2 - compassSettings.lineProperties.x1, 2) +
            Math.pow(compassSettings.lineProperties.y2 - compassSettings.lineProperties.y1, 2));
    }
    let radiusInCm = (compassSettings.radius * 0.02645833).toLocaleString('en-US', { maximumFractionDigits: 2 }) + ' cm';

    let compassLineIndicatorText = document.getElementById(`compassLineIndicatorText#${compassSettings.id}`);
    if (compassLineIndicatorText) {

        let canvas = document.createElement("canvas");
        let context = canvas.getContext("2d");
        context.font = '9px';

        let metrics = context.measureText(radiusInCm);
        compassLineIndicatorText.setAttribute('x', (compassSettings.lineProperties.x1 + compassSettings.lineProperties.x2) / 2 - metrics.width / 2);
        compassLineIndicatorText.setAttribute('y', (compassSettings.lineProperties.y1 + compassSettings.lineProperties.y2) / 2 + metrics.fontBoundingBoxAscent / 2);
        compassLineIndicatorText.setAttribute('style', 'font-size: 9px;pointer-events: none');
        compassLineIndicatorText.childNodes[0].nodeValue = radiusInCm;;
    }

}

compass.setLockImageAttributes = function (compassSettings) {

    let compassLock = document.getElementById(`compassLock#${compassSettings.id}`);

    if (compassLock) {
        compassLock.setAttribute('x', compassSettings.lockProperties.x);
        compassLock.setAttribute('y', compassSettings.lockProperties.y);

        if (compassSettings.isLocked) {
            compassLock.setAttribute('href', '_content/KueMinds.FillZGap.BlazorComponents/Drawingboard/Images/lock.svg');
        } else {
            compassLock.setAttribute('href', '_content/KueMinds.FillZGap.BlazorComponents/Drawingboard/Images/Unlock.svg');
        }

    }
}

compass.setPencilColorBoxAttributes = function (compassSettings) {

    let compassColorBox = document.getElementById(`compassColorBox#${compassSettings.id}`);

    if (compassColorBox) {
        compassColorBox.setAttribute('x', compassSettings.pencilColorBoxProperties.x);
        compassColorBox.setAttribute('y', compassSettings.pencilColorBoxProperties.y);

        if (compassSettings.pencilColorBoxProperties.isChecked) {
            compassColorBox.setAttribute('fill', compassSettings.color);
        } else {
            compassColorBox.setAttribute('fill', 'transparent');
        }
    }
}

compass.setPencilImagePositionAttributes = function (compassSettings) {

    let compassPencil = document.getElementById(`compassPencil#${compassSettings.id}`);

    if (compassPencil) {
        compassPencil.setAttribute('x', compassSettings.pencilProperties.x);
        compassPencil.setAttribute('y', compassSettings.pencilProperties.y);
    }
}

compass.updateLayout = function (compassSettings) {

    compassSettingsDictionary[id] = compassSettings;

    compass.setCenterImagePositionAttributes(compassSettings);
    compass.setLinePositionAttributes(compassSettings);
    compass.setLockImageAttributes(compassSettings);
    compass.setPencilColorBoxAttributes(compassSettings);
    compass.setPencilImagePositionAttributes(compassSettings);
}

compass.updateSettings = function (compassSettings) {

    compassSettingsDictionary[compassSettings.id] = compassSettings;
    compass.setPencilColorBoxAttributes(compassSettings);
}

compass.updateSettingsAndLayOut = function (compassSettings) {

    compassSettingsDictionary[compassSettings.id] = compassSettings;
    compass.setCenterImagePositionAttributes(compassSettings);
    compass.setLinePositionAttributes(compassSettings);
    compass.setLockImageAttributes(compassSettings);
    compass.setPencilColorBoxAttributes(compassSettings);
    compass.setPencilImagePositionAttributes(compassSettings);
}

compass.mouseDownCenter = function (e) {
    e.stopPropagation();
    let id = compass.extractId(e.target.id);

    let compassSettings = compassSettingsDictionary[id];

//    DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'HandleOnMouseDown', layerId, pointer)

    if (!compassSettings.isLocked && e.buttons == 1) {
        e.target.setPointerCapture(1);
        compassSettings.centerDragging = true;
        compassSettings.previousPointerPosition.x = e.clientX;
        compassSettings.previousPointerPosition.y = e.clientY;
    }
    else if (compassSettings.isLocked && e.buttons === 1 || e.buttons === 2) {
        
        let direction = e.buttons === 1 ? true : false;
        compass.movePencilInAnArc1(compassSettings, direction);
        compassSettings.previousPointerPosition.x = e.clientX;
        compassSettings.previousPointerPosition.y = e.clientY;

        DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'DrawCompassArc', compassSettings);
    }
}

compass.mouseMoveCenter = function (e) {

    e.stopPropagation();
    let id = compass.extractId(e.target.id);

    let compassSettings = compassSettingsDictionary[id];

    //    DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'HandleOnMouseDown', layerId, pointer)

    if (!compassSettings.isLocked && compassSettings.centerDragging) {

        e.target.style.cursor = 'move';

        let dx = e.clientX - compassSettings.previousPointerPosition.x;
        let dy = e.clientY - compassSettings.previousPointerPosition.y;

        compassSettings.previousPointerPosition.x = e.clientX;
        compassSettings.previousPointerPosition.y = e.clientY;

        compassSettings.compassCenterProperties.x = compassSettings.compassCenterProperties.x + dx;
        compassSettings.compassCenterProperties.y = compassSettings.compassCenterProperties.y + dy;

        compassSettings.lockProperties.x = compassSettings.compassCenterProperties.x;
        compassSettings.lockProperties.y = compassSettings.compassCenterProperties.y - compassSettings.lockProperties.height - 2;

        compassSettings.lineProperties.x1 = compassSettings.compassCenterProperties.x + 15;
        compassSettings.lineProperties.y1 = compassSettings.compassCenterProperties.y + 15;

        compass.setCenterImagePositionAttributes(compassSettings);
        compass.setLinePositionAttributes(compassSettings);
        compass.setLockImageAttributes(compassSettings);
    }
}

compass.mouseUpCenter = function (e) {

    e.stopPropagation();
    let id = compass.extractId(e.target.id);
    let compassSettings = compassSettingsDictionary[id];

    if (compassSettings.centerDragging) {
        compassSettings.pencilDragging = false;
        compassSettings.lineDragging = false;
        compassSettings.centerDragging = false;
        compassSettings.indicatorDragging = false;
        compassSettings.drawing = false;
        DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'UpdateCompassSettings', compassSettings);
    }
    e.target.releasePointerCapture(1);
}

compass.mouseDownLine = function (e) {
    e.stopPropagation();
    let id = compass.extractId(e.target.id);

    let compassSettings = compassSettingsDictionary[id];

    //    DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'HandleOnMouseDown', layerId, pointer)

    if (!compassSettings.isLocked && e.buttons == 1) {
        compassSettings.lineDragging = true;
        compassSettings.previousPointerPosition.x = e.clientX;
        compassSettings.previousPointerPosition.y = e.clientY;
    }
}

compass.mouseMoveLine = function (e) {
    e.stopPropagation();
    let id = compass.extractId(e.target.id);

    let compassSettings = compassSettingsDictionary[id];

    //    DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'HandleOnMouseDown', layerId, pointer)

    if (!compassSettings.isLocked && compassSettings.lineDragging) {

        e.target.style.cursor = 'move';

        let dx = e.clientX - compassSettings.previousPointerPosition.x;
        let dy = e.clientY - compassSettings.previousPointerPosition.y;

        compassSettings.previousPointerPosition.x = e.clientX;
        compassSettings.previousPointerPosition.y = e.clientY;

        compassSettings.compassCenterProperties.x = compassSettings.compassCenterProperties.x + dx;
        compassSettings.compassCenterProperties.y = compassSettings.compassCenterProperties.y + dy;

        compassSettings.lockProperties.x = compassSettings.compassCenterProperties.x;
        compassSettings.lockProperties.y = compassSettings.compassCenterProperties.y - compassSettings.lockProperties.height - 2;

        compassSettings.pencilColorBoxProperties.x = compassSettings.pencilColorBoxProperties.x + dx;
        compassSettings.pencilColorBoxProperties.y = compassSettings.pencilColorBoxProperties.y + dy;

        compassSettings.pencilProperties.x = compassSettings.pencilProperties.x + dx;
        compassSettings.pencilProperties.y = compassSettings.pencilProperties.y + dy;

        compassSettings.lineProperties.x1 = compassSettings.lineProperties.x1 + dx;
        compassSettings.lineProperties.y1 = compassSettings.lineProperties.y1 + dy;
        compassSettings.lineProperties.x2 = compassSettings.lineProperties.x2 + dx;
        compassSettings.lineProperties.y2 = compassSettings.lineProperties.y2 + dy;

        compass.setCenterImagePositionAttributes(compassSettings);
        compass.setLinePositionAttributes(compassSettings);
        compass.setLockImageAttributes(compassSettings);
        compass.setPencilColorBoxAttributes(compassSettings);
        compass.setPencilImagePositionAttributes(compassSettings);
    }
}

compass.mouseUpLine = function (e) {
    e.stopPropagation();
    let id = compass.extractId(e.target.id);

    let compassSettings = compassSettingsDictionary[id];

    compassSettings.pencilDragging = false;
    compassSettings.lineDragging = false;
    compassSettings.centerDragging = false;
    compassSettings.indicatorDragging = false;
    DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'UpdateCompassSettings', compassSettings);

    e.target.releasePointerCapture(1);
}

compass.mouseDownPencil = function (e) {
   
    let id = compass.extractId(e.target.id);

    let compassSettings = compassSettingsDictionary[id];

    if (!compassSettings.isLocked && e.buttons === 1) {

        compassSettings.previousPointerPosition.x = e.clientX;
        compassSettings.previousPointerPosition.y = e.clientY;

        compassSettings.pencilDragging = true;
        e.target.setPointerCapture(e.pointerId);
    } else if (compassSettings.isLocked && e.buttons === 1) {

        compassSettings.previousPointerPosition.x = e.clientX;
        compassSettings.previousPointerPosition.y = e.clientY;

        compassSettings.drawing = true;

        e.target.setPointerCapture(e.pointerId);
    }
    e.stopPropagation();

    //DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'OnMouseDownCompassPencil', compassSettings)

}

compass.mouseMovePencil = function (e) {
    e.stopPropagation();
    let id = compass.extractId(e.target.id);

    let compassSettings = compassSettingsDictionary[id];

    if (!compassSettings.isLocked && compassSettings.pencilDragging) {

        compass.movePencil(e, compassSettings);

        compassSettings.previousPointerPosition.x = e.clientX;
        compassSettings.previousPointerPosition.y = e.clientY;


    //    DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'OnMouseMoveCompassPencil', compassSettings, pointer)
    }
    else if (compassSettings.isLocked && compassSettings.drawing) {

        compass.movePencilInAnArc(compassSettings, e);
        compassSettings.previousPointerPosition.x = e.clientX;
        compassSettings.previousPointerPosition.y = e.clientY;

        //let relativePosition = drawingLayer.mapWindowMousePositionToCanvas1(compassSettings.layerId, e.clientX, e.clientY);
        //let pointer = { pointerId: 0, x: relativePosition.x, y: e.y, pointerType: "mouse", buttons: e.buttons };;

        //DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'OnMouseMoveCompassPencil', compassSettings, pointer)
    }

}

compass.mouseUpPencil = function (e) {

    e.stopPropagation();

    let id = compass.extractId(e.target.id);

    let compassSettings = compassSettingsDictionary[id];
    if (compassSettings.pencilDragging) {
        compassSettings.pencilDragging = false;
        compassSettings.lineDragging = false;
        compassSettings.centerDragging = false;
        compassSettings.indicatorDragging = false;
        compassSettings.drawing = false;

        e.target.releasePointerCapture(e.pointerId);

        DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'UpdateCompassSettings', compassSettings);
    }
    else if (compassSettings.drawing) {
        compassSettings.pencilDragging = false;
        compassSettings.lineDragging = false;
        compassSettings.centerDragging = false;
        compassSettings.indicatorDragging = false;
        compassSettings.drawing = false;
        DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'DrawCompassArc', compassSettings);
    }
}

compass.mouseUpLock = function (e) {
    e.stopPropagation();

    let id = compass.extractId(e.target.id);

    let compassSettings = compassSettingsDictionary[id];

    compassSettings.pencilDragging = false;
    compassSettings.lineDragging = false;
    compassSettings.centerDragging = false;
    compassSettings.indicatorDragging = false;
    compassSettings.drawing = false;
    compassSettings.isLocked = !compassSettings.isLocked;
    compass.setLockImageAttributes(compassSettings);

    DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'UpdateCompassSettings', compassSettings);

}

compass.mouseUpColorBox = function (e) {
    e.stopPropagation();
    let id = compass.extractId(e.target.id);

    let compassSettings = compassSettingsDictionary[id];

    compassSettings.pencilColorBoxProperties.isChecked = !compassSettings.pencilColorBoxProperties.isChecked;
    compass.setPencilColorBoxAttributes(compassSettings);
    DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'UpdateCompassSettings', compassSettings);
}

compass.mouseOver = function (e) {

    e.target.style.cursor = 'pointer';

}

compass.mouseOut = function (e) {

    e.target.style.cursor = 'default';
}

compass.movePencil = function (e, compassSettings) {

    e.target.style.cursor = 'move';

    let dx = e.clientX - compassSettings.previousPointerPosition.x;
    let dy = e.clientY - compassSettings.previousPointerPosition.y;

    compassSettings.previousPointerPosition.x = e.clientX;
    compassSettings.previousPointerPosition.y = e.clientY;

    compassSettings.pencilColorBoxProperties.x = compassSettings.pencilColorBoxProperties.x + dx;
    compassSettings.pencilColorBoxProperties.y = compassSettings.pencilColorBoxProperties.y + dy;

    compassSettings.pencilProperties.x = compassSettings.pencilProperties.x + dx;
    compassSettings.pencilProperties.y = compassSettings.pencilProperties.y + dy;

    compassSettings.lineProperties.x2 = compassSettings.pencilProperties.x + compassSettings.pencilProperties.width / 2;
    compassSettings.lineProperties.y2 = compassSettings.pencilProperties.y + compassSettings.pencilProperties.height;

    compass.setPencilColorBoxAttributes(compassSettings);
    compass.setPencilImagePositionAttributes(compassSettings);
    compass.setLinePositionAttributes(compassSettings);
}

compass.movePencilInAnArc = function (compassSettings, e) {

    let cx = compassSettings.compassCenterProperties.x + compassSettings.compassCenterProperties.diameter / 2;
    let cy = compassSettings.compassCenterProperties.y + compassSettings.compassCenterProperties.diameter / 2;

    let startAngle = compass.getAngle(compassSettings, { x: compassSettings.lineProperties.x2, y: compassSettings.lineProperties.y2 }, { x: cx, y: cy }, false);
    let endAngle = compass.getAngle(compassSettings , {x:e.clientX, y: e.clientY}, { x: cx, y: cy }, true);

    y = compassSettings.radius * Math.sin(endAngle);
    x = compassSettings.radius * Math.cos(endAngle);

    compassSettings.lineProperties.x2 =  cx + x;
    compassSettings.lineProperties.y2 =  cy + y;

    compassSettings.pencilProperties.x = compassSettings.lineProperties.x2 - compassSettings.pencilProperties.width / 2;
    compassSettings.pencilProperties.y = compassSettings.lineProperties.y2 - compassSettings.pencilProperties.height - 0.5;

    compassSettings.pencilColorBoxProperties.x = compassSettings.lineProperties.x2 - compassSettings.pencilColorBoxProperties.width / 2;
    compassSettings.pencilColorBoxProperties.y = compassSettings.pencilProperties.y - 5;

    compass.setPencilColorBoxAttributes(compassSettings);
    compass.setPencilImagePositionAttributes(compassSettings);
    compass.setLinePositionAttributes(compassSettings);

    compass.drawArc(compassSettings, cx, cy, startAngle, endAngle);

}

compass.movePencilInAnArc1 = function (compassSettings, direction) {

    let cx = compassSettings.compassCenterProperties.x + compassSettings.compassCenterProperties.diameter / 2;
    let cy = compassSettings.compassCenterProperties.y + compassSettings.compassCenterProperties.diameter / 2;

    let startAngle = 2 * Math.PI + compass.getAngle(compassSettings, { x: compassSettings.lineProperties.x2, y: compassSettings.lineProperties.y2 }, { x: cx, y: cy }, false);
    
    let endAngle = startAngle;
    if (direction) {
        endAngle -= 1*Math.PI/180;
    }
    else {
        endAngle += 1*Math.PI/180;
    }

    
    y = compassSettings.radius * Math.sin(endAngle);
    x = compassSettings.radius * Math.cos(endAngle);

    compassSettings.lineProperties.x2 = cx + x;
    compassSettings.lineProperties.y2 = cy + y;

    compassSettings.pencilProperties.x = compassSettings.lineProperties.x2 - compassSettings.pencilProperties.width / 2;
    compassSettings.pencilProperties.y = compassSettings.lineProperties.y2 - compassSettings.pencilProperties.height - 0.5;

    compassSettings.pencilColorBoxProperties.x = compassSettings.lineProperties.x2 - compassSettings.pencilColorBoxProperties.width / 2;
    compassSettings.pencilColorBoxProperties.y = compassSettings.pencilProperties.y - 5;

    compass.setPencilColorBoxAttributes(compassSettings);
    compass.setPencilImagePositionAttributes(compassSettings);
    compass.setLinePositionAttributes(compassSettings);

    compass.drawArc(compassSettings, cx, cy, startAngle, endAngle);

}

compass.getAngle = function (compassSettings, position, center, map) {

    let relativePosition = position;
    if (map) {
        relativePosition = drawingLayer.mapWindowMousePositionToCanvas1(compassSettings.layerId, position.x, position.y);
    }
    let tx = relativePosition.x - center.x;
    let ty = relativePosition.y - center.y;

    let alfa = Math.atan(Math.abs(ty / tx));
    if (tx < 0 && ty > 0) {
        alfa = Math.PI - Math.abs(alfa);
    }
    else if (tx < 0 && ty < 0) {
        alfa = Math.PI + Math.abs(alfa);
    }
    else if (tx > 0 && ty < 0) {
        alfa = 2 * Math.PI - Math.abs(alfa);
    }
    return alfa;

}

compass.drawArc = function (compassSettings, cx, cy, startAngle, endAngle) {

    let context = drawingContexts[compassSettings.layerId];

    if (compassSettings.pencilColorBoxProperties.isChecked && compassSettings.isLocked) {
        let direction = compass.getDirection(startAngle, endAngle);
        context.save();

        context.strokeStyle = compassSettings.color;
        context.lineWidth = compassSettings.strokeThickness;

        context.beginPath();
        context.arc(cx, cy, compassSettings.radius, startAngle, endAngle, direction);
        context.stroke();

        context.restore();
    }
}

compass.getDirection = function (startAngle, endAngle) {

    if (startAngle >= 0 && endAngle >= 0) {
        if (startAngle > 3 * Math.PI / 2 && endAngle <= Math.PI / 2) {
            return false;
        }
        if (startAngle <= Math.PI / 2 && endAngle > 3 * Math.PI / 2) {
            return true;
        }
        if (startAngle > endAngle) {
            return true;
        }

    }
    if (startAngle < 0 && endAngle < 0) {
        if (startAngle > endAngle) {
            return true;
        }
    }
    return false;
}

compass.onWheel = function (e) {

    e.stopPropagation();

    let id = compass.extractId(e.target.id);
    let compassSettings = compassSettingsDictionary[id];

    if (compassSettings.isLocked) {
        if (e.wheelDeltaY > 0) {
            compassSettings.direction = false;
        }
        else {
            compassSettings.direction = true;
        }

        compass.movePencilInAnArc1(compassSettings, compassSettings.direction);

        compassSettings.pencilDragging = false;
        compassSettings.lineDragging = false;
        compassSettings.centerDragging = false;
        compassSettings.indicatorDragging = false;
        compassSettings.drawing = false;
        if (compassSettings.pencilColorBoxProperties.isChecked) {
            DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'DrawCompassArc', compassSettings);
        }
        else {
            DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'UpdateCompassSettings', compassSettings);
        }
    }

}