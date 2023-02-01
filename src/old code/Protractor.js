var protractor = {};

protractorSettingsDictionary = {};

protractor.create = function (containerId, inputSettings) {

    let protractorInstance = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    protractorInstance.setAttribute('width', 10000);
    protractorInstance.setAttribute('height', 10000);
    protractorInstance.setAttribute('style', `z-index:${inputSettings.zIndex};position:fixed;pointer-events: none`);
    protractorInstance.id = inputSettings.id;

    let rootContainer = document.getElementById(containerId);
    rootContainer.appendChild(protractorInstance);

    protractorSettingsDictionary[inputSettings.id] = inputSettings;

    protractor.drawProtractor(inputSettings.id);
}

protractor.delete = function (containerId, id) {

    let rootContainer = document.getElementById(containerId);
    let protractorInstance = document.getElementById(id);

    rootContainer.removeChild(protractorInstance);

    delete protractorSettingsDictionary[id];

}

protractor.drawProtractor = function (id) {

    let protractorInstance = document.getElementById(id);

    if (protractorInstance) {
        let settings = protractorSettingsDictionary[id];


        let parentGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        parentGroup.id = `protractor#${id}`;
        protractorInstance.appendChild(parentGroup);

        parentGroup.setAttribute('style', `pointer-events: auto;transform-box: fill-box;transform-origin: center;transform: rotate(${settings.angle}deg`);
        parentGroup.setAttribute('onpointerdown', 'protractor.mouseDownProtractor(event)');
        parentGroup.setAttribute('onpointermove', 'protractor.mouseMoveProtractor(event)');
        parentGroup.setAttribute('onpointerup', 'protractor.mouseUpProtractor(event)');
        parentGroup.setAttribute('onpointerover', 'protractor.mouseOverProtractor(event)');
        parentGroup.setAttribute('onpointerout', 'protractor.mouseOutProtractor(event)');
        parentGroup.setAttribute('onwheel', 'protractor.mouseWheel(event)');

        let group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.id = `protractor-sg#${id}`;
        parentGroup.appendChild(group);

        group.setAttribute('style', `pointer-events: auto;transform-box: fill-box;transform-origin: center;transform: rotate(${settings.angle}deg`);
        group.setAttribute('onwheel', 'protractor.mouseWheel(event)');

        //let protractorShape = document.createElementNS("http://www.w3.org/2000/svg", "path");

        let smallRadius = 20;

        let cx = settings.x + settings.radius;
        let cy = settings.y;

        //let cx = settings.x + settings.radius + 10 / 0.2645833;
        //let cy = settings.y;

        //settings.center = {
        //    x: settings.x + settings.radius + 10 / 0.2645833, y: settings.y
        //};

        settings.center = {
            x: settings.x + settings.radius , y: settings.y
        };
        let outerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        outerCircle.setAttribute('stroke', settings.strokeColor);
        outerCircle.setAttribute('stroke-width', settings.strokeWidth);
        outerCircle.setAttribute('fill', settings.fillColor);
        outerCircle.setAttribute('cx', `${cx}`);
        outerCircle.setAttribute('cy', `${cy}`);
        outerCircle.setAttribute('r', settings.radius);
        group.appendChild(outerCircle);
        //protractorShape.setAttribute('d', `M ${settings.x} ${settings.y}
        //                                   L ${settings.x + 10 / 0.2645833} ${settings.y}
        //                                   A ${settings.radius} ${settings.radius} 0 0 1 ${settings.x + 2 * settings.radius + 10 / 0.2645833} ${settings.y}
        //                                   L ${settings.x + 2 * settings.radius + 20 / 0.2645833} ${settings.y}
        //                                   L ${settings.x + 2 * settings.radius + 20 / 0.2645833} ${settings.y + 20 / 0.2645833}
        //                                   L ${settings.x} ${settings.y + 20 / 0.2645833}
        //                                   L ${settings.x} ${settings.y} Z`);

        //protractorShape.setAttribute('style', `pointer - events: auto`);


        //protractorShape.setAttribute('fill', settings.fillColor);
        //protractorShape.setAttribute('stroke', settings.strokeColor);
        //protractorShape.setAttribute('stroke-width', settings.strokeWidth);


        //group.appendChild(protractorShape);


        //let innerRadius = 40 / 0.2645833;

        //let innerSemiCircle = document.createElementNS("http://www.w3.org/2000/svg", "path");
        //innerSemiCircle.setAttribute('d', `M ${settings.x + 30 / 0.2645833} ${settings.y}
        //                                   A ${innerRadius} ${innerRadius} 0 0 1 ${settings.x + 2 * innerRadius + 30 / 0.2645833} ${settings.y}
        //                                   L ${settings.x + 30 / 0.2645833} ${settings.y}
        //                                     Z`);

        //innerSemiCircle.setAttribute('fill', settings.fillColor);
        //innerSemiCircle.setAttribute('stroke', settings.strokeColor);
        //group.appendChild(innerSemiCircle);

        let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute('stroke', settings.strokeColor);
        circle.setAttribute('stroke-width', settings.strokeWidth);
        circle.setAttribute('fill', settings.fillColor);
        circle.setAttribute('cx', `${cx}`);
        circle.setAttribute('cy', `${cy}`);
        circle.setAttribute('r', smallRadius);
        group.appendChild(circle);

        let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute('stroke', settings.strokeColor);
        line.setAttribute('stroke-width', settings.strokeWidth);
        line.setAttribute('x1', `${settings.center.x}`);
        line.setAttribute('y1', `${settings.center.y + settings.radius}`);
        line.setAttribute('x2', `${settings.center.x}`);
        line.setAttribute('y2', `${settings.center.y - settings.radius}`);
        group.appendChild(line);

        line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute('stroke', settings.strokeColor);
        line.setAttribute('stroke-width', settings.strokeWidth);
        line.setAttribute('x1', `${settings.center.x - settings.radius}`);
        line.setAttribute('y1', `${settings.center.y}`);
        line.setAttribute('x2', `${settings.center.x + settings.radius}`);
        line.setAttribute('y2', `${settings.center.y }`);
        group.appendChild(line);

        let pathString = "";

        let canvas = document.createElement("canvas");
        let context = canvas.getContext("2d");
        context.font = '12px';

        for (let i = 0; i < 360; ++i) {

            let markLength = 4 / 0.2645833;

            if (i % 10 === 0) {
                markLength = 10 / 0.2645833;
            }
            else if (i % 5 === 0) {
                markLength = 7 / 0.2645833;
            }
           
            let y = settings.center.y - settings.radius * Math.sin(i * Math.PI / 180);
            let x = settings.center.x + settings.radius * Math.cos(i * Math.PI / 180);

            let y1 = settings.center.y - (settings.radius - markLength) * Math.sin(i * Math.PI / 180);
            let x1 = settings.center.x + (settings.radius - markLength) * Math.cos(i * Math.PI / 180);

            if (i % 10 === 0) {
                let metrics = context.measureText(i.toString());
                let indicatorText = document.createElementNS("http://www.w3.org/2000/svg", "text");
                indicatorText.setAttribute('style', `font-size: 10px;pointer-events: none;`);
                let data = document.createTextNode(`index${i}mm`);
                indicatorText.appendChild(data);
                indicatorText.childNodes[0].nodeValue = i;
                group.appendChild(indicatorText);
                
                if (i > 0 && i < 90) {
                    indicatorText.setAttribute('x', x1 - 1);
                    indicatorText.setAttribute('y', y1 + metrics.fontBoundingBoxAscent + 1);
                }
                else if (i >= 90 && i < 180) {
                    indicatorText.setAttribute('x', x1 + 1);
                    indicatorText.setAttribute('y', y1 + metrics.fontBoundingBoxAscent + 1);
                }
                else if (i > 180 && i <= 270) {
                    indicatorText.setAttribute('x', x1 + 1);
                    indicatorText.setAttribute('y', y1 - 1);
                }
                else if (i > 270 && i < 360) {
                    indicatorText.setAttribute('x', x1 - 1);
                    indicatorText.setAttribute('y', y1 - 1);
                }
                else {
                    indicatorText.setAttribute('x', x1 + 1);
                    indicatorText.setAttribute('y', y1);
                }
               
            }

            pathString = ` M ${x} ${y} L ${x1} ${y1}`

            let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute('d', pathString);
            path.setAttribute('stroke', settings.strokeColor);
            path.setAttribute('stroke-width', settings.strokeWidth);
            group.appendChild(path);
        }

        //let skipMillimeterFrom = 2;
        //for (let i = 1; i <= 135; ++i) {

        //    let markHeight = 4 / 0.2645833;

        //    let x = settings.x + (skipMillimeterFrom + i) / 0.2645833;

        //    if ((i - 1) % 10 === 0) {
        //        markHeight = 10 / 0.2645833;

        //        let indicatorText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        //        group.appendChild(indicatorText);
        //        indicatorText.setAttribute('x', x + 1);
        //        indicatorText.setAttribute('y', settings.y + 20 / 0.2645833 - markHeight + 10);
        //        indicatorText.setAttribute('style', `font-size: 10px;pointer-events: none;`);
        //        let data = document.createTextNode(`index${i}mm`);
        //        indicatorText.appendChild(data);
        //        indicatorText.childNodes[0].nodeValue = (i - 1) / 10;

        //    }
        //    else if ((i - 1) % 5 === 0) {
        //        markHeight = 7 / 0.2645833;
        //    }


        //    pathString = ` M ${x} ${settings.y + 20 / 0.2645833} L ${x} ${settings.y + 20 / 0.2645833 - markHeight}`

        //    let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        //    path.setAttribute('d', pathString);
        //    path.setAttribute('stroke', settings.marksStrokeColor);
        //    path.setAttribute('stroke-width', settings.strokeWidth);
        //    group.appendChild(path);
        //}

        //let canvas = document.createElement("canvas");
        //let context = canvas.getContext("2d");
        //context.font = '12px';
        //let metrics = context.measureText(settings.angle + '°');

        //let indicatorText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        //indicatorText.id = `angleIndicator#${settings.id}`
        //group.appendChild(indicatorText);
        //indicatorText.setAttribute('x', cx - metrics.width / 2);
        //indicatorText.setAttribute('y', cy + metrics.fontBoundingBoxAscent / 2);
        //indicatorText.setAttribute('style', `font-size: 12px;font-weight;font-color:red; pointer-events: none;)`);
        //let data = document.createTextNode(`angle${settings.id}`);
        //indicatorText.appendChild(data);
        //indicatorText.childNodes[0].nodeValue = settings.angle + '°';

        //metrics = context.measureText("0");
        //let angleCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        //group.appendChild(angleCircle);
        //angleCircle.setAttribute('r', metrics.width * 3.5);
        //angleCircle.setAttribute('cx', cx);
        //angleCircle.setAttribute('cy', cy );
        //angleCircle.setAttribute('fill', settings.fillColor);
        //angleCircle.setAttribute('stroke', `red`);
        //angleCircle.setAttribute('stroke-width', settings.strokeWidth);

    }
}

