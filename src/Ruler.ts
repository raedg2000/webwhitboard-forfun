import { BaseRuler as BaseRuler, RulersType } from "./BaseRuler";
import { DrawingLayer } from "./DrawingLayer";
import { IDispose } from "./IDispose";
import { IRuler } from "./IRuler";


export class Ruler extends BaseRuler implements IRuler, IDispose{

    private _svgAngleIndicator: SVGTextElement | undefined;

    constructor(id: string, drawingLayer : DrawingLayer){
        super(id, drawingLayer, 262/0.2645833, 40/0.2645833, RulersType.NormalRuler);

        this.buildRuler();
    }

    private drawRulerRectangle () : SVGRectElement{
        let rulerShape = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    
        rulerShape.setAttribute('width', `${this._width}`);
        rulerShape.setAttribute('height', `${this._height}`);
        rulerShape.setAttribute('x', '0');
        rulerShape.setAttribute('y', '0');
        rulerShape.setAttribute('fill', this._fillColor);
        rulerShape.setAttribute('stroke', this._strokeColor);
        rulerShape.setAttribute('stroke-width', `${this._strokeWidth}`);
    
        return rulerShape;
    }

    private buildRuler(){

        let group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.id = `parentgroup#${this._id.split('#')[1]}`;
        this._svgRulerInstance.appendChild(group);
        group.style.pointerEvents = 'auto';
        
        let rulerRectangleShape = this.drawRulerRectangle();
        group.appendChild(rulerRectangleShape);
        rulerRectangleShape.style.pointerEvents = 'auto';

        this.drawUpperMarkers(group);
        this.drawLowerMarkers(group);
       

        let radius = this.measureText('360°', this._defaultFontSize)?.width ?? 15;
        this.drawAngleCircle(group, radius);

        let metrics = this.measureText('360°', this._defaultFontSize)
        if (metrics){
            this.drawAngleText(group, metrics);
        }

        this._svgRulerInstance.addEventListener('pointerdown', (event) =>{
            let pointerEvent = event as PointerEvent;
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();
            if (pointerEvent.pointerType === 'mouse' && pointerEvent.buttons === 1){
                this._startDragging = true;
            }
        });

        this._svgRulerInstance.addEventListener('pointermove', (event) =>{
            let pointerEvent = event as PointerEvent;
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();
            if (pointerEvent.pointerType === 'mouse' && this._startDragging && pointerEvent.buttons === 1){
                this._svgRulerInstance.style.cursor = 'move';
                let x =   Number.parseFloat(this._svgRulerInstance.style.left)+ + pointerEvent.movementX;
                let y =   Number.parseFloat(this._svgRulerInstance.style.top)+ + pointerEvent.movementY;

                this._svgRulerInstance.style.left = x.toString();
                this._svgRulerInstance.style.top = y.toString();
            }

        });

        this._svgRulerInstance.addEventListener('pointerup', (event) =>{
            let pointerEvent = event as PointerEvent;
            
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();

            if (this._startDragging){
                this._svgRulerInstance.style.cursor = 'pointer';
            }
            this._startDragging = false;
           
        });

        this._svgRulerInstance.addEventListener('pointerover', (event) =>{
            let pointerEvent = event as PointerEvent;
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();

            this._svgRulerInstance.style.cursor = 'pointer';

         });

        this._svgRulerInstance.addEventListener('pointerout', (event) =>{

            let pointerEvent = event as PointerEvent;
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();
            
            this._svgRulerInstance.style.cursor = 'auto';

        });

        this._svgRulerInstance.addEventListener('wheel', (event) =>{
            let wheelEvent = event as WheelEvent;
            wheelEvent.preventDefault();
            wheelEvent.stopPropagation();
           //transform-box: fill-box;transform-origin: center;transform: rotate(${settings.angle}deg`
            this._angleOfRotation = (this._angleOfRotation + Math.sign(wheelEvent.deltaY) * 1) % 360;
            
            this._svgRulerInstance.style.transformBox = 'fill-box';
            this._svgRulerInstance.style.transformOrigin ='center';
            this._svgRulerInstance.style.transform = `rotate(${this._angleOfRotation}deg`;
           
            if (this._svgAngleIndicator){
                let metrics = this.measureText((-1*this._angleOfRotation).toString() + '°', this._defaultFontSize)
                if (metrics){
                    this._svgAngleIndicator.setAttribute('x', `${this._width / 2 - metrics.width / 2}`);
                }
                this._svgAngleIndicator.style.transformBox = 'view-box';
                this._svgAngleIndicator.style.transformOrigin ='center';
                this._svgAngleIndicator.style.transform = `rotate(${-1*this._angleOfRotation}deg`;
                this._svgAngleIndicator.childNodes[0].nodeValue = (-1*this._angleOfRotation).toString() + '°';
           
            }
        });
    }

