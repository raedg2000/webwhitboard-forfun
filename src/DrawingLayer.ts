import { BaseDrawingEvent } from "./BaseDrawingEvent";
import { EventAggregator } from "./EventAggregator";
import { IEventHandler } from "./IEventHandler";

export class DrawingLayer implements IEventHandler{

    private _canvasWidth: number = 10000;
    private _canvasHeight: number = 10000;
    private _gridDistance : number =  10 / 0.2645833;
    private _lineThinkness : number = 0.1;
    private _gridPointRadius : number = 1;
    private _gridPointColor: string = 'Gray' ;//'#E0E0E0'; 

    private _canvas : HTMLCanvasElement | undefined;

    constructor(){
        this.getHtmlCanvasElement();
        this.initializeCanvas();
        //EventAggregator.subscribe('ClearCanvasDrawingEvent', this);
    }

    get canvas():HTMLCanvasElement | undefined{
        return this._canvas;
    }

    get width() : number{
        return this._canvasWidth;
    }

    get height() : number{
        return this._canvasHeight;
    }

    private getHtmlCanvasElement():void{
        let tempElement = document.getElementById('whiteboard_canvas#1');
        if (tempElement){
            this._canvas =tempElement as HTMLCanvasElement;
        }
    }

    private initializeCanvas(){
        if (this._canvas){
            this._canvas.width = this._canvasWidth;
            this._canvas.height = this._canvasHeight;
            this.drawGridPoints();
        }
    }

    clear()
    {
        let context = this._canvas?.getContext(`2d`);
        if (context) {
            context.clearRect(0, 0, context.canvas.width, context.canvas.height);
            this.drawGridPoints();
        }
    }

    drawGridPoints () {

        let context = this._canvas?.getContext(`2d`);
        if (context){
            context.save();
        
            context.clearRect(0, 0, this._canvasWidth, this._canvasHeight);
            context.strokeStyle = this._gridPointColor;
            context.fillStyle  = this._gridPointColor;
            context.lineWidth = this._lineThinkness;
        
            for (var x = this._gridDistance; x <= this._canvasWidth - this._gridDistance; x += this._gridDistance){
                for (var y = this._gridDistance ; y <= this._canvasHeight - this._gridDistance; y += this._gridDistance) {
                    context.beginPath();
                    context.moveTo(x, y);
                    //arc(x, y, radius, startAngle, endAngle, counterclockwise)
                    context.arc(x, y, this._gridPointRadius, 0, 2*Math.PI, true );
                    context.fill();
                    context.stroke();
                }
            }
            context.restore();

        }
    }

    handle(eventData: BaseDrawingEvent): void {
        if (eventData.eventType === 'ClearCanvasDrawingEvent'){
            this.clear();
        }
    }
}