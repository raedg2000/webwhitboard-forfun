import {Point} from './Point';
import { BaseCompassSettings } from './BaseCompassSettings';
import {ToolBoxItem} from './ToolBoxItem'
import { ToolBoxItemType } from './ToolBoxItemType';
import { EventAggregator } from './EventAggregator';
import { IEventHandler } from "./IEventHandler";
import { BaseDrawingEvent } from './BaseDrawingEvent';
import { CompassMenuSettingsOpenEvent, CompassSettingsChangedEvent } from './CompassDrawingEvents';

export class CompassToolBoxItem extends ToolBoxItem{
   
    private _borderColor : string = '#000000'; // border color
    private _borderWidth : string = "1"; 
    private _width : number = 0;
    private _height : number = 0;
    private _maxThickness : number = 25;
    protected _settings : BaseCompassSettings;

    constructor (id: string , settings : BaseCompassSettings ){
        super(id, ToolBoxItemType.Pen);
       
        this._settings = settings;
        this._width = Number(this._svgElement?.clientWidth);
        this._height = Number(this._svgElement?.clientHeight);

        EventAggregator.subscribe('CompassSettingsChangedEvent', this);
    }

    get settings() : BaseCompassSettings{
        return this._settings;
    }

    set settings(value : BaseCompassSettings) {
        this._settings = value;
    }

