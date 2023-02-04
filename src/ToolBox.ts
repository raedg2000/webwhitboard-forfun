import { BaseEraserSettings } from "./BaseEraserSettings";
import { BaseCompassSettings } from "./BaseCompassSettings";
import { BasePenSettings } from "./BasePenSettings";
import { ToolBoxItemType } from "./ToolBoxItemType";
import { ToolBoxItem } from "./ToolBoxItem";
import { PenToolBoxItem} from "./PenToolboxItem";
import { CompassToolBoxItem } from "./CompassToolBoxItem";
import { EraserToolBoxItem } from "./EraserToolBoxItem";
import { SaveFileToolboxItem } from "./SaveFileToolboxItem";
import { OpenFileToolboxItem } from "./OpenFileToolboxItem";
import { ClearCanvasToolboxItem } from "./ClearCanvasToolboxItem";
import { NewFileToolboxItem } from "./NewFileToolboxItem";
import { PenSelectedEvent } from "./PenDrawingEvents";
import { EventAggregator } from "./EventAggregator";
import { ClearCanvasDrawingEvent } from "./ClearCanavasDrawingEvent";
import { EraserSelectedEvent } from "./EraserDrawingEvents";
import { ToolBoxPointerSelectedEvent } from "./ToolboxPointerSelectedEvent";
import { AddRulerEvent, RemoveRulerEvent } from "./RulerDrawingEvents";
import { AddCompassEvent, RemoveCompassEvent } from "./CompassDrawingEvents";


export class ToolBox{

    private _toolboxItems : Map<string, ToolBoxItem> = new Map<string, ToolBoxItem>;

    constructor(){

        this.initializeNewFile ('svg-newFile#1');
        // this.initializeOpenFile('svg-openFile#1');
        this.initializeSaveFile('svg-saveFile#1');

        this.initializeClear('svg-clearCanvas#1');

        this.initializePointer('svg-pointer#1');

        this.initializePen('svg-pen#1', '#000000', false); 
        this.initializePen('svg-pen#2', '#008000', false);
        this.initializePen('svg-pen#3', '#FF0000', false); 
        this.initializePen('svg-pen#4', '#FFFF00', false); 
        this.initializePen('svg-pen#5', '#0000FF', false);
        this.initializePen('svg-pen#6', '#4E342E', false);
        //this.initializePen('svg-pen#7', '#F57C00', false); 
        // this.initializePen('svg-pen#8', '#76FF03', false); 
        // this.initializePen('svg-pen#9', '#AA00FF', false);
        // this.initializePen('svg-pen#10', '#D81B60', false); 
        // this.initializePen('svg-pen#11', '#00695C', false);
        // this.initializePen('svg-pen#12', '#4E342E', false);

        this.initializeEraser('svg-pen#100');

        this.initializeRuler('svg-ruler#1');
        this.initializeRuler('svg-ruler#2');
        this.initializeRuler('svg-ruler#3');

        this.initializeCompass('svg-compass#1');
    }

    private initializeClear(id : string){
        let clearBtn = new ClearCanvasToolboxItem(id);        
        this._toolboxItems.set(id, clearBtn);
        clearBtn.drawClearCanvasSVG();
        let clear_toolboxItem = document.getElementById(id);
        if (clear_toolboxItem){
            clear_toolboxItem.addEventListener(`click`, ()=>{
                let clearCanvasDrawingEvent = new ClearCanvasDrawingEvent();
                EventAggregator.publish(clearCanvasDrawingEvent);
                
            });
        }
        
    }

    private initializeNewFile(id : string){
        let newFileBtn = new NewFileToolboxItem(id);        
        this._toolboxItems.set(id, newFileBtn);
        newFileBtn.drawNewFileSVG();
   
        // let openFile_toolboxItem = document.getElementById(id);
        // if (openFile_toolboxItem){
        //     openFile_toolboxItem.addEventListener(`click`, this.openFile_clicked);
        // }
        
    }

    private initializeOpenFile(id : string){
        let openFileBtn = new OpenFileToolboxItem(id);        
        this._toolboxItems.set(id, openFileBtn);
        openFileBtn.drawOpenFileSVG();
   
        // let openFile_toolboxItem = document.getElementById(id);
        // if (openFile_toolboxItem){
        //     openFile_toolboxItem.addEventListener(`click`, this.openFile_clicked);
        // }
        
    }

    private initializeSaveFile(id : string){
        let saveFileBtn = new SaveFileToolboxItem(id);        
        this._toolboxItems.set(id, saveFileBtn);
        saveFileBtn.drawSaveFileSVG();
        // let saveFile_toolboxItem = document.getElementById(id);
        // if (saveFile_toolboxItem){
        //     saveFile_toolboxItem.addEventListener(`click`, this.saveFile_clicked);
        // }
       
    }

