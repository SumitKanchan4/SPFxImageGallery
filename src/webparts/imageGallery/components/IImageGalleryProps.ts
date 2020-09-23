import { SPHttpClient } from '@microsoft/sp-http';
import { IPropertyPaneAccessor } from '@microsoft/sp-webpart-base';

export interface IImageGalleryProps {
  layout: string;
  spHttpClient: SPHttpClient;
  loggerName: string;
  webUrl: string;
  listName: string;
  colCount: number;
  isAutorotate: boolean;
  duration: number;
  imagesCount: number;
  propertyPane: IPropertyPaneAccessor;
}

export interface IImageDetails {
  info: IImageDetail[];
}

export interface IImageDetail {
  name: string;
  redirectLink: string;
  caption: string;
  path: string;
  description?: string;
}

export interface IImageGalleryState {
  imageCount?: number;
  imageInfo?: IImageDetails;
}

export class Constants {

  
  public static get CaroselMax() : number {
    return 10;
  }

  public static get ListMax() : number {
    return 25;
  }

  public static get LightboxMax() : number {
    return 50;
  }
}