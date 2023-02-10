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
import { EraserDrawingCompletedEvent, EraserMenuSettingsOpenEvent, EraserSelectedEvent, EraserSettingsChangedEvent } from "./EraserDrawingEvents";
import { ToolBoxPointerSelectedEvent } from "./ToolboxPointerSelectedEvent";
import { PenMenu } from "./PenMenu";
import { AddRulerEvent, RemoveRulerEvent } from "./RulerDrawingEvents";
import { BaseRuler, RulersType } from "./BaseRuler";
import { Ruler } from "./Ruler";
import { Protractor } from "./Protractor";
import { SetSquare } from "./SetSquare";
import { CompassMenuSettingsOpenEvent, AddCompassEvent, CompassSettingsChangedEvent, RemoveCompassEvent } from "./CompassDrawingEvents";
import { CompassMenu } from "./CompassMenu";
import { Compass } from "./Compass";
import { PenRulerHelper } from "./PenRulersHelper";
import { EraserMenu } from "./EraserMenu";
import { NewWhiteboardEvent } from "./NewFileDrawingEvents";
import { SaveWhiteboardEvent } from "./SaveFileDrawingEvents";


export class Whiteboard implements IEventHandler{
    private static _counter: number = 0;

    private _toolbox : ToolBox;
    
    private _drawingLayer : DrawingLayer | null = null;

    private _activePen : Pen | Eraser | null = null;
    private _activeRulers : Map<RulersType, BaseRuler> = new  Map<RulersType, BaseRuler>;
    private _activeCompass : Compass | null = null;;

    private _penMenu : PenMenu | null = null;
    private _eraserMenu : EraserMenu | null  = null;
    private _compassMenu : CompassMenu | null = null;

    static getNewCounter():number{
        return ++Whiteboard._counter;
    }

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
        EventAggregator.subscribe('EraserMenuSettingsOpenEvent', this);
        EventAggregator.subscribe('EraserSettingsChangedEvent', this);

        EventAggregator.subscribe('AddCompassEvent', this);
        EventAggregator.subscribe('CompassMenuSettingsOpenEvent', this);
        EventAggregator.subscribe('CompassSettingsChangedEvent', this);
        EventAggregator.subscribe('RemoveCompassEvent', this);

        EventAggregator.subscribe('RemoveRulerEvent', this);
        EventAggregator.subscribe('AddRulerEvent', this); 

        EventAggregator.subscribe('ClearCanvasDrawingEvent', this);
        
