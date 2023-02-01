import {BaseDrawingEvent} from './BaseDrawingEvent';
import {BasePenSettings} from './BasePenSettings'
import { Point } from './Point';

export class PenSelectedEvent extends BaseDrawingEvent{

    private _id : string;
    private _basePenSetting : BasePenSettings;

    constructor(id: string, penSettings : BasePenSettings){
        super('PenSelectedEvent');
        this._id = id;
        this._basePenSetting = penSettings;
    }

    get id():string{
        return this._id;
    }
    
    get settings() : BasePenSettings{
        return this._basePenSetting;
    }
}

export class PenDrawingCompletedEvent extends BaseDrawingEvent{

    private _line: Array<Point> ;

    constructor(line: Array<Point>){
        super('PenDrawingCompleted');
        this._line = line;
    }

    get line() : Array<Point>{
        return this._line;
    }
}


export class PenSettingsChangedEvent extends BaseDrawingEvent{

    private _penId : string;
    private _basePenSetting : BasePenSettings;

    constructor(penId: string, penSettings : BasePenSettings){
        super('PenSettingsChangedEvent');
        this._penId = penId;
        this._basePenSetting = penSettings;
    }

    get settings() : BasePenSettings{
        return this._basePenSetting;
    }

    get penId() : string {
        return this._penId;
    }
}


export class PenMenuSettingsOpenEvent extends BaseDrawingEvent{

    private _basePenSetting : BasePenSettings;

    constructor(private _id: string, penSettings : BasePenSettings, private _boundingRect: DOMRect | undefined){
        super('PenMenuSettingsOpenEvent');
        this._basePenSetting = penSettings;
    }

    get id(): string{
        return this._id;
    }

    get settings() : BasePenSettings{
        return this._basePenSetting;
    }

    get boundingRect(): DOMRect | undefined{
        return this._boundingRect;
    }
}