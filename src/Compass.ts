

import { BaseCompassSettings } from "./BaseCompassSettings";
import { BaseDrawingEvent } from "./BaseDrawingEvent";
import { CompassSettingsChangedEvent } from "./CompassDrawingEvents";
import { Arc, Arcs, ArcsDrawingCompletedEvent } from "./DrawingData";
import { DrawingLayer } from "./DrawingLayer";
import { EventAggregator } from "./EventAggregator";
import { IDispose } from "./IDispose";
import { IEventHandler } from "./IEventHandler";
import { IMouseEventsHandler } from "./IMouseEventsHandler";
import { Point } from "./Point";

export class Compass implements IEventHandler{
    
    static readonly MIN_RADIUS = 25/0.2645833;
    static readonly MAX_RADIUS = 200/0.2645833;

    private _id : string;
    private _settings : BaseCompassSettings;
    private _width: number = 120/0.2645833;
    private _height: number = 120/0.2645833;
    private _zIndex : number = 50;
    private _topLeftPosition : Point;
    private _radius : number ;
    private _drawingStarted : boolean = false;
    private _drawingLayer : DrawingLayer | null;
    private _svgCompassInstance : SVGElement;

    private _centerdiameter: number = 50;
    private _strokeLineColor: string = 'blue';
    private _strokLineWidth: number = 5;
    private _pencilColorBoxWidth : number = 16;
    private _pencilColorBoxHeight : number = 16;
    private _pencilColorBoxStrokeColor: string = `black`;
    private _pencilColorBoxStrokeWidth:number = 0.5;
    private _pencilWidth : number = 90;
    private _pencilHeight : number = 100;
    private _compassRadiusLengthTextRectStrokeWidth : number = 1;
    private _compassRadiusLengthTextRectWidth : number = 80;
    private _compassRadiusLengthTextRectHeight : number = 40;

    private _compassPen : SVGElement;
    private _compassRadius : SVGLineElement;
    private _compassCenter : SVGImageElement;
    private _compassLock : SVGImageElement;
    private _compassColorBox : SVGRectElement;
    private _compassRadiusText : SVGTextElement;
    private _compassRadiusTextRect: SVGRectElement;

    private _locked : boolean = false;

    private pencilDragging = false;
    private lineDragging = false;
    private centerDragging = false;
    private indicatorDragging = false;
    private drawingBoxChecked = true;

    private _lastPosition : Point | null = null;
    private _angle = 0;
    private _radiusCoordinates = new Point(0,0);
    private _line:Array<Point> = new Array<Point>();

    private _arcs : Arcs = new Arcs();

    constructor(id: string, settings : BaseCompassSettings, drawingLayer : DrawingLayer) {
        this._id = id;
        this._settings = settings;
        this._drawingLayer = drawingLayer;
        
        this._topLeftPosition = this.getTopLeftPosition();
        this._radius = 5*this._centerdiameter;

        this._svgCompassInstance = this.createSVGElement();
        let group = this.createRootGroup();
        this._compassLock = this.createLockImage(group);
        this._compassCenter = this.createCompassCenterImage(group);
        this._compassRadius = this.createLineBetweenCenterAndPen(group);
        this._compassPen = this.createCompassPen(group);
        this._compassColorBox = this.createCompassPenColorBoxIndicator(group);
       
        this._compassRadiusTextRect = this.createCompassRadiusLengthTextRectangle(group);
        this._compassRadiusText = this.createCompassRadiusLengthText(group);

        this._arcs.color = this.settings.color;
        this._arcs.strokeWidth = this.settings.thickness;

        document.body.appendChild(this._svgCompassInstance)
        
        this.defineCompassRadiusTextRectEvents();
        this.defineCompassPenEvents();
        this.defineCompassCenterEvents();
        this.defineCompassRadiusEvents();
        EventAggregator.subscribe('CompassSettingsChangedEvent', this)
    }

    get id(): string{
        return this._id;
    }

    get settings() : BaseCompassSettings{
        return this._settings;
    }

    set settings(value : BaseCompassSettings){
        this._settings = value;
        this._arcs.color = value.color;
        this._arcs.strokeWidth = value.thickness;
    }

    get drawingStarted():boolean{
        return this._drawingStarted;
    }

    private measureText(text: string , fontSize : number) : TextMetrics | undefined{
        let canvas = document.createElement("canvas");
        let context = canvas.getContext("2d");
        if (context){
            context.font = `${fontSize}px`;
            return  context.measureText(text);
        }
    }

    private mapMousePositionToCanvas(x : number, y : number) : Point{

        if (this._drawingLayer?.canvas) {
            let canvas = this._drawingLayer.canvas;
            var bbox = canvas.getBoundingClientRect();
    
            return  new Point((x - bbox.left) * (canvas.width / bbox.width),
                          (y - bbox.top) * (canvas.height / bbox.height));

        }
        else {
            return   new Point(-1,-1);
        }
    }

    private getTopLeftPosition():Point{
        let scrollPosition =  new Point(document.documentElement.scrollLeft,document.documentElement.scrollTop);
        return new Point(scrollPosition.x + 200, scrollPosition.y + 200);
    }

    private createSVGElement() : SVGElement {

        let compassInstance = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        compassInstance.setAttribute('width', '10000');
        compassInstance.setAttribute('height', '10000');
        compassInstance.setAttribute('style', `z-index:${this._zIndex};position:absolute;top:${0}px;left:${0}px;pointer-events: none;`);
        compassInstance.id = this._id;

        return compassInstance;
    }

    private createRootGroup() : SVGElement{
        let group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.id = `parentgroup#${this._id.split('#')[1]}`;
        group.style.pointerEvents = 'auto';

        this._svgCompassInstance.appendChild(group);
        
        return group;
    }
    
