interface IImageGalleryProps {
  libName: string;
  imageCountInRow: number;
  maxImage: number;
  imgHeight: string;
  imgWidth: string;
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
}

export { IImageGalleryProps, IImageDetails, IImageState };
