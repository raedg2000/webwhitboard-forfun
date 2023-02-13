import { BaseRuler as BaseRuler, CapturedRulerInfo, RulersType } from "./BaseRuler";
import { DrawingLayer } from "./DrawingLayer";
import { EventAggregator } from "./EventAggregator";
import { IDispose } from "./IDispose";
import { Point } from "./Point";
import { RulerReleasedCapture } from "./RulerDrawingEvents";
import { ToolBoxItemType } from "./ToolBoxItemType";

export class SetSquare extends BaseRuler implements IDispose{

    private _pointA : Point;
    private _pointB : Point;
    private _pointC : Point;
    private _center : Point;
    private _outerTriangle: SVGPathElement;
    private _svgAngleIndicator : SVGTextElement | undefined;

    constructor(id: string, drawingLayer : DrawingLayer){
        super(id, drawingLayer, 190/0.2645833, 95/0.2645833, RulersType.SetSquare);
        this._strokeWidth = 2;
        let h = (this._height - 2*this._strokeWidth);
        this._center = new Point(this._width/2, (this._height - 2*this._strokeWidth)/2);
        // this._pointA = new Point(this._width/2, this._strokeWidth);
        // this._pointB = new Point(this._strokeWidth, this._height - this._strokeWidth)
        // this._pointC = new Point(this._width - this._strokeWidth, this._height - this._strokeWidth)

        
        this._pointA = new Point(this._width/2, this._strokeWidth);
        this._pointB = new Point(this._width/2 - h, this._pointA.y + h);
        this._pointC = new Point(this._width/2 + h, this._pointA.y + h);

        let group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.id = `parentgroup#${this._id.split('#')[1]}`;
        this._svgRulerInstance.style.pointerEvents = 'none';
        this._svgRulerInstance.appendChild(group);
        
        this._outerTriangle = this.drawOuterTriangle(group);
        this.drawInnerTriangle(group);
        this.drawSideABUnits(group);
        this.drawSideACUnits(group);
        
        let radius = this.measureText('360°', this._defaultFontSize)?.width ?? 15;
        this.drawAngleCircle(group, radius);

        let metrics = this.measureText('360°', this._defaultFontSize)
        if (metrics){
            this.drawAngleText(group, metrics);
        }

        this.defineSetSquareEvents();
    }

