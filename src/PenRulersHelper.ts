import { BaseRuler, CapturedRulerInfo, RulersType } from "./BaseRuler";
import { Point } from "./Point";

export class PenRulerHelper{

    static captureRulerInfo(activeRulers : Map<RulersType, BaseRuler>, penScreenPosition:Point): null | CapturedRulerInfo{
        let minimumDistance = Number.MAX_VALUE;
        let distanceToRuler : CapturedRulerInfo | null = null;
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