    private createLockImage(group:SVGElement) : SVGImageElement{
        let imageWidth = 50;
        let marginFromCenter = 5;
        let lockImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
        lockImage.id = `compassLock#${this._id.split('#')[1]}`;
        lockImage.setAttribute('href', './images/unlock.svg');
        lockImage.setAttribute('width', `${imageWidth}`);
        lockImage.setAttribute('height', `${imageWidth}`);
        lockImage.setAttribute('style', `pointer-events: auto`);
        lockImage.setAttribute('x',  `${2*this._centerdiameter}` );
        lockImage.setAttribute('y',  `${this._height -  2*this._centerdiameter - imageWidth - marginFromCenter}`);

        lockImage.addEventListener('pointerup', (event) => {
            this._locked = !this._locked;
            if (this._locked){
                lockImage.setAttribute('href', './images/lock.svg');
            }
            else{
                lockImage.setAttribute('href', './images/unlock.svg');
            }
        });

        group.appendChild(lockImage);

        return lockImage
    }

    
    private createCompassCenterImage(group : SVGElement) : SVGImageElement{

        let centerImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
        centerImage.id = `compassCenter#${this._id.split('#')[1]}`;
        centerImage.setAttribute('href', './images/center.svg');
        centerImage.setAttribute('width', this._centerdiameter.toString());
        centerImage.setAttribute('height', this._centerdiameter .toString());
        centerImage.setAttribute('x',`${2*this._centerdiameter}`);
        centerImage.setAttribute('y',`${this._height- 2*this._centerdiameter}`);
        centerImage.style.pointerEvents = 'auto';

        group.appendChild(centerImage);

        return centerImage;
    }

    private createLineBetweenCenterAndPen(group: SVGElement) : SVGLineElement{
        let compassLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        compassLine.id = `compassLine#${this._id.split('#')[1]}`;

        compassLine.setAttribute('style', `pointer-events: auto`);
        compassLine.setAttribute('stroke', this._strokeLineColor);
        compassLine.setAttribute('stroke-width', this._strokLineWidth.toString());
        compassLine.setAttribute('x1',`${5*this._centerdiameter/2}`);
        compassLine.setAttribute('y1',`${this._height - 3*this._centerdiameter/2 }`);
        compassLine.setAttribute('x2',`${5*this._centerdiameter/2 + this._radius}`);
        compassLine.setAttribute('y2',`${this._height - 3*this._centerdiameter/2 }`);
        group.appendChild(compassLine);
       
        return compassLine;
    }

    private createCompassRadiusLengthTextRectangle(group : SVGElement): SVGRectElement{

        let compassRadiusLengthTextRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        compassRadiusLengthTextRect.id = `compassRadiusLengthRect#${this._id.split('#')[1]}`;

        compassRadiusLengthTextRect.setAttribute('style', `pointer-events: auto`);
        compassRadiusLengthTextRect.setAttribute('stroke', this._strokeLineColor);
        compassRadiusLengthTextRect.setAttribute('stroke-width', this._compassRadiusLengthTextRectStrokeWidth.toString());
        compassRadiusLengthTextRect.setAttribute('fill', 'white');
        compassRadiusLengthTextRect.setAttribute('width', this._compassRadiusLengthTextRectWidth.toString());
        compassRadiusLengthTextRect.setAttribute('height', this._compassRadiusLengthTextRectHeight.toString());

        let x1 = Number(this._compassRadius.getAttribute('x1')) ;
        let y1 = Number(this._compassRadius.getAttribute('y1')) ;
        let x2 = Number(this._compassRadius.getAttribute('x2')) ;
        let y2 = Number(this._compassRadius.getAttribute('y2')) ;

        let x = (x2 + x1)/2 - this._compassRadiusLengthTextRectWidth/2;
        let y = (y1 + y2)/2 - this._compassRadiusLengthTextRectHeight/2;
        compassRadiusLengthTextRect.setAttribute('x',`${x}`);
        compassRadiusLengthTextRect.setAttribute('y',`${y}`);
        group.appendChild(compassRadiusLengthTextRect);
        

        return compassRadiusLengthTextRect;
    }

    private createCompassRadiusLengthText (group: SVGElement): SVGTextElement{
        let fontSize = 12;
        let radiusValue = `${(this._radius*0.02645833).toFixed(2)} cm`;
        let metrics = this.measureText(radiusValue, fontSize);
        let compassRadiusLengthText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        compassRadiusLengthText.id = `compassRadiusLengthText#${this._id.split('#')[1]}`;
        compassRadiusLengthText.setAttribute('style', `pointer-events: none; font-size:${fontSize}; font-color:blue`);
        
        group.appendChild(compassRadiusLengthText);
        
        if (metrics){
            let x = Number(this._compassRadiusTextRect.getAttribute('x')) + this._compassRadiusLengthTextRectWidth/2 - metrics.width/2;
            let y = Number(this._compassRadiusTextRect.getAttribute('y')) + this._compassRadiusLengthTextRectHeight/2 + metrics.fontBoundingBoxAscent/2 ;
            compassRadiusLengthText.setAttribute('x',`${x}`);
            compassRadiusLengthText.setAttribute('y',`${y}`);
        }

        let data = document.createTextNode(radiusValue);
        compassRadiusLengthText.appendChild(data);

        return compassRadiusLengthText;
    }

    private createCompassPenColorBoxIndicator(group:SVGElement): SVGRectElement{
        let margin = 0;
        let colorBox = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        colorBox.id = `compassColorBox#${this._id.split('#')[1]}`;
        colorBox.setAttribute('style', `pointer-events: auto`);

        colorBox.setAttribute('width', this._pencilColorBoxWidth.toString());
        colorBox.setAttribute('height', this._pencilColorBoxHeight.toString());
        colorBox.setAttribute('stroke', this._pencilColorBoxStrokeColor);
        colorBox.setAttribute('stroke-width', this._pencilColorBoxStrokeWidth.toString());
        colorBox.setAttribute('fill', this.settings.color);
        colorBox.setAttribute('x',`${5*this._centerdiameter/2 + this._radius - this._pencilColorBoxWidth/2}`);
        colorBox.setAttribute('y',`${this._height - 3*this._centerdiameter/2 - this._pencilHeight - this._pencilColorBoxHeight - margin}`);
        group.appendChild(colorBox);

        colorBox.addEventListener('pointerup', (event) => {
            this.drawingBoxChecked = !this.drawingBoxChecked;
            if (this.drawingBoxChecked){
                colorBox.setAttribute('fill', this.settings.color);
            }
            else{
                colorBox.setAttribute('fill', 'transparent');
            }
        });

        colorBox.addEventListener('pointerover',  (event) => {
            let pointerEvent = event as PointerEvent;
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();

            if (!this.lineDragging){
                colorBox.style.cursor = 'pointer';
            }
            
        });
        colorBox.addEventListener('pointerout',  (event) => {
            let pointerEvent = event as PointerEvent;
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();
            
            colorBox.style.cursor = 'auto';
        });
  
        return colorBox;
    }


