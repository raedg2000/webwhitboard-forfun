import {Point} from './Point';
import { BasePenSettings } from './BasePenSettings';
import {ToolBoxItem} from './ToolBoxItem'
import { ToolBoxItemType } from './ToolBoxItemType';
import { PenMenuSettingsOpenEvent, PenSettingsChangedEvent } from './PenDrawingEvents';
import { EventAggregator } from './EventAggregator';
import { IEventHandler } from "./IEventHandler";
import { BaseDrawingEvent } from './BaseDrawingEvent';

export class PenToolBoxItem extends ToolBoxItem implements IEventHandler {

    private _borderColor : string = '#000000'; // border color
    private _borderWidth : string = "1"; 
    private _width : number = 0;
    private _height : number = 0;
    private _maxThickness : number = 25;
    protected _settings : BasePenSettings;

    constructor (id: string , settings : BasePenSettings ){
        super(id, ToolBoxItemType.Pen);
       
        this._settings = settings;
        this._width = Number(this._svgElement?.clientWidth);
        this._height = Number(this._svgElement?.clientHeight);

        this.addPenMenuExpanderEvent()
        EventAggregator.subscribe('PenSettingsChangedEvent', this);

    }

    get settings() : BasePenSettings{
        return this._settings;
    }

    set settings(value : BasePenSettings) {
        this._settings = value;
    }

    private addPenMenuExpanderEvent(){
        let element : any = document.getElementById(`penMenuExpander#${this.id.split('#')[1]}`);
       
        if (element){
            let penMenuExpander = element as SVGPathElement;
            penMenuExpander.addEventListener('mouseup', (event) =>{
                event.stopPropagation();
                let tempElement = event.currentTarget as SVGMPathElement;
                if (tempElement && tempElement.dataset.enabled === 'true' && this._settings && this.isSelected){
                    if (this._settings.thickness === 0){
                        this._settings.thickness = 1;
                    }
                
                    let penMenuSettingsOpenEvent = new PenMenuSettingsOpenEvent(this.id, this._settings, this.divElement?.getBoundingClientRect());
                    EventAggregator.publish(penMenuSettingsOpenEvent);
                    //
                }
            });
        }
    }

    
    private findthicknessRect(id :string) : SVGRectElement | undefined{

           let thicknessRectId = `pen-svg-thickness-rect#${id.split('#')[1]}`;
           let tempElement : any = document.getElementById(thicknessRectId);
           return (tempElement as SVGRectElement);
    }

    private setThicknessRectHeightAttributes (thicknessRect: SVGRectElement | undefined){
        if (thicknessRect && this._settings){
            let x = thicknessRect.dataset?.x ?? '0';
            let y = Number(thicknessRect.dataset?.y) - this._settings?.thickness/2;
            thicknessRect.setAttribute('x',  `${x}`);
            thicknessRect.setAttribute('y',  `${y}`);
            thicknessRect.setAttribute('height',  `${this._settings?.thickness}`);
            thicknessRect.setAttribute('fill', `${this._settings?.color}`);
        }
    }

    private findPenColorSection(id :string) : SVGRectElement | undefined{

        let penTipId = `colorSection#${id.split('#')[1]}`;
        let tempElement : any = document.getElementById(penTipId);
        return (tempElement as SVGRectElement);

    }

    private UpdatePenColorSectionAttributes (colorSection: SVGRectElement | undefined){
        if (colorSection && this._settings){
            colorSection.setAttribute('fill', `${this._settings?.color}`);
        }
    }

    private findPenTip(id :string) : SVGPathElement | undefined{
        let penTipId = `penTip#${id.split('#')[1]}`;
        let tempElement : any = document.getElementById(penTipId);
        return (tempElement as SVGRectElement);
    }

