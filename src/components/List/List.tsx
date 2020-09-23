import * as React from 'react';
import styles from './List.module.scss';
import { IListProps } from './IListProps';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Image } from 'office-ui-fabric-react/lib/Image';
import { SizeMe } from 'react-sizeme';

export class List extends React.Component<IListProps, {}>{

    public render(): React.ReactElement<IListProps> {
        return (
            <div className={styles.list}>
                <div className={styles.listContainer}>
                    <div className={styles.grid}>
                        <div className={styles.row}>
                            {
                                this.props.images.info.map((item, index) => {
                                    return (
                                        <div className={styles.col12} key={index}>
                                            <div className={styles.grid}>
                                                <div className={styles.row}>
                                                    <div className={styles.col5}>
                                                        <SizeMe>{
                                                            ({ size }) =>
                                                                <div className={styles.boxShadow}>
                                                                    {
                                                                        item.redirectLink && item.redirectLink != '#'
                                                                            ?
                                                                            <Link href={item.redirectLink} target='_blank'>
                                                                                <Image src={item.path} role='presentation' width={size.width - 10} height={(size.width / 16) * 9} />
                                                                            </Link>
                                                                            :
                                                                            <Link>
                                                                                <Image src={item.path} role='presentation' width={size.width - 10} height={(size.width / 16) * 9} />
                                                                            </Link>
                                                                    }
                                                                </div>
                                                        }</SizeMe>
                                                    </div>
                                                    <div className={styles.col7}>
                                                        <div className={styles.grid}>
                                                            <div className={styles.row}>
                                                                <div className={styles.col12}>
                                                                    {
                                                                        item.redirectLink && item.redirectLink != '#'
                                                                            ?
                                                                            <Link href={item.redirectLink} target='_blank'>
                                                                                <h2>{item.caption}</h2>
                                                                            </Link>
                                                                            :
                                                                            <Link>
                                                                                <h2>{item.caption}</h2>
                                                                            </Link>
                                                                    }

                                                                </div>
                                                            </div>
                                                            <div className={styles.row}>
                                                                <div className={`${styles.col12} ms-hiddenSm ${styles.desc}`}>
                                                                    <div>{item.description}</div>
                                                                </div>
                                                            </div>
                                                            {
                                                                item.redirectLink && item.redirectLink != '#'
                                                                    ?
                                                                    <div className={styles.row}>
                                                                        <div className={`${styles.col12} ms-hiddenSm`}>
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

                    </div>
                </div>
            </div>
        );
    }
}