    private createCompassPen(group : SVGElement): SVGImageElement{
        let pencilImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
        pencilImage.id = `compassPencil#${this._id.split('#')[1]}`;
        pencilImage.setAttribute('style', `pointer-events: auto`);
        pencilImage.setAttribute("href", "./images/pencil.svg");
        pencilImage.setAttribute('width', this._pencilWidth.toString());
        pencilImage.setAttribute('height', this._pencilHeight.toString());

        pencilImage.setAttribute('x',`${5*this._centerdiameter/2 + this._radius - this._pencilWidth/2}`);
        pencilImage.setAttribute('y',`${this._height - 3*this._centerdiameter/2 - this._pencilHeight}`);

        group.appendChild(pencilImage);

        return pencilImage;
    }


    private defineCompassRadiusEvents(){
         this._compassRadius.addEventListener('pointerdown',  (event) => {
            document.body.style.touchAction ='none';
            if (!this._locked && (event.pointerType !== 'mouse'  || (event.pointerType === 'mouse' && event.button === 0))){
                this._compassRadius.style.cursor = 'grab';
                event.preventDefault();
                event.stopPropagation();
                this.lineDragging = true;
            }

        });

        this._compassRadius.addEventListener('pointermove', (event) => {
            let pointerEvent = event as PointerEvent;
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();
            document.body.style.touchAction ='none';
            if (!this._locked && (event.pointerType !== 'mouse'  || (pointerEvent.pointerType === 'mouse'  && pointerEvent.buttons === 1)) && this.lineDragging){
                this._compassRadius.style.cursor = 'grab';

                this._topLeftPosition = new Point( this._topLeftPosition.x + pointerEvent.movementX, this._topLeftPosition.y + pointerEvent.movementY);

                let x = Number(this._compassPen.getAttribute('x')) + pointerEvent.movementX;
                let y = Number(this._compassPen.getAttribute('y')) + pointerEvent.movementY;

                this._compassPen.setAttribute('x',`${x}`);
                this._compassPen.setAttribute('y',`${y}`);

                x = Number(this._compassColorBox.getAttribute('x')) + pointerEvent.movementX;
                y = Number(this._compassColorBox.getAttribute('y')) + pointerEvent.movementY;

                this._compassColorBox.setAttribute('x',`${x}`);
                this._compassColorBox.setAttribute('y',`${y}`);
                
                x = Number(this._compassLock.getAttribute('x')) + pointerEvent.movementX;
                y = Number(this._compassLock.getAttribute('y')) + pointerEvent.movementY;

                this._compassLock.setAttribute('x',`${x}`);
                this._compassLock.setAttribute('y',`${y}`);

                x = Number(this._compassCenter.getAttribute('x')) + pointerEvent.movementX;
                y = Number(this._compassCenter.getAttribute('y')) + pointerEvent.movementY;

                this._compassCenter.setAttribute('x',`${x}`);
                this._compassCenter.setAttribute('y',`${y}`);

                let x1 = Number(this._compassRadius.getAttribute('x1')) + pointerEvent.movementX;
                let y1 = Number(this._compassRadius.getAttribute('y1')) + pointerEvent.movementY;
                let x2 = Number(this._compassRadius.getAttribute('x2')) + pointerEvent.movementX;
                let y2 = Number(this._compassRadius.getAttribute('y2')) + pointerEvent.movementY;

                this._compassRadius.setAttribute('x1',`${x1}`);
                this._compassRadius.setAttribute('y1',`${y1}`);
                this._compassRadius.setAttribute('x2',`${x2}`);
                this._compassRadius.setAttribute('y2',`${y2}`);

                x = Number(this._compassRadiusTextRect.getAttribute('x')) + pointerEvent.movementX;
                y = Number(this._compassRadiusTextRect.getAttribute('y')) + pointerEvent.movementY;

                this._compassRadiusTextRect.setAttribute('x',`${x}`);
                this._compassRadiusTextRect.setAttribute('y',`${y}`);

                x = Number(this._compassRadiusText.getAttribute('x')) + pointerEvent.movementX;
                y = Number(this._compassRadiusText.getAttribute('y')) + pointerEvent.movementY;
                this._compassRadiusText.setAttribute('x',`${x}`);
                this._compassRadiusText.setAttribute('y',`${y}`);
            }
        });
        this._compassRadius.addEventListener('pointerup',  (event) => {
            let pointerEvent = event as PointerEvent;
            document.body.style.touchAction ='auto';
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();

            if (this.lineDragging){
                this._compassRadius.style.cursor = 'pointer';
            }
            this.lineDragging = false;
        });

        this._compassRadius.addEventListener('pointerover',  (event) => {
            let pointerEvent = event as PointerEvent;
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();

            if (!this.lineDragging){
                this._compassRadius.style.cursor = 'pointer';
            }
            
        });
        this._compassRadius.addEventListener('pointerout',  (event) => {
            let pointerEvent = event as PointerEvent;
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();
            
            this._compassRadius.style.cursor = 'auto';
        });
  
    }

