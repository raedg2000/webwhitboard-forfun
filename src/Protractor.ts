import { BaseRuler as BaseRuler, CapturedRulerInfo, RulersType } from "./BaseRuler";
import { DrawingLayer } from "./DrawingLayer";
import { EventAggregator } from "./EventAggregator";
import { IDispose } from "./IDispose";
import { Point } from "./Point";
import { RulerReleasedCapture } from "./RulerDrawingEvents";
import { ToolBoxItemType } from "./ToolBoxItemType";


export class Protractor extends BaseRuler implements IDispose{

    private _radius : number;
    private _center : Point;
    private _circleElement : SVGCircleElement;
   
    constructor(id: string, drawingLayer : DrawingLayer){
        super(id, drawingLayer, 120/0.2645833, 120/0.2645833, RulersType.Protractor);
        this._strokeWidth = 2;
        this._radius = this._width/2 - 2*this._strokeWidth;
        this._center =  new Point(this._width/2 , this._height/2 );

        this._svgRulerInstance.style.pointerEvents = 'none';
        let group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.id = `parentgroup#${this._id.split('#')[1]}`;
        this._svgRulerInstance.appendChild(group);

        this._circleElement = this.drawOuterCricle(group);
        this.drawHorizontalLine(group);
        this.drawVerticalLine(group);
        this.drawInnerCircle(group);
        this.drawMarkings(group);

        this.buildRulerEvents();
    }

    get radius(): number{
        return this._radius;
    }


    private buildRulerEvents(){


        this._circleElement.addEventListener('pointerdown', (event) =>{
            if (this._captured){
                return ;
            }
            let pointerEvent = event as PointerEvent;
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();

            if (pointerEvent.pointerType === 'touch' && document.body.style.touchAction ==='auto'){
                document.body.style.touchAction ='none';
            }
            else if (pointerEvent.pointerType === 'touch' && document.body.style.touchAction ==='none'){
                if(!this.touchFingure1){
                    this.touchFingure1 = pointerEvent;
                }
                if (this.touchFingure1.pointerId != pointerEvent.pointerId){
                    this.touchFingure2 = pointerEvent;
                    return;
                }
            }

            if((pointerEvent.pointerType !== 'mouse') || (pointerEvent.pointerType === 'mouse' && pointerEvent.buttons === 1)){
                this._startDragging = true;
                this._svgRulerInstance.style.cursor = 'grab';
            }
        });

        this._circleElement.addEventListener('pointermove', (event) =>{
            if (this._captured){
                return ;
            }
            let pointerEvent = event as PointerEvent;
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();

            if ((pointerEvent.pointerType === 'touch')){
                document.body.style.touchAction ='none';
                if (this.touchFingure1 && this.touchFingure2 && this.touchFingure2.pointerId === pointerEvent.pointerId){
                    this.touchFingure1_IsCenter = true;
                    this.RotateByTouch(pointerEvent);
                    return;
                }
            }
            if ((pointerEvent.pointerType !== 'mouse') || (pointerEvent.pointerType === 'mouse' && pointerEvent.buttons === 1)){
                this._svgRulerInstance.style.cursor = 'grab';
                let x =   Number.parseFloat(this._svgRulerInstance.style.left)+ pointerEvent.movementX;
                let y =   Number.parseFloat(this._svgRulerInstance.style.top)+  pointerEvent.movementY;

                this._svgRulerInstance.style.left = x.toString();
                this._svgRulerInstance.style.top = y.toString();

                this._topLeftPostion = new Point(x, y);
            }

        });

        this._circleElement.addEventListener('pointerup', (event) =>{
            let pointerEvent = event as PointerEvent;
            
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();

            if (this._captured){
                this.uncapture(pointerEvent.pointerId);

                let rulerCaptureReleased = new RulerReleasedCapture(this.id, ToolBoxItemType.Protractor);
                EventAggregator.publish(rulerCaptureReleased)
            }

            this.touchFingure1 = undefined;
            this.touchFingure2 = undefined;
            this.touchFingure1_IsCenter = false;

            if (this._startDragging){
                this._svgRulerInstance.style.cursor = 'pointer';
            }
            this._startDragging = false;
           
        });

        this._circleElement.addEventListener('pointerover', (event) =>{
            let pointerEvent = event as PointerEvent;
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();

            if (!this._startDragging){
                this._svgRulerInstance.style.cursor = 'pointer';
            }

         });

        this._circleElement.addEventListener('pointerout', (event) =>{

            let pointerEvent = event as PointerEvent;
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();
            
            this._svgRulerInstance.style.cursor = 'auto';

        });

        this._circleElement.addEventListener('wheel', (event) =>{
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

    private RotateByTouch (pointerEvent: PointerEvent) {

        this.updateAngleOfRotationDueToTouch(pointerEvent);

        this._svgRulerInstance.style.transformBox = 'fill-box';
        this._svgRulerInstance.style.transformOrigin ='center';
        this._svgRulerInstance.style.transform = `rotate(${this._angleOfRotation}deg`;

        this.touchFingure2 = pointerEvent;
    }

    calculateDistanceToRuler(penPosition : Point): CapturedRulerInfo{
       
        let center = new Point(this._topLeftPostion.x + this._width/2, this._topLeftPostion.y + this._width/2);
        
        let distance =  Math.abs(this._radius - Math.sqrt(Math.pow(penPosition.x - center.x , 2) + Math.pow(penPosition.y - center.y, 2)));
        console.log(`dist : ${distance}`) 
        return new CapturedRulerInfo(this.type, 'circle', distance, center, this);
    }

    mapPenPosition(distanceToRuler: CapturedRulerInfo, mousePosition: Point, strokeThickness: number = 1): Point {

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

    capture(pointerId: number):void{
        this._captured = true;
        this._circleElement.setPointerCapture(pointerId);
    }

    uncapture(pointerId: number):void{
        this._captured = false;
        this._circleElement.releasePointerCapture(pointerId);
    }


    static getAngle(position : Point, center : Point) {
        let tx = position.x - center.x ;
        let ty = position.y - center.y ;

        let alfa = Math.atan(Math.abs(ty / tx));
        if (tx < 0 && ty > 0) {
            alfa = Math.PI  -  Math.abs(alfa);
        }
        else if (tx < 0 && ty < 0) {
            alfa = Math.PI + Math.abs(alfa);
        }
        else if (tx > 0 && ty < 0) {
            alfa = 2 * Math.PI - Math.abs(alfa);
        }
        return alfa;

    }

    static getDirection(startAngle : number, endAngle : number) {

        if (startAngle >= 0 && endAngle >= 0) {
            if (startAngle > 3 * Math.PI / 2 && endAngle <= Math.PI / 2) {
                return false;
            }
            if (startAngle <= Math.PI / 2 && endAngle > 3 * Math.PI / 2) {
                return true;
            }
            if (startAngle > endAngle) {
                return true;
            }
            
        }
        if (startAngle < 0 && endAngle < 0) {
            if (startAngle > endAngle) {
                return true;
            }
        }
        return false;
    }
}