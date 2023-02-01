import { IEventHandler } from "./IEventHandler";

export interface IEventAggregator
{

        publish<T>(eventToPublish: T ) : void;

        subscribe(eventType:string, subscriber: IEventHandler) : void;

        unSubscribe(eventType:string, subscriber: IEventHandler) : void;
}