
import {Point} from './Point';
import {ToolBoxItem} from './ToolBoxItem'
import { ToolBoxItemType } from './ToolBoxItemType';

export class ClearCanvasToolboxItem extends ToolBoxItem{

    private _borderColor : string = '#1976D2'; // border color
    private _borderWidth : string = "1.5"; 
    private _width : number = 0;
    private _height : number = 0;
    private _maxThickness : number = 7;

    constructor (id: string){
        super(id, ToolBoxItemType.Clear);
        this._width = Number(this._svgElement?.clientWidth);
        this._height = Number(this._svgElement?.clientHeight);
    }

    get id() : string{
        return this._id;
    }

    drawClearCanvasSVG(){
        if (this._svgElement){
            let clearCanvasShape = document.createElementNS("http://www.w3.org/2000/svg", "g");
            clearCanvasShape.id = `clearCanvasShape#${this.id.split('#')[1]}`;
            clearCanvasShape.setAttribute('style', `pointer-events: auto`);
            
            //draw main shape
            let topLeft = new Point(this._width /10 - 2, this._height/4 );
          
            let rect1 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect1.setAttribute('x',  `${topLeft.x}`);
            rect1.setAttribute('y',  `${topLeft.y}`);
            rect1.setAttribute('stroke', `${this._borderColor}`);
            rect1.setAttribute('stroke-width', '0.5');
            rect1.setAttribute('height',  `5`);
            rect1.setAttribute('width',  `${8*this._width /10 + 4}`);
            rect1.setAttribute('fill',  `${this._borderColor}`);
            clearCanvasShape.appendChild(rect1);

            topLeft = new Point(this._width /10, this._height/4 + 5);
            let topRight = new Point(9*this._width /10, this._height/4 + 5);
            let ButtomRight  = new Point(7*this._width /10, topLeft.y + 1.5*this._height/4);
            let ButtomLeft  = new Point(3*topLeft.x, topLeft.y + 1.5*this._height/4);

            let pathString = ` M ${topLeft.x} ${topLeft.y} 
            L ${topRight.x} ${topRight.y} 
            L ${ButtomRight.x} ${ButtomRight.y}
            L ${ButtomLeft.x} ${ButtomLeft.y}
            L ${topLeft.x} ${topLeft.y} 
           `;
            let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute('d', pathString);
            path.setAttribute('stroke', this._borderColor);
            path.setAttribute('stroke-width', this._borderWidth);
            path.setAttribute('fill', '#4FC3F7');

            clearCanvasShape.appendChild(path);

            let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttributeNS(null, "x", `${topLeft.x + 5}`);
            text.setAttributeNS(null, "y", `${ButtomLeft.y + 18}`);
            text.setAttributeNS(null, "class", "svgText");
            // text.setAttributeNS(null, "font-size", "14px");
            // text.setAttributeNS(null, "font-weight","bold");
            const textNode = document.createTextNode('Clear');
            text.appendChild(textNode);
            clearCanvasShape.appendChild(text);

            this._svgElement.appendChild(clearCanvasShape);
        }
    }

}