

import {Point} from './Point';
import {ToolBoxItem} from './ToolBoxItem'
import { ToolBoxItemType } from './ToolBoxItemType';

export class SaveFileToolboxItem extends ToolBoxItem{

    private _borderColor : string = '#000000'; // border color
    private _borderWidth : string = "0.5"; 

    private _width : number = 0;
    private _height : number = 0;
    private _maxThickness : number = 7;

    constructor (id: string){
        super(id, ToolBoxItemType.Save);
        this._width = Number(this._svgElement?.clientWidth);
        this._height = Number(this._svgElement?.clientHeight);
    }

    drawSaveFileSVG(){
        if (this._svgElement){
            let saveFileShape = document.createElementNS("http://www.w3.org/2000/svg", "g");
            saveFileShape.id = `saveFileShape#${this.id.split('#')[1]}`;
            saveFileShape.setAttribute('style', `pointer-events: auto`);
            
            //draw main shape
            let topLeft = new Point(this._width /10, this._height/4);
            let topRight = new Point(8*this._width /10, this._height/4);
            let secondTopRight  = new Point(9*this._width /10, this._height/4 + this._width/10);
            let ButtomRight  = new Point(secondTopRight.x, secondTopRight.y + 1.5*this._height/4);
            let ButtomLeft  = new Point(topLeft.x, secondTopRight.y + 1.5*this._height/4);
            
            let pathString = ` M ${topLeft.x} ${topLeft.y} 
            L ${topRight.x} ${topRight.y} 
            L ${secondTopRight.x} ${secondTopRight.y}
            L ${ButtomRight.x} ${ButtomRight.y}
            L ${ButtomLeft.x} ${ButtomLeft.y}
            L ${topLeft.x} ${topLeft.y} 
           `;
            let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute('d', pathString);
            path.setAttribute('stroke', this._borderColor);
            path.setAttribute('stroke-width', this._borderWidth);
            path.setAttribute('fill', '#0288D1');

            saveFileShape.appendChild(path);

            let rect1 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect1.setAttribute('x',  `${topLeft.x + 5}`);
            rect1.setAttribute('y',  `${topLeft.y}`);
            rect1.setAttribute('stroke', `transparent`);
            rect1.setAttribute('stroke-width', '0.5');
            rect1.setAttribute('height',  `${20}`);
            rect1.setAttribute('width',  `${topRight.x - topLeft.x - 10}`);
            rect1.setAttribute('fill',  `#0D47A1`);
            saveFileShape.appendChild(rect1);

            let rect2 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect2.setAttribute('x',  `${topLeft.x + 10}`);
            rect2.setAttribute('y',  `${topLeft.y}`);
            rect2.setAttribute('stroke', `transparent`);
            rect2.setAttribute('stroke-width', '0.5');
            rect2.setAttribute('height',  `${20}`);
            rect2.setAttribute('width',  `${topRight.x - topLeft.x - 10}`);
            rect2.setAttribute('fill',  `#CFD8DC`);
            saveFileShape.appendChild(rect2);

            let rect3 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect3.setAttribute('x',  `${topRight.x - 12}`);
            rect3.setAttribute('y',  `${topRight.y + 2}`);
            rect3.setAttribute('stroke', `transparent`);
            rect3.setAttribute('stroke-width', '0.5');
            rect3.setAttribute('height',  `${16}`);
            rect3.setAttribute('width',  `${10}`);
            rect3.setAttribute('fill',  `#0288D1`);
            saveFileShape.appendChild(rect3);

            let rect4 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect4.setAttribute('x',  `${topLeft.x + 5}`);
            rect4.setAttribute('y',  `${ButtomLeft.y - 15}`);
            rect4.setAttribute('stroke', `transparent`);
            rect4.setAttribute('stroke-width', '0.5');
            rect4.setAttribute('height',  `${15}`);
            rect4.setAttribute('width',  `${topRight.x - topLeft.x - 5}`);
            rect4.setAttribute('fill',  `#CFD8DC`);
            saveFileShape.appendChild(rect4);

            let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttributeNS(null, "x", `${ButtomLeft.x + 5}`);
            text.setAttributeNS(null, "y", `${ButtomLeft.y + 18}`);
            text.setAttributeNS(null, "class", "svgText");
            
            // text.setAttributeNS(null, "font-size", "14px");
            // text.setAttributeNS(null, "font-weight","bold");
            const textNode = document.createTextNode('Save');
            text.appendChild(textNode);
            saveFileShape.appendChild(text);

            this._svgElement.appendChild(saveFileShape);
        }
    }

}