    private drawUpperMarkers(parent : SVGElement) {
        let pathString = "";
        let width = Number.parseInt(this._width.toString()) -1
        let skipMillimeterFrom = 2;
        for (let i = 1; i <= width ; ++i) {
    
            let markHeight = 4 / 0.2645833;
    
            let x = (skipMillimeterFrom + i) / 0.2645833;
    
            if ((i - 1) % 10 === 0) {
                markHeight = 10 / 0.2645833;
    
                let indicatorText = document.createElementNS("http://www.w3.org/2000/svg", "text");
                parent.appendChild(indicatorText);
                indicatorText.setAttribute('x', (x + 1).toString());
                indicatorText.setAttribute('y', (markHeight).toString());
                indicatorText.setAttribute('style', `font-size:12px;pointer-events: none;`);
                let data = document.createTextNode(`index${i}mm`);
                indicatorText.appendChild(data);
                indicatorText.childNodes[0].nodeValue = ((i - 1) / 10).toString();
    
            }
            else if ((i - 1) % 5 === 0) {
                markHeight = 7 / 0.2645833;
            }
    
            pathString = ` M ${x} ${markHeight} L ${x} ${0}`;
    
            let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute('d', pathString);
            path.setAttribute('stroke', this._markersColor);
            path.setAttribute('stroke-width', this._markersStrokeWidth.toString());
            //   path.setAttribute('fill', settings.fillColor);
            parent.appendChild(path);
        }
    }
    
    private drawLowerMarkers (parent : SVGElement) {
        let pathString = "";
        let height = Number.parseInt(this._height.toString()) -1
        for (let i = 1; i <= height; ++i) {
    
            let markHeight = 4 / 0.2645833;
    
            let x = 2.54 * (i) / 0.2645833;
    
            if ((i - 1) % 10 === 0) {
                markHeight = 10/ 0.2645833;
    
                let indicatorText = document.createElementNS("http://www.w3.org/2000/svg", "text");
                parent.appendChild(indicatorText);
                indicatorText.setAttribute('x', (x + 1).toString());
                indicatorText.setAttribute('y', `${this._height - markHeight + 10}`);
                indicatorText.setAttribute('style', `font-size:12px;pointer-events: none;`);
                let data = document.createTextNode(`index${i}mm`);
                indicatorText.appendChild(data);
                indicatorText.childNodes[0].nodeValue = ((i - 1) / 10).toString();
            }
            else if ((i - 1) % 5 === 0) {
                markHeight =  7 / 0.2645833;
            }
    
            let angleCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    
            pathString = ` M ${x} ${this._topLeftPostion.y + this._height} L ${x} ${this._height - markHeight}`;
    
            let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute('d', pathString);
            path.setAttribute('stroke', this._markersColor);
            path.setAttribute('stroke-width', this._markersStrokeWidth.toString());
            //   path.setAttribute('fill', settings.fillColor);
            parent.appendChild(path);
        }
    }

    private drawAngleCircle( parent : SVGElement, radius : number) {
 
        let angleCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        parent.appendChild(angleCircle);
        angleCircle.setAttribute('r', `${radius}`);
        angleCircle.setAttribute('cx', `${(this._width) / 2}`);
        angleCircle.setAttribute('cy', `${(this._height / 2)}`);
        angleCircle.setAttribute('fill', this._fillColor);
        angleCircle.setAttribute('stroke', `red`);
        angleCircle.setAttribute('stroke-width', this._strokeWidth.toString());

    }

    private drawAngleText(parent : SVGElement, metrics : TextMetrics) {
    
        let pathString = "";
        let indicatorText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        indicatorText.id = `angleIndicator#${this._id}`;
        parent.appendChild(indicatorText);
        indicatorText.setAttribute('x', `${this._width / 2 - metrics.width / 2}`);
        indicatorText.setAttribute('y', `${this._height / 2 + metrics.fontBoundingBoxAscent / 2}`);
        indicatorText.setAttribute('style', `font-size:12px;font-weight;font-color:red; pointer-events: none;)`);
        let data = document.createTextNode(`angle${this._id}`);
        indicatorText.appendChild(data);
        indicatorText.childNodes[0].nodeValue = this._angleOfRotation.toString() + '°';

        this._svgAngleIndicator = indicatorText;
    }
    

    capturePen(): void {
        
    }

    dispose(): void {
        
    }
}