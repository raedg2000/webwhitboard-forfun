import { BaseRuler as BaseRuler, DistanceToRuler, RulersType } from "./BaseRuler";
import { DrawingLayer } from "./DrawingLayer";
import { IDispose } from "./IDispose";
import { Point } from "./Point";


export class Protractor extends BaseRuler implements IDispose{

    private _radius : number;
    private _center : Point;
   
    constructor(id: string, drawingLayer : DrawingLayer){
        super(id, drawingLayer, 120/0.2645833, 120/0.2645833, RulersType.Protractor);
        this._strokeWidth = 2;
        this._radius = this._width/2 - 2*this._strokeWidth;
        this._center =  new Point(this._width/2 , this._height/2 );
        this.buildRuler();
    }

    private buildRuler(){
        this._svgRulerInstance.style.pointerEvents = 'none';
        let group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.id = `parentgroup#${this._id.split('#')[1]}`;
        this._svgRulerInstance.appendChild(group);

        let circle = this.drawOuterCricle(group);
        this.drawHorizontalLine(group);
        this.drawVerticalLine(group);
        this.drawInnerCircle(group);
        this.drawMarkings(group);

        circle.addEventListener('pointerdown', (event) =>{
            let pointerEvent = event as PointerEvent;
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();
            if (pointerEvent.pointerType === 'mouse' && pointerEvent.buttons === 1){
                this._startDragging = true;
            }
        });

        circle.addEventListener('pointermove', (event) =>{
            let pointerEvent = event as PointerEvent;
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();
            if (pointerEvent.pointerType === 'mouse' && this._startDragging && pointerEvent.buttons === 1){
                this._svgRulerInstance.style.cursor = 'move';
                let x =   Number.parseFloat(this._svgRulerInstance.style.left)+ pointerEvent.movementX;
                let y =   Number.parseFloat(this._svgRulerInstance.style.top)+  pointerEvent.movementY;

                this._svgRulerInstance.style.left = x.toString();
                this._svgRulerInstance.style.top = y.toString();

                this._topLeftPostion = new Point(x, y);
            }

        });

        circle.addEventListener('pointerup', (event) =>{
            let pointerEvent = event as PointerEvent;
            
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();

            if (this._startDragging){
                this._svgRulerInstance.style.cursor = 'pointer';
            }
            this._startDragging = false;
           
        });

        circle.addEventListener('pointerover', (event) =>{
            let pointerEvent = event as PointerEvent;
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();

            this._svgRulerInstance.style.cursor = 'pointer';

         });

         circle.addEventListener('pointerout', (event) =>{

            let pointerEvent = event as PointerEvent;
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();
            
            this._svgRulerInstance.style.cursor = 'auto';

        });

        circle.addEventListener('wheel', (event) =>{
            let wheelEvent = event as WheelEvent;
            wheelEvent.preventDefault();
            wheelEvent.stopPropagation();
           //transform-box: fill-box;transform-origin: center;transform: rotate(${settings.angle}deg`
            this._angleOfRotation = (this._angleOfRotation + Math.sign(wheelEvent.deltaY) * 1) % 360;
            
            this._svgRulerInstance.style.transformBox = 'fill-box';
            this._svgRulerInstance.style.transformOrigin ='center';
            this._svgRulerInstance.style.transform = `rotate(${this._angleOfRotation}deg`;
        });
    }

    private drawOuterCricle(group : SVGElement): SVGCircleElement{
        let smallRadius = 20;

        let cx = this._center.x ;
        let cy = this._center.y;

        let outerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        outerCircle.setAttribute('stroke', this._strokeColor);
        outerCircle.setAttribute('stroke-width', this._strokeWidth.toString());
        outerCircle.setAttribute('fill', this._fillColor);
        outerCircle.setAttribute('cx', `${cx}`);
        outerCircle.setAttribute('cy', `${cy}`);
        outerCircle.setAttribute('r', this._radius.toString());
        outerCircle.style.pointerEvents = 'auto';
        group.appendChild(outerCircle);

        return outerCircle;
    }

    private drawVerticalLine(group: SVGElement){
        let strokeWidth = '1';
        let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute('stroke', this._strokeColor);
        line.setAttribute('stroke-width', strokeWidth);
        line.setAttribute('x1', `${this._center.x}`);
        line.setAttribute('y1', `${this._center.y + this._radius}`);
        line.setAttribute('x2', `${this._center.x}`);
        line.setAttribute('y2', `${this._center.y - this._radius}`);
        group.appendChild(line);
    }

    private drawHorizontalLine(group: SVGElement){
        let strokeWidth = '1';
        let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute('stroke', this._strokeColor);
        line.setAttribute('stroke-width',strokeWidth);
        line.setAttribute('x1', `${this._center.x - this._radius}`);
        line.setAttribute('y1', `${this._center.y}`);
        line.setAttribute('x2', `${this._center.x +  this._radius}`);
        line.setAttribute('y2', `${this._center.y }`);
        group.appendChild(line);
    }

