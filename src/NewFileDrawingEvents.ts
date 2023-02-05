

import {BaseDrawingEvent} from './BaseDrawingEvent';
import { ToolBoxItemType } from './ToolBoxItemType';

export class NewWhiteboardEvent extends BaseDrawingEvent{

    private _id : string;
   
    constructor(id: string, type : ToolBoxItemType){
        super('NewWhiteboardEvent');
        this._id = id;
    }

    get id():string{
        return this._id;
    }

}