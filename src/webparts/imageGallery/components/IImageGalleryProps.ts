interface IImageGalleryProps {
  libName: string;
  imageCountInRow: number;
  maxImage: number;
  createLink: boolean;
  spHttpClient: any;
  webUrl: string;
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
}

export { IImageGalleryProps, IImageDetails, IImageState };
