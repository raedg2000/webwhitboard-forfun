import { BaseEraserSettings, EraserShapeType } from "./BaseEraserSettings";
import { CompassSettingsChangedEvent } from "./CompassDrawingEvents";
import { EraserSettingsChangedEvent } from "./EraserDrawingEvents";
import { EventAggregator } from "./EventAggregator";

export class EraserMenu{

    private _id : string;
    private _compassId : string;
    private _eraserSettings : BaseEraserSettings;
    private _divElement : HTMLDivElement;
    private _boundingRect : DOMRect | undefined;

    constructor(id: string, settings: BaseEraserSettings, boundingRect: DOMRect | undefined){
        this._compassId = id;
        this._id = `eraserMenu#${id.split('#')[1]}`;
        this._eraserSettings = settings;
        this._boundingRect = boundingRect;
        this._divElement = this.constructPenMenuDiv(boundingRect);

        document.body.appendChild(this._divElement);
    }

    get dialogElement(): HTMLDivElement{
        return this._divElement;
    }
    
    private constructPenMenuDiv(boundingRect: DOMRect | undefined): HTMLDivElement{
        let dialog = document.createElement('div');

        let top = boundingRect? boundingRect.bottom + 25 : 150;
        let left =  boundingRect?boundingRect.left : 25;

        dialog.id = this._id;
        dialog.setAttribute('style', `position:absolute;z-index:20000; background-color:#EDF0F5;top:${top}px;
                                      left:${left}px;width:220px; height:130px; 
                                      border-radius: 6px;border-bottom: 2px; border-style: solid; border-color:#3A5795;
                                      box-shadow: 3px 3px 2px #3A5795;`);
    
        let table = document.createElement('table');
        table.id = `table-${this._id}`;
        let tr1 = document.createElement('tr');
        tr1.id = `tr1-${this._id}`;
        table.appendChild(tr1);

        let col1_1 = document.createElement('td');
        let label1_1 = document.createElement('label');
        label1_1.id = `label1_1-${this._id}`;
        label1_1.innerText = 'Width';
        col1_1.appendChild(label1_1);

        let col1_2 = document.createElement('td');
        col1_2.id = `col1_2-${this._id}`;

        let rangeInput =  document.createElement('input');
        rangeInput.id = `rangeInput-${this._id}`;

        rangeInput.type = 'range';
        rangeInput.min = '1';
        rangeInput.max = `${BaseEraserSettings.MAX_WIDTH}`;
        rangeInput.value = this._eraserSettings.width.toString();
        rangeInput.setAttribute('style', `width: 100px;`);
        col1_2.appendChild(rangeInput);

        let col1_3= document.createElement('td');
        col1_3.id = `col1_3-${this._id}`;

        let label1_3 = document.createElement('label');
        label1_3.id = `label1_3-${this._id}`;

        label1_3.innerText = this._eraserSettings.width.toString();
        col1_3.appendChild(label1_3);

        tr1.appendChild(col1_1);
        tr1.appendChild(col1_2);
        tr1.appendChild(col1_3);

        let tr2 = document.createElement('tr');
        tr2.id = `tr2-${this._id}`;

        table.appendChild(tr1);

        let col2_1 = document.createElement('td');
        col2_1.id = `col2_1-${this._id}`;

        let label2_1 = document.createElement('label');
        label2_1.id = `label2_1-${this._id}`;

        label2_1.innerText = 'Shape';
        col2_1.appendChild(label2_1);

        let col2_2 = document.createElement('td');
        col2_2.colSpan = 2;
        col2_2.id = `col2_2-${this._id}`;

        let div = document.createElement('div');
        div.id = `div-${this._id}`;
        div.className = "box1";
        col2_2.appendChild(div);

        let div2_2 = document.createElement('div');
        div2_2.id = `div2_2-${this._id}`;
        div2_2.setAttribute("style", "margin-left: 20px;")
        div.appendChild(div2_2);


        let input2_1 = document.createElement('input');
        input2_1.id = `input2_1-${this._id}`;
        input2_1.type ='radio';
        input2_1.checked = true;
        input2_1.name = "radio"
        div2_2.appendChild(input2_1);
        
        let img1 = document.createElement('img');
        img1.id = `img1-${this._id}`;
        img1.src = `./images/square.png`
        div2_2.appendChild(img1);

        
        let div2_3 = document.createElement('div');
        div2_3.id = `div2_3-${this._id}`;
        div2_2.setAttribute("style", "margin-left:5px;")
        div.appendChild(div2_3);

        let input2_2 = document.createElement('input');
        input2_2.id = `input2_2-${this._id}`;
        input2_2.type ='radio';
        input2_2.checked = false;
        input2_2.name = "radio"
        div2_3.appendChild(input2_2);
       

        let img2 = document.createElement('img');
        img2.id = `img2-${this._id}`;
        img2.src = `./images/circle.png`
        div2_3.appendChild(img2);

        tr2.appendChild(col2_1);
        tr2.appendChild(col2_2);
        table.appendChild(tr2);

        let tr3 = document.createElement('tr');
        tr3.id = `tr3-${this._id}`;

        table.appendChild(tr3);

        let col3_1 = document.createElement('td');
        col3_1.colSpan = 3;
        col3_1.id = `col3_1-${this._id}`;

        let resetBtn =document.createElement('button');
        resetBtn.id = `resetBtn-${this._id}`;
        resetBtn.innerText = "Reset";

        col3_1.appendChild(resetBtn);

        tr3.appendChild(col3_1);

        rangeInput.addEventListener('input', (event) =>{
            let input = event.target as HTMLInputElement;
            label1_3.innerText = input.value;
            this._eraserSettings.width = Number(input.value);
            let eraserSettingsChangedEvent = new EraserSettingsChangedEvent(this._compassId, this._eraserSettings);
            EventAggregator.publish(eraserSettingsChangedEvent);
        });

        input2_1.addEventListener('input', (event) =>{
            let input = event.target as HTMLInputElement;
            this._eraserSettings.eraserShape = EraserShapeType.Square;
            let eraserSettingsChangedEvent = new EraserSettingsChangedEvent(this._compassId, this._eraserSettings);
            EventAggregator.publish(eraserSettingsChangedEvent);
        });

        input2_2.addEventListener('input', (event) =>{
          let input = event.target as HTMLInputElement;
          this._eraserSettings.eraserShape = EraserShapeType.Circle;
          let eraserSettingsChangedEvent = new EraserSettingsChangedEvent(this._compassId, this._eraserSettings);
          EventAggregator.publish(eraserSettingsChangedEvent);
      });

        resetBtn.addEventListener('click', (event) =>{
            this._eraserSettings.eraserShape = this._eraserSettings.initialEraseShape;
            this._eraserSettings.width = this._eraserSettings.initialWidth;

            rangeInput.value = this._eraserSettings.initialWidth.toString();
            input2_1.checked = true;

            let eraserSettingsChangedEvent = new EraserSettingsChangedEvent(this._compassId, this._eraserSettings);
            EventAggregator.publish(eraserSettingsChangedEvent);
        });
        dialog.appendChild(table);
        return dialog;
    }

    dispose(){
        if (this.dialogElement !== null){
            document.body.removeChild(this.dialogElement);
        }
    }
}