import { BaseRuler, DistanceToRuler, RulersType } from "./BaseRuler";
import { Point } from "./Point";

export class PenRulerHelper{

    static getRulerWithMinimumDistanceToPen(activeRulers : Map<RulersType, BaseRuler>, penScreenPosition:Point): null | DistanceToRuler{
        let ruler : DistanceToRuler | null = null;
        let minimumDistance = Number.MAX_VALUE;

        activeRulers.forEach( (activeRuler) =>{
            if (activeRuler){
                let result = activeRuler.calculateDistanceToRuler(penScreenPosition)
                if (result.distance <= BaseRuler.Ruler_Capture_Distance && result.distance < minimumDistance){
                    let ruler = activeRuler;
                    minimumDistance = result.distance;
                }
            }
        })
        return ruler;
    }
}