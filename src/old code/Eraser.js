var eraser = {};

eraser.LINE_WIDTH = 1;
eraser.STROKE_STYLE = 'gray';

eraser.erase = function(settings){
 
    let context = drawingContexts[settings.layerId];
    if (context) {
        
        for (i = 0; i < settings.points.length; ++i) {
            context.save();
            let position = settings.points[i];
            if (settings.eraserShape === 'circle') {
                let radius = settings.width / 2;
                eraser.drawCircle(context, radius + 2 * eraser.LINE_WIDTH, position);
            }
            else {
                eraser.drawSqaure(context, settings.width + 3 * eraser.LINE_WIDTH, position);
            }

            context.clip();
            drawingLayer.drawGridLines(context, drawingLayerSettings[settings.layerId]);
            context.restore();
        }
      
    }
}

eraser.setEraserAttributes = function (context) {
    context.lineWidth = eraser.LINE_WIDTH;
    context.strokeStyle = eraser.STROKE_STYLE;
}

eraser.drawCircle = function (context, radius, position) {

    context.lineWidth = eraser.LINE_WIDTH;
    context.strokeStyle = eraser.STROKE_STYLE;

    context.beginPath();

    context.arc(position.x, position.y, radius, 0, Math.PI * 2, false);
}

eraser.drawSqaure = function (context, width, position) {

    context.lineWidth = eraser.LINE_WIDTH;
    context.strokeStyle = eraser.STROKE_STYLE;

    context.beginPath();

    context.rect(position.x - width / 2, position.y - width / 2, width, width);

}

eraser.createDrawingEraser = function (settings) {
    let drawingPen = new DrawingEraser(settings);
    LayersActiveElement[settings.layerId] = drawingPen;
}

eraser.deleteDrawingEraser = function (settings) {

    if (LayersActiveElement[settings.layerId] && LayersActiveElement[settings.layerId].settings.id === settings.id) {
        delete LayersActiveElement[settings.layerId];
    }
}

eraser.updateSettings = function (settings) {
    if (LayersActiveElement[settings.layerId]) {
        LayersActiveElement[settings.layerId].settings = settings;
    }
}

class DrawingEraser {

    constructor(settings) {
        this.settings = settings;
        this.prevPosition = {};
        this.drawing = false;
    }

    #drawCircle(context, radius, position) {

        context.lineWidth = eraser.LINE_WIDTH;
        context.strokeStyle = eraser.STROKE_STYLE;

        context.beginPath();

        context.arc(position.x, position.y, radius, 0, Math.PI * 2, false);
    }

    #drawSqaure(context, width, position) {

        context.lineWidth = eraser.LINE_WIDTH;
        context.strokeStyle = eraser.STROKE_STYLE;

        context.beginPath();

        context.rect(position.x - width / 2 , position.y - width / 2 , width , width );
    }

    #draw (position) {
        let context = drawingContexts[this.settings.layerId];
        if (context) {
            context.save();
            if (this.settings.eraserShape === 'circle') {
                let radius = this.settings.width / 2;
                eraser.drawCircle(context, radius, position);
            }
            else {
                eraser.drawSqaure(context, this.settings.width, position);
            }

            context.stroke();
            context.restore();
        }
    }


    #erase(position) {
        
        let context = drawingContexts[this.settings.layerId];
        if (context) {
            context.save();

            if (this.settings.eraserShape === 'circle') {
                let radius = this.settings.width / 2;
                this.#drawCircle(context, radius + 2*eraser.LINE_WIDTH , position);
            }
            else {
                this.#drawSqaure(context, this.settings.width + 3 * eraser.LINE_WIDTH, position);
            }

            context.clip();
            drawingLayer.drawGridLines(context, drawingLayerSettings[this.settings.layerId]);
            context.restore();
        }
    }

    mouseDown(pointer) {
        if (pointer.buttons === 1 || pointer.pointerType === "touch") {
            this.drawing = true;
            this.prevPosition = pointer;
            this.settings.points.push({ x: pointer.x, y: pointer.y });
            this.#draw(this.prevPosition);
            this.#erase(this.prevPosition);
        }
    }

    mouseMove(pointer) {
        if (this.drawing) {
            this.settings.points.push({ x: pointer.x, y: pointer.y });
            this.#erase(this.prevPosition);
            this.prevPosition = pointer;
            this.#draw(pointer);
        }
    }

    mouseUp(pointer) {
        this.drawing = false;
        let context = drawingContexts[this.settings.layerId];
        if (context) {
            this.#erase(this.prevPosition);
            context.restore();
        }
        DotNet.invokeMethodAsync('KueMinds.FillZGap.BlazorComponents', 'EraserDrawingCompleted', this.settings);
        this.settings.points = [];
    }
}