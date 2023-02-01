

import {Point} from './Point';
import {ToolBoxItem} from './ToolBoxItem'
import { ToolBoxItemType } from './ToolBoxItemType';

export class EraserToolBoxItem extends ToolBoxItem{

    private _borderColor : string = '#000000'; // border color
    private _borderWidth : string = "1"; 
    private _width : number = 0;
    private _height : number = 0;
    private _maxThickness : number = 7;

    constructor (id: string){
        super(id, ToolBoxItemType.Eraser);
        this._width = Number(this._svgElement?.clientWidth);
        this._height = Number(this._svgElement?.clientHeight);
    }

    get id() : string{
        return this._id;
    }

   
    drawEraserSVG(){
        if (this._svgElement ){
            let eraserShape = document.createElementNS("http://www.w3.org/2000/svg", "g");
            eraserShape.id = `eraserShape#${this.id.split('#')[1]}`;
            eraserShape.setAttribute('style', `pointer-events: auto`);
            
            //draw main shape
          
            let topLeft = new Point(this._width /2- 10, 2*this._height/10);
            let rect1 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect1.setAttribute('x',  `${topLeft.x}`);
            rect1.setAttribute('y',  `${topLeft.y}`);
            rect1.setAttribute('stroke', `transparent`);
            rect1.setAttribute('stroke-width', '0.5');
            rect1.setAttribute('height',  `22`);
            rect1.setAttribute('width',  `20`);
            rect1.setAttribute('fill',  `#FF7043`);
            eraserShape.appendChild(rect1);

            topLeft = new Point(this._width /2- 10, 2*this._height/10 + 22);
            let rect2 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect2.setAttribute('x',  `${topLeft.x}`);
            rect2.setAttribute('y',  `${topLeft.y}`);
            rect2.setAttribute('stroke', `transparent`);
            rect2.setAttribute('stroke-width', '0.5');
            rect2.setAttribute('height',  `5`);
            rect2.setAttribute('width',  `20`);
            rect2.setAttribute('fill',  `#CFD8DC`);
            eraserShape.appendChild(rect2);

            topLeft = new Point(this._width /2- 10, 2*this._height/10 + 27);
            let rect3 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect3.setAttribute('x',  `${topLeft.x}`);
            rect3.setAttribute('y',  `${topLeft.y}`);
            rect3.setAttribute('stroke', `transparent`);
            rect3.setAttribute('stroke-width', '0.5');
            rect3.setAttribute('height',  `5`);
            rect3.setAttribute('width',  `20`);
            rect3.setAttribute('fill',  `#78909C`);
            eraserShape.appendChild(rect3);

            topLeft = new Point(this._width /2- 10, 2*this._height/10 + 32);
            let rect4 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect4.setAttribute('x',  `${topLeft.x}`);
            rect4.setAttribute('y',  `${topLeft.y}`);
            rect4.setAttribute('stroke', `transparent`);
            rect4.setAttribute('stroke-width', '0.5');
            rect4.setAttribute('height',  `5`);
            rect4.setAttribute('width',  `20`);
            rect4.setAttribute('fill',  `#CFD8DC`);
            eraserShape.appendChild(rect4);

            topLeft = new Point(this._width /2- 10, 2*this._height/10 + 37);
            let rect5 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect5.setAttribute('x',  `${topLeft.x}`);
            rect5.setAttribute('y',  `${topLeft.y}`);
            rect5.setAttribute('stroke', `transparent`);
            rect5.setAttribute('stroke-width', '0.5');
            rect5.setAttribute('height',  `5`);
            rect5.setAttribute('width',  `20`);
            rect5.setAttribute('fill',  `#78909C`);
            eraserShape.appendChild(rect5);

            topLeft = new Point(this._width /2- 10, 2*this._height/10 + 42);
            let rect6 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect6.setAttribute('x',  `${topLeft.x}`);
            rect6.setAttribute('y',  `${topLeft.y}`);
            rect6.setAttribute('stroke', `transparent`);
            rect6.setAttribute('stroke-width', '0.5');
            rect6.setAttribute('height',  `27`);
            rect6.setAttribute('width',  `20`);
            rect6.setAttribute('fill',  `#FFA726`);
            eraserShape.appendChild(rect6);

                      
            this._svgElement.appendChild(eraserShape);
        }
    }

}