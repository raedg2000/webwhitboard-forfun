import { Point } from "./Point";


export class SVGLoading{

    svgFileLoadingInstance : SVGElement ;

    constructor(){

        this.svgFileLoadingInstance = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svgFileLoadingInstance.setAttribute('width', '480');
        this.svgFileLoadingInstance.setAttribute('height', '400');
        this.svgFileLoadingInstance.setAttribute('style', `z-index:${200};position:fixed;top:30%;left:30%;pointer-events: none;`);
        this.svgFileLoadingInstance.id = "loading";

        let loadingImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
       
        loadingImage.setAttribute('href', './images/loading.png');
        loadingImage.setAttribute('width', `480`);
        loadingImage.setAttribute('height', `400`);
        loadingImage.setAttribute('x',  '0' );
        loadingImage.setAttribute('y',  `0`);

        this.svgFileLoadingInstance.appendChild(loadingImage);

        document.body.appendChild(this.svgFileLoadingInstance);

    }

    dispose(){
        document.body.removeChild(this.svgFileLoadingInstance);
    }

}  