    private defineCompassRadiusTextRectEvents(){
        this._compassRadiusTextRect.addEventListener('pointerdown',  (event) => {
            document.body.style.touchAction ='none';
            if (!this._locked && (event.pointerType !== 'mouse'  || (event.pointerType === 'mouse' && event.button === 0))){
                this._compassRadiusTextRect.style.cursor = 'grab';
                event.preventDefault();
                event.stopPropagation();
                this.indicatorDragging = true;
            }
            else if (this._locked){
                event.preventDefault();
                event.stopPropagation();
                
                this.handleClickEventToDrawOrRotate(event);
            }

        });

        this._compassRadiusTextRect.addEventListener('pointermove', (event) => {
            let pointerEvent = event as PointerEvent;
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();
            document.body.style.touchAction ='none';
            if (!this._locked && (event.pointerType !== 'mouse'  || (pointerEvent.pointerType === 'mouse'  && pointerEvent.buttons === 1)) && this.indicatorDragging){
                this._compassRadiusTextRect.style.cursor = 'grab';

                this._topLeftPosition = new Point( this._topLeftPosition.x + pointerEvent.movementX, this._topLeftPosition.y + pointerEvent.movementY);


                let x = Number(this._compassPen.getAttribute('x')) + pointerEvent.movementX;
                let y = Number(this._compassPen.getAttribute('y')) + pointerEvent.movementY;

                this._compassPen.setAttribute('x',`${x}`);
                this._compassPen.setAttribute('y',`${y}`);

                x = Number(this._compassColorBox.getAttribute('x')) + pointerEvent.movementX;
                y = Number(this._compassColorBox.getAttribute('y')) + pointerEvent.movementY;

                this._compassColorBox.setAttribute('x',`${x}`);
                this._compassColorBox.setAttribute('y',`${y}`);
                
                x = Number(this._compassLock.getAttribute('x')) + pointerEvent.movementX;
                y = Number(this._compassLock.getAttribute('y')) + pointerEvent.movementY;

                this._compassLock.setAttribute('x',`${x}`);
                this._compassLock.setAttribute('y',`${y}`);

                x = Number(this._compassCenter.getAttribute('x')) + pointerEvent.movementX;
                y = Number(this._compassCenter.getAttribute('y')) + pointerEvent.movementY;

                this._compassCenter.setAttribute('x',`${x}`);
                this._compassCenter.setAttribute('y',`${y}`);

                let x1 = Number(this._compassRadius.getAttribute('x1')) + pointerEvent.movementX;
                let y1 = Number(this._compassRadius.getAttribute('y1')) + pointerEvent.movementY;
                let x2 = Number(this._compassRadius.getAttribute('x2')) + pointerEvent.movementX;
                let y2 = Number(this._compassRadius.getAttribute('y2')) + pointerEvent.movementY;

                this._compassRadius.setAttribute('x1',`${x1}`);
                this._compassRadius.setAttribute('y1',`${y1}`);
                this._compassRadius.setAttribute('x2',`${x2}`);
                this._compassRadius.setAttribute('y2',`${y2}`);

                x = Number(this._compassRadiusTextRect.getAttribute('x')) + pointerEvent.movementX;
                y = Number(this._compassRadiusTextRect.getAttribute('y')) + pointerEvent.movementY;

                this._compassRadiusTextRect.setAttribute('x',`${x}`);
                this._compassRadiusTextRect.setAttribute('y',`${y}`);

                x = Number(this._compassRadiusText.getAttribute('x')) + pointerEvent.movementX;
                y = Number(this._compassRadiusText.getAttribute('y')) + pointerEvent.movementY;
                this._compassRadiusText.setAttribute('x',`${x}`);
                this._compassRadiusText.setAttribute('y',`${y}`);
            }

        });

        this._compassRadiusTextRect.addEventListener('pointerup',  (event) => {
            let pointerEvent = event as PointerEvent;
            document.body.style.touchAction ='auto';
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();

            if (this.indicatorDragging){
                this._compassRadiusTextRect.style.cursor = 'pointer';
            }
            this.indicatorDragging = false;
        });

        this._compassRadiusTextRect.addEventListener('pointerover',  (event) => {
            let pointerEvent = event as PointerEvent;
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();

            if (!this.indicatorDragging){
                this._compassRadiusTextRect.style.cursor = 'pointer';
            }
            
        });

        this._compassRadiusTextRect.addEventListener('pointerout',  (event) => {
            let pointerEvent = event as PointerEvent;
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();
            
            this._compassRadiusTextRect.style.cursor = 'auto';
        });

        this._compassRadiusTextRect.addEventListener('wheel',  (event) => {
            this.handleWheelEventToDrawOrRotate(event);
        });
        
  
    }

