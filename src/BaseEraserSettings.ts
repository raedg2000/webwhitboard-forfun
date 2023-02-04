
export enum EraserShapeType{
    Circle = 'circle',
    Square = 'square'
}

export class BaseEraserSettings{

    
    private _width: number = 25; 
    private _eraserShape : EraserShapeType = EraserShapeType.Square ;
    private _initialWidth : number = 25; 
    private _initialEraserShape : EraserShapeType = EraserShapeType.Square ;

    static readonly MAX_WIDTH = 50;

    get initialEraseShape():EraserShapeType{
        return this._initialEraserShape;
    }
 
    get initialWidth():number{
        return this._initialWidth;
    }

    get width():number{
        return this._width;
    }

    set width  (value:number){
         this._width = value;
    }

    get eraserShape():EraserShapeType{
        return this._eraserShape;
    }

    set eraserShape(value : EraserShapeType){
        this._eraserShape = value;
    }
}