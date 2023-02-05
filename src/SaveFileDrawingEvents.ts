import {BaseDrawingEvent} from './BaseDrawingEvent';
import { ToolBoxItemType } from './ToolBoxItemType';

export class SaveWhiteboardEvent extends BaseDrawingEvent{

    private _id : string;
   
    constructor(id: string, type : ToolBoxItemType){
        super('SaveWhiteboardEvent');
        this._id = id;
    }

    get id():string{
        return this._id;
    }

}