    private defineCompassPenEvents(){
        this._compassPen.addEventListener('pointerdown',  (event) => {
            document.body.style.touchAction ='none';
            if (!this._locked && (event.pointerType !== 'mouse'  || (event.pointerType === 'mouse' && event.buttons === 1))){
                event.preventDefault();
                event.stopPropagation();
                this._compassPen.style.cursor = 'grab';
                this.pencilDragging = true;
            }
            else if (this._locked && (event.pointerType !== 'mouse'  || (event.pointerType === 'mouse' && event.buttons === 1))){
                event.preventDefault();
                event.stopPropagation();
                this._compassPen.style.cursor = 'grab';
                this._drawingStarted = true;
                this._compassPen.setPointerCapture(event.pointerId);
            }
                //this.handleClickEventToDrawOrRotate(event);
        });

        this._compassPen.addEventListener('pointermove', (event) => {
            let pointerEvent = event as PointerEvent;
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();
            document.body.style.touchAction ='none';

            if (!this._locked && (event.pointerType !== 'mouse'  || (pointerEvent.pointerType === 'mouse'  && pointerEvent.buttons === 1)) && this.pencilDragging){
                this._compassPen.style.cursor = 'grab';
                
                let x1 = Number(this._compassRadius.getAttribute('x1')) ;
                let y1 = Number(this._compassRadius.getAttribute('y1')) ;

                let x2 = Number(this._compassRadius.getAttribute('x2')) + pointerEvent.movementX;
                let y2 = Number(this._compassRadius.getAttribute('y2')) + pointerEvent.movementY;

                let radius = Math.sqrt((x2- x1)**2 + (y2 - y1)**2);
                if (radius < Compass.MIN_RADIUS || radius > Compass.MAX_RADIUS)
                {
                    return;
                }

                this._radius = radius;

                this._compassRadius.setAttribute('x2',`${x2}`);
                this._compassRadius.setAttribute('y2',`${y2}`);
                
                let x = Number(this._compassPen.getAttribute('x')) + pointerEvent.movementX;
                let y = Number(this._compassPen.getAttribute('y')) + pointerEvent.movementY;

                this._compassPen.setAttribute('x',`${x}`);
                this._compassPen.setAttribute('y',`${y}`);

                x = Number(this._compassRadiusTextRect.getAttribute('x')) + pointerEvent.movementX;
                y = Number(this._compassRadiusTextRect.getAttribute('y')) + pointerEvent.movementY;

                this._compassRadiusTextRect.setAttribute('x',`${x}`);
                this._compassRadiusTextRect.setAttribute('y',`${y}`);

                x = Number(this._compassColorBox.getAttribute('x')) + pointerEvent.movementX;
                y = Number(this._compassColorBox.getAttribute('y')) + pointerEvent.movementY;

                this._compassColorBox.setAttribute('x',`${x}`);
                this._compassColorBox.setAttribute('y',`${y}`);
                
                x = (x2 + x1)/2 - this._compassRadiusLengthTextRectWidth/2;
                y = (y1 + y2)/2 - this._compassRadiusLengthTextRectHeight/2;
                this._compassRadiusTextRect.setAttribute('x',`${x}`);
                this._compassRadiusTextRect.setAttribute('y',`${y}`);

                let fontSize = 12;
                let radiusValue = `${(this._radius*0.02645833).toFixed(2)} cm`;
                let metrics = this.measureText(radiusValue, fontSize);
                if (metrics){
                    x = x + this._compassRadiusLengthTextRectWidth/2 - metrics.width/2;
                    y = y + this._compassRadiusLengthTextRectHeight/2 + metrics.fontBoundingBoxAscent/2 ;
                    this._compassRadiusText.setAttribute('x',`${x}`);
                    this._compassRadiusText.setAttribute('y',`${y}`);
                    this._compassRadiusText.childNodes[0].textContent = radiusValue;
                }
            }

            else if (this._locked && this._drawingStarted){
                this.movePencilInAnArc(pointerEvent);
            }

        });

        this._compassPen.addEventListener('pointerup',  (event) => {
            let pointerEvent = event as PointerEvent;
            document.body.style.touchAction ='auto';
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();
            
            if (this._drawingStarted){
                this._drawingStarted = false;
                this._compassPen.releasePointerCapture(pointerEvent.pointerId);
                let arcsDrawingCompletedEvent = new ArcsDrawingCompletedEvent(this._arcs);
                EventAggregator.publish(arcsDrawingCompletedEvent);
                this._arcs = new Arcs();
                this._arcs.color = this.settings.color;
                this._arcs.strokeWidth = this.settings.thickness;
            }
            else if (this.pencilDragging){
                this.updateAngle();
                this._compassPen.style.cursor = 'pointer';
            }
            this._drawingStarted = false;
            this.pencilDragging = false;
        });

        this._compassPen.addEventListener('pointerover',  (event) => {
            let pointerEvent = event as PointerEvent;
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();

            if (!this.pencilDragging){
                this._compassPen.style.cursor = 'pointer';
            }
            
        });
        this._compassPen.addEventListener('pointerout',  (event) => {
            let pointerEvent = event as PointerEvent;
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();
            
            this._compassPen.style.cursor = 'auto';
        });
  
        this._compassPen.addEventListener('wheel',  (event) => {
            this.handleWheelEventToDrawOrRotate(event);
        });
    }

