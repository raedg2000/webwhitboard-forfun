import { BaseDrawingEvent } from "./BaseDrawingEvent";
import { BasePenSettings } from "./BasePenSettings";
import { BaseRuler, CapturedRulerInfo, RulersType } from "./BaseRuler";
import { Arc, Arcs, ArcsDrawingCompletedEvent, Line, LinesDrawingCompletedEvent } from "./DrawingData";
import { DrawingLayer } from "./DrawingLayer";
import { EventAggregator } from "./EventAggregator";
import { IDispose } from "./IDispose";
import { IEventHandler } from "./IEventHandler";
import { IMouseEventsHandler } from "./IMouseEventsHandler";
import { IMouseMoveEvent, IMouseLeftButtonDownEvent, IMouseLeftButtonUpEvent } from "./MouseEvents";
import { Point } from "./Point";
import { Protractor } from "./Protractor";
import { RulerReleasedCapture } from "./RulerDrawingEvents";


export class Pen implements IMouseMoveEvent, IMouseLeftButtonDownEvent, IMouseLeftButtonUpEvent,IEventHandler, IDispose{

    private _id : string;
    private _settings : BasePenSettings;
    private _startPosition: Point | null = null;
    private _lastPosition : Point| null  = null;
    private _drawingStarted : boolean = false;
    private _drawingLayer : DrawingLayer | null;
    private _lines : Line = new Line();
    private _arcs : Arcs = new Arcs();
    private _capturedRulerInfo : CapturedRulerInfo | null = null;

    constructor(id: string, settings : BasePenSettings, drawingLayer : DrawingLayer) {
        this._id = id;
        this._settings = settings;
        this._drawingLayer = drawingLayer;
        
        this._lines.color = settings.color;
        this._lines.strokeWidth = settings.thickness;

        EventAggregator.subscribe('RulerReleasedCapture', this);
    }

    get id(): string{
        return this._id;
    }

    get settings() : BasePenSettings{
        return this._settings;
    }

    set settings(value : BasePenSettings){
        this._settings = value;
        this._lines.color = value.color;
        this._lines.strokeWidth = value.thickness;
        this._arcs.color = value.color;
        this._arcs.strokeWidth = value.thickness;
    }

    get drawingStarted():boolean{
        return this._drawingStarted;
    }

    getCapturedRulerInfo(): CapturedRulerInfo | null{
        if (this._capturedRulerInfo !== null){
            return this._capturedRulerInfo;
        } 
        return null;
    }

    setPointerCaptureOnTargetedRuler(value: CapturedRulerInfo , pointerId: number){
        this._capturedRulerInfo = value;
        this._capturedRulerInfo.targetRuler.capture(pointerId);
    }

    releasePointerCaptureOnTargetedRuler(pointerId: number){

        if (this._capturedRulerInfo !== null){
            this._capturedRulerInfo.targetRuler.uncapture(pointerId);
            this._capturedRulerInfo = null;
        }
    }

    OnMouseDown(data: Point): void {
        this._drawingStarted = true;
        if (this._startPosition === null){
            this._startPosition = data;
            this._lines.points.push(data);
        }
        this._lastPosition = data;
    }

    OnMouseMove(data: Point): void {
        this._lastPosition = data;
        
        if (this._capturedRulerInfo !== null && this._capturedRulerInfo.rulerType === RulersType.Protractor){
            this.drawArc()
        }
        else{
            this.draw();
        }
    }

    OnMouseUp(data: Point): void {
        this._startPosition = null;
        this._lastPosition = null;
        this._drawingStarted = false; 

        
        let linesDrawingCompletedEvent = new LinesDrawingCompletedEvent(this._lines);
        EventAggregator.publish(linesDrawingCompletedEvent);

        if (this._capturedRulerInfo?.rulerType === RulersType.Protractor){
            let arcsDrawingCompletedEvent = new ArcsDrawingCompletedEvent(this._arcs);
            EventAggregator.publish(arcsDrawingCompletedEvent);
        }
        
        this._lines = new Line();
        this._lines.color = this.settings.color;
        this._lines.strokeWidth = this.settings.thickness;
        this._arcs = new Arcs();
        this._arcs.color = this.settings.color;
        this._arcs.strokeWidth = this.settings.thickness;

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
                this._startPosition = this._lastPosition;
                this._lines.points.push(this._lastPosition);
            }  
        }
    }

    drawArc(){
        if (this.drawingStarted){
            let capturingObject = null;

            let context = this._drawingLayer?.canvas?.getContext('2d');
            if (context && this._startPosition !== null && this._lastPosition !== null && this._capturedRulerInfo !== null) {

                let arc = new Arc();
                arc.center = this._capturedRulerInfo.center; 
                arc.startAngle = Protractor.getAngle(this._startPosition, this._capturedRulerInfo.center);
                arc.endAngle =    Protractor.getAngle(this._lastPosition, this._capturedRulerInfo.center);  
                arc.direction = Protractor.getDirection(arc.startAngle,  arc.endAngle);
                let protractor = (this._capturedRulerInfo.targetRuler as Protractor);
                arc.radius = protractor.radius + this.settings.thickness/2 + BaseRuler.Ruler_Shift;
                
                context.beginPath();
                context.lineCap = "round";
                context.strokeStyle = this._settings.color;
                context.lineWidth = this._settings.thickness;
                context.arc(arc.center.x, arc.center.y, arc.radius, arc.startAngle, arc.endAngle, arc.direction );
                context.stroke();
                context.closePath();

                this._arcs.arcsInfo.push(arc);
            }  
            
           
          
            this._startPosition = this._lastPosition;
        }
    }

    dispose(){
        this._drawingLayer = null;
        this._lines = new Line();
        this._arcs = new Arcs();
        this._startPosition = null;
        this._lastPosition = null;
        this._drawingStarted = false;
        this._capturedRulerInfo = null;
        EventAggregator.unSubscribe('RulerCaptureReleased', this);
    }

    handle(eventData: RulerReleasedCapture): void {
        if (eventData.id === this._capturedRulerInfo?.targetRuler.id){
            let linesDrawingCompletedEvent = new LinesDrawingCompletedEvent(this._lines);
            EventAggregator.publish(linesDrawingCompletedEvent);
    
            if (this._capturedRulerInfo?.rulerType === RulersType.Protractor){
                let arcsDrawingCompletedEvent = new ArcsDrawingCompletedEvent(this._arcs);
                EventAggregator.publish(arcsDrawingCompletedEvent);
            }
            
            this._lines = new Line();
            this._lines.color = this.settings.color;
            this._lines.strokeWidth = this.settings.thickness;
            this._arcs = new Arcs();
            this._arcs.color = this.settings.color;
            this._arcs.strokeWidth = this.settings.thickness;

            this._startPosition = null;
            this._lastPosition = null;
            this._drawingStarted = false;
            this._capturedRulerInfo = null;
        }
    }
}