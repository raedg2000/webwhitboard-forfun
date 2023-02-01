import {BaseDrawingEvent} from './BaseDrawingEvent';
import {BaseEraserSettings} from './BaseEraserSettings'
import { Point } from './Point';

export class EraserSelectedEvent extends BaseDrawingEvent{

    private _baseEraserSetting : BaseEraserSettings;

    constructor(eraserSettings : BaseEraserSettings){
        super('EraserSelectedEvent');
        this._baseEraserSetting = eraserSettings;
    }

    get settings() : BaseEraserSettings{
        return this._baseEraserSetting;
    }
}

export class EraserDrawingCompletedEvent extends BaseDrawingEvent{

    private _line: Array<Point> ;

    constructor(line: Array<Point>){
        super('EraserDrawingCompletedEvent');
        this._line = line;
    }

    get line() : Array<Point>{
        return this._line;
    }
}