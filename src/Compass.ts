

import { BaseCompassSettings } from "./BaseCompassSettings";
import { DrawingLayer } from "./DrawingLayer";
import { EventAggregator } from "./EventAggregator";
import { IDispose } from "./IDispose";
import { IMouseEventsHandler } from "./IMouseEventsHandler";
import { Point } from "./Point";

export class Compass{
    
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

    private center = Point;

    private _centerdiameter: number = 50;
    private _strokeLineColor: string = 'blue';
    private _strokLineWidth: number = 3;
    private _pencilColorBoxWidth : number = 16;
    private _pencilColorBoxHeight : number = 16;
    private _pencilColorBoxStrokeColor: string = `black`;
    private _pencilColorBoxStrokeWidth:number = 0.5;
    private _pencilWidth : number = 100;
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
    private _compassRasiusTextRect: SVGRectElement;

    private pencilDragging = false;
    private lineDragging = false;
    private centerDragging = false;
    private indicatorDragging = false;
    private drawing = false;
    private _line:Array<Point> = new Array<Point>();

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
        this._compassPen = this.createCompassPencil(group);
        this._compassColorBox = this.createCompassPenColorBoxIndicator(group);
       
        this._compassRasiusTextRect = this.createCompassRadiusLengthTextRectangle(group);
        this._compassRadiusText = this.createCompassRadiusLengthText(this._compassRasiusTextRect);

        document.body.appendChild(this._svgCompassInstance)
        
