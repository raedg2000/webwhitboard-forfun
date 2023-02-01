var pen = {};


pen.draw = function (settings, capturingObjectString) {
    let capturingObject = null;
    if (capturingObjectString) {
        capturingObject = JSON.parse();
    }
    let context = drawingContexts[settings.layerId];
    if (context) {
        context.lineCap = "round";
        context.strokeStyle = settings.strokeColor;
        context.lineWidth = settings.strokeThickness;
        for (var i = 0; i < settings.points.length - 1; ++i) {
            context.beginPath();
            startPosition = settings.points[i];
            endPosition = settings.points[i + 1];
            if ((capturingObject !== null && capturingObject.type === "ruler") ||
                (capturingObject !== null && capturingObject.type === "setSquare") ||
                capturingObject == null) {
                context.moveTo(startPosition.x, startPosition.y);
                context.lineTo(endPosition.x, endPosition.y);
                context.stroke();
            }
            else if (capturingObject !== null && capturingObject.type === "protractor") {
                context.moveTo(startPosition.x, startPosition.y);
                let startAngle = DrawingPen.getAngle(capturingObject.settings.angle,
                    startPosition, capturingObject.settings.center,
                    capturingObject.settings.dx, capturingObject.settings.dy);
                let endAngle = DrawingPen.getAngle(capturingObject.settings.angle,
                    endPosition, capturingObject.settings.center,
                    capturingObject.settings.dx, capturingObject.settings.dy);

                let counterclockwise = DrawingPen.getDirection(startAngle, endAngle);
                console.log(startPosition, endPosition, capturingObject.settings.center, startAngle * 180 / Math.PI, endAngle * 180 / Math.PI, counterclockwise);
                context.arc(capturingObject.settings.center.x + capturingObject.settings.dx,
                    capturingObject.settings.center.y + capturingObject.settings.dy,
                    capturingObject.settings.radius + settings.strokeThickness / 2 + rulerShift,
                    startAngle, endAngle, counterclockwise);

                context.stroke();

            }
        }
        
    }
}

pen.createDrawingPen = function(settings){
    let drawingPen = new DrawingPen(settings);
    LayersActiveElement[settings.layerId] = drawingPen;
}

pen.deleteDrawingPen = function (settings) {

    if (LayersActiveElement[settings.layerId] && LayersActiveElement[settings.layerId].settings.id === settings.id) {
        delete LayersActiveElement[settings.layerId];
    }
}

pen.updateSettings = function (settings) {
    if (LayersActiveElement[settings.layerId]) {
        LayersActiveElement[settings.layerId].settings = settings;
    }
}

class DrawingPen {

    constructor(settings) {
        this.settings = settings;
        this.startPosition = {};
        this.drawing = false;
        this.capturingObject = null;
    }

    #getCapturedPosition(pointer) {
        if (this.capturingObject == null) {
            this.capturingObject = ruler.capturePen(this.settings.layerId, pointer);
            if (this.capturingObject == null) {
                this.capturingObject = protractor.capturePen(this.settings.layerId, pointer);
            }
            if (this.capturingObject == null) {
                this.capturingObject = setSquareRuler.capturePen(this.settings.layerId, pointer);
            }
        }

        if (this.capturingObject != null) {
            if (this.capturingObject.type === "ruler") {
                return ruler.mapMousePosition(this.capturingObject,this.settings.strokeThickness, pointer)
            }
            if (this.capturingObject.type === "protractor") {
                return protractor.mapMousePosition(this.capturingObject, this.settings.strokeThickness, pointer)
            }
            if (this.capturingObject.type === "setSquare") {
                return setSquareRuler.mapMousePosition(this.capturingObject, this.settings.strokeThickness, pointer)
            }
        }

        return pointer;
    }

    #draw(endPosition) {

        let context = drawingContexts[this.settings.layerId];
        if (context) {
            context.beginPath();
            if ((this.capturingObject !== null && this.capturingObject.type === "ruler") ||
                (this.capturingObject !== null && this.capturingObject.type === "setSquare") ||
                this.capturingObject == null) {
                context.moveTo(this.startPosition.x, this.startPosition.y);
                context.lineTo(endPosition.x, endPosition.y);
                context.stroke();
            }
            else if (this.capturingObject !== null && this.capturingObject.type === "protractor") {
                context.moveTo(this.startPosition.x, this.startPosition.y);
                let startAngle = DrawingPen.getAngle(this.capturingObject.settings.angle,
                    this.startPosition, this.capturingObject.settings.center,
                    this.capturingObject.settings.dx, this.capturingObject.settings.dy);
                let endAngle = DrawingPen.getAngle(this.capturingObject.settings.angle,
                    endPosition, this.capturingObject.settings.center,
                    this.capturingObject.settings.dx, this.capturingObject.settings.dy);


                let counterclockwise = DrawingPen.getDirection(startAngle, endAngle);
                console.log(this.startPosition, endPosition, this.capturingObject.settings.center, startAngle * 180 / Math.PI, endAngle * 180 / Math.PI, counterclockwise);
                context.arc(this.capturingObject.settings.center.x + this.capturingObject.settings.dx,
                    this.capturingObject.settings.center.y + this.capturingObject.settings.dy,
                    this.capturingObject.settings.radius + this.settings.strokeThickness / 2 + rulerShift,
                    startAngle, endAngle, counterclockwise);

                context.stroke();

            }
            
        }
        this.startPosition = endPosition;
    }

    mouseDown(pointer) {
        if (pointer.buttons === 1 || pointer.pointerType === "touch") {
            this.settings.points = [];
            pointer = this.#getCapturedPosition(pointer);
            console.log(pointer);
            if (pointer != null) {
                this.drawing = true;
                this.startPosition = pointer;
                this.settings.points.push({ x: pointer.x, y: pointer.y });
                let context = drawingContexts[this.settings.layerId];
                if (context) {
                    context.save();

                    context.strokeStyle = this.settings.strokeColor;
                    context.lineWidth = this.settings.strokeThickness;
                    context.lineCap = "round";
                    //context.beginPath();
                }
            }
        }
    }

    mouseMove(pointer) {
        if (this.drawing) {
            pointer = this.#getCapturedPosition(pointer);
            if (pointer != null) {
                this.settings.points.push({ x: pointer.x, y: pointer.y });
                this.#draw(pointer);
            }
        }
    }

    mouseUp(pointer) {
        DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'PenDrawingCompleted', this.settings, JSON.stringify(this.capturingObject));
        this.drawing = false;
        this.capturingObject = null;
        this.settings.points = [];
    }

    static getAngle(angle, position, center, dx, dy) {
        let tx = position.x - center.x - dx;
        let ty = position.y - center.y - dy;

        let alfa = Math.atan(Math.abs(ty / tx));
        if (tx < 0 && ty > 0) {
            alfa = Math.PI  -  Math.abs(alfa);
        }
        else if (tx < 0 && ty < 0) {
            alfa = Math.PI + Math.abs(alfa);
        }
        else if (tx > 0 && ty < 0) {
            alfa = 2 * Math.PI - Math.abs(alfa);
        }
        return alfa;

    }

    static getDirection(startAngle, endAngle) {

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
}