    private initializePointer(id : string){
      
        let pointer = new ToolBoxItem(id, ToolBoxItemType.Pointer);        
   
        this._toolboxItems.set(id, pointer);
        let penValue = ToolBoxItemType.Pen;
        let eraserValue = ToolBoxItemType.Eraser;
        let toolBoxValue = ToolBoxItemType.Pointer;
        pointer.divElement?.addEventListener(`click`, (event) =>{
            
            if (event.currentTarget){
                let clickedElement = event.currentTarget as HTMLElement;
                let toolboxItemId = `svg-pointer#${clickedElement.id.split('#')[1]}`
                let pointerToolBoxItem = this._toolboxItems.get(toolboxItemId);
                if (pointerToolBoxItem && !pointerToolBoxItem.isSelected){
                    this._toolboxItems.forEach( item =>{
                        if (item.toolBoxItemType === penValue ||  
                            item.toolBoxItemType === eraserValue ||
                            item.toolBoxItemType === toolBoxValue){
                            item.isSelected = false;
                            item.divElement?.classList.remove(ToolBoxItem.hoverSelectedClass);
                            if (item.toolBoxItemType === penValue){
                                let penToolBoxItem = item as PenToolBoxItem;
                                penToolBoxItem.enable(item.id, item.isSelected)
                            }
                            if (item.toolBoxItemType === eraserValue){
                                let eraserToolBoxItem = item as EraserToolBoxItem;
                                eraserToolBoxItem.enable(item.id, item.isSelected)
                            }
                        }
                    }, false);
                    
                    pointerToolBoxItem.isSelected = true;
                    pointerToolBoxItem.divElement?.classList.add(ToolBoxItem.hoverSelectedClass);

                    let pointerSelectedEvent = new ToolBoxPointerSelectedEvent('ToolBoxPointerSelectedEvent');
                    EventAggregator.publish(pointerSelectedEvent);
                }   
            }
        });
    }

    private initializeEraser(id : string){

        let settings = new BaseEraserSettings();

        let eraser = new EraserToolBoxItem(id, settings);        
        this._toolboxItems.set(id, eraser);
        eraser.drawEraserSVG();
        let penValue = ToolBoxItemType.Pen;
        let eraserValue = ToolBoxItemType.Eraser;
        let pointerValue = ToolBoxItemType.Pointer;
        eraser.divElement?.addEventListener(`click`, (event) =>{
            if (event.currentTarget){
                document.body.style.touchAction ='none';
                let clickedElement = event.currentTarget as HTMLElement;
                let toolboxItemId = `svg-pen#${clickedElement.id.split('#')[1]}`
                let item = this._toolboxItems.get(toolboxItemId);
                if (item && !item.isSelected){
                    this._toolboxItems.forEach( value =>{
                        if (value.toolBoxItemType === penValue ||  
                            value.toolBoxItemType === eraserValue ||
                            value.toolBoxItemType === pointerValue){
                            value.isSelected = false;
                            value.divElement?.classList.remove(ToolBoxItem.hoverSelectedClass);
                        }
                    });
                    item.isSelected = true;
                    item.divElement?.classList.add(ToolBoxItem.hoverSelectedClass);
                    if (item.toolBoxItemType === eraserValue){
                        let eraserToolBoxItem = item as EraserToolBoxItem;
                        eraserToolBoxItem.enable(item.id, item.isSelected)
                    }
                    //Raise Event 
                    let eraserSelectedEvent = new EraserSelectedEvent(settings);
                    EventAggregator.publish(eraserSelectedEvent);
                }
            }
        });
       
    }

    private initializeRuler(id : string){
        let rulerType = ToolBoxItemType.Ruler;

        if (id === `svg-ruler#2`){
            rulerType = ToolBoxItemType.Protractor;
        }
        else if (id === `svg-ruler#3`){
            rulerType = ToolBoxItemType.SetSquare;
        }

        let ruler = new ToolBoxItem(id, rulerType);        
   
        this._toolboxItems.set(id, ruler);

        ruler.divElement?.addEventListener(`click`, (event) =>{
            if (event.currentTarget){
                
                let clickedElement = event.currentTarget as HTMLElement;
                 let toolboxItemId = `svg-ruler#${clickedElement.id.split('#')[1]}`
                let rulerToolBoxItem = this._toolboxItems.get(toolboxItemId);
                if (rulerToolBoxItem ){
                    if (!rulerToolBoxItem.isSelected){
                        rulerToolBoxItem.divElement?.classList.add(ToolBoxItem.hoverSelectedClass);
                    }
                    else{
                        rulerToolBoxItem.divElement?.classList.remove(ToolBoxItem.hoverSelectedClass);
                    }

                    rulerToolBoxItem.isSelected = !rulerToolBoxItem.isSelected;
                    if (rulerToolBoxItem.isSelected){
                        let addRulerEvent = new AddRulerEvent(toolboxItemId, rulerType);
                        EventAggregator.publish(addRulerEvent)
                    }
                    else{
                        let removeRulerEvent = new RemoveRulerEvent(toolboxItemId, rulerType);
                        EventAggregator.publish(removeRulerEvent)
                    }
                }
            }
        });
    }