protractor.mouseWheel = function (e) {
    e.preventDefault();
    e.stopPropagation();
    e.target.style.cursor = 'pointer';

    let id = protractor.extractId(e.currentTarget.id);

    let settings = protractorSettingsDictionary[id];

    settings.angle = (settings.angle + Math.sign(e.wheelDeltaY) * 1) % 360;
    protractor.updateRotationSettings(settings);

    DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'UpdatePotractorSettings', settings)
}

protractor.setPosition = function (settings) {

    let protractorShape = document.getElementById(`protractor#${settings.id}`);

    if (settings.dragging && protractorShape) {
        protractorShape.setAttribute('style', `pointer-events: auto;transform-origin:0,0; transform:translate(${settings.dx}px, ${settings.dy}px);`);
    }
}

protractor.mouseOverProtractor = function (e) {

    e.target.style.cursor = 'pointer';

}

protractor.mouseOutProtractor = function (e) {

    e.target.style.cursor = 'default';
}

protractor.mouseDownProtractor = function (e) {

    event.stopPropagation();

    if (e.buttons == 1) {
        e.target.style.cursor = 'move';
        let id = protractor.extractId(e.currentTarget.id);
        let settings = protractorSettingsDictionary[id];
        settings.dragging = true;
        e.target.setPointerCapture(1);
        settings.previousPointerPosition = { x: e.clientX, y: e.clientY };

       // DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'OnMouseDownProtractor', settings)
    }
}

