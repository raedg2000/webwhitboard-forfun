import {ToolBoxItemType} from './ToolBoxItemType'
import { BaseEraserSettings } from "./BaseEraserSettings";
import { BaseCompassSettings } from "./BaseCompassSettings";
import { BasePenSettings } from "./BasePenSettings";

export class ToolBoxItem{

    protected _id : string ;
    protected _type : ToolBoxItemType;
    protected _isSelected : boolean = false;  
    protected _svgElement : SVGAElement | undefined = undefined;
    protected _divElement : HTMLElement | null;
    protected _settings : undefined | BasePenSettings | BaseEraserSettings | BaseCompassSettings;

    static normalStyleClass: string = '';
    static hoverStyleClass: string = '';
    static hoverSelectedClass: string = 'toolbox-item-selected';

    constructor(id: string, type : ToolBoxItemType){
        this._id = id;
        this._type = type;
        this._divElement = null;
        let tempElement : any = document.getElementById(this._id);
        if (tempElement){
            this._svgElement = tempElement as SVGAElement;
            this._divElement = this._svgElement.parentElement;
        }
    }

    get id() : string{
        return this._id;
    }
    
    get toolBoxItemType() : ToolBoxItemType{
        return this._type;
    }

    get isSelected() : boolean{
        return this._isSelected;
    }

    set isSelected(value : boolean) {
        this._isSelected = value;
    }

    get svgElement() : SVGAElement| undefined {
        return this._svgElement
    }
    
    get divElement() : HTMLElement| null {
        return this._divElement
    }

    get BoundingRectangle(): DOMRect | undefined{
        return this._divElement?.getBoundingClientRect();
    }

    reset():void{
        this.isSelected = false;
        if (this._settings){
            this._settings.reset();
        }
    } 

}