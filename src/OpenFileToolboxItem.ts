

import {Point} from './Point';
import {ToolBoxItem} from './ToolBoxItem'
import { ToolBoxItemType } from './ToolBoxItemType';

export class OpenFileToolboxItem extends ToolBoxItem{

    private _borderColor : string = '#FFF9C4'; // border color
    private _borderWidth : string = "0.5"; 

    private _width : number = 0;
    private _height : number = 0;
    private _maxThickness : number = 7;

    constructor (id: string){
        super(id, ToolBoxItemType.OpenFile);
        this._width = Number(this._svgElement?.clientWidth);
        this._height = Number(this._svgElement?.clientHeight);
    }

    drawOpenFileSVG(){
        if (this._svgElement){
            let openFileShape = document.createElementNS("http://www.w3.org/2000/svg", "g");
            openFileShape.id = `openFileShape#${this.id.split('#')[1]}`;
            openFileShape.setAttribute('style', `pointer-events: auto`);
            
            //draw main shape
            let topLeft = new Point(this._width /10, this._height/4);
            let topRight = new Point(4*this._width /10, this._height/4);
            let secondTopRight  = new Point(5*this._width /10, this._height/4 + this._width/10);
            let thirdTopRight  = new Point(8*this._width /10, this._height/4 + this._width/10);
            let ButtomRight  = new Point(thirdTopRight.x, secondTopRight.y + 1.5*this._height/4);
            let ButtomLeft  = new Point(topLeft.x, secondTopRight.y + 1.5*this._height/4);
            
            let pathString = ` M ${topLeft.x} ${topLeft.y} 
            L ${topRight.x} ${topRight.y} 
            L ${secondTopRight.x} ${secondTopRight.y}
            L ${thirdTopRight.x} ${thirdTopRight.y}
            L ${ButtomRight.x} ${ButtomRight.y}
            L ${ButtomLeft.x} ${ButtomLeft.y}
            L ${topLeft.x} ${topLeft.y} 
           `;
            let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute('d', pathString);
            path.setAttribute('stroke', this._borderColor);
            path.setAttribute('stroke-width', this._borderWidth);
            path.setAttribute('fill', '#FBC02D');

            openFileShape.appendChild(path);

            topRight = new Point(2*this._width /10, this._height/4 + 15);
            secondTopRight  = new Point(3*this._width /10, this._height/4 + 15);

            pathString = ` M ${ButtomLeft.x} ${ButtomLeft.y} 
            L ${topRight.x } ${topRight.y}
            L ${secondTopRight.x + 5} ${topRight.y}
            L ${secondTopRight.x + 10} ${secondTopRight.y - 5}
            L ${thirdTopRight.x + 5} ${secondTopRight.y - 5}
            L ${ButtomRight.x} ${ButtomRight.y}
            L ${ButtomLeft.x} ${ButtomLeft.y}
            L ${topLeft.x} ${topLeft.y} 
           `;

            path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute('d', pathString);
            path.setAttribute('stroke', this._borderColor);
            path.setAttribute('stroke-width', this._borderWidth);
            path.setAttribute('fill', '#FDD835');

            openFileShape.appendChild(path);

            let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttributeNS(null, "x", `${ButtomLeft.x}`);
            text.setAttributeNS(null, "y", `${ButtomLeft.y + 18}`);
            text.setAttributeNS(null, "class", "svgText");
            // text.setAttributeNS(null, "font-size", "14px");
            // text.setAttributeNS(null, "font-weight","bold");
            const textNode = document.createTextNode('Open');
            text.appendChild(textNode);
            openFileShape.appendChild(text);

            this._svgElement.appendChild(openFileShape);
        }
    }

}