        //EventAggregator.subscribe('OpenExistingWhiteboardEvent', this);
        EventAggregator.subscribe('NewWhiteboardEvent', this);
        EventAggregator.subscribe('SaveWhiteboardEvent', this);
    }

    private initializeDrawingLayer(){
        this._drawingLayer = new DrawingLayer();
    }

    private addPointerEvents():void{
        document.body.addEventListener("pointerdown", (event) => {
            let target: any = event.target;
            let targetElement = target as HTMLCanvasElement;
            if (!targetElement.id.includes('penMenu') && this._penMenu !== null){
                    this._penMenu.dispose();
                    this._penMenu = null;
            }
            if (!targetElement.id.includes('compassMenu') && this._compassMenu !== null){
                this._compassMenu.dispose();
                this._compassMenu = null;
            }
            if (!targetElement.id.includes('eraserMenu') && this._eraserMenu !== null){
                this._eraserMenu.dispose();
                this._eraserMenu = null;
            }
            if (targetElement.id === 'whiteboard_canvas#1'){ 
                if ((event.pointerType !== 'mouse'  || (event.pointerType === 'mouse' && event.button === 0)) && this._activePen !== null){
                    document.body.style.touchAction ='none';
                    event.preventDefault();
                    event.stopPropagation();
                    let mousePosition  = this.mapMousePositionToCanvas(event.clientX, event.clientY);
                    if (this._activePen instanceof Pen){
                        let pen = this._activePen as Pen;
                        let result = PenRulerHelper.captureRulerInfo(this._activeRulers, mousePosition);
                        if (result !== null){
                            pen.setPointerCaptureOnTargetedRuler(result, event.pointerId);
                            let ruler = this._activeRulers.get(result.rulerType);
                            if (ruler){
                                mousePosition = ruler.mapPenPosition(result, mousePosition, pen.settings.thickness);
                            }
                        }
                        this._activePen.OnMouseDown(mousePosition);
                    }
                    else if (this._activePen instanceof Eraser){
                        //this._activePen.OnMouseDown(this.mapMousePositionToCanvas(event.clientX, event.clientY));
                        this._activePen.OnMouseDown(mousePosition)
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
                    let pen = this._activePen as Pen;
                    let mousePosition  = this.mapMousePositionToCanvas(event.clientX, event.clientY);
                   
                    let capturedRulerInfo = this._activePen.getCapturedRulerInfo();
                    if (capturedRulerInfo !== null){
                        mousePosition = capturedRulerInfo.targetRuler.mapPenPosition(capturedRulerInfo, mousePosition, pen.settings.thickness);
                    }
                   
                    this._activePen.OnMouseMove(mousePosition);
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

        return   new Point(x,y);
        // if (this._drawingLayer?.canvas) {
        //     let canvas = this._drawingLayer.canvas;
        //     var bbox = canvas.getBoundingClientRect();
    
        //     return  new Point(x - bbox.left * (canvas.width / bbox.width),
        //                   y - bbox.top * (canvas.height / bbox.height));

        // }
        // else {
        //     return   new Point(-1,-1);
        // }
    }

    private handlePenSelectedEvent(eventData: PenSelectedEvent) : void{
        if (this._activePen !== null){
            this._activePen.dispose();
        }
        if (this._drawingLayer !== null){
            this._activePen = new Pen(eventData.id, eventData.settings, this._drawingLayer);
            if (this._drawingLayer.canvas){
                 this._drawingLayer.canvas.style.cursor = 'crosshair';
            }
        }
    }

    private handlePenDrawingCompletedEvent(eventData : PenDrawingCompletedEvent) : void {

    }

    private handleHandleClearCanvasEvent(eventData: ClearCanvasDrawingEvent) : void{
       //remove rulers 
       this._activeRulers.forEach((ruler)=> ruler.dispose());
       this._activeRulers.clear();
       //remove compass
       this._activeCompass?.dispose();
       this._activeCompass = null;

       this._toolbox.resetSelection();
    }

    private handleCompassSelectedEvent(eventData : AddCompassEvent){
        if (this._activeCompass !== null){
            //dispose
        }
        if (this._drawingLayer !== null){
            this._activeCompass = new Compass(eventData.id, eventData.settings, this._drawingLayer);
        }
    }
    
    private handleEraserSelectedEvent(eventData: EraserSelectedEvent) : void{
        if (this._activePen !== null){
            this._activePen.dispose();
        }
        if (this._drawingLayer !== null){
            this._activePen = new Eraser(eventData.settings, this._drawingLayer);
            if (this._drawingLayer.canvas){
                this._drawingLayer.canvas.style.cursor = 'crosshair';
            }
        }

    }

    private handlEraserDrawingCompletedEvent(eventData : EraserDrawingCompletedEvent) : void {

    }

    private handlePointerSelectedEvent(eventData : ToolBoxPointerSelectedEvent) : void {
        this._activePen?.dispose();
        this._activePen = null;
        document.body.style.touchAction ='auto';
        
        if (this._drawingLayer !== null){
            if (this._drawingLayer.canvas){
                this._drawingLayer.canvas.style.cursor = 'auto';
            }
        }
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
            baseRuler.dispose();
            this._activeRulers.delete(eventData.type);
        }
    }


    private removeCompass(){
        if(this._activeCompass !== null) {
            this._activeCompass.dispose();
            this._activeCompass = null;
        };
    }

    private removeAllRules(){
        this._activeRulers.forEach( (ruler)=>  {
            ruler.dispose();
        });
        this._activeRulers.clear();
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
                        this._penMenu.dispose();
                        this._penMenu = null;
                    }
                    this._penMenu = new PenMenu(penMenuSettingsOpenEvent.id, penMenuSettingsOpenEvent.settings, penMenuSettingsOpenEvent.boundingRect)
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
            
                EraserMenuSettingsOpenEvent
            case 'EraserMenuSettingsOpenEvent' :{
                    let eraserMenuSettingsOpenEvent = eventData as EraserMenuSettingsOpenEvent;
                    if (this._eraserMenu !== null){
                        this._eraserMenu.dispose();
                        this._eraserMenu = null;
                    }
                    this._eraserMenu = new EraserMenu(eraserMenuSettingsOpenEvent.id, eraserMenuSettingsOpenEvent.settings, eraserMenuSettingsOpenEvent.boundingRect)
                }
                break;
            case 'AddCompassEvent' :
                this.handleCompassSelectedEvent(eventData as AddCompassEvent)
                break;

            case 'RemoveCompassEvent' :
                if (this._activeCompass !== null){
                    this._activeCompass.dispose();
                    this._activeCompass = null;
                }
                break;

            case 'CompassMenuSettingsOpenEvent' :{
                    let compassMenuSettingsOpenEvent = eventData as CompassMenuSettingsOpenEvent;
                    if (this._compassMenu !== null){
                        this._compassMenu.dispose();
                        this._compassMenu = null;
                    }
                    this._compassMenu = new CompassMenu(compassMenuSettingsOpenEvent.id, compassMenuSettingsOpenEvent.settings, compassMenuSettingsOpenEvent.boundingRect)
                }
                break;

            case 'CompassSettingsChangedEvent': 
                if (this._activeCompass !== null && this._activeCompass) {
                    let compassSettingsChangedEvent = eventData as CompassSettingsChangedEvent;
                    this._activeCompass.settings = compassSettingsChangedEvent.settings;
                }
                break;

            case 'AddRulerEvent' :
                this.handleAddRulerEvent(eventData as AddRulerEvent);
                this._toolbox.resetPointerSelection();
                break;

            case 'RemoveRulerEvent':
                this.handleRemoveRulerEvent(eventData as RemoveRulerEvent);
                break;

            case 'NewWhiteboardEvent' :
                break;

            case 'SaveWhiteboardEvent':
                break;

            case 'OpenExistingWhiteboardEvent':
                break;
            
        }
    }

    reinitialize(){
        let title = `Untitled - ${Whiteboard.getNewCounter()}`;
        
        this._activePen?.dispose();
        this._activePen = null;

        this._eraserMenu?.dispose();
        this._eraserMenu = null;

        this._penMenu?.dispose();
        this._penMenu = null;
        
        this._activeCompass?.dispose();
        this._activeCompass = null;

        this.removeAllRules();
        this._drawingLayer?.clear();

        this._toolbox.resetSelection();
    }
}

