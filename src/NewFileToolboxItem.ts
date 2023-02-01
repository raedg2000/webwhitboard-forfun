
import {Point} from './Point';
import {ToolBoxItem} from './ToolBoxItem'
import { ToolBoxItemType } from './ToolBoxItemType';

export class NewFileToolboxItem extends ToolBoxItem{
   
    private _borderColor : string = '#000000'; // border color
    private _borderWidth : string = "0.5"; 
    private _width : number = 0;
    private _height : number = 0;
    private _maxThickness : number = 7;

    constructor (id: string){
        super(id, ToolBoxItemType.NewFile);
        this._width = Number(this._svgElement?.clientWidth);
        this._height = Number(this._svgElement?.clientHeight);
    }


    drawNewFileSVG(){
        if (this._svgElement){
            let newFileShape = document.createElementNS("http://www.w3.org/2000/svg", "g");
            newFileShape.id = `newFileShape#${this.id.split('#')[1]}`;
            newFileShape.setAttribute('style', `pointer-events: auto`);
            
            //draw main shape
            let topLeft = new Point(this._width /10, this._height/4);
            let topRight = new Point(6.5*this._width /10, this._height/4);
            let secondTopRight  = new Point(8*this._width /10, this._height/4 + 1.5*this._width/10);
           
            let ButtomRight  = new Point(secondTopRight.x, secondTopRight.y + 1.35*this._height/4);
            let ButtomLeft  = new Point(topLeft.x, secondTopRight.y + 1.35*this._height/4);
            
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
            path.setAttribute('fill', '#FFFFFF');

            newFileShape.appendChild(path);

            pathString = ` M ${topRight.x} ${topRight.y} 
            L ${topRight.x } ${secondTopRight.y}
            L ${secondTopRight.x } ${secondTopRight.y}
            L ${topRight.x} ${topRight.y} 
           `;

            path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute('d', pathString);
            path.setAttribute('stroke', this._borderColor);
            path.setAttribute('stroke-width', this._borderWidth);
            path.setAttribute('fill', '#C8E6C9');
            newFileShape.appendChild(path);


            let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            path.setAttribute('stroke', `#FFFFFF`);
            circle.setAttribute('stroke-width', this._borderWidth);
            circle.setAttribute('cx',`${ButtomRight.x - this._width /10}`);
            circle.setAttribute('cy',`${ButtomRight.y - 2*this._width /10}`);
            circle.setAttribute('r',`${2*this._width /10}`);
            circle.setAttribute('fill',`#66BB6A`);
            newFileShape.appendChild(circle);
            
            let rect1 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect1.setAttribute('x',  `${ButtomRight.x -3*this._width /10 + 1}`);
            rect1.setAttribute('y',  `${ButtomRight.y - 2*this._width /10 - 1.5}`);
            rect1.setAttribute('stroke', `transparent`);
            rect1.setAttribute('stroke-width', '0.5');
            rect1.setAttribute('height',  `3`);
            rect1.setAttribute('width',  `${4*this._width /10 - 2}`);
            rect1.setAttribute('fill',  `#C8E6C9`);
            newFileShape.appendChild(rect1);

            let rect2 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect2.setAttribute('x',  `${ButtomRight.x -this._width /10 - 1.5}`);
            rect2.setAttribute('y',  `${ButtomRight.y - 4*this._width /10 + 1}`);
            rect2.setAttribute('stroke', `transparent`);
            rect2.setAttribute('stroke-width', '0.5');
            rect2.setAttribute('height',  `${4*this._width /10 - 2}`);
            rect2.setAttribute('width',  `3`);
            rect2.setAttribute('fill',  `#C8E6C9`);
            newFileShape.appendChild(rect2);


            let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttributeNS(null, "x", `${ButtomLeft.x + 5}`);
            text.setAttributeNS(null, "y", `${ButtomLeft.y + 18}`);
            text.setAttributeNS(null, "class", "svgText");
            // text.setAttributeNS(null, "font-size", "14px");
            // text.setAttributeNS(null, "font-weight","bold");
            const textNode = document.createTextNode('New');
            text.appendChild(textNode);
            newFileShape.appendChild(text);

            this._svgElement.appendChild(newFileShape);
        }
    }

}