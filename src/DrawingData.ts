import { BaseDrawingEvent } from "./BaseDrawingEvent";
import { EraserShapeType } from "./BaseEraserSettings";
import { Point } from "./Point";


export interface DrawingType{
    type: string;
}

export class Line implements DrawingType{

    color: string = '#000000';
    strokeWidth : number = 1 ;
    points : Array<Point> = new Array<Point>;
    type = 'Line';

    clone():Line{
        let line = new Line();
        line.color = this.color;
        line.strokeWidth = this.strokeWidth;
        line.points = [...this.points];

        return line;
    }
}

export class Arc{

    startAngle : number = 0;
    endAngle : number = 0;
    direction: boolean = false;
    radius : number = 1;
    center: Point = new Point(0,0);
}

export class Arcs{

    color: string = '#000000';
    strokeWidth : number = 1 ;
    arcsInfo : Array<Arc> = new Array<Arc>;
    type = 'Arcs';
   

    clone():Arcs{
        let newArcs = new Arcs();
        newArcs.color = this.color;
        newArcs.strokeWidth = this.strokeWidth;
        newArcs.arcsInfo = [...this.arcsInfo];

        return newArcs;
    }
}

export class ErasedLine implements DrawingType{
    eraserType : EraserShapeType = EraserShapeType.Square;
    width : number = 1 ;
    points : Array<Point> = new Array<Point>
    type = 'ErasedLine';
   

    clone():ErasedLine{
        let erasedLine = new ErasedLine();
        erasedLine.eraserType = this.eraserType;
        erasedLine.width = this.width;
        erasedLine.points = [...this.points];

        return erasedLine;
    }
}

export class LinesDrawingCompletedEvent extends BaseDrawingEvent{

    private _line: Line ;

    constructor(line: Line){
        super('LinesDrawingCompletedEvent');
        this._line = line;
    }

    get line() : Line{
        return this._line;
    }
}

export class ErasedLinesDrawingCompletedEvent extends BaseDrawingEvent{

    private _erasedLine: ErasedLine ;

    constructor(line: ErasedLine){
        super('ErasedLinesDrawingCompletedEvent');
        this._erasedLine = line;
    }

    get erasedLine() : ErasedLine{
        return this._erasedLine;
    }
}

export class ArcsDrawingCompletedEvent extends BaseDrawingEvent{

    private _arcs: Arcs ;

    constructor(arcs: Arcs){
        super('ArcsDrawingCompletedEvent');
        this._arcs = arcs;
    }

    get arcs() : Arcs{
        return this._arcs;
    }
}
