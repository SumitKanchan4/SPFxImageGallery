import { IImageDetails } from "../../webparts/imageGallery/components/IImageGalleryProps";

export interface ILightboxProps {
    imagesCount: number;
    images?: IImageDetails;
    colCount: number;
}