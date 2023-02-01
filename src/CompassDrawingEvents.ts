import { BaseCompassSettings } from './BaseCompassSettings';
import {BaseDrawingEvent} from './BaseDrawingEvent';
import { Point } from './Point';

export class CompassSelectedEvent extends BaseDrawingEvent{

    private _id : string;
    private _baseCompassSetting : BaseCompassSettings;

    constructor(id: string, compassSettings : BaseCompassSettings){
        super('CompassSelectedEvent');
        this._id = id;
        this._baseCompassSetting = compassSettings;
    }

    get id():string{
        return this._id;
    }
    
    get settings() : BaseCompassSettings{
        return this._baseCompassSetting;
    }
}

export class CompassDrawingCompletedEvent extends BaseDrawingEvent{

    private _line: Array<Point> ;

    constructor(line: Array<Point>){
        super('CompassDrawingCompletedEvent');
        this._line = line;
    }

    get line() : Array<Point>{
        return this._line;
    }
}


export class CompassSettingsChangedEvent extends BaseDrawingEvent{

    private _compassId : string;
    private _baseCompassSetting : BaseCompassSettings;

    constructor(compassId: string, compassSettings : BaseCompassSettings){
        super('CompassSettingsChangedEvent');
        this._compassId = compassId;
        this._baseCompassSetting = compassSettings;
    }

    get settings() : BaseCompassSettings{
        return this._baseCompassSetting;
    }

    get compassId() : string {
        return this._compassId;
    }
}


export class CompassMenuSettingsOpenEvent extends BaseDrawingEvent{

    private _baseCompassSetting : BaseCompassSettings;

    constructor(private _id: string, compassSettings : BaseCompassSettings, private _boundingRect: DOMRect | undefined){
        super('CompassMenuSettingsOpenEvent');
        this._baseCompassSetting = compassSettings;
    }

    get id(): string{
        return this._id;
    }

    get settings() : BaseCompassSettings{
        return this._baseCompassSetting;
    }

    get boundingRect(): DOMRect | undefined{
        return this._boundingRect;
    }
}