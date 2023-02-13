import { EraserShapeType } from "./BaseEraserSettings";
import { Arc, Arcs, DrawingType, ErasedLine, Line } from "./DrawingData";
import { DrawingLayer } from "./DrawingLayer";
import { Eraser } from "./Eraser";
import { Point } from "./Point";


export class Renderer
{

    static async render(drawingLayer: DrawingLayer, data: Array<Line | Arcs | ErasedLine>)
    {
       for(let index =0; index < data.length ; ++ index){

            let drawingType = data[index] as DrawingType;
            
            if (drawingType.type === 'Line'){
                Renderer.draw(drawingLayer, data[index] as Line);
            }else if (drawingType.type === 'Arcs'){
                Renderer.drawArc(drawingLayer, data[index] as Arcs);
            }
            else if (drawingType.type === 'ErasedLine'){
                Renderer.erase(drawingLayer, data[index] as ErasedLine);
            }
        };
    }

    private static draw(drawingLayer: DrawingLayer, line : Line ) {

        if (line.points.length > 0){
            let index = 0;
            let startPosition = line.points[0];
            let lastPosition = line.points[0];
            do {
                let context = drawingLayer?.canvas?.getContext('2d');
                if (context) {
                    context.beginPath();
                    context.lineCap = "round";
                    context.strokeStyle = line.color;
                    context.lineWidth = line.strokeWidth;
                    context.moveTo(startPosition.x, startPosition.y);
                    context.lineTo(lastPosition.x, lastPosition.y);
                    context.stroke();
                    context.closePath();
                } 
                
                startPosition = lastPosition;
                ++index;
                lastPosition = line.points[index];
            }while(index < line.points.length)
               
        }

    }

    private static drawArc(drawingLayer: DrawingLayer, arcs : Arcs){
 
        let context = drawingLayer?.canvas?.getContext('2d');
        
        if (context) {
            for (let index = 0; index < arcs.arcsInfo.length ; ++index){
                let arc =  arcs.arcsInfo[index];
                context.beginPath();
                context.lineCap = "round";

                context.strokeStyle = arcs.color;
                context.lineWidth = arcs.strokeWidth;
                context.arc(arc.center.x, arc.center.y, arc.radius, arc.startAngle, arc.endAngle, arc.direction );
                context.stroke();
                context.closePath();
            }
        }  
    }

    private static drawClippingArea(context: CanvasRenderingContext2D, width: number, position : Point, eraserShape: EraserShapeType){
        
        if (eraserShape === EraserShapeType.Circle) {
            let radius = width / 2;
            context.arc(position.x, position.y, radius, 0, Math.PI * 2, false); 
        }
        else {
            context.rect(position.x - width / 2 , position.y - width / 2 , width , width );
        }
    }

    private static erase (drawingLayer: DrawingLayer, erasedLine : ErasedLine ){

        let context = drawingLayer?.canvas?.getContext('2d');

        if (context) {
            for(let index= 0; index < erasedLine.points.length; ++index){
                let position = erasedLine.points[index];

                context.save();

                context.beginPath();

                let width = erasedLine.width + 2*Eraser.LineWidth;
                Renderer.drawClippingArea(context, width, position, erasedLine.eraserType);

                context.clip();

                width = 3*erasedLine.width;
                context.clearRect(position.x - width / 2 , position.y - width / 2 , width , width );
                
                drawingLayer?.drawGridPoints();
                context.restore();
            }
        }
    }


}