import * as React from 'react';
import styles from './ImageGallery.module.scss';
import { IImageGalleryProps, IImageState, IImageDetails } from './IImageGalleryProps';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { SPListOperations, SPFieldOperations, SPHelperCommon } from 'spfxhelper';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Image } from 'office-ui-fabric-react/lib/Image';
import * as $ from 'jquery';

export default class ImageGallery extends React.Component<IImageGalleryProps, IImageState> {

  constructor(props: IImageGalleryProps, state: IImageState) {
    super(props);

    this.state = {
      imageDetails: [],
      showLoading: true,
      status: '',
      intervalID: 0
    };
  }

  private get oSPListOp(): SPListOperations {
    return SPListOperations.getInstance(this.props.spHttpClient, this.props.webUrl);
  }

  private get oSPFieldOp(): SPFieldOperations {
    return SPFieldOperations.getInstance(this.props.spHttpClient, this.props.webUrl);
  }

  private animateDuration: number = 1000;
  private autoRotateDuration: number = 5000;
  private interval: number = 0;

  private createRedirectLink: boolean = false;

  public render(): React.ReactElement<IImageGalleryProps> {
    return (
      <div>
        {
          this.props.layout == 'Carousel' ?
            this.generateCarousel()
            :
            this.props.layout == 'Grid' ?
              this.generateGrid()
              :
              this.generateList()
        }
      </div>
    );
  }

