import { IImageDetails } from "../../webparts/imageGallery/components/IImageGalleryProps";

export interface IListProps {
    imagesCount: number;
    images?: IImageDetails;
}