    private UpdatePenTipColorAttributes (penTip: SVGPathElement | undefined){
        if (penTip && this._settings){
            penTip.setAttribute('fill', `${this._settings?.color}`);
        }
    }
   

    
    drawPenSVG(){
        if (this._svgElement){
            let penShape = document.createElementNS("http://www.w3.org/2000/svg", "g");
            penShape.id = `penShape#${this.id.split('#')[1]}`;
            penShape.setAttribute('style', `pointer-events: auto`);
            
            //draw main shape
            let penWidth = 20;
            let topCenter = new Point(this._width /2, this._height/10);
            let topLeftCylinder = new Point(topCenter.x - penWidth/2, topCenter.y + 25);
            let buttomLeftCylinder = new Point(topLeftCylinder.x, topLeftCylinder.y + 40);
            let buttomRightCylinder = new Point(topCenter.x + penWidth/2, topLeftCylinder.y + 40);
            let topRightCylinder = new Point(topCenter.x + penWidth/2 , topCenter.y + 25);

            let pathString = ` M ${topCenter.x} ${topCenter.y} 
                               L ${topLeftCylinder.x} ${topLeftCylinder.y} 
                               L ${buttomLeftCylinder.x} ${buttomLeftCylinder.y}
                               L ${buttomRightCylinder.x} ${buttomRightCylinder.y}
                               L ${topRightCylinder.x} ${topRightCylinder.y}
                               L ${topCenter.x} ${topCenter.y} 
                              `;
            let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute('d', pathString);
            path.setAttribute('stroke', this._borderColor);
            path.setAttribute('stroke-width', this._borderWidth);
            path.setAttribute('fill', 'transparent');

            penShape.appendChild(path);
           
            let buttomLeftPenTip = new Point(topCenter.x - 5, topCenter.y + 12.5);
            let buttomRightPenTip = new Point(topCenter.x + 5, topCenter.y + 12.5);
       

            pathString = ` M ${topCenter.x} ${topCenter.y} 
            L ${buttomLeftPenTip.x} ${buttomLeftPenTip.y} 
            L ${buttomRightPenTip.x} ${buttomRightPenTip.y} 
            L ${topCenter.x} ${topCenter.y} 
           `;
            
            let penTip = document.createElementNS("http://www.w3.org/2000/svg", "path");
            penTip.id  = `penTip#${this.id.split('#')[1]}`;
            penTip.setAttribute('d', pathString);
            penTip.setAttribute('stroke', `transparent`);
            penTip.setAttribute('stroke-width', '0.5');
            penTip.setAttribute('fill', `${this._settings?.color}`);

            penShape.appendChild(penTip);

            let colorSection = document.createElementNS("http://www.w3.org/2000/svg", "rect");
             colorSection.id = `colorSection#${this.id.split('#')[1]}`;
            let topLeftRectangle = new Point(topLeftCylinder.x, topLeftCylinder.y);

            colorSection.setAttribute('x',  `${topLeftRectangle.x + 0.5}`);
            colorSection.setAttribute('y',  `${topLeftRectangle.y}`);
            colorSection.setAttribute('stroke', `transparent`);
            colorSection.setAttribute('stroke-width', '0.5');
            colorSection.setAttribute('height',  `${buttomLeftCylinder.y - topLeftRectangle.y}`);
            colorSection.setAttribute('width',  `${topRightCylinder.x - topLeftRectangle.x - 1}`);
            colorSection.setAttribute('fill',  `${this._settings?.color}`);
            penShape.appendChild(colorSection);

            this._svgElement.appendChild(penShape);

            let thicknessSection = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            thicknessSection.id = `pen-svg-thickness-section#${this.id.split('#')[1]}`;
            thicknessSection.setAttribute('x',  `${buttomLeftCylinder.x}`);
            thicknessSection.setAttribute('y',  `${buttomLeftCylinder.y}`);
            thicknessSection.setAttribute('stroke', this._borderColor);
            thicknessSection.setAttribute('stroke-width', this._borderWidth);
            thicknessSection.setAttribute('height',  `30`);
            thicknessSection.setAttribute('width',  `${topRightCylinder.x - topLeftRectangle.x}`);
            thicknessSection.setAttribute('fill',  `transparent`);
            thicknessSection.setAttribute('style', `pointer-events: auto`);
            
            penShape.appendChild(thicknessSection);

            let thicknessRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            thicknessRect.dataset.x = `${buttomLeftCylinder.x + 2}`;
            thicknessRect.dataset.y = `${buttomLeftCylinder.y + 15}`;
            thicknessRect.id = `pen-svg-thickness-rect#${this.id.split('#')[1]}`;
            thicknessRect.setAttribute('stroke', `${this._settings?.color}`);
            thicknessRect.setAttribute('stroke-width', '0.5');
            thicknessRect.setAttribute('style', `pointer-events: none`);
            thicknessRect.setAttribute('width',  `${topRightCylinder.x - topLeftRectangle.x - 4}`);
            this.setThicknessRectHeightAttributes(thicknessRect);
            penShape.appendChild(thicknessRect);

            pathString = ` M ${topCenter.x -7} ${buttomLeftCylinder.y + 37} 
            L ${topCenter.x} ${buttomLeftCylinder.y + 45} 
            L ${topCenter.x + 7} ${buttomLeftCylinder.y + 37} 
            L ${topCenter.x -7} ${buttomLeftCylinder.y + 37} 
           `;
            
            let penMenuExpander = document.createElementNS("http://www.w3.org/2000/svg", "path");
            penMenuExpander.id = `penMenuExpander#${this.id.split('#')[1]}`;
            penMenuExpander.setAttribute('d', pathString);
            penMenuExpander.setAttribute('stroke', `transparent`);
            penMenuExpander.setAttribute('stroke-width', '0.5');
            penMenuExpander.setAttribute('fill', `Gray`);
            penMenuExpander.setAttribute('style', `pointer-events: auto`);
            penMenuExpander.dataset.enabled = 'false';
            penMenuExpander.addEventListener('mouseup', (event) =>{
                event.stopPropagation();
                let tempElement = event.currentTarget as SVGMPathElement;
                if (tempElement && tempElement.dataset.enabled === 'true' && this._settings && this.isSelected){
                    if (this._settings.thickness === 0){
                        this._settings.thickness = 1;
                    }
                   
                    let penMenuSettingsOpenEvent = new PenMenuSettingsOpenEvent(this.id, this._settings, this.divElement?.getBoundingClientRect());
                    EventAggregator.publish(penMenuSettingsOpenEvent);
                    //
                }
            });
            penShape.appendChild(penMenuExpander);
           
        }
    }