  private generateGrid(): React.ReactElement<IImageGalleryProps> {
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
                                    SPHelperCommon.isStringNullOrEmpty(item.redirectLink) ?
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

  private generateCarousel(): React.ReactElement<IImageGalleryProps> {
    return (
      <div className={styles.carousel} >
        <div className={styles.carouselContainer}>
          <div className={`ms-Grid`}>
            {
              !this.state.showLoading ?
                this.state.imageDetails.length > 0 ?

                  <div className={`ms-Grid-row`}>
                    <div className={`ms-Grid-col ms-u-sm12`}>
                      <div id='legoSlider' className={styles.legoSlider}>
                        {this.state.imageDetails.length > 1 ? <Link className={styles.control_next}>&#10095;</Link> : <div></div>}
                        {this.state.imageDetails.length > 1 ? <Link className={styles.control_prev}>&#10094;</Link> : <div></div>}

                        <ul ref='ulSlider'>
                          {
                            this.state.imageDetails.map((item) => {
                              return (
                                <li>
                                  {
                                    // # reloads on IE on click so if there is no link then do not add href (href presence generate a tag else button tag)
                                    !SPHelperCommon.isStringNullOrEmpty(item.redirectLink) && item.redirectLink != '#' ?
                                      <Link href={item.redirectLink}>
                                        <Image src={item.imageUrl} role='presentation' />
                                        <div className={styles.text}>{item.title}</div>
                                      </Link>
                                      :
                                      <Link>
                                        <Image src={item.imageUrl} role='presentation' />
                                        <div className={styles.text}>{item.title}</div>
                                      </Link>
                                  }
                                </li>
                              );
                            })
                          }
                        </ul>
                      </div>
                    </div>
                  </div>
                  : // Else part if the count == 0

                  <div className={`ms-Grid-row`}>
                    <div className={`ms-Grid-col ms-u-mdPush4 ms-u-md5 ms-u-smPush2 ms-u-sm10 ms-font-m-plus`}>
                      <span>No images found in library</span>
                    </div>
                  </div>
                :
                <Spinner size={SpinnerSize.large} />
            }
          </div>
        </div>
      </div >
    );
  }

  private generateList(): React.ReactElement<IImageGalleryProps> {
    return (
      <div className={styles.list}>
        <div className={styles.container}>
          <div className={`ms-Grid`}>
            {
              !this.state.showLoading ?
                this.state.imageDetails.length > 0 ?
                  <div className={`ms-Grid-row`}>
                    {
                      this.state.imageDetails.map((item) => {
                        return (
                          <div className={`ms-Grid-col ms-u-sm12`}>
                            <div className={`ms-Grid`}>
                              <div className={`ms-Grid-row`}>
                                <div className={`ms-Grid-col ms-u-sm5`}>
                                  {/* Display Image */}
                                  <div className={styles.boxShadow}>
                                    {
                                      SPHelperCommon.isStringNullOrEmpty(item.redirectLink) || item.redirectLink == '#'
                                        ?
                                        <Link href={item.redirectLink} target='_blank'>
                                          <Image src={item.imageUrl} role='presentation' />
                                        </Link>
                                        :
                                        <Link>
                                          <Image src={item.imageUrl} role='presentation' />
                                        </Link>
                                    }
                                  </div>
                                </div>
                                <div className={`ms-Grid-col ms-u-sm7`}>
                                  <div className={`ms-Grid`}>
                                    <div className={`ms-Grid-row`}>
                                      <div className={`ms-Grid-col ms-u-sm12`}>
                                        {
                                          SPHelperCommon.isStringNullOrEmpty(item.redirectLink) || item.redirectLink == '#'
                                            ?
                                            <Link>
                                              <h2>{item.title}</h2>
                                            </Link>
                                            :
                                            <Link href={item.redirectLink} target='_blank'>
                                              <h2>{item.title}</h2>
                                            </Link>
                                        }

                                      </div>
                                    </div>
                                    <div className={`ms-Grid-row`}>
                                      <div className={`ms-Grid-col ms-u-sm12 ms-hiddenSm`}>
                                        <div>{item.description}</div>
                                      </div>
                                    </div>
                                    {
                                      !SPHelperCommon.isStringNullOrEmpty(item.redirectLink) || item.redirectLink != '#'
                                        ?
                                        <div className={`ms-Grid-row`}>
                                          <div className={`ms-Grid-col ms-u-sm12 ms-hiddenSm`}>
                                            <Link href={item.redirectLink} target='_blank' className={styles.width100}>
                                              <div className={styles.fRight}>Read More..</div>
                                            </Link>
                                          </div>
                                        </div>
                                        :
                                        <div></div>
                                    }
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                  :
                  <div className={`ms-Grid-row`}>
                    <div className={`ms-Grid-col ms-u-mdPush4 ms-u-md5 ms-u-smPush2 ms-u-sm10 ms-font-m-plus`}>
                      <span>No images found in library</span>
                    </div>
                  </div>
                :
                <Spinner size={SpinnerSize.large} />
            }
          </div>
        </div>
      </div>
    );
  }

  public componentWillReceiveProps(nextProps: IImageGalleryProps, nextContext: any): void {
    this.setState({ showLoading: true, imageDetails: [] as any });
    this.getLibItems(nextProps);
  }

  public componentDidMount(): void {
    this.setState({ showLoading: true, imageDetails: [] as any });
    this.getLibItems(this.props);
  }

  /**
   * Gets the items from the library 
   * @param props 
   */
  private getLibItems(props: IImageGalleryProps): void {
    try {

      this.setState({ showLoading: true, status: 'Fetching Data...' });
      if (this.validateColumn() && !SPHelperCommon.isStringNullOrEmpty(props.libName)) {

        var query = this.getQuery(props);
        let imgDetails: IImageDetails[] = [];

        this.oSPListOp.getListItemsByQuery(props.libName, query).then((response) => {

          response.result.forEach(item => {
            imgDetails.push({
              imageUrl: item.File.ServerRelativeUrl,
              redirectLink: this.createRedirectLink ? item.Redirect_x0020_Link : '',
              title: SPHelperCommon.isStringNullOrEmpty(item.Title) ? '' : item.Title,
              description: !SPHelperCommon.isStringNullOrEmpty(item.Description) && item.Description.length > 230 ? item.Description.slice(0, 230) + '...' : item.Description
            });
          });

          this.configureLayout(imgDetails, props);

        });
      }
      else {
        this.setState({ showLoading: false, status: 'Please configure webpart...' });
      }
    } catch (error) {
      alert(JSON.stringify(error));
    }
  }

  private configureLayout(imgdetails: IImageDetails[], props: IImageGalleryProps): void {

    switch (props.layout) {
      case 'Carousel':
        this.createCarousel(imgdetails, props);
        break;
      case 'Grid':
        this.createGrid(imgdetails, props);
        break;
      case 'List':
        this.setState({ showLoading: false, imageDetails: imgdetails as any[] });
        break;
    }
  }

  /**
   * Creates a 2D array object so rows and columns can be created dynamically
   * @param imgdetails 
   * @param props 
   */
  private createGrid(imgdetails: IImageDetails[], props: IImageGalleryProps): void {

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
      if (colCount == props.imageCountInRow || remainingItems == 0) {
        colCount = 0;
        row.push(column);
        column = [];
      }
    });

    this.setState({ imageDetails: row as any[], showLoading: false });
  }

  private createCarousel(imgdetails: IImageDetails[], props: IImageGalleryProps): void {

    try {

      this.setState({ showLoading: false, imageDetails: imgdetails as any[] });
      this.stopAutoRotateCarousel();
      // Perform the manipulation when the elements are created 
      this.forceUpdate(() => {
        var containerWidth = Math.floor($(`.${styles.carousel}`).innerWidth() * 0.90);
        var containerHeight = Math.floor($(`.${styles.carousel}`).innerHeight() * 0.90);
        var slideCount = $('#legoSlider ul li').length;
        $('#legoSlider ul li').css({ width: containerWidth, height: containerHeight });
        var slideWidth = $('#legoSlider ul li').width();
        var slideHeight = $('#legoSlider ul li').height();
        var sliderUlWidth = slideCount * slideWidth;

        $('#legoSlider').css({ width: slideWidth, height: slideHeight });

        // show only single image if there is only single item in the image library
        if (imgdetails.length > 1) {
          $('#legoSlider ul').css({ width: sliderUlWidth, marginLeft: - slideWidth });
        }
        else {
          $('#legoSlider ul').css({ width: sliderUlWidth, marginLeft: 0 });
        }
        $('#legoSlider ul li:last-child').prependTo('#legoSlider ul');
        $('#legoSlider ul li img').css({ width: containerWidth, height: containerHeight });

        if (imgdetails.length > 1) {
          this.registerEvents(imgdetails);

          /** Start Autorotate only if the property is set to true */
          this.startAutoRotateCarousel();
        }
      });

    }
    catch (error) {

    }
  }

  /**
   * Returns the query based on the certain parameters selected
   */
  private getQuery(props: IImageGalleryProps): string {

    var query: string = `?$expand=File&$select=Title,File/ServerRelativeUrl,Description`;

    if (this.createRedirectLink) {
      query += ",Redirect";
    }
    if (props.maxImage > 0) {
      query += `&$top=${props.maxImage}`;
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
        return `ms-md12`;
      case 2:
        return `ms-md6`;
      case 3:
        return `ms-md4`;
      case 4:
        return `ms-md3`;
      case 5:
      case 6:
      case 7:
        return `ms-md2`;
      case 8:
      case 9:
      case 10:
      case 11:
      case 12:
        return `ms-md1`;
    }
  }

  /** Method used to register events in the carousel */
  private registerEvents(imgdetails: IImageDetails[]): void {
    try {
      /** Handling the click event of the carousel */
      $(`.${styles.control_next}`).click((e) => {
        this.stopAutoRotateCarousel();
        this.showNext();
        this.startAutoRotateCarousel();
      });

      /** Handling the previous click event of the carousel */
      $(`.${styles.control_prev}`).click((e) => {
        this.stopAutoRotateCarousel();
        this.showPrev();
        this.startAutoRotateCarousel();
      });

      /** Handling the previous enter event of the carousel */
      $(`.${styles.control_prev}`).mouseenter(() => {
        this.stopAutoRotateCarousel();
      });

      /** Handling the previous leave event of the carousel */
      $(`.${styles.control_prev}`).mouseleave(() => {
        this.startAutoRotateCarousel();
      });

      /** Handling the previous enter event of the carousel */
      $(`.${styles.control_next}`).mouseenter(() => {
        this.stopAutoRotateCarousel();
      });

      /** Handling the previous leave event of the carousel */
      $(`.${styles.control_next}`).mouseleave(() => {
        this.startAutoRotateCarousel();
      });

      /** Handling the mouse enter event on the image of the carousel */
      $(`#legoSlider ul li`).mouseenter(() => {
        this.stopAutoRotateCarousel();
      });

      /** Handling the mouse leave event on the image of the carousel */
      $(`#legoSlider ul li`).mouseleave(() => {
        this.startAutoRotateCarousel();
      });

      /** Event registered for the resizing of the window */
      window.onresize = () => {
        this.stopAutoRotateCarousel();
        this.createCarousel(imgdetails, this.props);
      };

      /** clears the interval so that it does not cause issue  =next time it loads */
      window.onbeforeunload = () => {
        this.stopAutoRotateCarousel();
      };
    }
    catch (error) {

    }
  }

  /** Method  starts the auto rotation of the carousel*/
  private startAutoRotateCarousel(): void {
    try {

      if (this.props.autoRotate && this.state.intervalID == 0) {

        this.interval = setInterval(() => {
          this.showNext();
        }, this.autoRotateDuration);

        this.setState({ intervalID: this.interval });
      }
    }
    catch (error) {
    }
  }

  /** Method stopes the autoCarousel */
  private stopAutoRotateCarousel(): void {
    try {
      if (this.state.intervalID > 0) {
        clearInterval(this.state.intervalID);
        this.setState({ intervalID: 0, showLoading: false });
      }
    }
    catch (error) {
    }
  }

  /** Method shows the next image */
  private showNext(): void {

    try {

      var slideWidth = $('#legoSlider ul li').width();
      $('#legoSlider ul').animate({
        left: + slideWidth
      }, this.animateDuration, 'linear', () => {
        $('#legoSlider ul li:last-child').prependTo('#legoSlider ul');
        $('#legoSlider ul').css('left', '');
      });
    }
    catch (error) {
    }
  }

  /** Method shows the Previous image */
  private showPrev(): void {

    try {
      var slideWidth = $('#legoSlider ul li').width();
      $('#legoSlider ul').animate({
        left: - slideWidth
      }, this.animateDuration, 'linear', () => {
        $('#legoSlider ul li:first-child').appendTo('#legoSlider ul');
        $('#legoSlider ul').css('left', '');
      });
    }
    catch (error) {
    }
  }

}