    private defineCompassCenterEvents(){
        this._compassCenter.addEventListener('pointerdown',  (event) => {
            document.body.style.touchAction ='none';
            if (!this._locked && (event.pointerType !== 'mouse'  || (event.pointerType === 'mouse' && event.button === 0))){
                this._compassCenter.style.cursor = 'grab';
                event.preventDefault();
                event.stopPropagation();
                this.centerDragging = true;
            }
            else if (this._locked){
                event.preventDefault();
                event.stopPropagation();

                this.handleClickEventToDrawOrRotate(event);
            }

        });

        this._compassCenter.addEventListener('pointermove', (event) => {
            let pointerEvent = event as PointerEvent;
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();
            if (!this._locked && ((event.pointerType !== 'mouse'  || pointerEvent.pointerType === 'mouse'  && pointerEvent.buttons === 1)) && this.centerDragging){
                this._compassCenter.style.cursor = 'grab';

                let x1 = Number(this._compassRadius.getAttribute('x1')) + pointerEvent.movementX;
                let y1 = Number(this._compassRadius.getAttribute('y1')) + pointerEvent.movementY;

                let x2 = Number(this._compassRadius.getAttribute('x2')) ;
                let y2 = Number(this._compassRadius.getAttribute('y2')) ;

                let radius = Math.sqrt((x2- x1)**2 + (y2 - y1)**2);
                if (radius < Compass.MIN_RADIUS || radius > Compass.MAX_RADIUS)
                {
                    return;
                }

                this._radius = radius;

                this._compassRadius.setAttribute('x1',`${x1}`);
                this._compassRadius.setAttribute('y1',`${y1}`);

                let x = Number(this._compassLock.getAttribute('x')) + pointerEvent.movementX;
                let y = Number(this._compassLock.getAttribute('y')) + pointerEvent.movementY;

                this._compassLock.setAttribute('x',`${x}`);
                this._compassLock.setAttribute('y',`${y}`);

                x = Number(this._compassCenter.getAttribute('x')) + pointerEvent.movementX;
                y = Number(this._compassCenter.getAttribute('y')) + pointerEvent.movementY;

                this._compassCenter.setAttribute('x',`${x}`);
                this._compassCenter.setAttribute('y',`${y}`);
                
                x = Number(this._compassRadiusTextRect.getAttribute('x')) + pointerEvent.movementX;
                y = Number(this._compassRadiusTextRect.getAttribute('y')) + pointerEvent.movementY;

                this._compassRadiusTextRect.setAttribute('x',`${x}`);
                this._compassRadiusTextRect.setAttribute('y',`${y}`);

                x2 = Number(this._compassRadius.getAttribute('x2')) ;
                y2 = Number(this._compassRadius.getAttribute('y2')) ;
        
                x = (x2 + x1)/2 - this._compassRadiusLengthTextRectWidth/2;
                y = (y1 + y2)/2 - this._compassRadiusLengthTextRectHeight/2;
                this._compassRadiusTextRect.setAttribute('x',`${x}`);
                this._compassRadiusTextRect.setAttribute('y',`${y}`);

                let fontSize = 12;
                let radiusValue = `${(this._radius*0.02645833).toFixed(2)} cm`;
                let metrics = this.measureText(radiusValue, fontSize);
                if (metrics){
                    x = x + this._compassRadiusLengthTextRectWidth/2 - metrics.width/2;
                    y = y + this._compassRadiusLengthTextRectHeight/2 + metrics.fontBoundingBoxAscent/2 ;
                    this._compassRadiusText.setAttribute('x',`${x}`);
                    this._compassRadiusText.setAttribute('y',`${y}`);
                    this._compassRadiusText.childNodes[0].textContent = radiusValue;
                }
            }

        });

        this._compassCenter.addEventListener('pointerup',  (event) => {
            document.body.style.touchAction ='auto';
            let pointerEvent = event as PointerEvent;
            
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();

            if (this.centerDragging){
                this.updateAngle();
                this._compassCenter.style.cursor = 'pointer';
            }
            this.centerDragging = false;
        });

        this._compassCenter.addEventListener('pointerover',  (event) => {
            let pointerEvent = event as PointerEvent;
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();

            if (!this.centerDragging){
                this._compassCenter.style.cursor = 'pointer';
            }
            
        });
        this._compassCenter.addEventListener('pointerout',  (event) => {
            let pointerEvent = event as PointerEvent;
            pointerEvent.stopPropagation();
            pointerEvent.preventDefault();
            
            this._compassCenter.style.cursor = 'auto';
        });
  
        this._compassCenter.addEventListener('wheel',  (event) => {
            this.handleWheelEventToDrawOrRotate(event);
        });
    }

    private handleWheelEventToDrawOrRotate(event: WheelEvent){

        event.preventDefault();
        event.stopPropagation();
    
        if (this._locked ) {        
            let x1 = Number(this._compassRadius.getAttribute('x1')) ;
            let y1 = Number(this._compassRadius.getAttribute('y1')) ;        
            let x2 = Number(this._compassRadius.getAttribute('x2')) ;
            let y2 = Number(this._compassRadius.getAttribute('y2')) ;

            this._lastPosition = new Point(x2, y2);
            let previousAngle =this._angle*Math.PI/180;
            let direction = false;
            if (event.deltaY < 0){
                this._angle =  (this._angle - 1) % 360;;
                direction = true;
            }
            else
            {
                this._angle = (this._angle + 1) % 360;;
            }
            let newAngle = this._angle*Math.PI/180;
            
            let tx2_o = this._radius* Math.cos(previousAngle);
            let ty2_o = this._radius* Math.sin(previousAngle);

            let tx2_a = this._radius* Math.cos(newAngle);
            let ty2_a = this._radius* Math.sin(newAngle);

            let dx = tx2_o - tx2_a;
            let dy = -(ty2_o - ty2_a);

            this._lastPosition = new Point(x2 - dx , y2 + dy);

            this._compassRadius.setAttribute('x2',`${this._lastPosition.x}`);
            this._compassRadius.setAttribute('y2',`${this._lastPosition.y}`);
            
            let x = Number(this._compassPen.getAttribute('x')) - dx;
            let y = Number(this._compassPen.getAttribute('y')) + dy;

            this._compassPen.setAttribute('x',`${x}`);
            this._compassPen.setAttribute('y',`${y}`);

            x = Number(this._compassRadiusTextRect.getAttribute('x')) - dx;
            y = Number(this._compassRadiusTextRect.getAttribute('y')) + dy ;

            this._compassRadiusTextRect.setAttribute('x',`${x}`);
            this._compassRadiusTextRect.setAttribute('y',`${y}`);

            x = Number(this._compassColorBox.getAttribute('x')) - dx;
            y = Number(this._compassColorBox.getAttribute('y')) + dy;

            this._compassColorBox.setAttribute('x',`${x}`);
            this._compassColorBox.setAttribute('y',`${y}`);
            
            x2 = Number(this._compassRadius.getAttribute('x2')) ;
            y2 = Number(this._compassRadius.getAttribute('y2')) ;

            x = (x2 + x1)/2 - this._compassRadiusLengthTextRectWidth/2;
            y = (y2 + y1)/2 - this._compassRadiusLengthTextRectHeight/2;
            this._compassRadiusTextRect.setAttribute('x',`${x}`);
            this._compassRadiusTextRect.setAttribute('y',`${y}`);

            let fontSize = 12;
            let radiusValue = `${(this._radius*0.02645833).toFixed(2)} cm`;
            let metrics = this.measureText(radiusValue, fontSize);
            if (metrics){
                x = x + this._compassRadiusLengthTextRectWidth/2 - metrics.width/2;
                y = y + this._compassRadiusLengthTextRectHeight/2 + metrics.fontBoundingBoxAscent/2 ;
                this._compassRadiusText.setAttribute('x',`${x}`);
                this._compassRadiusText.setAttribute('y',`${y}`);
                this._compassRadiusText.childNodes[0].textContent = radiusValue;
            }
            
            if (this.drawingBoxChecked){
                this.drawArcUsingAngles(previousAngle, newAngle, direction);
                let arcsDrawingCompletedEvent = new ArcsDrawingCompletedEvent(this._arcs);
                EventAggregator.publish(arcsDrawingCompletedEvent);
                this._arcs = new Arcs();
                this._arcs.color = this.settings.color;
                this._arcs.strokeWidth = this.settings.thickness;
            }
        }
    } 
    
