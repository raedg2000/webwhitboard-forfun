import { DrawingLayer } from "./DrawingLayer";
import { EventAggregator } from "./EventAggregator";
import { IEventHandler } from "./IEventHandler";
import { ToolBox } from "./ToolBox";
import { PenDrawingCompletedEvent, PenMenuSettingsOpenEvent, PenSelectedEvent, PenSettingsChangedEvent} from './PenDrawingEvents'
import { BaseDrawingEvent } from "./BaseDrawingEvent";
import { Pen } from "./Pen";
import { Point } from "./Point";
import { ClearCanvasDrawingEvent } from "./ClearCanavasDrawingEvent";
import { Eraser } from "./Eraser";
import { EraserDrawingCompletedEvent, EraserSelectedEvent } from "./EraserDrawingEvents";
import { ToolBoxPointerSelectedEvent } from "./ToolboxPointerSelectedEvent";
import { PenMenu } from "./PenMenu";
import { AddRulerEvent, RemoveRulerEvent } from "./RulerDrawingEvents";
import { BaseRuler, RulersType } from "./BaseRuler";
import { Ruler } from "./Ruler";
import { Protractor } from "./Protractor";
import { SetSquare } from "./SetSquare";
import { CompassMenuSettingsOpenEvent, CompassSelectedEvent, CompassSettingsChangedEvent } from "./CompassDrawingEvents";
import { CompassMenu } from "./CompassMenu";


export class Whiteboard implements IEventHandler{

    private _toolbox : ToolBox;
    
    private _drawingLayer : DrawingLayer | null = null;

    private _activePen : Pen | Eraser | null = null;
    private _activeRulers : Map<string, BaseRuler> = new  Map<RulersType, BaseRuler>;
    private _activeCompass : any;

    private _penMenu : PenMenu | null = null;
    private _compassMenu : CompassMenu | null = null;

    constructor(){
       
        this.addPointerEvents();
        this.initializeDrawingLayer();
        this.subscribeToDrawingEvents();
        this._toolbox = new ToolBox();
    }

    private subscribeToDrawingEvents(){
       
        EventAggregator.subscribe('ToolBoxPointerSelectedEvent', this);

        EventAggregator.subscribe('PenSelectedEvent', this);
        EventAggregator.subscribe('PenDrawingCompletedEvent', this);
        EventAggregator.subscribe('PenMenuSettingsOpenEvent', this);
        EventAggregator.subscribe('PenSettingsChangedEvent', this);
       
        EventAggregator.subscribe('EraserSelectedEvent', this);
        EventAggregator.subscribe('EraserDrawingCompletedEvent', this);

        EventAggregator.subscribe('CompassSelectedEvent', this);
        EventAggregator.subscribe('CompassMenuSettingsOpenEvent', this);
        EventAggregator.subscribe('CompassSettingsChangedEvent', this);

        EventAggregator.subscribe('RemoveRulerEvent', this);
        EventAggregator.subscribe('AddRulerEvent', this); 

        EventAggregator.subscribe('ClearCanvasDrawingEvent', this);
    }

    private initializeDrawingLayer(){
        this._drawingLayer = new DrawingLayer();
    }

    private addPointerEvents():void{
        document.body.addEventListener("pointerdown", (event) => {
            let target: any = event.target;
            let targetElement = target as HTMLCanvasElement;
            if (!targetElement.id.includes('penMenu') && this._penMenu !== null){
                document.body.removeChild(this._penMenu.dialogElement);
                this._penMenu = null;
            }
            if (targetElement.id === 'whiteboard_canvas#1'){ 
                if ((event.pointerType !== 'mouse'  || (event.pointerType === 'mouse' && event.button === 0)) && this._activePen !== null){
                    document.body.style.touchAction ='none';
                    event.preventDefault();
                    event.stopPropagation();
                    if (this._activePen instanceof Pen){
                    this._activePen.OnMouseDown(this.mapMousePositionToCanvas(event.clientX, event.clientY))
                    }
                    else if (this._activePen instanceof Eraser){
                        this._activePen.OnMouseDown(this.mapMousePositionToCanvas(event.clientX, event.clientY))
                    }
                }
            }
        }, false);

        document.body.addEventListener("pointermove", (event) =>{
            if (this._activePen !== null){
                document.body.style.touchAction ='none';
                event.preventDefault();
                event.stopPropagation();
                if (this._activePen instanceof Pen && this._activePen.drawingStarted){
                    this._activePen.OnMouseMove(this.mapMousePositionToCanvas(event.clientX, event.clientY))
                }
                else if (this._activePen instanceof Eraser && this._activePen.erasingStarted){
                    this._activePen.OnMouseMove(this.mapMousePositionToCanvas(event.clientX, event.clientY))
                }
        }}, false);

        document.body.addEventListener("pointerup", (event) => {
            if (this._activePen !== null){
                document.body.style.touchAction ='none';
                event.preventDefault();
                event.stopPropagation();

                if (this._activePen instanceof Pen && this._activePen.drawingStarted){
                    this._activePen.OnMouseUp(this.mapMousePositionToCanvas(event.clientX, event.clientY))
                }
                else if (this._activePen instanceof Eraser && this._activePen.erasingStarted){
                    this._activePen.OnMouseUp(this.mapMousePositionToCanvas(event.clientX, event.clientY))
                }

               
                //document.body.style.touchAction ='auto';
            }
        }, false);

    }

    private mapMousePositionToCanvas(x : number, y : number) : Point{

        if (this._drawingLayer?.canvas) {
            let canvas = this._drawingLayer.canvas;
            var bbox = canvas.getBoundingClientRect();
    
            return  new Point(x - bbox.left * (canvas.width / bbox.width),
                          y - bbox.top * (canvas.height / bbox.height));

        }
        else {
            return   new Point(-1,-1);
        }
    }