    enable(id : string, enable: boolean){
        let penThicknessExpanderId = `penMenuExpander#${this.id.split('#')[1]}`;
        let tempElement: any = document.getElementById(penThicknessExpanderId);
        let penMenuExpander = tempElement as SVGPathElement;
        if (penMenuExpander){
            penMenuExpander.dataset.enabled = enable.toString();
            if (enable){
                penMenuExpander.setAttribute('fill', `black`);
            }
            else{
                penMenuExpander.setAttribute('fill', `Gray`);
            }
        }
    }

    handle(eventData: BaseDrawingEvent):void{
        let penSettingsChangedEvent = eventData as PenSettingsChangedEvent;
        if (this.id === penSettingsChangedEvent.penId){
            this.settings = penSettingsChangedEvent.settings;
            this.setThicknessRectHeightAttributes(this.findthicknessRect(penSettingsChangedEvent.penId));
            this.UpdatePenColorSectionAttributes(this.findPenColorSection(penSettingsChangedEvent.penId));
            this.UpdatePenTipColorAttributes(this.findPenTip(penSettingsChangedEvent.penId));
        }
    }

    reset(): void {
        this.isSelected = false;
        this.enable(this._id, this.isSelected);
        this.settings.reset();
        this.setThicknessRectHeightAttributes(this.findthicknessRect(this._id));
        this.UpdatePenColorSectionAttributes(this.findPenColorSection(this._id));
        this.UpdatePenTipColorAttributes(this.findPenTip(this._id));
    }
    // drawPenSVG1(){
    //     if (this._svgElement){
    //         let penShape = document.createElementNS("http://www.w3.org/2000/svg", "g");
    //         penShape.id = `penShape#${this.id.split('#')[1]}`;
    //         penShape.setAttribute('style', `pointer-events: auto`);
            
    //         //draw main shape
    //         let topCenter = new Point(this._width /2, this._height/10);
    //         let topLeftCylinder = new Point(topCenter.x- 10, topCenter.y + 25);
    //         let buttomLeftCylinder = new Point(topLeftCylinder.x, topLeftCylinder.y + 40);
    //         let buttomRightCylinder = new Point(topCenter.x + 10, topLeftCylinder.y + 40);
    //         let topRightCylinder = new Point(topCenter.x + 10, topCenter.y + 25);

    //         let pathString = ` M ${topCenter.x} ${topCenter.y} 
    //                            L ${topLeftCylinder.x} ${topLeftCylinder.y} 
    //                            L ${buttomLeftCylinder.x} ${buttomLeftCylinder.y}
    //                            L ${buttomRightCylinder.x} ${buttomRightCylinder.y}
    //                            L ${topRightCylinder.x} ${topRightCylinder.y}
    //                            L ${topCenter.x} ${topCenter.y} 
    //                           `;
    //         let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    //         path.setAttribute('d', pathString);
    //         path.setAttribute('stroke', this._borderColor);
    //         path.setAttribute('stroke-width', this._borderWidth);
    //         path.setAttribute('fill', 'transparent');

