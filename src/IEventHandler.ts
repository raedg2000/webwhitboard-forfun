import { BaseDrawingEvent } from "./BaseDrawingEvent";

export interface IEventHandler{

    handle(eventData : BaseDrawingEvent):void;
}