import * as React from 'react';
import styles from './ImageGallery.module.scss';
import { IImageGalleryProps, IImageDetails, IImageGalleryState, Constants } from './IImageGalleryProps';
import { Carousel } from '../../../components/Carousel/Carousel';
import { Lightbox } from '../../../components/Lightbox/Lightbox';
import { List } from '../../../components/List/List';
import { SPListOperations } from 'spfxhelper';
import { IListItemsResponse } from 'spfxhelper/dist/SPFxHelper/Props/ISPListProps';
import { Log } from '@microsoft/sp-core-library';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';


const CAROUSEL: string = 'carousel';
const LIGHTBOX: string = 'lightbox';
const LIST: string = 'list';

export default class ImageGallery extends React.Component<IImageGalleryProps, IImageGalleryState> {

  constructor(props: IImageGalleryProps, state: IImageGalleryState) {
    super(props);

    this.state = {
      imageCount: 10,
      imageInfo: { info: [] }
    };
  }

  public componentDidMount(): void {
    this.getItems();
  }

  public render(): React.ReactElement<IImageGalleryProps> {
    return (
      <div className={styles.imageGallery}>
        <div className={styles.container}>
          <div className={`ms-Grid`}>
            <div className={`ms-Grid-row`}>
              <div className={`ms-Grid-col ms-sm12`}>
                {
                  this.props.webUrl && this.props.listName ?

                    this.props.layout == CAROUSEL ?
                      <React.Suspense fallback={<div>Loading...</div>}>
                        <Carousel duration={this.props.duration} images={this.state.imageInfo} imagesCount={this.state.imageCount} isAutoRotate={this.props.isAutorotate} showCaptions={true}></Carousel>
                      </React.Suspense>
                      :
                      this.props.layout === LIGHTBOX ?
                        <React.Suspense fallback={<div>Loading...</div>}>
                          <Lightbox imagesCount={this.state.imageCount} colCount={this.props.colCount} images={this.state.imageInfo}></Lightbox>
                        </React.Suspense>
                        :
                        <React.Suspense fallback={<div>Loading...</div>}>
                          <List imagesCount={this.state.imageCount} images={this.state.imageInfo}></List>
                        </React.Suspense>
                    :
                    this.showConfigureMessge()
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Log any unhandeled error in the component
   * @param error 
   * @param errorInfo 
   */
  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    Log.error(this.props.loggerName, error);
    console.log(errorInfo);
  }

  /**
   * Updates the component when there is any chagne in the configuration
   * @param prevProps 
   * @param prevState 
   */
  public getSnapshotBeforeUpdate(prevProps: IImageGalleryProps, prevState: IImageGalleryState): any {

    if (this.props.webUrl != prevProps.webUrl || this.props.listName != prevProps.listName) {
      this.getItems();
    }
    else {
      this.render();
    }
  }

  /**
   * Gets the Images from the SharePoint Library to be displayed in the control
   */
  private async getItems(): Promise<void> {

    // initialize the image variable
    let imageDetails: IImageDetails = { info: [] };

    try {

      let listOps: SPListOperations = new SPListOperations(this.props.spHttpClient, this.props.webUrl, this.props.loggerName);

      // Get the max number of records to be fetched
      let maxRec: number = this.props.layout == CAROUSEL ? Constants.CaroselMax : this.props.layout == LIST ? Constants.ListMax : Constants.LightboxMax;
      // Get all the images from the list
      let response: IListItemsResponse = await listOps.getListItemsByQuery(this.props.listName, `?$filter=Enable eq 1&$expand=File&$top=${this.props.imagesCount > 0 ? this.props.imagesCount : maxRec}&$select=RedirectLink,Caption,Description,File/Name,File/ServerRelativeUrl`);

      if (response.ok) {

        response.result.forEach(image => {
          imageDetails.info.push({ caption: image["Caption"], description: image["Description"], name: image["File"]["Name"], path: image["File"]["ServerRelativeUrl"], redirectLink: image["RedirectLink"] });
        });
      }
      else {
        Log.error(this.props.loggerName, response.error);
      }
    }
    catch (e) {
      Log.error(this.props.loggerName, new Error(`Error occured in ImageGallery.getItems()`));
      Log.error(this.props.loggerName, e);
    }
    finally {
      this.setState({ imageInfo: imageDetails, imageCount: imageDetails.info.length });
    }
  }

  /**
   * Show the configure message, if ther webpart is not configured
   */
  private showConfigureMessge(): JSX.Element {
    return (
      <div className={styles.center}>
        <h2>Webpart is not configured</h2>
        <PrimaryButton iconProps={{ iconName: "Settings" }} onClick={() => this.props.propertyPane.open()}>Configure</PrimaryButton>
      </div>
    );
  }
}
