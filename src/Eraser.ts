import { BaseEraserSettings, EraserShapeType } from "./BaseEraserSettings";
import { DrawingLayer } from "./DrawingLayer";
import { EraserDrawingCompletedEvent } from "./EraserDrawingEvents";
import { EventAggregator } from "./EventAggregator";
import { IDispose } from "./IDispose";
import { IMouseEventsHandler } from "./IMouseEventsHandler";
import { IMouseMoveEvent, IMouseLeftButtonDownEvent, IMouseLeftButtonUpEvent } from "./MouseEvents";
import { Point } from "./Point";

export class Eraser implements IMouseMoveEvent, IMouseLeftButtonDownEvent, IMouseLeftButtonUpEvent, IDispose{

    private _settings : BaseEraserSettings;
    private _previousPosition: Point | null = null;
    private _lastPosition : Point| null  = null;
    private _erasingStarted : boolean = false;
    private _drawingLayer : DrawingLayer | null;
    private _line:Array<Point> = new Array<Point>();
    private readonly LINE_WIDTH = 1;
    private readonly STROKE_STYLE = 'gray';
    private readonly FILL_COLOR = 'transparent';

    constructor(settings : BaseEraserSettings, drawingLayer : DrawingLayer) {
        this._settings = settings;
        this._drawingLayer = drawingLayer;
    }

    get erasingStarted():boolean{
        return this._erasingStarted;
    }

    private drawCircle(context : CanvasRenderingContext2D, radius : number, position : Point) {
        
        context.lineWidth = this.LINE_WIDTH;
        context.strokeStyle = this.STROKE_STYLE;
        context.fillStyle = this.FILL_COLOR;
        context.arc(position.x, position.y, radius, 0, Math.PI * 2, false); 
        context.stroke();
        context.fill();         
    }

    private drawSqaure(context : CanvasRenderingContext2D, width : number, position : Point) {
        
        context.lineWidth = this.LINE_WIDTH;
        context.strokeStyle = this.STROKE_STYLE;
        context.fillStyle = this.FILL_COLOR;
        context.rect(position.x - width / 2 , position.y - width / 2 , width , width );
        context.stroke();
        context.fill();
    }

    drawEraser (position : Point) {
        let context = this._drawingLayer?.canvas?.getContext('2d');
        if (context) {
            context.beginPath();
            if (this._settings.eraserShape === EraserShapeType.Circle) {
                let radius = this._settings.width / 2;
                this.drawCircle(context, radius, position);
            }
            else {
                this.drawSqaure(context, this._settings.width, position);
            }
          
            context.closePath();
        }
    }

    drawClippingArea(context: CanvasRenderingContext2D, width: number, position : Point){
        
        if (this._settings.eraserShape === EraserShapeType.Circle) {
            let radius = this._settings.width / 2;
            context.arc(position.x, position.y, radius, 0, Math.PI * 2, false); 
        }
        else {
            context.rect(position.x - width / 2 , position.y - width / 2 , width , width );
        }
    }

    OnMouseDown(data: Point): void {
        this._erasingStarted = true;
        if (this._previousPosition === null){
            this._previousPosition = data;
            this._line.push(this._previousPosition);
        }
        this._lastPosition = data;
        this.drawEraser( this._previousPosition);
    }

    OnMouseMove(data: Point): void {
        if (this._erasingStarted) {
            this._line.push(data);
            if (this._previousPosition !== null){
                this.erase(this._previousPosition);
            }      
            this._previousPosition = data;
            this.drawEraser( this._previousPosition);
        }
    }

    OnMouseUp(data: Point): void {
       let context = this._drawingLayer?.canvas?.getContext('2d');
       if (context) {
            if (this._previousPosition !== null) {
                this.erase(this._previousPosition);
            }
          
       }

       this._previousPosition = null;
       this._lastPosition = null;
       this._erasingStarted = false; 

       let eraserDrawingCompletedEvent = new EraserDrawingCompletedEvent(this._line);
       EventAggregator.publish(eraserDrawingCompletedEvent);

       this._previousPosition = null;
       this._lastPosition = null;
       this._erasingStarted = false; 
       this._line = new Array<Point>();
    }

  

    erase (position : Point){
        if (this._erasingStarted){
            let context = this._drawingLayer?.canvas?.getContext('2d');

            if (context) {
                context.save();

                context.beginPath();

                let width = this._settings.width + 2*this.LINE_WIDTH;
                this.drawClippingArea(context, width, position);

                context.clip();

                width = 3*this._settings.width;
                context.clearRect(position.x - width / 2 , position.y - width / 2 , width , width );
                
                this._drawingLayer?.drawGridPoints();
                context.restore();
            }
        }
        
    }

    dispose(){
        this._drawingLayer = null;
        this._line = [];
        this._previousPosition = null;
        this._lastPosition = null;
    }
}

    
    
