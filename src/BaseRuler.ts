import { DrawingLayer } from "./DrawingLayer";
import { Point } from "./Point";


export enum RulersType{
    NormalRuler = 'Ruler',
    SetSquare = 'SetSquare',
    Protractor = 'Protractor'
}

export class DistanceToRuler{

    constructor(public ruler : RulersType = RulersType.NormalRuler,
                public side : string  = '',
                public distance : number = 0){}
}
export abstract class BaseRuler{

    protected _angleOfRotation : number = 0;

    protected _id : string;
    protected _drawingLayer : DrawingLayer;
    protected _svgRulerInstance: SVGElement;
    protected _zIndex : number = 50; 
    protected _width : number = 25*0.2645833;
    protected _height : number = 3*0.2645833;
    protected _topLeftPostion : Point;
    protected _defaultFontSize : number = 12;
    protected _strokeColor : string = '#304FFE';
    protected _strokeWidth : number =  3;
    protected _fillColor : string = 'transparent';//'#E3F2FD';
    protected _markersStrokeWidth : number =  1;
    protected _markersColor : string = '#304FFE';

    protected _startDragging : boolean = false;
    protected _startPosition : Point | null = null;

    protected readonly _type: RulersType;

    static readonly Ruler_Shift = 2;
    static readonly Ruler_Capture_Distance : number = 15;

    constructor(id: string, drawingLayer : DrawingLayer, width: number , height: number, type: RulersType){
        this._id = id;
        this._drawingLayer = drawingLayer;
        this._width = width;
        this._height = height;
        this._type = type;
        this._topLeftPostion = this.getTopLeftPosition();
        this._svgRulerInstance = this.createSVGRulerElement();
       
        document.body.appendChild(this._svgRulerInstance);
    }

    get id():string{
        return this.id;
    }

    get type():RulersType{
        return this._type;
    }

    get svgElement():SVGElement{
        return this._svgRulerInstance;
    }

    protected measureText(text: string , fontSize : number) : TextMetrics | undefined{
        let canvas = document.createElement("canvas");
        let context = canvas.getContext("2d");
        if (context){
            context.font = `${fontSize}px`;
            return  context.measureText(text);
        }
    }

    protected getTopLeftPosition(){
        let scrollPosition =  new Point(document.documentElement.scrollLeft,document.documentElement.scrollTop);
        return new Point(scrollPosition.x + 200, scrollPosition.y + 200);
    }

    protected createSVGRulerElement(): SVGElement{

        let svgRulerInstance = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgRulerInstance.id = `instance-${this._id}`;
        svgRulerInstance.setAttribute('width', `${this._width}`);
        svgRulerInstance.setAttribute('height', `${this._height}`);
        svgRulerInstance.setAttribute('style', `position:absolute;z-index:${this._zIndex};top:${this._topLeftPostion.y}px;left:${this._topLeftPostion.x}px;pointer-events: auto;`);
       
        return svgRulerInstance;
    }


    abstract calculateDistanceToRuler(penPosition : Point):DistanceToRuler;

    abstract mapPenPosition(distanceToRuler : DistanceToRuler, mousePosition: Point, strokeThickness : number ):Point ;

    dispose(){
        document.body.removeChild(this._svgRulerInstance);
    }

}