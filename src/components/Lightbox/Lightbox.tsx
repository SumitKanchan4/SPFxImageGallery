import * as React from 'react';
import styles from './Lightbox.module.scss';
import { ILightboxProps } from './ILightboxProps';
import { Image } from 'office-ui-fabric-react/lib/Image';
import { SizeMe } from 'react-sizeme';
import { Link } from 'office-ui-fabric-react/lib/Link';

export class Lightbox extends React.Component<ILightboxProps, { isModalOpen: boolean, showSlideIndex: number }>{

    constructor(props: ILightboxProps, state: any) {
        super(props);
        this.state = {
            isModalOpen: false,
            showSlideIndex: 0
        };
    }

    private get itemsInRow(): number {
        return this.props.colCount;
    }

    private get getColumnClass(): string {

        let cssName: string = undefined;
        switch (this.itemsInRow) {
            case 1:
                cssName = styles.col1;
                break;
            case 2:
                cssName = styles.col2;
                break;
            case 3:
                cssName = styles.col3;
                break;
            case 4:
                cssName = styles.col4;
                break;
        }

        return cssName;
    }

    public render(): React.ReactElement<ILightboxProps> {

        let rowArray: any[] = [];
        let rowsCount: number = Math.ceil(this.props.imagesCount / this.itemsInRow);
        while (rowsCount > 0) {
            rowArray.push(rowsCount);
            rowsCount--;
        }
        return (
            <div className={styles.lightbox}>
                <div className={styles.row}>
                    {

                        this.props.images.info.map((col, colIndex) => {
                            return (
                                <div className={this.getColumnClass} key={`lightBoxColumn${colIndex}`}>

                                    <SizeMe>{
                                        ({ size }) =>
                                            <div className={styles.boxShadow}>
                                                <Image src={col.path} role='presentation' width={size.width - 10} height={(size.width / 16) * 9}></Image>
                                                <div className={styles.overlay}>
                                                    {
                                                        col.redirectLink && col.redirectLink != '#' ?
                                                            <Link href={col.redirectLink} target='_blank'>
                                                                <div className={`ms-u-hiddenSm ms-font-m-plus ms-fontWeight-semibold ${styles.heading} ${styles.colBlack}`}>{col.caption}</div>
                                                            </Link>
                                                            :
                                                            <div className={`ms-u-hiddenSm ms-font-m-plus ms-fontWeight-semibold ${styles.heading} ${styles.colBlack}`}>{col.caption}</div>
                                                    }

                                                </div>
                                            </div>
                                    }</SizeMe>


                                </div>
                            );
                        })
                    }
                </div>
            </div>
        );
    }
}