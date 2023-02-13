import { BaseCompassSettings } from './BaseCompassSettings';
import {BaseDrawingEvent} from './BaseDrawingEvent';
import { Point } from './Point';

export class AboutEvent extends BaseDrawingEvent{

   
    constructor(){
        super('AboutEvent');
    }
}