import * as React from 'react';
import styles from './Carousel.module.scss';
import { ICarouselProps } from './ICarouselProps';
import { SizeMe } from 'react-sizeme';
import { Link } from 'office-ui-fabric-react/lib/Link';

export class Carousel extends React.Component<ICarouselProps, { showSlideIndex?: number, interval?: number }>{

    constructor(props: ICarouselProps, state: any) {
        super(props);

        this.state = {
            showSlideIndex: 0,
            interval: 0
        };
    }

    public componentDidMount(): void {
        this.startAutorotate();
    }

    public render(): React.ReactElement<ICarouselProps> {

        return (
            <div className={styles.carousel}>
                <SizeMe>{({ size }) =>
                    <div className={styles.slideshowContainer}>
                        {/*  Iterate over each item to generate the carousel */}
                        {this.props.images.info.slice(0, this.props.imagesCount).map((image, index) => {
                            return (
                                <div onMouseEnter={() => this.stopAutorotate()} onMouseLeave={() => this.startAutorotate()} key={index.toString()} className={`${index === this.state.showSlideIndex ? styles.show : styles.mySlides} ${styles.fade}`}>
                                    <div className={styles.numbertext}>{index + 1}/{this.props.imagesCount}</div>
                                    {
                                        image.redirectLink && image.redirectLink != '#' ?
                                            <Link href={image.redirectLink} target='_blank'>
                                                <img className={styles.imgWidth} src={image.path} width={size.width} height={(size.width / 16) * 9}></img>
                                            </Link>
                                            :
                                            <img className={styles.imgWidth} src={image.path} width={size.width} height={(size.width / 16) * 9}></img>
                                    }
                                    <div className={`${styles.text} ${image.caption ? styles.backgroundBlack : ''} ms-u-hiddenSm ms-font-m-plus ms-fontWeight-semibold`}>{image.caption ? image.caption : ''}</div>  {/*If image caption is undefined, then assign emty*/}
                                </div>
                            );
                        })}

                        <a className={styles.prev} onClick={() => this.prevSlide()} >&#10094;</a>
                        <a className={styles.next} onClick={() => this.nextSlide()} >&#10095;</a>
                    </div>}
                </SizeMe>
            </div>
        );
    }

    public getSnapshotBeforeUpdate(prevProp: ICarouselProps, prevState: any): any {

        if (prevProp.duration != this.props.duration || prevProp.isAutoRotate != this.props.isAutoRotate) {
            this.startAutorotate();
        }
    }

    /**
     * Displays the next slide
     */
    private nextSlide(): void {
        let nextSlide: number = this.state.showSlideIndex + 1;
        if (nextSlide > this.props.imagesCount - 1) { nextSlide = 0; }
        this.setState({ showSlideIndex: nextSlide });
    }

    /**
     * Displays the prev slide
     */
    private prevSlide(): void {
        let nextSlide: number = this.state.showSlideIndex - 1;
        if (nextSlide < 0) { nextSlide = this.props.imagesCount - 1; }
        this.setState({ showSlideIndex: nextSlide });
    }

    private stopAutorotate(): void {
        clearInterval(this.state.interval);
    }

    private startAutorotate(): void {
        //stop the autorotate to stop the previous interval and then register new one
        this.stopAutorotate();

        if (this.props.isAutoRotate) {
            this.setState({
                interval: setInterval(() => {
                    this.nextSlide();
                }, this.props.duration)
            });
        }
    }
}