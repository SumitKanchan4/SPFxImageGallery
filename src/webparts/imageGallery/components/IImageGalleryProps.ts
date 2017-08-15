interface IImageGalleryProps {
  libName: string;
  imageCountInRow: number;
  maxImage: number;
  createLink: boolean;
  spHttpClient: any;
  webUrl: string;
  layout:string;
  autoRotate:boolean;
}

interface IImageDetails {
  title: string;
  imageUrl: string;
  redirectLink?: string;
}

interface IImageState {
  imageDetails?: any[];
  showLoading: boolean;
  status?:string;
  intervalID?: number;
}

export { IImageGalleryProps, IImageDetails, IImageState };