    private drawInnerCircle(group: SVGElement){
        let smallRadius = 20;
        let strokeWidth = '1';
        let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute('stroke', this._strokeColor);
        circle.setAttribute('stroke-width', strokeWidth);
        circle.setAttribute('fill', this._fillColor);
        circle.setAttribute('cx', `${this._center.x}`);
        circle.setAttribute('cy', `${this._center.y}`);
        circle.setAttribute('r', smallRadius.toString());
        group.appendChild(circle);
    }

    private drawMarkings(group : SVGElement){
        let strokeWidth = '1';
        let pathString = "";

        for (let i = 0; i < 360; ++i) {

            let markLength = 4 / 0.2645833;

            if (i % 10 === 0) {
                markLength = 10 / 0.2645833;
            }
            else if (i % 5 === 0) {
                markLength = 7 / 0.2645833;
            }
           
            let y = this._center.y - this._radius * Math.sin(i * Math.PI / 180);
            let x = this._center.x + this._radius * Math.cos(i * Math.PI / 180);

            let y1 = this._center.y - (this._radius - markLength) * Math.sin(i * Math.PI / 180);
            let x1 = this._center.x + (this._radius - markLength) * Math.cos(i * Math.PI / 180);

            if (i % 10 === 0) {
                let metrics = this.measureText(i.toString(), this._defaultFontSize) ;
                if (metrics){
                    let indicatorText = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    indicatorText.setAttribute('style', `font-size: 10px;pointer-events: none;`);
                    let data = document.createTextNode(`index${i}mm`);
                    indicatorText.appendChild(data);
                    indicatorText.childNodes[0].nodeValue = i.toString();
                    group.appendChild(indicatorText);
                    
                    if (i > 0 && i < 90) {
                        indicatorText.setAttribute('x', `${x1 - 1}`);
                        indicatorText.setAttribute('y', `${y1 + metrics.fontBoundingBoxAscent + 1}`);
                    }
                    else if (i >= 90 && i < 180) {
                        indicatorText.setAttribute('x', `${x1 + 1}`);
                        indicatorText.setAttribute('y', `${y1 + metrics.fontBoundingBoxAscent + 1}`);
                    }
                    else if (i > 180 && i <= 270) {
                        indicatorText.setAttribute('x', `${x1 + 1}`);
                        indicatorText.setAttribute('y', `${y1 - 1}`);
                    }
                    else if (i > 270 && i < 360) {
                        indicatorText.setAttribute('x', `${x1 - 1}`);
                        indicatorText.setAttribute('y', `${y1 - 1}`);
                    }
                    else {
                        indicatorText.setAttribute('x', `${x1 + 1}`);
                        indicatorText.setAttribute('y', `${y1}`);
                    }
                }
            }

            pathString = ` M ${x} ${y} L ${x1} ${y1}`

            let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute('d', pathString);
            path.setAttribute('stroke', this._strokeColor);
            path.setAttribute('stroke-width', strokeWidth);
            group.appendChild(path);
        }


    }

    calculateDistanceToRuler(penPosition : Point): DistanceToRuler{
       
        let center = new Point(this._topLeftPostion.x + this._width/2, this._topLeftPostion.y + this._width/2);
        
        let distance =  Math.abs(this._radius - Math.sqrt(Math.pow(penPosition.x - center.x , 2) + Math.pow(penPosition.y - center.y, 2)));
        console.log(`dist : ${distance}`) 
        return new DistanceToRuler(this.type, 'circle', distance);
    }

    mapPenPosition(distanceToRuler: DistanceToRuler, mousePosition: Point, strokeThickness: number = 1): Point {

        let center = new Point(this._topLeftPostion.x + this._width/2, this._topLeftPostion.y + this._width/2);
        let tx = (mousePosition.x - center.x );
        let ty = (mousePosition.y - center.y );

        let angle = Math.atan(Math.abs(ty / tx));
        if (tx < 0 && ty > 0) {
            angle = Math.PI - Math.abs(angle);
        }
        else if (tx < 0 && ty < 0) {
            angle = Math.PI + Math.abs(angle);
        }
        else if (tx > 0 && ty < 0) {
            angle = 2 * Math.PI - Math.abs(angle);
        }
        
        //console.log(tx, ty, settings.center, angle*180/Math.PI);
        return new Point(
            center.x + (this._radius+ strokeThickness / 2 + BaseRuler.Ruler_Shift) * Math.cos(angle),
            center.y + (this._radius + strokeThickness / 2 + BaseRuler.Ruler_Shift) * Math.sin(angle)
        );
    }

}