protractor.mouseMoveProtractor = function (e) {
    event.stopPropagation();
    let id = protractor.extractId(e.currentTarget.id);
    let settings = protractorSettingsDictionary[id];
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
        protractor.setPosition(settings);
        settings.previousPointerPosition.x = e.clientX;
        settings.previousPointerPosition.y = e.clientY;

       // DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'OnMouseMoveProtractor', settings)
    }
}

protractor.mouseUpProtractor = function (e) {

    e.target.style.cursor = 'default';
    event.stopPropagation();
    let id = protractor.extractId(e.currentTarget.id);
    let settings = protractorSettingsDictionary[id];
    if (settings.dragging) {

        settings.dragging = false;
        e.target.releasePointerCapture(1);

        DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'UpdatePotractorSettings', settings)
    }
}

protractor.extractId = function (value) {
    let arr = value.split("#");
    return arr[1];
}

protractor.updateSettings = function (settings) {
    protractor.updateRotationSettings(settings);
    protractor.setPosition(settings);
}

protractor.updateRotationSettings= function(settings) {
    let cx = settings.x + settings.radius + 10 / 0.2645833;
    let cy = settings.y;

    let protractorShape = document.getElementById(`protractor-sg#${settings.id}`);
    protractorShape.setAttribute('style', `pointer-events: auto;transform-box: fill-box;transform-origin: center;transform: rotate(${settings.angle}deg`);

    //let canvas = document.createElement("canvas");
    //let context = canvas.getContext("2d");
    //context.font = '12px';
    //let metrics = context.measureText(settings.angle + '°');

    //let indicatorText = document.getElementById(`angleIndicator#${settings.id}`);
    //indicatorText.setAttribute('x', cx - metrics.width / 2);
    //indicatorText.setAttribute('y', cy - 20 / 0.2645833 + metrics.fontBoundingBoxAscent / 2);

    //indicatorText.setAttribute('style', `font-size: 12px;font-weight;font-color:red; pointer-events: none;transform-box: fill-box;transform-origin: center;transform: rotate(${-1 * settings.angle}deg)`);
    //indicatorText.childNodes[0].nodeValue = settings.angle + '°';
}