    //         penShape.appendChild(path);
           
    //         let buttomLeftPenTip = new Point(topCenter.x - 5, topCenter.y + 12.5);
    //         let buttomRightPenTip = new Point(topCenter.x + 5, topCenter.y + 12.5);
       

    //         pathString = ` M ${topCenter.x} ${topCenter.y} 
    //         L ${buttomLeftPenTip.x} ${buttomLeftPenTip.y} 
    //         L ${buttomRightPenTip.x} ${buttomRightPenTip.y} 
    //         L ${topCenter.x} ${topCenter.y} 
    //        `;
            
    //         let penTip = document.createElementNS("http://www.w3.org/2000/svg", "path");
    //         penTip.setAttribute('d', pathString);
    //         penTip.setAttribute('stroke', `transparent`);
    //         penTip.setAttribute('stroke-width', '0.5');
    //         penTip.setAttribute('fill', `${this._settings?.color}`);

    //         penShape.appendChild(penTip);

    //         let colorSection = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    //         let topLeftRectangle = new Point(topLeftCylinder.x, topLeftCylinder.y);

    //         colorSection.setAttribute('x',  `${topLeftRectangle.x + 0.5}`);
    //         colorSection.setAttribute('y',  `${topLeftRectangle.y}`);
    //         colorSection.setAttribute('stroke', `transparent`);
    //         colorSection.setAttribute('stroke-width', '0.5');
    //         colorSection.setAttribute('height',  `${buttomLeftCylinder.y - topLeftRectangle.y}`);
    //         colorSection.setAttribute('width',  `${topRightCylinder.x - topLeftRectangle.x - 1}`);
    //         colorSection.setAttribute('fill',  `${this._settings?.color}`);
    //         colorSection.setAttribute('style', `pointer-events: auto`);
    //         penShape.appendChild(colorSection);

    //         this._svgElement.appendChild(penShape);

    //         let thicknessSection = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    //         thicknessSection.id = `pen-svg-thickness-section#${this.id.split('#')[1]}`;
    //         thicknessSection.setAttribute('x',  `${buttomLeftCylinder.x}`);
    //         thicknessSection.setAttribute('y',  `${buttomLeftCylinder.y}`);
    //         thicknessSection.setAttribute('stroke', this._borderColor);
    //         thicknessSection.setAttribute('stroke-width', this._borderWidth);
    //         thicknessSection.setAttribute('height',  `15`);
    //         thicknessSection.setAttribute('width',  `${topRightCylinder.x - topLeftRectangle.x}`);
    //         thicknessSection.setAttribute('fill',  `transparent`);
    //         thicknessSection.setAttribute('style', `pointer-events: auto`);
    //         thicknessSection.addEventListener('mouseup', (event) =>{
    //             event.stopPropagation();
    //             if (this._settings && this.isSelected){
    //                 this._settings.thickness = ( this._settings.thickness + 1) % this._maxThickness ;
    //                 if (this._settings.thickness === 0){
    //                     this._settings.thickness = 1;
    //                 }
    //                 let tempElement = event.currentTarget as SVGRectElement;
    //                 if (tempElement){
    //                     this.setThicknessRectHeightAttributes(this.findthicknessRect(tempElement.id));
    //                 }
    //             }
    //         });
    //         penShape.appendChild(thicknessSection);

    //         let thicknessRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    //         thicknessRect.dataset.x = `${buttomLeftCylinder.x + 2}`;
    //         thicknessRect.dataset.y = `${buttomLeftCylinder.y + 7.5}`;
    //         thicknessRect.id = `pen-svg-thickness-rect#${this.id.split('#')[1]}`;
    //         thicknessRect.setAttribute('stroke', `${this._settings?.color}`);
    //         thicknessRect.setAttribute('stroke-width', '0.5');
    //         thicknessRect.setAttribute('style', `pointer-events: none`);
    //         thicknessRect.setAttribute('width',  `${topRightCylinder.x - topLeftRectangle.x - 4}`);
    //         this.setThicknessRectHeightAttributes(thicknessRect);
    //         penShape.appendChild(thicknessRect);
           
    //     }
    // }

}