    private defineSetSquareEvents(){
        this._outerTriangle.addEventListener('pointerdown', (event) =>{

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
            
            if ((pointerEvent.pointerType !== 'mouse') || (pointerEvent.pointerType === 'mouse' && pointerEvent.buttons === 1)){
                this._startDragging = true;
                this._outerTriangle.style.cursor = 'grab';
            }
        });

        this._outerTriangle.addEventListener('pointermove', (event) =>{

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
                    this.touchFingure2 = pointerEvent;
                    this.RotateByTouch();
                    return;
                }
            }

            if ((pointerEvent.pointerType !== 'mouse') || (pointerEvent.pointerType === 'mouse' && this._startDragging && pointerEvent.buttons === 1)){
                this._outerTriangle.style.cursor = 'grab';
                let x =   Number.parseFloat(this._svgRulerInstance.style.left)+ + pointerEvent.movementX;
                let y =   Number.parseFloat(this._svgRulerInstance.style.top)+ + pointerEvent.movementY;

                this._svgRulerInstance.style.left = x.toString();
                this._svgRulerInstance.style.top = y.toString();
                this._topLeftPostion = new Point(x, y);
            }

        });

        this._outerTriangle.addEventListener('pointerup', (event) =>{
            let pointerEvent = event as PointerEvent;
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();

            if (this._captured){
                this.uncapture(pointerEvent.pointerId);

                let rulerCaptureReleased = new RulerReleasedCapture(this.id, ToolBoxItemType.SetSquare);
                EventAggregator.publish(rulerCaptureReleased)
            }

            this.touchFingure1 = undefined;
            this.touchFingure2 = undefined;
            this.touchFingure1_IsCenter = false;
                     
            if (this._startDragging){
                this._outerTriangle.style.cursor = 'pointer';
            }
            this._startDragging = false;
           
        });

        this._outerTriangle.addEventListener('pointerover', (event) =>{
            let pointerEvent = event as PointerEvent;
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();

            if (!this._startDragging){
                this._outerTriangle.style.cursor = 'pointer';
            }

         });

         this._outerTriangle.addEventListener('pointerout', (event) =>{

            let pointerEvent = event as PointerEvent;
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();
            
            this._outerTriangle.style.cursor = 'auto';

        });

        this._outerTriangle.addEventListener('wheel', (event) =>{
            let wheelEvent = event as WheelEvent;
            wheelEvent.preventDefault();
            wheelEvent.stopPropagation();
         
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

    private drawAngleText (group : SVGElement, metrics: TextMetrics) {

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

    private drawAngleCircle  (group : SVGElement, radius: number) {
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

    private drawSideABUnits ( group : SVGElement) {
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


    private drawSideACUnits (group : SVGElement) {
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


    private calculateDistanceToRulerRightSide (position : Point) {

        let va_tx = this._pointA.x - this._center.x;
        let va_ty = this._pointA.y - this._center.y;
    
        let vc_tx = this._pointC.x - this._center.x;
        let vc_ty = this._pointC.y - this._center.y;
    
        let p_tx = position.x - this._center.x - this._topLeftPostion.x;
        let p_ty = position.y - this._center.y - this._topLeftPostion.y;
    
        let angle = Math.PI * this._angleOfRotation / 180;
    
        let va_x = Math.cos(angle) * va_tx - Math.sin(angle) * va_ty;
        let va_y = Math.sign(angle) * va_tx + Math.cos(angle) * va_ty;
    
        let vc_x = Math.cos(angle) * vc_tx - Math.sin(angle) * vc_ty;
        let vc_y = Math.sign(angle) * vc_tx + Math.cos(angle) * vc_ty;
    
        if (this._angleOfRotation === -45 || this._angleOfRotation === 135 || this._angleOfRotation === 315 || this._angleOfRotation === -225) {
            return Math.abs(p_ty - va_y);
        }
        else if (this._angleOfRotation === 45 || this._angleOfRotation === 225 || this._angleOfRotation == -135 || this._angleOfRotation === -315) {
            return Math.abs(p_tx - va_x);
        }
        else {
            let slope = (vc_y - va_y) / (vc_x - va_x);
            let p_slope = -1 / slope;
            let b = va_y - va_x * slope;
            let p_b = p_ty - p_tx * p_slope;
    
            let x = (p_b - b) / (slope - p_slope);
            let y = x * slope + b;
            return Math.sqrt(Math.pow((p_ty - y), 2) + Math.pow((p_tx - x), 2));
        }
    
    }
    
    calculateDistanceToRulerLeftSide(position : Point) {
    
        let va_tx = this._pointA.x - this._center.x;
        let va_ty = this._pointA.y - this._center.y;
    
        let vb_tx = this._pointB.x - this._center.x;
        let vb_ty = this._pointB.y - this._center.y;
    
        let p_tx = position.x - this._center.x - this._topLeftPostion.x;
        let p_ty = position.y - this._center.y - this._topLeftPostion.y;
    
        let angle = Math.PI * this._angleOfRotation / 180;
        let va_x = Math.cos(angle) * va_tx - Math.sin(angle) * va_ty;
        let va_y = Math.sign(angle) * va_tx + Math.cos(angle) * va_ty;
    
        let vb_x = Math.cos(angle) * vb_tx - Math.sin(angle) * vb_ty;
        let vb_y = Math.sign(angle) * vb_tx + Math.cos(angle) * vb_ty;
    
        let slope = 0;
        let p_slope = 0;
        if (this._angleOfRotation === 45 || this._angleOfRotation === 225 || this._angleOfRotation === -135 || this._angleOfRotation === -315) {
            return Math.abs(p_ty - va_y);
        }
        else if (this._angleOfRotation === 135 || this._angleOfRotation === 315 || this._angleOfRotation === -225 || this._angleOfRotation === -45) {
            return Math.abs(p_tx - va_x);
        }
        else {
            slope = (vb_y - va_y) / (vb_x - va_x);
            p_slope = -1 / slope;
            let b = va_y - va_x * slope;
            let p_b = p_ty - p_tx * p_slope;
    
            let x = (p_b - b) / (slope - p_slope);
            let y = x * slope + b;
    
            return Math.sqrt(Math.pow((p_ty - y), 2) + Math.pow((p_tx - x), 2));
        }
    }
    
    private calculateDistanceToRulerBottomSide (position: Point) {
    
        let px = position.x - this._center.x - this._topLeftPostion.x;
        let py = position.y - this._center.y - this._topLeftPostion.y;
    
        let height = this._pointB.y - this._center.y;
    
        if (this._angleOfRotation === 0) {
            return Math.abs(py - height);
    
        }
        else if (this._angleOfRotation === -90 || this._angleOfRotation === 270) {
            return Math.abs(px - height);
        }
        else if (this._angleOfRotation === 90 || this._angleOfRotation === -270) {
            return Math.abs(px + height);
        }
        else if (this._angleOfRotation === 180 || this._angleOfRotation === -180) {
            return Math.abs(py + height );
        }
        else {
            let translatedCurrentPositionX = position.x - this._center.x - this._topLeftPostion.x;
            let translatedCurrentPositionY = -(position.y - this._center.y - this._topLeftPostion.y);
            let angleInRadians = Math.PI * (-this._angleOfRotation) / 180;
            let theta = Math.PI / 2;
            let beta = angleInRadians + theta;
            let p = -height;
            let s = Math.tan(beta);
            let b = translatedCurrentPositionY - s * translatedCurrentPositionX;
            let x = (p / Math.sin(beta) - b) / (s + 1 / Math.tan(beta));
            let y = Math.tan(beta) * x + b;
     
            return Math.sqrt(Math.pow(translatedCurrentPositionY - y, 2) + Math.pow(translatedCurrentPositionX - x, 2));
        }
    }

    calculateDistanceToRuler(penPosition : Point): CapturedRulerInfo{

        let distanceFromLeftSide = this.calculateDistanceToRulerLeftSide(penPosition);
        let distanceFromRightSide = this.calculateDistanceToRulerRightSide(penPosition);
        let distanceFromBottomSide = this.calculateDistanceToRulerBottomSide(penPosition);
    
        let side = "sideAC";
        let distance = distanceFromBottomSide;
        if (distanceFromLeftSide < distanceFromBottomSide) {
            side = "sideAB";
            distance = distanceFromLeftSide;
            if (distanceFromRightSide < distanceFromLeftSide) {
                side = "sideAC";
                distance = distanceFromRightSide;
            }
        }
        else {
            side = "sideBC";
            distance = distanceFromBottomSide;
            if (distanceFromRightSide < distanceFromBottomSide ) {
                side = "sideAC";
                distance = distanceFromRightSide;
            }
        }
        
        return new CapturedRulerInfo(this.type, side, distance, new Point(this._topLeftPostion.x + this._center.x, this._topLeftPostion.y + this._center.y), this);
    }

    mapMousePositionToSideAB(mousePosition: Point,  strokeThickness : number = 1): Point {
    
        let center = this._center;
    
        let va_tx = this._pointA.x  - center.x;
        let va_ty = this._pointA.y - center.y  - (strokeThickness / 2 + 1.5*BaseRuler.Ruler_Shift) / Math.cos(Math.PI / 4);
    
        let vb_tx = this._pointB.x - (strokeThickness / 2 + 1.5*BaseRuler.Ruler_Shift) / Math.cos(Math.PI / 4) - center.x;
        let vb_ty = this._pointB.y - center.y ;
    
        let p_tx = mousePosition.x - center.x - this._topLeftPostion.x;
        let p_ty = mousePosition.y - center.y - this._topLeftPostion.y;
    
        let angle = Math.PI * this._angleOfRotation / 180;
        let va_x = Math.cos(angle) * va_tx - Math.sin(angle) * va_ty;
        let va_y = Math.sin(angle) * va_tx + Math.cos(angle) * va_ty;
    
        let vb_x = Math.cos(angle) * vb_tx - Math.sin(angle) * vb_ty;
        let vb_y = Math.sin(angle) * vb_tx + Math.cos(angle) * vb_ty;
    
        if (this._angleOfRotation === 45 || this._angleOfRotation === 225 || this._angleOfRotation === -135 || this._angleOfRotation === -315) {
            return new Point(mousePosition.x, va_y + center.y + this._topLeftPostion.y);
        }
        else if (this._angleOfRotation === 135 || this._angleOfRotation === 315 || this._angleOfRotation == -225 || this._angleOfRotation === -45) {
            return new Point(va_x + center.x + this._topLeftPostion.x, mousePosition.y);
        }
        else {
            let translatedCurrentPositionX = p_tx;
            let translatedCurrentPositionY = -p_ty;
            let angleInRadians = Math.PI * (-this._angleOfRotation ) / 180;
            let theta = Math.PI -  Math.PI / 4;
            let beta = angleInRadians + theta;
            let p = - (va_ty) * Math.sin(Math.PI / 4);
            let s = Math.tan(beta);
            let b = translatedCurrentPositionY - s * translatedCurrentPositionX;
            let x = (p / Math.sin(beta) - b) / (s + 1 / Math.tan(beta));
            let y = Math.tan(beta) * x + b;
            return new Point(center.x + this._topLeftPostion.x + x, center.y +this._topLeftPostion.y - y);
    
        }
    }

    mapMousePositionToSideAC(mousePosition: Point,  strokeThickness : number = 1): Point {
        let center = this._center;
    
        let va_tx = this._pointA.x - center.x ;
        let va_ty = this._pointA.y - center.y - (strokeThickness / 2 + 1.5*BaseRuler.Ruler_Shift) / Math.cos(Math.PI / 4);
    
        let vc_tx = this._pointC.x + (strokeThickness / 2 + 1.5*BaseRuler.Ruler_Shift) / Math.cos(Math.PI / 4) - center.x;
        let vc_ty = this._pointC.y - center.y ;
    
        let p_tx = mousePosition.x - center.x - this._topLeftPostion.x;
        let p_ty = mousePosition.y - center.y - this._topLeftPostion.x;
    
        let angle = Math.PI * this._angleOfRotation / 180;
        let va_x = Math.cos(angle) * va_tx - Math.sin(angle) * va_ty;
        let va_y = Math.sin(angle) * va_tx + Math.cos(angle) * va_ty;
    
        let vc_x = Math.cos(angle) * vc_tx - Math.sin(angle) * vc_ty;
        let vc_y = Math.sin(angle) * vc_tx + Math.cos(angle) * vc_ty;
    
        if (this._angleOfRotation === -45 || this._angleOfRotation == 135 || this._angleOfRotation === 315 || this._angleOfRotation === -225) {
            return new Point(mousePosition.x, va_y + center.y + this._topLeftPostion.y);
        }
        else if (this._angleOfRotation === 45 || this._angleOfRotation === 225 || this._angleOfRotation === -135 || this._angleOfRotation === -315) {
            return new Point(va_x + center.x + this._topLeftPostion.x, mousePosition.y )
        }
        else {
            let translatedCurrentPositionX = p_tx;
            let translatedCurrentPositionY = -p_ty;
            let angleInRadians = Math.PI * (-this._angleOfRotation) / 180;
            let theta =  Math.PI / 4;
            let beta = angleInRadians + theta;
            let p = -(va_ty) * Math.sin(Math.PI / 4);
            let s = Math.tan(beta);
            let b = translatedCurrentPositionY - s * translatedCurrentPositionX;
            let x = (p / Math.sin(beta) - b) / (s + 1 / Math.tan(beta));
            let y = Math.tan(beta) * x + b;
            return new Point(center.x + this._topLeftPostion.x + x, center.y + this._topLeftPostion.y - y  )
        }
    }
     
    mapMousePositionToSideBC(mousePosition: Point,  strokeThickness : number = 1): Point {
        
        let height = this._pointB.y - this._center.y;

        if (this._angleOfRotation === 0) {
            return new Point(mousePosition.x, this._pointB.y + this._topLeftPostion.y + BaseRuler.Ruler_Shift + strokeThickness / 2 );
        }
    
        if (this._angleOfRotation === 180 || this._angleOfRotation === -180) {
            return new Point(mousePosition.x, this._pointB.y + this._topLeftPostion.y - BaseRuler.Ruler_Shift - strokeThickness / 2 );
        }
    
        if (this._angleOfRotation === -90 || this._angleOfRotation === 270) {
            return new Point(this._center.x + height + this._topLeftPostion.x + BaseRuler.Ruler_Shift + strokeThickness / 2, mousePosition.y);
        }
    
        if (this._angleOfRotation === 90 || this._angleOfRotation === -270) {
            return new Point(this._center.x - height - BaseRuler.Ruler_Shift - strokeThickness / 2 + this._topLeftPostion.x, mousePosition.y);
        }
        else {
            let translatedCurrentPositionX = mousePosition.x - this._center.x - this._topLeftPostion.x;
            let translatedCurrentPositionY = -(mousePosition.y - this._center.y - this._topLeftPostion.y);
            let angleInRadians = Math.PI * (-this._angleOfRotation) / 180;
            let theta = Math.PI / 2;
            let beta = angleInRadians + theta;
    
            let p = -(strokeThickness / 2 + height + BaseRuler.Ruler_Shift);
            let s = Math.tan(beta);
            let b = translatedCurrentPositionY - s * translatedCurrentPositionX;
            let x = (p / Math.sin(beta) - b) / (s + 1 / Math.tan(beta));
            let y = Math.tan(beta) * x + b;
            return new Point(this._center.x + this._topLeftPostion.x + x, this._center.y + this._topLeftPostion.y - y)
    
        }
    }

    mapPenPosition(capturedRulerInfo: CapturedRulerInfo, mousePosition: Point,  strokeThickness : number = 1): Point {
       
        if (capturedRulerInfo.side == 'sideAC'){
            return this.mapMousePositionToSideAC(mousePosition,  strokeThickness);
        }
        else if (capturedRulerInfo.side == 'sideAB'){
            return this.mapMousePositionToSideAB(mousePosition,  strokeThickness);
        }
        else{
            return this.mapMousePositionToSideBC(mousePosition,  strokeThickness);
        }
    }

    capture(pointerId: number):void{
        this._captured = true;
        this._outerTriangle.setPointerCapture(pointerId);
    }

    uncapture(pointerId: number):void{
        this._captured = false;
        this._outerTriangle.releasePointerCapture(pointerId);
    }
}