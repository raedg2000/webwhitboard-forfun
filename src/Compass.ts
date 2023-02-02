

import { BaseCompassSettings } from "./BaseCompassSettings";
import { DrawingLayer } from "./DrawingLayer";
import { EventAggregator } from "./EventAggregator";
import { IDispose } from "./IDispose";
import { IMouseEventsHandler } from "./IMouseEventsHandler";
import { Point } from "./Point";

export class Compass{
    
    private _id : string;
    private _settings : BaseCompassSettings;
   
    private _drawingStarted : boolean = false;
    private _drawingLayer : DrawingLayer | null;
    private _line:Array<Point> = new Array<Point>();

    constructor(id: string, settings : BaseCompassSettings, drawingLayer : DrawingLayer) {
        this._id = id;
        this._settings = settings;
        this._drawingLayer = drawingLayer;


        //add compass to the document body
    }

    get id(): string{
        return this._id;
    }

    get settings() : BaseCompassSettings{
        return this.settings;
    }

    set settings(value : BaseCompassSettings){
        this._settings = value;
    }

    get drawingStarted():boolean{
        return this._drawingStarted;
    }

    dispose(){
           
        //document.body.removeChild()
    }

}

