import React from 'react';
import { connect } from 'react-redux';
import download from 'downloadjs';
import Head from 'next/head';
import styles from './style.module.scss';
import { One } from '@template';

import { Util } from '@lib';
import { APIConfig } from '@constant';

import { importUserData, exportUserData } from '../../src/redux/core/actions';
import { Loading } from '@component';
import { appStore } from '../../src/redux/store';

interface TProps {
    theme: {
        color: string;
        fontFamily: string;
    };
    itemStatus: {
        [key: string]: boolean;
    };
    userData: {
        [key: string]: string;
    };
}
interface TState {
    exportStatus: any;
    gifGenerateStatus: boolean;
    // exportStatus: Boolean | string | null
}

class Home extends React.Component<TProps, TState> {
    constructor(props: TProps) {
        super(props);
        this.state = {
            exportStatus: false,
            gifGenerateStatus: false,
        };
    }

    componentDidMount() {
        const exportStatus = Util.getQueryString(window.location, 'export');
        this.setState({ exportStatus });

        const data = Util.getQueryString(window.location, 'data');
        if (exportStatus === 'true' && data) {
            fetch(`${APIConfig.hostname}/download?data=${data}`)
                .then((response) => response.json())
                .then((res) => {
                    importUserData(JSON.parse(JSON.stringify(res)));
                });
        }
    }

    _downloadPDFBtnPress = async () => {
        const { userData } = this.props;
        const data = appStore.dispatch(exportUserData());
        const fileName = `CV-${userData.name}.pdf`;

        this.setState({ gifGenerateStatus: true });

        const req = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        };

        const res = await fetch(`${APIConfig.hostname}/download`, req);
        const blob = await res.blob();
        this.setState({ gifGenerateStatus: false });
        download(blob, fileName);
    };

    render() {
        return (
            <>
                <Head>
                    <title>preview | wtfresume</title>
                </Head>
                <div style={{ fontFamily: this.props.theme.fontFamily }}>
                    {this.state.exportStatus !== 'true' && (
                        <>
                            <div className={styles.bgLayer} />

                        </>
                    )}

                    <div>
                        <One />
                    </div>

                    <Loading show={this.state.gifGenerateStatus} />
                </div>
            </>
        );
    }
}

const mapStateToProps = (store: any) => ({
    theme: store.theme,
    itemStatus: store.itemStatus,
    userData: store.userData,
});

const mapDispatchToProps = () => ({
    importUserData,
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