    private handleClickEventToDrawOrRotate(event: PointerEvent){

        if (this._locked ) {        
            let x1 = Number(this._compassRadius.getAttribute('x1')) ;
            let y1 = Number(this._compassRadius.getAttribute('y1')) ;        
            let x2 = Number(this._compassRadius.getAttribute('x2')) ;
            let y2 = Number(this._compassRadius.getAttribute('y2')) ;

            this._lastPosition = new Point(x2, y2);
            let previousAngle =this._angle*Math.PI/180;
            let direction = false;
            if (event.buttons === 1){
                this._angle =  (this._angle - 1) % 360;;
                direction = true;
            }
            else if (event.buttons === 2){
                this._angle = (this._angle + 1) % 360;;
            }
            else{
                return ;
            }
            let newAngle = this._angle*Math.PI/180;
            
            let tx2_o = this._radius* Math.cos(previousAngle);
            let ty2_o = this._radius* Math.sin(previousAngle);

            let tx2_a = this._radius* Math.cos(newAngle);
            let ty2_a = this._radius* Math.sin(newAngle);

            let dx = tx2_o - tx2_a;
            let dy = -(ty2_o - ty2_a);

            this._lastPosition = new Point(x2 - dx , y2 + dy);
            
            this._compassRadius.setAttribute('x2',`${this._lastPosition.x}`);
            this._compassRadius.setAttribute('y2',`${this._lastPosition.y}`);
            
            let x = Number(this._compassPen.getAttribute('x')) - dx;
            let y = Number(this._compassPen.getAttribute('y')) + dy;

            this._compassPen.setAttribute('x',`${x}`);
            this._compassPen.setAttribute('y',`${y}`);

            x = Number(this._compassRadiusTextRect.getAttribute('x')) - dx;
            y = Number(this._compassRadiusTextRect.getAttribute('y')) + dy ;

            this._compassRadiusTextRect.setAttribute('x',`${x}`);
            this._compassRadiusTextRect.setAttribute('y',`${y}`);

            x = Number(this._compassColorBox.getAttribute('x')) - dx;
            y = Number(this._compassColorBox.getAttribute('y')) + dy;

            this._compassColorBox.setAttribute('x',`${x}`);
            this._compassColorBox.setAttribute('y',`${y}`);
            
            x2 = Number(this._compassRadius.getAttribute('x2')) ;
            y2 = Number(this._compassRadius.getAttribute('y2')) ;

            x = (x2 + x1)/2 - this._compassRadiusLengthTextRectWidth/2;
            y = (y2 + y1)/2 - this._compassRadiusLengthTextRectHeight/2;
            this._compassRadiusTextRect.setAttribute('x',`${x}`);
            this._compassRadiusTextRect.setAttribute('y',`${y}`);

            let fontSize = 12;
            let radiusValue = `${(this._radius*0.02645833).toFixed(2)} cm`;
            let metrics = this.measureText(radiusValue, fontSize);
            if (metrics){
                x = x + this._compassRadiusLengthTextRectWidth/2 - metrics.width/2;
                y = y + this._compassRadiusLengthTextRectHeight/2 + metrics.fontBoundingBoxAscent/2 ;
                this._compassRadiusText.setAttribute('x',`${x}`);
                this._compassRadiusText.setAttribute('y',`${y}`);
                this._compassRadiusText.childNodes[0].textContent = radiusValue;
            }
            
            if (this.drawingBoxChecked){
                this.drawArcUsingAngles(previousAngle, newAngle, direction);
                let arcsDrawingCompletedEvent = new ArcsDrawingCompletedEvent(this._arcs);
                EventAggregator.publish(arcsDrawingCompletedEvent);
                this._arcs = new Arcs();
                this._arcs.color = this.settings.color;
                this._arcs.strokeWidth = this.settings.thickness;
            }
        }
    } 

    private drawArcUsingAngles(startAngle: number, endAngle: number, direction: boolean) {

        let context = this._drawingLayer?.canvas?.getContext('2d');

        if (context && this.drawingBoxChecked && this._locked) {
            
            let x1 = Number(this._compassRadius.getAttribute('x1')) ;
            let y1 = Number(this._compassRadius.getAttribute('y1')) ; 
            
            let arc = new Arc();
            arc.center = new Point(x1, y1);
            arc.radius = this._radius;
            arc.startAngle = startAngle;
            arc.endAngle = endAngle
            arc.direction = direction;

            context.save();

            context.strokeStyle = this.settings.color;
            context.lineWidth = this.settings.thickness;

            context.beginPath();
           
            context.arc(x1, y1, this._radius, startAngle, endAngle,  direction);
            context.stroke();

            context.restore();
            this._arcs.arcsInfo.push(arc);
        }

    }

    private getAngleInRadians (pointerEvent: PointerEvent): number {

        let x1 = Number(this._compassRadius.getAttribute('x1')) ;
        let y1 = Number(this._compassRadius.getAttribute('y1')) ;
        let x2 = Number(this._compassRadius.getAttribute('x2')) ;
        let y2 = Number(this._compassRadius.getAttribute('y2')) ;   
      
        let Rx = x2 - x1 + pointerEvent.movementX;
        let Ry = (y2 - y1) + pointerEvent.movementY;
    
        let angle = Math.atan(Ry/Rx);
        if (Ry > 0 && Rx > 0)
        {
            angle = angle;
        }
        else if ((Ry > 0 && Rx < 0) || (Ry < 0 && Rx < 0)){
            angle = (Math.PI + angle);
        }
        else if (Ry < 0 && Rx > 0)
        {
            angle = (2*Math.PI + angle);
        }
        
        return angle % (2*Math.PI);
    }

