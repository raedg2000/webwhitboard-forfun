export class BasePenSettings{
    private _color: string = `#000000` // black color;
    private _thickness: number = 1;

    private _initialColor : string = `#000000`;
    private _initialThickness : number = 1;
 

    constructor(initialColor: string, initialThickness: number){
        this._initialColor = this.color = initialColor;
        this._initialThickness = this._thickness = initialThickness;
    }
        
    get initialColor():string{
        return this._initialColor;
    }

    get color():string{
        return this._color;
    }

    set color(value:string){
         this._color = value;
    }

    get initialThickness():number{
        return this._initialThickness;
    }

    get thickness():number{
        return this._thickness;
    }

    set thickness(value:number){
         this._thickness = value;
    }

    reset(){
        this.color =  this._initialColor ;
        this._thickness = this._initialThickness;
    }
}