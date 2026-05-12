import { BaseDrawingEvent } from "./BaseDrawingEvent";
import { IEventAggregator } from "./IEventAggregator";
import { IEventHandler } from "./IEventHandler";


export abstract class EventAggregator{


    private static eventSubscriberLists : Map<string, IEventHandler[]>  = new Map<string, IEventHandler[]>();
  
    static publish(eventToPublish: BaseDrawingEvent):void{
        let eventSubscribers = EventAggregator.eventSubscriberLists.get(eventToPublish.eventType);
        if (eventSubscribers){
            eventSubscribers.forEach( handler =>
                handler.handle(eventToPublish));
        }

    }

    static subscribe(eventType:string, subscriber:IEventHandler):void{
        let eventSubscribers = EventAggregator.eventSubscriberLists.get(eventType);
        if (!eventSubscribers){
            eventSubscribers = new Array<IEventHandler>();
            EventAggregator.eventSubscriberLists.set(eventType, eventSubscribers)
        }

        eventSubscribers.push(subscriber);
    }

    static unSubscribe(eventType:string, subscriber:IEventHandler):void{
        let eventSubscribers = EventAggregator.eventSubscriberLists.get(eventType);
        if (eventSubscribers){
            for (let entry of eventSubscribers){
                if (entry === subscriber){
                    let index = eventSubscribers.indexOf(entry);
                    eventSubscribers.splice(index, 1);
                    break;
                }
            }
        }
   }
}

