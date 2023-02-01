
export abstract class BaseDrawingEvent{
    protected _eventType : string = '';

    constructor(eventType: string){
        this._eventType = eventType;
    }
    
    get eventType(){
        return this._eventType;
    }
}