    private initializePen(id : string, color : string, isSelected : boolean):void{

        let settings = new BasePenSettings(color, 1);

        let pen = new PenToolBoxItem(id, settings);
        pen.isSelected = isSelected;
       
        this._toolboxItems.set(id, pen);
        pen.drawPenSVG();
        let penValue = ToolBoxItemType.Pen;
        let eraserValue = ToolBoxItemType.Eraser;
        let pointerValue = ToolBoxItemType.Pointer;
        let compassValue = ToolBoxItemType.Compass;
        pen.divElement?.addEventListener(`click`, (event) =>{
            event.stopPropagation();
            if (event.currentTarget){
                document.body.style.touchAction ='none';
                let clickedElement = event.currentTarget as HTMLElement;
                let toolboxItemId = `svg-pen#${clickedElement.id.split('#')[1]}`
                let item = this._toolboxItems.get(toolboxItemId);
                if (item && !item.isSelected){
                    this._toolboxItems.forEach( value =>{
                        if (value.toolBoxItemType === penValue ||  
                            value.toolBoxItemType === eraserValue ||
                            value.toolBoxItemType === pointerValue){
                            value.isSelected = false;
                            value.divElement?.classList.remove(ToolBoxItem.hoverSelectedClass);
                            if (value.toolBoxItemType === penValue){
                                let penToolBoxItem = value as PenToolBoxItem;
                                penToolBoxItem.enable(value.id, value.isSelected)
                            }
                        }
                    }, false);
    
                    item.isSelected = true;
                    item.divElement?.classList.add(ToolBoxItem.hoverSelectedClass);
                    if (item.toolBoxItemType === penValue){
                        let penToolBoxItem = item as PenToolBoxItem;
                        penToolBoxItem.enable(item.id, item.isSelected)
                    }
                    //Raise Event
                    let penSelectedEvent = new PenSelectedEvent(toolboxItemId, settings);
                    EventAggregator.publish(penSelectedEvent);
                }
            }
        });
    }

    private initializeCompass(id : string):void{

        let settings = new BaseCompassSettings('#000000', 1);
        let compass = new CompassToolBoxItem(id, settings);
        compass.isSelected = false;
        this._toolboxItems.set(id, compass);
        compass.drawCompassSVG();
        compass.divElement?.addEventListener(`click`, (event) =>{
            if (event.currentTarget){
                
                let clickedElement = event.currentTarget as HTMLElement;
                 let toolboxItemId = `svg-compass#${clickedElement.id.split('#')[1]}`
                let item = this._toolboxItems.get(toolboxItemId);
                if (item ){
                    if (!item.isSelected){
                        item.divElement?.classList.add(ToolBoxItem.hoverSelectedClass);
                    }
                    else{
                        item.divElement?.classList.remove(ToolBoxItem.hoverSelectedClass);
                    }

                    item.isSelected = !item.isSelected;
                   
                    let compassToolBoxItem = item as CompassToolBoxItem;
                    compassToolBoxItem.enable(item.id, item.isSelected)
                   
                    //Raise Event
                    if (compassToolBoxItem.isSelected){
                        let addCompassEvent = new AddCompassEvent(toolboxItemId, settings);
                        EventAggregator.publish(addCompassEvent);
                    }
                    else{
                        let removeCompassEvent = new RemoveCompassEvent(toolboxItemId);
                        EventAggregator.publish(removeCompassEvent)

                    }
                }
            }
        });
       
    }

    resetSelection(){

        let penValue = ToolBoxItemType.Pen;
        let eraserValue = ToolBoxItemType.Eraser;
        let pointerValue = ToolBoxItemType.Pointer;
        let compassValue = ToolBoxItemType.Compass;

        this._toolboxItems.forEach(item =>{
           
                item.isSelected = false;
                item.divElement?.classList.remove(ToolBoxItem.hoverSelectedClass);
                if (item.toolBoxItemType === penValue){
                    let penToolBoxItem = item as PenToolBoxItem;
                    penToolBoxItem.enable(item.id, item.isSelected)
                }
                else if (item.toolBoxItemType === eraserValue){
                    let eraserToolBoxItem = item as EraserToolBoxItem;
                    eraserToolBoxItem.enable(item.id, item.isSelected)
                }

                else if (item.toolBoxItemType === compassValue){
                    let compassToolBoxItem = item as CompassToolBoxItem;
                    compassToolBoxItem.enable(item.id, item.isSelected)
                }
        });
    }

}7