        //add compass to the document body
    }

    private measureText(text: string , fontSize : number) : TextMetrics | undefined{
        let canvas = document.createElement("canvas");
        let context = canvas.getContext("2d");
        if (context){
            context.font = `${fontSize}px`;
            return  context.measureText(text);
        }
    }

    private getTopLeftPosition():Point{
        let scrollPosition =  new Point(document.documentElement.scrollLeft,document.documentElement.scrollTop);
        return new Point(scrollPosition.x + 200, scrollPosition.y + 200);
    }

    private createSVGElement() : SVGElement {

        let compassInstance = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        compassInstance.setAttribute('width', this._width.toString());
        compassInstance.setAttribute('height', this._height.toString());
        compassInstance.setAttribute('style', `z-index:${this._zIndex};position:absolute;top:${this._topLeftPosition.y}px;left:${this._topLeftPosition.x}pxpointer-events: none;`);
        compassInstance.id = this._id;

        return compassInstance;
    }

    private createRootGroup() : SVGElement{
        let group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.id = `parentgroup#${this._id.split('#')[1]}`;
        group.style.pointerEvents = 'none';

        this._svgCompassInstance.appendChild(group);
        
        return group;
    }
    
    private createLockImage(group:SVGElement) : SVGImageElement{
        let imageWidth = 50;
        let marginFromCenter = 5;
        let lockImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
        lockImage.id = `compassLock#${this._id.split('#')[1]}`;
        lockImage.setAttribute('href', './images/lock.svg');
        lockImage.setAttribute('width', `${imageWidth}`);
        lockImage.setAttribute('height', `${imageWidth}`);
        lockImage.setAttribute('style', `pointer-events: auto`);
        lockImage.setAttribute('x',  `${2*this._centerdiameter}` );
        lockImage.setAttribute('y',  `${this._height -  2*this._centerdiameter - imageWidth - marginFromCenter}`);

        group.appendChild(lockImage);

        lockImage.addEventListener('mouseup', (event) =>{

        });
        
        return lockImage
    }

    
    private createCompassCenterImage(group : SVGElement) : SVGImageElement{

        let centerImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
        centerImage.id = `compassCenter#${this._id.split('#')[1]}`;
        centerImage.setAttribute('href', './images/center.svg');
        centerImage.setAttribute('style', `pointer-events: auto`);
        centerImage.setAttribute('width', this._centerdiameter.toString());
        centerImage.setAttribute('height', this._centerdiameter .toString());
        centerImage.setAttribute('x',`${2*this._centerdiameter}`);
        centerImage.setAttribute('y',`${this._height- 2*this._centerdiameter}`);

        group.appendChild(centerImage);


        centerImage.addEventListener('mousedown', (event)=>{

        });
        centerImage.addEventListener('mousemove', (event)=>{

        });
        centerImage.addEventListener('mouseup', (event)=>{

        });
        centerImage.addEventListener('mouseover', (event)=>{

        });
        centerImage.addEventListener('mouseout', (event)=>{

        });
        centerImage.addEventListener('wheel', (event)=>{

        });
        
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
        compassRadiusLengthTextRect.setAttribute('x',`${5*this._centerdiameter/2 + this._radius/2 - this._compassRadiusLengthTextRectWidth/2}`);
        compassRadiusLengthTextRect.setAttribute('y',`${this._height - 3*this._centerdiameter/2  - this._compassRadiusLengthTextRectHeight/2}`);
        group.appendChild(compassRadiusLengthTextRect);
        
        compassRadiusLengthTextRect.addEventListener('pointerdown',  (event) => {

        });
        compassRadiusLengthTextRect.addEventListener('pointermove', (event) => {

        });
        compassRadiusLengthTextRect.addEventListener('pointerup',  (event) => {

        });
        compassRadiusLengthTextRect.addEventListener('pointerover',  (event) => {

        });
        compassRadiusLengthTextRect.addEventListener('pointerout',  (event) => {

        });
  
        return compassRadiusLengthTextRect;
    }

    private createCompassRadiusLengthText (rect: SVGRectElement): SVGTextElement{
        let fontSize = 7;
        let radiusValue = `${(this._radius*0.02645833).toFixed(2)} cm`;
        let metrics = this.measureText(radiusValue, fontSize);
        let compassRadiusLengthText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        compassRadiusLengthText.id = `compassRadiusLengthText#${this._id.split('#')[1]}`;
        compassRadiusLengthText.setAttribute('style', `pointer-events: none; font-size:${fontSize}; font-color:blue`);
        rect.appendChild(compassRadiusLengthText);
        if (metrics){
            let x= 5*this._centerdiameter/2 + this._radius/2 + this._compassRadiusLengthTextRectWidth/2 - metrics.width/2;
            let y= this._height - 3*this._centerdiameter/2  - this._compassRadiusLengthTextRectHeight/2 + metrics.fontBoundingBoxAscent/2;
            compassRadiusLengthText.setAttribute('x',`${x}`);
            compassRadiusLengthText.setAttribute('y',`${y}`);
        }

        let data = document.createTextNode("abx");
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
        colorBox.setAttribute('x',`${5*this._centerdiameter/2 + this._radius - this._pencilColorBoxWidth/2}`);
        colorBox.setAttribute('y',`${this._height - 3*this._centerdiameter/2 - this._pencilHeight - this._pencilColorBoxHeight - margin}`);
        group.appendChild(colorBox);

        colorBox.addEventListener('pointerup', (event) => {

        });

        return colorBox;
    }

    private createCompassPencil(group : SVGElement): SVGImageElement{
        let pencilImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
        pencilImage.id = `compassPencil#${this._id.split('#')[1]}`;
        pencilImage.setAttribute('style', `pointer-events: auto`);
        pencilImage.setAttribute("href", "./images/pencil.svg");
        pencilImage.setAttribute('width', this._pencilWidth.toString());
        pencilImage.setAttribute('height', this._pencilHeight.toString());

        pencilImage.setAttribute('x',`${5*this._centerdiameter/2 + this._radius - this._pencilWidth/2}`);
        pencilImage.setAttribute('y',`${this._height - 3*this._centerdiameter/2 - this._pencilHeight}`);
        group.appendChild(pencilImage);

        pencilImage.addEventListener('pointerdown', (event) => {

        });
        pencilImage.addEventListener('pointermove', (event) => {

        });
        pencilImage.addEventListener('pointerup', (event) => {

        });
        pencilImage.addEventListener('pointerover', (event) => {

        });
        pencilImage.addEventListener('pointerout', (event) => {

        });

    
       return pencilImage;
    }

    get id(): string{
        return this._id;
    }

    get settings() : BaseCompassSettings{
        return this.settings;
    }

    set settings(value : BaseCompassSettings){
        this._settings = value;
    }

    get drawingStarted():boolean{
        return this._drawingStarted;
    }

    dispose(){
           
        //document.body.removeChild()
    }

}

