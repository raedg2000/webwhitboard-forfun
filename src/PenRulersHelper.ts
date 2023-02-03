import { BaseRuler, DistanceToRuler, RulersType } from "./BaseRuler";
import { Point } from "./Point";

export class PenRulerHelper{

    static getRulerWithMinimumDistanceToPen(activeRulers : Map<RulersType, BaseRuler>, penScreenPosition:Point): null | DistanceToRuler{
        let minimumDistance = Number.MAX_VALUE;
        let distanceToRuler : DistanceToRuler | null = null;
        activeRulers.forEach( (activeRuler) =>{
            if (activeRuler){
                let result = activeRuler.calculateDistanceToRuler(penScreenPosition)
                if (result.distance <= BaseRuler.Ruler_Capture_Distance && result.distance < minimumDistance){
                    minimumDistance = result.distance;
                    distanceToRuler = result;
                }
            }
        })
        return distanceToRuler;
    }
}