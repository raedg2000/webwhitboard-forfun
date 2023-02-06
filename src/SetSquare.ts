import { BaseRuler as BaseRuler, DistanceToRuler, RulersType } from "./BaseRuler";
import { DrawingLayer } from "./DrawingLayer";
import { IDispose } from "./IDispose";
import { Point } from "./Point";

export class SetSquare extends BaseRuler implements IDispose{

    private _pointA : Point;
    private _pointB : Point;
    private _pointC : Point;
    private _svgAngleIndicator : SVGTextElement | undefined;

    constructor(id: string, drawingLayer : DrawingLayer){
        super(id, drawingLayer, 190/0.2645833, 95/0.2645833, RulersType.SetSquare);
        this._strokeWidth = 2;
        this._pointA = new Point(this._width/2, this._strokeWidth);
        this._pointB = new Point(this._strokeWidth, this._height - this._strokeWidth)
        this._pointC = new Point(this._width - this._strokeWidth, this._height - this._strokeWidth)
        this.buildRuler();
    }

    private buildRuler(){

        let group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.id = `parentgroup#${this._id.split('#')[1]}`;
        this._svgRulerInstance.appendChild(group);
        
        let outerRectangle = this.drawOuterTriangle(group);
        this.drawInnerTriangle(group);
        this.drawSideABUnits(group);
        this.drawSideACUnits(group);
        
        let radius = this.measureText('360°', this._defaultFontSize)?.width ?? 15;
        this.drawAngleCircle(group, radius);

        let metrics = this.measureText('360°', this._defaultFontSize)
        if (metrics){
            this.drawAngleText(group, metrics);
        }

        outerRectangle.addEventListener('pointerdown', (event) =>{
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
            
            if ((pointerEvent.pointerType !== 'mouse') || (pointerEvent.pointerType === 'mouse' && pointerEvent.buttons === 1)){
                this._startDragging = true;
                this._svgRulerInstance.style.cursor = 'grab';
            }
        });

        outerRectangle.addEventListener('pointermove', (event) =>{
            let pointerEvent = event as PointerEvent;
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();

            if ((pointerEvent.pointerType === 'touch')){
                document.body.style.touchAction ='none';
                if (this.touchFingure1 && this.touchFingure2 && this.touchFingure2.pointerId === pointerEvent.pointerId){
                    this.touchFingure1_IsCenter = true;
                    this.touchFingure2 = pointerEvent;
                    this.RotateByTouch();
                    return;
                }
            }

            if ((pointerEvent.pointerType !== 'mouse') || (pointerEvent.pointerType === 'mouse' && this._startDragging && pointerEvent.buttons === 1)){
                this._svgRulerInstance.style.cursor = 'grab';
                let x =   Number.parseFloat(this._svgRulerInstance.style.left)+ + pointerEvent.movementX;
                let y =   Number.parseFloat(this._svgRulerInstance.style.top)+ + pointerEvent.movementY;

                this._svgRulerInstance.style.left = x.toString();
                this._svgRulerInstance.style.top = y.toString();
                this._topLeftPostion = new Point(x, y);
            }

        });

        outerRectangle.addEventListener('pointerup', (event) =>{
            let pointerEvent = event as PointerEvent;
            
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();

            if (this._startDragging){
                this._svgRulerInstance.style.cursor = 'pointer';
            }
            this._startDragging = false;
           
        });

        outerRectangle.addEventListener('pointerover', (event) =>{
            let pointerEvent = event as PointerEvent;
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();

            if (!this._startDragging){
                this._svgRulerInstance.style.cursor = 'pointer';
            }

         });

        outerRectangle.addEventListener('pointerout', (event) =>{

            let pointerEvent = event as PointerEvent;
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();
            
            this._svgRulerInstance.style.cursor = 'auto';

        });

        outerRectangle.addEventListener('wheel', (event) =>{
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
                this._svgAngleIndicator.style.transformBox = 'fill-box';
                this._svgAngleIndicator.style.transformOrigin ='center';
                this._svgAngleIndicator.style.transform = `rotate(${-1*this._angleOfRotation}deg`;
                this._svgAngleIndicator.childNodes[0].nodeValue = (-1*this._angleOfRotation).toString() + '°';
           
            }
        });
    }

    private drawOuterTriangle(group : SVGElement): SVGPathElement {

        let outerTraingle = document.createElementNS("http://www.w3.org/2000/svg", "path");

        outerTraingle.setAttribute('d', `M ${this._pointA.x} ${this._pointA.y} L ${this._pointB.x} ${this._pointB.y}
                                        L ${this._pointC.x} ${this._pointC.y}
                                        L ${this._pointA.x} ${this._pointA.y} Z`);

        outerTraingle.setAttribute('style', `pointer-events: auto`);

        outerTraingle.setAttribute('fill', this._fillColor);
        outerTraingle.setAttribute('stroke', this._strokeColor);
        outerTraingle.setAttribute('stroke-width', this._strokeWidth.toString());
        group.appendChild(outerTraingle);

        return outerTraingle;
    }

    private drawInnerTriangle(group : SVGElement) {

        let shiftFromSide = 25 / 0.2645833;

        let sideB = Math.sin(Math.PI / 4) * (this._pointC.x - this._pointB.x);
        let sideC = Math.sin(Math.PI / 4) * (this._pointC.x - this._pointB.x);

        let cosB = Math.PI / 4;
        let sinB = Math.PI / 4;
        let tanB = 1;

        let cosC = Math.PI / 4;
        let sinC = Math.PI / 4;
        let tanC = 1;

        let segementBM = (this._pointC.x - this._pointB.x) / 2;


        let BB1C = shiftFromSide;
        let CC1B = shiftFromSide;

        let B1C1 =  (this._pointC.x - this._pointB.x) - BB1C - CC1B;

        let B1M1 = B1C1 / 2;
        let h1 = B1M1 - shiftFromSide;

        // inner triangle vertices
        let Bp = { x: this._pointB.x + 2 * BB1C, y: this._pointB.y - shiftFromSide };
        let Cp = { x: this._pointC.x - 2 * BB1C, y: this._pointB.y - shiftFromSide };
        let Ap = { x: this._pointA.x , y: this._pointB.y - h1 - shiftFromSide };


        let innerTriangle = document.createElementNS("http://www.w3.org/2000/svg", "path");

        innerTriangle.setAttribute('d', `M ${Ap.x} ${Ap.y} L ${Bp.x} ${Bp.y}
                                        L ${Cp.x} ${Cp.y}
                                        L ${Ap.x} ${Ap.y} Z`);

        innerTriangle.setAttribute('style', `pointer - events: none`);


        innerTriangle.setAttribute('fill', this._fillColor);
        innerTriangle.setAttribute('stroke', this._strokeColor);
        innerTriangle.setAttribute('stroke-width', this._strokeWidth.toString());
        group.appendChild(innerTriangle);

    }
   
    private RotateByTouch () {

        let x1 = Number(this.touchFingure1?.clientX) ;
        let y1 = Number(this.touchFingure1?.clientY) ; 
        let x2 = Number(this.touchFingure2?.clientX) ;
        let y2 = Number(this.touchFingure2?.clientY) ;
        
        let Rx = x2 - x1;
        let Ry = -(y2 - y1);
        let angle = Math.round(Math.atan(Ry/Rx) * 180/ Math.PI);
        if (Ry > 0 && Rx > 0)
        {
            angle = -1*angle;
        }
        else if ((Ry > 0 && Rx < 0) || (Ry < 0 && Rx < 0)){
            angle = -1* (180 + angle);
        }
        else if (Ry < 0 && Rx > 0)
        {
            angle = -1*(360 + angle);
        }
        this._angleOfRotation = angle;

        this._svgRulerInstance.style.transformBox = 'fill-box';
        this._svgRulerInstance.style.transformOrigin ='center';
        this._svgRulerInstance.style.transform = `rotate(${this._angleOfRotation}deg`;

        if (this._svgAngleIndicator){
            let metrics = this.measureText((-1*this._angleOfRotation).toString() + '°', this._defaultFontSize)
            if (metrics){
                this._svgAngleIndicator.setAttribute('x', `${this._width / 2 - metrics.width / 2}`);
            }
            this._svgAngleIndicator.style.transformBox = 'fill-box';
            this._svgAngleIndicator.style.transformOrigin ='center';
            this._svgAngleIndicator.style.transform = `rotate(${-1*this._angleOfRotation}deg`;
            this._svgAngleIndicator.childNodes[0].nodeValue = (-1*this._angleOfRotation).toString() + '°';
       
        }
    }

    drawAngleText (group : SVGElement, metrics: TextMetrics) {

        let y = this._pointB.y - 15/ 0.2645833  + metrics.fontBoundingBoxAscent/2;
        let pathString = "";
        let indicatorText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        indicatorText.id = `angleIndicator#${this._id.split('#')[1]}`;
        group.appendChild(indicatorText);
        indicatorText.setAttribute('x', `${this._pointA.x - metrics.width / 4}`);
        indicatorText.setAttribute('y', `${y }`);
        indicatorText.setAttribute('style', `font-size: 12px;font-weight;font-color:red; pointer-events: none;)`);
        let data = document.createTextNode(`angle${this._id.split('#')[1]}`);
        indicatorText.appendChild(data);
        indicatorText.childNodes[0].nodeValue = `${this._angleOfRotation}°`;

        this._svgAngleIndicator = indicatorText;
    }

    drawAngleCircle  (group : SVGElement, radius: number) {
        let strokeWidth = '1';
        let angleCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        group.appendChild(angleCircle);
        angleCircle.setAttribute('r', `${radius}`);
        angleCircle.setAttribute('cx', `${this._pointA.x}`);
        angleCircle.setAttribute('cy', `${(this._pointB.y - 15/ 0.2645833)}`);
        angleCircle.setAttribute('fill',this._fillColor);
        angleCircle.setAttribute('stroke', `red`);
        angleCircle.setAttribute('stroke-width', strokeWidth );
    }

    drawSideABUnits ( group : SVGElement) {
        let angleB = Math.PI / 4;
        let AB = Math.floor(Math.sqrt(Math.pow((this._pointA.x - this._pointB.x), 2) + Math.pow((this._pointA.y - this._pointB.y), 2)));

        AB = Math.floor((AB - 25 / 0.2645833) * 0.2645833);
        let skipMillimeterFromB = 15;
        for (let i = 1; i <= AB; ++i) {

            let markHeight = 4 / 0.2645833;

            let x = this._pointB.x + (i + skipMillimeterFromB) * Math.cos(angleB) / 0.2645833;
            let y = this._pointB.y - (i + skipMillimeterFromB) * Math.cos(angleB) / 0.2645833;

            if ((i - 1) % 10 === 0) {
                markHeight = 8 / 0.2645833;

                let indicatorText = document.createElementNS("http://www.w3.org/2000/svg", "text");
                group.appendChild(indicatorText);
                indicatorText.setAttribute('x', `${x + markHeight + 1}`);
                indicatorText.setAttribute('y', `${y + markHeight}`);
                indicatorText.setAttribute('style', `font-size: 10px;pointer-events: none;`);
                let data = document.createTextNode(`index${i}mm`);
                indicatorText.appendChild(data);
                indicatorText.childNodes[0].nodeValue = ((i - 1) / 10).toString();

            }
            else if ((i - 1) % 5 === 0) {
                markHeight = 6 / 0.2645833;
            }

            let pathString = ` M ${x} ${y} L ${x + markHeight} ${y + markHeight}`

            let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute('d', pathString);
            path.setAttribute('stroke', this._markersColor);
            path.setAttribute('stroke-width', this._markersStrokeWidth.toString());
            //   path.setAttribute('fill', settings.fillColor);
            group.appendChild(path);
        }
    }


    drawSideACUnits (group : SVGElement) {
        let angleB = Math.PI / 4;
        let AC = Math.floor(Math.sqrt(Math.pow((this._pointA.x - this._pointC.x), 2) + Math.pow((this._pointA.y - this._pointC.y), 2)));

        AC = Math.floor((AC - 25 / 0.2645833) * 0.2645833);
        let skipMillimeterFromB = 15;
        for (let i = 1; i <= AC; ++i) {

            let markHeight = 4 / 0.2645833;

            let x = this._pointC.x - (i + skipMillimeterFromB) * Math.cos(angleB) / 0.2645833;
            let y = this._pointC.y - (i + skipMillimeterFromB) * Math.cos(angleB) / 0.2645833;

            if ((i - 1) % 10 === 0) {
                markHeight = 8 / 0.2645833;

                let indicatorText = document.createElementNS("http://www.w3.org/2000/svg", "text");
                group.appendChild(indicatorText);
                indicatorText.setAttribute('x', `${x - markHeight - 4}`);
                indicatorText.setAttribute('y', `${y + markHeight}`);
                indicatorText.setAttribute('style', `font-size: 10px;pointer-events: none;`);
                let data = document.createTextNode(`index${i}mm`);
                indicatorText.appendChild(data);
                indicatorText.childNodes[0].nodeValue = ((i - 1) / 10).toString();

            }
            else if ((i - 1) % 5 === 0) {
                markHeight = 6 / 0.2645833;
            }



            let pathString = ` M ${x} ${y} L ${x - markHeight} ${y + markHeight}`

            let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute('d', pathString);
            path.setAttribute('stroke', this._markersColor);
            path.setAttribute('stroke-width', this._markersStrokeWidth.toString());
            //   path.setAttribute('fill', settings.fillColor);
            group.appendChild(path);
        }
    }

    calculateDistanceToRuler(penPosition : Point): DistanceToRuler{
        return new DistanceToRuler(this.type, 'sideAB', Infinity);
    }

    mapPenPosition(distanceToRuler: DistanceToRuler, mousePosition: Point,  strokeThickness : number = 1): Point {
        return new Point(0,0);
    }
}