import { BasePenSettings } from "./BasePenSettings";
import { EventAggregator } from "./EventAggregator";
import { PenSettingsChangedEvent } from "./PenDrawingEvents";


export class PenMenu{

    private _id : string;
    private _penId : string;
    private _penSettings : BasePenSettings;
    private _divElement : HTMLDivElement;;
    private _boundingRect : DOMRect | undefined;

    constructor(id: string, settings: BasePenSettings, boundingRect: DOMRect | undefined){
        this._penId = id;
        this._id = `penMenu#${id.split('#')[1]}`;
        this._penSettings = settings;
        this._boundingRect = boundingRect;
        this._divElement = this.constructPenMenuDiv(boundingRect);
        document.body.appendChild(this._divElement );
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
        label1_1.innerText = 'Thickness';
        col1_1.appendChild(label1_1);

        let col1_2 = document.createElement('td');
        col1_2.id = `col1_2-${this._id}`;

        let rangeInput =  document.createElement('input');
        rangeInput.id = `rangeInput-${this._id}`;

        rangeInput.type = 'range';
        rangeInput.min = '1';
        rangeInput.max = '25';
        rangeInput.value = this._penSettings.thickness.toString();
        rangeInput.setAttribute('style', `width: 100px;`);
        col1_2.appendChild(rangeInput);

        let col1_3= document.createElement('td');
        col1_3.id = `col1_3-${this._id}`;

        let label1_3 = document.createElement('label');
        label1_3.id = `label1_3-${this._id}`;

        label1_3.innerText = this._penSettings.thickness.toString();
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

        label2_1.innerText = 'Color';
        col2_1.appendChild(label2_1);

        let col2_2 = document.createElement('td');
        col2_2.id = `col2_2-${this._id}`;

        let colorInput =  document.createElement('input');
        colorInput.id = `colorInput-${this._id}`;

        colorInput.type = 'color';
        colorInput.value = this._penSettings.color;
        colorInput.setAttribute('style', `width: 100px;`);
        col2_2.appendChild(colorInput);

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
            this._penSettings.thickness = Number(input.value);
            let penSettingsChangedEvent = new PenSettingsChangedEvent(this._penId, this._penSettings);
            EventAggregator.publish(penSettingsChangedEvent);
        }
        );

        colorInput.addEventListener('input', (event) =>{
            let input = event.target as HTMLInputElement;
            this._penSettings.color = input.value;
            let penSettingsChangedEvent = new PenSettingsChangedEvent(this._penId, this._penSettings);
            EventAggregator.publish(penSettingsChangedEvent);
        });

        resetBtn.addEventListener('click', (event) =>{
            this._penSettings.color = this._penSettings.initialColor;
            this._penSettings.thickness = this._penSettings.initialThickness;

            rangeInput.value = this._penSettings.thickness.toString();
            colorInput.value = this._penSettings.color;

            let penSettingsChangedEvent = new PenSettingsChangedEvent(this._penId, this._penSettings);
            EventAggregator.publish(penSettingsChangedEvent);
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