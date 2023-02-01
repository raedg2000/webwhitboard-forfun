export class BaseCompassSettings{

    private _color: string = `#000000` // black color;
    private _thickness: number = 1;

 
    get color():string{
        return this._color;
    }

    set color(value:string){
         this._color = value;
    }

    get thickness():number{
        return this._thickness;
    }

    set thickness(value:number){
         this._thickness = value;
    }
}