    private handlePenSelectedEvent(eventData: PenSelectedEvent) : void{
        if (this._activePen !== null){
            this._activePen.dispose();
        }
        if (this._drawingLayer !== null){
            this._activePen = new Pen(eventData.id, eventData.settings, this._drawingLayer);
        }
    }

    private handlePenDrawingCompletedEvent(eventData : PenDrawingCompletedEvent) : void {

    }

    private handleHandleClearCanvasEvent(eventData: ClearCanvasDrawingEvent) : void{
       //remove rulers 
       this._activeRulers.clear();
       //remove compass
       this._activeCompass = null;
    }

    private handleEraserSelectedEvent(eventData: EraserSelectedEvent) : void{
        if (this._activePen !== null){
            this._activePen.dispose();
        }
        if (this._drawingLayer !== null){
            this._activePen = new Eraser(eventData.settings, this._drawingLayer);
        }

    }

    private handlEraserDrawingCompletedEvent(eventData : EraserDrawingCompletedEvent) : void {

    }

    private handlePointerSelectedEvent(eventData : ToolBoxPointerSelectedEvent) : void {
        this._activePen?.dispose();
        this._activePen = null;
        document.body.style.touchAction ='auto';
    }

    private handleAddRulerEvent(eventData : AddRulerEvent){
        if (!this._activeRulers.get(eventData.type)){
            if (this._drawingLayer){
                switch (eventData.type){
                    case RulersType.NormalRuler:
                        
                        let ruler = new Ruler(eventData.id, this._drawingLayer);
                        this._activeRulers.set(ruler.type, ruler)
                        break;
                }
                switch (eventData.type){
                    case RulersType.Protractor:
                        
                        let ruler = new Protractor(eventData.id, this._drawingLayer);
                        this._activeRulers.set(ruler.type, ruler as BaseRuler)
                        break;
                }
                switch (eventData.type){
                    case RulersType.SetSquare:
                        
                        let ruler = new SetSquare(eventData.id, this._drawingLayer);
                        this._activeRulers.set(ruler.type, ruler as BaseRuler)
                        break;
                }
            }
        }
    }

    private handleRemoveRulerEvent(eventData : RemoveRulerEvent){
        let baseRuler = this._activeRulers.get(eventData.type);
        if (baseRuler){
            document.body.removeChild(baseRuler.svgElement);
            this._activeRulers.delete(eventData.type);
        }
    }

    handle(eventData: BaseDrawingEvent): void {
        switch (eventData.eventType){

            case 'ClearCanvasDrawingEvent':
                this.handleHandleClearCanvasEvent(eventData as ClearCanvasDrawingEvent)
                break;

            case 'ToolBoxPointerSelectedEvent':
                    this.handlePointerSelectedEvent(eventData as ToolBoxPointerSelectedEvent)
                    break;

            case 'PenSelectedEvent' :
                this.handlePenSelectedEvent(eventData as PenSelectedEvent)
                break;

            case 'PenDrawingCompletedEvent' :
                this.handlePenDrawingCompletedEvent(eventData as PenDrawingCompletedEvent)
                break;

            case 'PenMenuSettingsOpenEvent' :{
                    let penMenuSettingsOpenEvent = eventData as PenMenuSettingsOpenEvent;
                    if (this._penMenu !== null){
                        document.body.removeChild(this._penMenu.dialogElement);
                    }
                    this._penMenu = new PenMenu(penMenuSettingsOpenEvent.id, penMenuSettingsOpenEvent.settings, penMenuSettingsOpenEvent.boundingRect)
                    document.body.appendChild(this._penMenu.dialogElement);
                }
                break;

           
            case 'PenSettingsChangedEvent': 
                    if (this._activePen !== null && this._activePen instanceof Pen) {
                        let penSettingsChangedEvent = eventData as PenSettingsChangedEvent;
                        if (this._activePen.id === penSettingsChangedEvent.penId ){
                            this._activePen.settings = penSettingsChangedEvent.settings;
                        }
                    }
                break;

            case 'EraserSelectedEvent' :
                this.handleEraserSelectedEvent(eventData as EraserSelectedEvent)
                break;
            case 'EraserDrawingCompletedEvent':
                this.handlEraserDrawingCompletedEvent(eventData as EraserDrawingCompletedEvent)
                break;

            case 'CompassMenuSettingsOpenEvent' :{
                    let compassMenuSettingsOpenEvent = eventData as CompassMenuSettingsOpenEvent;
                    if (this._penMenu !== null){
                        document.body.removeChild(this._penMenu.dialogElement);
                    }
                    this._compassMenu = new CompassMenu(compassMenuSettingsOpenEvent.id, compassMenuSettingsOpenEvent.settings, compassMenuSettingsOpenEvent.boundingRect)
                    document.body.appendChild(this._compassMenu.dialogElement);
                }
                break;

            case 'CompassSettingsChangedEvent': 
                if (this._activePen !== null && this._activePen instanceof Pen) {
                    let compassSettingsChangedEvent = eventData as CompassSettingsChangedEvent;
                    // if (this._activePen.id === penSettingsChangedEvent.penId ){
                    //     this._activePen.settings = penSettingsChangedEvent.settings;
                    // }
                }
            break;

            case 'AddRulerEvent' :
                this.handleAddRulerEvent(eventData as AddRulerEvent)
                break;

            case 'RemoveRulerEvent':
                this.handleRemoveRulerEvent(eventData as RemoveRulerEvent)
                break;
            
        }
    }
}

