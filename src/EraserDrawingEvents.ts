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

export class EraserSettingsChangedEvent extends BaseDrawingEvent{

    private _eraserId : string;
    private _basePenSetting : BaseEraserSettings;

    constructor(penId: string, penSettings : BaseEraserSettings){
        super('EraserSettingsChangedEvent');
        this._eraserId = penId;
        this._basePenSetting = penSettings;
    }

    get settings() : BaseEraserSettings{
        return this._basePenSetting;
    }

    get eraserId() : string {
        return this._eraserId;
    }
}

export class EraserMenuSettingsOpenEvent extends BaseDrawingEvent{

    private _baseEraserSetting : BaseEraserSettings;

    constructor(private _id: string, eraserSettings : BaseEraserSettings, private _boundingRect: DOMRect | undefined){
        super('EraserMenuSettingsOpenEvent');
        this._baseEraserSetting = eraserSettings;
    }

    get id(): string{
        return this._id;
    }

    get settings() : BaseEraserSettings{
        return this._baseEraserSetting;
    }

    get boundingRect(): DOMRect | undefined{
        return this._boundingRect;
    }
}