import {BaseDrawingEvent} from './BaseDrawingEvent';
import { RulersType } from './BaseRuler';
import { ToolBoxItemType } from './ToolBoxItemType';

export class AddRulerEvent extends BaseDrawingEvent{

    private _id : string;
    private _type : RulersType;
   
    constructor(id: string, type : ToolBoxItemType){
        super('AddRulerEvent');
        this._id = id;
        if (type === ToolBoxItemType.Ruler){
            this._type = RulersType.NormalRuler;
        }
        else if (type === ToolBoxItemType.Protractor){
            this._type = RulersType.Protractor;
        }
        else{
            this._type = RulersType.SetSquare;
        }
    }

    get id():string{
        return this._id;
    }

    get type():RulersType{
        return this._type;
    }
}

export class RemoveRulerEvent extends BaseDrawingEvent{

    private _id : string;
    private _type : RulersType;
   
    constructor(id: string, type : ToolBoxItemType){
        super('RemoveRulerEvent');
        this._id = id;
        if (type === ToolBoxItemType.Ruler){
            this._type = RulersType.NormalRuler;
        }
        else if (type === ToolBoxItemType.Protractor){
            this._type = RulersType.Protractor;
        }
        else{
            this._type = RulersType.SetSquare;
        }
    }

    get id():string{
        return this._id;
    }

    get type():RulersType{
        return this._type;
    }
}