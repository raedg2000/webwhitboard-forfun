import {BaseDrawingEvent} from './BaseDrawingEvent';

export class ClearCanvasDrawingEvent extends BaseDrawingEvent{

    constructor(){
        super('ClearCanvasDrawingEvent');
       
    }
}