protractor.calculateDistanceToArc = function (settings, position) {

    return Math.abs(settings.radius - Math.sqrt(Math.pow(position.x - settings.center.x - settings.dx, 2) + Math.pow(position.y - settings.center.y - settings.dy, 2)));

    //let angle = -settings.angle * Math.PI / 180;
    //let tx = position.x - settings.center.x;
    //let ty = -(position.y - settings.center.y);
    //let y = tx * Math.sign(angle) + ty * Math.cos(angle);
    //if (y > 0) {
    //    return Math.abs(settings.radius - Math.sqrt(Math.pow(position.x - settings.center.x - settings.dx, 2) + Math.pow(position.y - settings.center.y - settings.dy, 2)));
    //}
    //else {
    //    return Number.MAX_VALUE;
    //}
}

protractor.calculateDistanceToRuler = function (settings, position) {
    let distanceFromTopSide = protractor.calculateDistanceToArc(settings, position);
    return { id: settings.id, type: "protractor", side: "circle", distance: distanceFromTopSide, settings: settings }
}

protractor.capturePen = function (layerId, position) {

    let minCapturedResult = null;
    for (var key in protractorSettingsDictionary) {
        let settings = protractorSettingsDictionary[key];
        if (settings.layerId === layerId) {
            let result = protractor.calculateDistanceToRuler(settings, position);
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

protractor.mapMousePosition = function (capturedObject, strokeThickness, position) {
    let height = 20 / 0.2645833;
    let settings = protractorSettingsDictionary[capturedObject.id];
    if (settings) {
        let result = protractor.calculateDistanceToRuler(settings, position);
        if (result.distance <= rulerCaptureDistance) {
            //if (capturedObject.side === "circle") {
                let tx = (position.x - settings.center.x - settings.dx);
                let ty = (position.y - settings.center.y - settings.dy);

                let angle = Math.atan(Math.abs(ty / tx));
                if (tx < 0 && ty > 0) {
                    angle = Math.PI - Math.abs(angle);
                }
                else if (tx < 0 && ty < 0) {
                    angle = Math.PI + Math.abs(angle);
                }
                else if (tx > 0 && ty < 0) {
                    angle = 2 * Math.PI - Math.abs(angle);
                }
                
                //console.log(tx, ty, settings.center, angle*180/Math.PI);
                return {
                    x: settings.center.x + settings.dx + (settings.radius + strokeThickness / 2 + rulerShift) * Math.cos(angle),
                    y: settings.center.y + settings.dy + (settings.radius + strokeThickness / 2 + rulerShift) * Math.sin(angle)
                };
            //}
            //else if (capturedObject.side === "bottom") {
            //    if (settings.angle === 0) {
            //        return { x: position.x, y: settings.y + height + settings.dy + rulerShift + strokeThickness / 2 };
            //    }

            //    if (settings.angle === 180 || settings.angle === -180) {
            //        return { x: position.x, y: settings.y + settings.dy - rulerShift - strokeThickness / 2 };
            //    }

            //    if (settings.angle === -90 || settings.angle === 270) {
            //        return { x: settings.center.x + height + settings.dx + rulerShift + strokeThickness / 2, y: position.y };
            //    }

            //    if (settings.angle === 90 || settings.angle === -270) {
            //        return { x: settings.center.x - height - rulerShift - strokeThickness / 2 + settings.dx, y: position.y };
            //    }
            //    else {
            //        let translatedCurrentPositionX = position.x - settings.center.x - settings.dx;
            //        let translatedCurrentPositionY = -(position.y - settings.center.y - settings.dy);
            //        let angleInRadians = Math.PI * (-settings.angle) / 180;
            //        let theta = Math.PI / 2;
            //        let beta = angleInRadians + theta;

            //        let p = -(strokeThickness / 2 + height + rulerShift);
            //        let s = Math.tan(beta);
            //        let b = translatedCurrentPositionY - s * translatedCurrentPositionX;
            //        let x = (p / Math.sin(beta) - b) / (s + 1 / Math.tan(beta));
            //        let y = Math.tan(beta) * x + b;
            //        return { x: settings.center.x + settings.dx + x, y: settings.center.y + settings.dy - y };
            //    }
            //}
        }
    }

    return null;
}

