import * as React from 'react';
import styles from './ImageGallery.module.scss';
import { IImageGalleryProps, IImageState, IImageDetails } from './IImageGalleryProps';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { SPListOperations, SPFieldOperations, SPHelperCommon } from 'spfxhelper';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Image } from 'office-ui-fabric-react/lib/Image';

export default class ImageGallery extends React.Component<IImageGalleryProps, IImageState> {

  constructor(props: IImageGalleryProps, state: IImageState) {
    super(props);

    this.state = {
      imageDetails: [],
      showLoading: true,
      status:''
    };
  }

  private get oSPListOp(): SPListOperations {
    return SPListOperations.getInstance(this.props.spHttpClient, this.props.webUrl);
  }

  private get oSPFieldOp(): SPFieldOperations {
    return SPFieldOperations.getInstance(this.props.spHttpClient, this.props.webUrl);
  }

  private createRedirectLink: boolean = false;

  public render(): React.ReactElement<IImageGalleryProps> {
    return (
      <div className={styles.imageGallery}>
        <div className={styles.container}>
          {
            this.state.imageDetails.length > 0 ?
              <div className={`ms-Grid`}>
                {
                  this.state.imageDetails.map((row) => {
                    return (
                      <div className={`ms-Grid-row`}>
                        {
                          row.map((column) => {
                            const item = column as IImageDetails;

                            return (
                              <div className={`ms-Grid-col ${this.getColClass(this.props.imageCountInRow)}`}>
                                <div className={styles.boxShadow}>
                                  {
                                    SPHelperCommon.isStringNullOrEmpy(item.redirectLink) ?
                                      <Link>
                                        <Image src={item.imageUrl} role='presentation'></Image>
                                        <div className={`ms-u-hiddenSm ms-font-m-plus ms-fontWeight-semibold ${styles.heading} ${styles.colBlack}`}>{item.title}</div>
                                      </Link>
                                      :
                                      <Link href={item.redirectLink} target='_blank'>
                                        <Image src={item.imageUrl}></Image>
                                        <div className={`ms-u-hiddenSm ms-font-m-plus ms-fontWeight-semibold ${styles.heading} ${styles.colBlack}`}>{item.title}</div>
                                      </Link>
                                  }

                                </div>
                                <br />
                              </div>
                            );
                          })
                        }
                      </div>
                    );
                  })
                }
              </div>
              :
              <div>
                {
                  this.state.showLoading ?
                    <Spinner size={SpinnerSize.large} className={`${styles.padding}`} />
                    :
                    <div>{this.state.status}</div>
                }
              </div>
          }
        </div>
      </div>
    );
  }

  protected componentWillReceiveProps(nextProps: IImageGalleryProps, nextContext: any): void {
    this.getLibItems(nextProps);
  }

  protected componentDidMount(): void {
    this.getLibItems(this.props);
  }

  /**
   * Gets the items from the library 
   * @param props 
   */
  private getLibItems(props: IImageGalleryProps): void {
    try {

      this.setState({ showLoading: true, status: 'Fetching Data...' });
      if (this.validateColumn() && !SPHelperCommon.isStringNullOrEmpy(props.libName)) {

        var query = this.getQuery(props);
        let imgDetails: IImageDetails[] = [];

        this.oSPListOp.getListItemsByQuery(props.libName, query).then((response) => {

          response.result.forEach(item => {
            imgDetails.push({
              imageUrl: item.File.ServerRelativeUrl,
              redirectLink: this.createRedirectLink ? item.Redirect_x0020_Link : '',
              title: SPHelperCommon.isStringNullOrEmpy(item.Title) ? '' : item.Title
            });
          });

          this.create2DArray(imgDetails, props);

        });
      }
      else {
        this.setState({ showLoading: false, status: 'Please configure webpart...' });
      }
    } catch (error) {
      alert(JSON.stringify(error));
    }
  }

  /**
   * Creates a 2D array object so rows and columns can be created dynamically
   * @param imgdetails 
   * @param props 
   */
  private create2DArray(imgdetails: IImageDetails[], props: IImageGalleryProps): void {

    // Create an array of array to display selected number of images per row
    var remainingItems: number = imgdetails.length;
    var row: any[] = [];
    var column: any[] = [];
    var colCount: number = 0;

    imgdetails.forEach(item => {

      column.push(item);
      colCount += 1;
      remainingItems -= 1;

      // after every max images per row count change the row
      if (colCount == props.maxImage || remainingItems == 0) {
        colCount = 0;
        row.push(column);
        column = [];
      }
    });

    this.setState({ imageDetails: row as any[], showLoading: false });
  }

  /**
   * Returns the query based on the certain parameters selected
   */
  private getQuery(props: IImageGalleryProps): string {

    var query: string = `?$expand=File&$select=Title,File/ServerRelativeUrl`;

    if (this.createRedirectLink) {
      query += ",Redirect";
    }
    if (props.maxImage > 0) {
      query += "&$top=" + this.props.maxImage;
    }

    return query;
  }

  /**
   * Validates the redirect column if the create link is enabled
   */
  private validateColumn(): Promise<boolean> {

    if (this.props.createLink) {

      return this.oSPFieldOp.getFieldByList("Redirect", this.props.libName).then((response) => {
        this.createRedirectLink = response.exists;
        return response.exists;
      });
    }
    else {
      this.createRedirectLink = false;
      return Promise.resolve(true);
    }

  }

  /**
   * Returns the class based on the number of columns
   * @param count 
   */
  private getColClass(count: number) {

    switch (count) {
      case 1:
        return `ms-u-md12`;
      case 2:
        return `ms-u-md6`;
      case 3:
        return `ms-u-md4`;
      case 4:
        return `ms-u-md3`;
      case 5:
      case 6:
      case 7:
        return `ms-u-md2`;
      case 8:
      case 9:
      case 10:
      case 11:
      case 12:
        return `ms-u-md1`;
    }
  }

}