    drawCompassSVG(){
        if (this._svgElement){
            let compassShape = document.createElementNS("http://www.w3.org/2000/svg", "g");
            compassShape.id = `compassShape#${this.id.split('#')[1]}`;
            compassShape.setAttribute('style', `pointer-events: auto`);


            let topLeftRectangle = new Point(this._width/2 - 4, 5*this._height/10);

            let middleRectangle = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            middleRectangle.id = `compassColorSection#${this.id.split('#')[1]}`;
            middleRectangle.setAttribute('style', `pointer-events: none`);
            middleRectangle.setAttribute('x',  `${topLeftRectangle.x}`);
            middleRectangle.setAttribute('y',  `${topLeftRectangle.y}`);
            middleRectangle.setAttribute('stroke', `transparent`);
            middleRectangle.setAttribute('stroke-width', '0.5');
            middleRectangle.setAttribute('height',  `24`);
            middleRectangle.setAttribute('width',  `8`);
            middleRectangle.setAttribute('fill',  `${this.settings.color}`);
            compassShape.appendChild(middleRectangle);

            this._svgElement.appendChild(compassShape);
            
            // <line x1="0" y1="80" x2="100" y2="20" stroke="black" />
            let x1 = this._width/15;
            let y1 = topLeftRectangle.y + this._height/10;
            let middleHorizontalLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
            middleHorizontalLine.setAttribute('style', `pointer-events: none`);
            middleHorizontalLine.setAttribute('x1',  `${x1}`);
            middleHorizontalLine.setAttribute('y1',  `${y1}`);
            middleHorizontalLine.setAttribute('x2',  `${this._width - x1}`);
            middleHorizontalLine.setAttribute('y2',  `${y1}`);
            middleHorizontalLine.setAttribute('stroke', `#71B1F5`);
            middleHorizontalLine.setAttribute('stroke-width', '2');

            this._svgElement.appendChild(middleHorizontalLine);

            //left hand
            let y = 3.5* this._height/10;
            let topLeft = new Point(this._width/2 - 1.5*this._width/10, y);
            let topRight = new Point(this._width/2 + 1.5*this._width/10, y);

            
            let topMiddle = new Point(this._width/2, y + 5);
           
            let bottomLeft = new Point(1.5*this._width/10, 7.5*this._height/10);
            let bottomRight = new Point(this._width - 1.5*this._width/10, 7.5*this._height/10);

            let pathString = ` M ${topLeft.x} ${topLeft.y} 
                               L ${topRight.x} ${topRight.y} 
                               L ${bottomRight.x} ${bottomRight.y}
                               L ${topMiddle.x} ${topMiddle.y}
                               L ${bottomLeft.x} ${bottomLeft.y}
                               L ${topLeft.x} ${topLeft.y} 
                              `;
            let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute('style', `pointer-events: none`);
            path.setAttribute('d', pathString);
            path.setAttribute('stroke', '#71B1F5');
            path.setAttribute('stroke-width', this._borderWidth);
            path.setAttribute('fill', '#71B1F5');

            compassShape.appendChild(path);

            let upperRectangle = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            topLeftRectangle = new Point(this._width/2 - 3, 1.5*this._height/10);

            upperRectangle.setAttribute('x',  `${topLeftRectangle.x}`);
            upperRectangle.setAttribute('y',  `${topLeftRectangle.y}`);
            upperRectangle.setAttribute('stroke', `#71B1F5`);
            upperRectangle.setAttribute('stroke-width', '0.5');
            upperRectangle.setAttribute('height',  `24`);
            upperRectangle.setAttribute('width',  `6`);
            upperRectangle.setAttribute('fill',  `#71B1F5`);
            compassShape.appendChild(upperRectangle);

            this._svgElement.appendChild(compassShape);
            let topCenter = new Point(this._width /2, this._height/10);

            y = topCenter.y + 65;
            pathString = ` M ${topCenter.x -7} ${y+ 37} 
            L ${topCenter.x} ${y + 45} 
            L ${topCenter.x + 7} ${y + 37} 
            L ${topCenter.x -7} ${y + 37} 
           `;
            
            let compassMenuExpander = document.createElementNS("http://www.w3.org/2000/svg", "path");
            compassMenuExpander.id = `compassMenuExpander#${this.id.split('#')[1]}`;
            compassMenuExpander.setAttribute('d', pathString);
            compassMenuExpander.setAttribute('stroke', `transparent`);
            compassMenuExpander.setAttribute('stroke-width', '0.5');
            compassMenuExpander.setAttribute('fill', `Gray`);
            compassMenuExpander.setAttribute('style', `pointer-events: auto`);
            compassMenuExpander.dataset.enabled = 'false';
            compassMenuExpander.addEventListener('mousedown', (event) =>{
                event.stopPropagation();
                event.preventDefault();
                let tempElement = event.currentTarget as SVGMPathElement;
                if (tempElement && tempElement.dataset.enabled === 'true' && this._settings && this.isSelected){
                    if (this._settings.thickness === 0){
                        this._settings.thickness = 1;
                    }
                   
                    let compassMenuSettingsOpenEvent = new CompassMenuSettingsOpenEvent(this.id, this._settings, this.divElement?.getBoundingClientRect());
                    EventAggregator.publish(compassMenuSettingsOpenEvent);
                    //
                }
            });
            compassShape.appendChild(compassMenuExpander);
           
        }
    }
    
    enable(id : string, enable: boolean){
        let compassMenuExpanderId = `compassMenuExpander#${this.id.split('#')[1]}`;
        let tempElement: any = document.getElementById(compassMenuExpanderId);
        let compassMenuExpander = tempElement as SVGPathElement;
        if (compassMenuExpander){
            compassMenuExpander.dataset.enabled = enable.toString();
            if (enable){
                compassMenuExpander.setAttribute('fill', `black`);
            }
            else{
                compassMenuExpander.setAttribute('fill', `Gray`);
            }
        }
    }

    handle(eventData: BaseDrawingEvent):void{
        let compassSettingsChangedEvent = eventData as CompassSettingsChangedEvent;
        if (this.id === compassSettingsChangedEvent.compassId){
            this.settings = compassSettingsChangedEvent.settings;
            let compassMenuExpander = document.getElementById(`compassColorSection#${this.id.split('#')[1]}`);
            compassMenuExpander?.setAttribute('fill', this.settings.color);
        }
    } 
}