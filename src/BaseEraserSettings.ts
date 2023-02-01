export enum EraserType{
    Circle,
    Square
}

export enum EraserShapeType{
    Circle = 'circle',
    Square = 'square'
}

export class BaseEraserSettings{

  
    private _type: EraserType =  EraserType.Circle
    private _width: number = 25; 
    private _eraserShape : EraserShapeType = EraserShapeType.Square ;
 
    get type():EraserType{
        return this._type;
    }

    set type(value:EraserType){
         this._type = value;
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