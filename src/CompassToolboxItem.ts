
import {Point} from './Point';
import {ToolBoxItem} from './ToolBoxItem'
import { ToolBoxItemType } from './ToolBoxItemType';

export class CompassToolboxItem extends ToolBoxItem{
   
    private _maxThickness : number = 7;

    constructor (id: string){
        super(id, ToolBoxItemType.Compass)
    }


}