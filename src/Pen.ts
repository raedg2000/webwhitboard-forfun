import { BasePenSettings } from "./BasePenSettings";
import { DrawingLayer } from "./DrawingLayer";
import { EventAggregator } from "./EventAggregator";
import { IDispose } from "./IDispose";
import { IMouseEventsHandler } from "./IMouseEventsHandler";
import { IMouseMoveEvent, IMouseLeftButtonDownEvent, IMouseLeftButtonUpEvent } from "./MouseEvents";
import { PenDrawingCompletedEvent } from "./PenDrawingEvents";
import { Point } from "./Point";

export class Pen implements IMouseMoveEvent, IMouseLeftButtonDownEvent, IMouseLeftButtonUpEvent, IDispose{

    private _id : string;
    private _settings : BasePenSettings;
    private _startPosition: Point | null = null;
    private _lastPosition : Point| null  = null;
    private _drawingStarted : boolean = false;
    private _drawingLayer : DrawingLayer | null;
    private _line:Array<Point> = new Array<Point>();

    constructor(id: string, settings : BasePenSettings, drawingLayer : DrawingLayer) {
        this._id = id;
        this._settings = settings;
        this._drawingLayer = drawingLayer;
    }

    get id(): string{
        return this._id;
    }

    get settings() : BasePenSettings{
        return this._settings;
    }

    set settings(value : BasePenSettings){
        this._settings = value;
    }

    get drawingStarted():boolean{
        return this._drawingStarted;
    }

    OnMouseDown(data: Point): void {
        this._drawingStarted = true;
        if (this._startPosition === null){
            this._startPosition = data;
            this._line.push(this._startPosition);
        }
        this._lastPosition = data;
    }

    OnMouseMove(data: Point): void {
        this._lastPosition = data;
        this._line.push(this._lastPosition)
        this.draw();
    }

    OnMouseUp(data: Point): void {
       this._startPosition = null;
       this._lastPosition = null;
       this._drawingStarted = false; 

       let penDrawingCompletedEvent = new PenDrawingCompletedEvent(this._line);
       EventAggregator.publish(penDrawingCompletedEvent);

       this._line = new Array<Point>();
       this._drawingStarted = false;
    }

    draw() {
        if (this.drawingStarted){
            let capturingObject = null;

            let context = this._drawingLayer?.canvas?.getContext('2d');
            if (context && this._startPosition !== null && this._lastPosition !== null) {
                context.beginPath();
                context.lineCap = "round";
                context.strokeStyle = this._settings.color;
                context.lineWidth = this._settings.thickness;
                context.moveTo(this._startPosition.x, this._startPosition.y);
                context.lineTo(this._lastPosition.x, this._lastPosition.y);
                context.stroke();
                context.closePath();
            }  

            this._startPosition = this._lastPosition;
        }
    }

    dispose(){
        this._drawingLayer = null;
        this._line = [];
        this._startPosition = null;
        this._lastPosition = null;
        this._drawingStarted = false;
    }
}