    private getRotationDirection(pointerEvent: PointerEvent, x2_before_rotation : number, y2_before_rotation : number,
                                 x2_after_rotation : number, y2_after_rotation : number): boolean {

        let xb2 = x2_before_rotation;
        let yb2 = y2_before_rotation;

        let xa2 = x2_after_rotation;
        let ya2 = y2_after_rotation;

        // both are in first quadrant
        if (xb2 > 0 && yb2 >= 0 && xa2 > 0  && ya2 > 0){
            if (xb2 >= xa2 && yb2 <= ya2){
                return true;
            }
        }
        if (xb2 > 0 && yb2 > 0 && xa2 <= 0  && ya2 > 0){
            return true;
        }

        if (xb2 <= 0 && yb2 > 0 && xa2 <= 0  && ya2 > 0){
            if (xb2 >= xa2 && yb2 > ya2){
                return true;
            }
        }

        if (xb2 <= 0 && yb2 > 0 && xa2 < 0  && ya2 <= 0){
                return true;
        }

        if (xb2 <= 0 && yb2 <= 0 && xa2 < 0  && ya2 < 0){
            if (xb2 < xa2 && yb2 > ya2){
                return true;
            }
        }

        if (xb2 < 0 && yb2 < 0 && xa2 >= 0  && ya2 < 0){
            return true;
        }

        if (xb2 >= 0 && yb2 < 0 && xa2 > 0  && ya2 <=0 ){
            if (xa2 > xb2 && ya2 > yb2){
                return true;
            }
        }
    
        if (xb2 > 0 && yb2 <= 0 && xa2 > 0  && ya2 > 0){
            return true;
        }

        return false;
    }
    
    
    private movePencilInAnArc(pointerEVent : PointerEvent) {

        if (pointerEVent.movementX === 0 && pointerEVent.movementY ===0){
            return ;
        }
        let x1 = Number(this._compassRadius.getAttribute('x1')) ;
        let y1 = Number(this._compassRadius.getAttribute('y1')) ;
        let x2 = Number(this._compassRadius.getAttribute('x2')) ;
        let y2 = Number(this._compassRadius.getAttribute('y2')) ;
        
        let x2_copy_before_rotation =  x2 - x1;
        let y2_copy_before_rotation =  -(y2 - y1);
        
        let startAngleInRadians = this._angle*Math.PI/180;
        x2 = x2 + pointerEVent.movementX;
        y2 = y2 + pointerEVent.movementY;
        let endAngleInRadians = this.getAngleInRadians(pointerEVent);
        
        x2 = this._radius * Math.cos(endAngleInRadians) + x1;
        y2 = this._radius * Math.sin(endAngleInRadians) + y1;
       
    
        this._compassPen.setAttribute('x',`${x2 - this._pencilWidth/2}`);
        this._compassPen.setAttribute('y',`${y2 - this._pencilHeight}`);
    
        this._compassRadius.setAttribute('x2', `${x2}`);
        this._compassRadius.setAttribute('y2', `${y2}`);

        this._compassColorBox.setAttribute('x',`${x2 - this._pencilColorBoxWidth/2}`);
        this._compassColorBox.setAttribute('y',`${y2- this._pencilHeight - this._pencilColorBoxHeight}`);
    
        let x = (x2 + x1)/2 - this._compassRadiusLengthTextRectWidth/2;
        let y = (y2 + y1)/2 - this._compassRadiusLengthTextRectHeight/2;
        this._compassRadiusTextRect.setAttribute('x',`${x}`);
        this._compassRadiusTextRect.setAttribute('y',`${y}`);

        let fontSize = 12;
        let radiusValue = `${(this._radius*0.02645833).toFixed(2)} cm`;
        let metrics = this.measureText(radiusValue, fontSize);
        if (metrics){
            x = x + this._compassRadiusLengthTextRectWidth/2 - metrics.width/2;
            y = y + this._compassRadiusLengthTextRectHeight/2 + metrics.fontBoundingBoxAscent/2 ;
            this._compassRadiusText.setAttribute('x',`${x}`);
            this._compassRadiusText.setAttribute('y',`${y}`);
            this._compassRadiusText.childNodes[0].textContent = radiusValue;
        }
        
        
        this.updateAngle();
        endAngleInRadians = this._angle*Math.PI/180;
        let x2_after_before_rotation =  x2 - x1;
        let y2_after_before_rotation =  -(y2 - y1);
        
       let rotationDirection = this.getRotationDirection(pointerEVent, x2_copy_before_rotation, y2_copy_before_rotation, x2_after_before_rotation, y2_after_before_rotation);
       
        if (this.drawingBoxChecked && Math.abs(startAngleInRadians) !== Math.abs(endAngleInRadians)){
            this.drawArcUsingAngles(startAngleInRadians, endAngleInRadians, rotationDirection);
        }

       
        
        // console.log(this._angle);
        //drawArc(compassSettings, cx, cy, startAngle, endAngle);
    }

    private updateAngle () {
        let x1 = Number(this._compassRadius.getAttribute('x1')) ;
        let y1 = Number(this._compassRadius.getAttribute('y1')) ; 
        let x2 = Number(this._compassRadius.getAttribute('x2')) ;
        let y2 = Number(this._compassRadius.getAttribute('y2')) ;  
        
        let Rx = x2 - x1;
        let Ry = -(y2 - y1);
        //let angle = Math.round(Math.atan(Ry/Rx) * 180/ Math.PI);
        let angle = Math.atan(Ry/Rx) * 180/ Math.PI;
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
        this._angle = angle % 360;
    }

    handle(eventData: CompassSettingsChangedEvent): void {
        this._settings = eventData.settings;
        this._compassColorBox.setAttribute('fill', this._settings.color);
    }
   
    dispose(){
           
        EventAggregator.unSubscribe('CompassSettingsChangedEvent', this);
        document.body.removeChild(this._svgCompassInstance);
    }

}

