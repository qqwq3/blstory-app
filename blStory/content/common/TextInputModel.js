'use strict';

import React from 'react';
import {
    View,
    Text,
    TextInput,
    Modal,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import XingrenLink from './XingrenLink';
import { Devices } from "./Api";

class TextInputModel extends React.Component {
    static propTypes = {
        visible: PropTypes.bool,
        onClose: PropTypes.func,
        onShow: PropTypes.func,
        onSubmit: PropTypes.func,
        onCancel: PropTypes.func,
        title: PropTypes.string.isRequired,
        placeholder: PropTypes.string,
        maxLength: PropTypes.number,
    };
    static defaultProps = {
        visible: false,
        placeholder: null,
    };
    constructor(props) {
        super(props);
        this.state = {
            text: '',
            visible: this.props.visible,
            isBusy: false
        };
        this._onSubmit = this._onSubmit.bind(this);
    }
    _onSubmit(text) {
        if (typeof(text) !== 'string') {
            text = this.state.text;
        }

        this.props.onSubmit && this.props.onSubmit(text);
    }
    _onCancel() {
        this.props.onCancel && this.props.onCancel();
        this.hide();
    }
    getText() {
        return this.state.text;
    }
    close() {
        this.setState({ isBusy: false, visible: false, text: '' });
    }
    show(defaultValue) {
        this.setState({visible: true, text: defaultValue});
    }
    hide() {
        this.setState({visible: false});
    }
    busy() {
        this.setState({isBusy: true});
    }
    idle() {
        this.setState({isBusy: false});
    }
    _renderBusy() {
        return (
            <View style={styles.busyContainer}>
                <ActivityIndicator style={styles.busyIndicator} />
            </View>
        );
    }
    render() {
        return (
            <Modal
                visible={(this.props.visible && this.state.visible) || this.state.visible}
                transparent={true}
                onRequestClose={() => this.props.onClose && this.props.onClose()}
                onShow={() => this.props.onShow && this.props.onShow()}
                animationType={"slide"}
            >
                <TouchableOpacity
                    style={styles.modalBackground}
                    onPress={() => this.close()}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modelTitleView}>
                            <Text style={styles.modalTitle}>{this.props.title}</Text>
                        </View>
                        <View style={styles.modalBody}>
                            <TextInput
                                style={styles.modalInput}
                                placeholder={this.props.placeholder}
                                placeholderTextColor="#cccccc"
                                underlineColorAndroid="transparent"
                                maxLength={this.props.maxLength}
                                autoFocus={true}
                                onSubmitEditing={(e) => {
                                    this._onSubmit(e.nativeEvent.text);
                                }}
                                onChangeText={(text) => {
                                    this.setState({ text:text });
                                }}
                                //defaultValue={this.state.text}
                            />
                        </View>
                        <View style={styles.modalFooter}>
                            <XingrenLink
                                text={'取消'}
                                style={styles.modalCancelButton}
                                textStyle={styles.modalCancelButtonText}
                                onPress={this._onCancel.bind(this)}
                            />
                            <XingrenLink
                                text={'确定'}
                                style={styles.modalOKButton}
                                textStyle={styles.modalOKButtonText}
                                onPress={this._onSubmit.bind(this)}
                            />
                        </View>
                        {this.state.isBusy ? this._renderBusy() : null }
                    </View>
                </TouchableOpacity>
            </Modal>
        );
    }
}

export default TextInputModel;

const styles = StyleSheet.create({
    modelTitleView:{
        justifyContent: 'flex-end',
        alignItems: 'center',
        height: 45,
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContainer: {
        width: 300,
        height: 180,
        borderRadius: 6,
        backgroundColor: '#ffffff',
        elevation: 5,
    },
    modalBody: {
        flex: 1,
        borderBottomWidth: 1 / Devices.piexl,
        borderBottomColor: '#e5e5e5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalFooter: {
        height: 50,
        flexDirection: 'row',
    },
    modalCancelButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRightWidth: 1 / Devices.piexl,
        borderRightColor: '#e5e5e5',
    },
    modalCancelButtonText: {
        color: '#999',
        fontSize: 15,
    },
    modalOKButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderLeftWidth: 1 / Devices.piexl,
        borderLeftColor: '#e5e5e5',
    },
    modalOKButtonText: {
        color: '#F8AD54',
        fontSize: 15,
    },
    modalTitle: {
        color: '#666666',
        fontSize: 17,
    },
    modalInput: {
        height: 40,
        borderColor: '#e5e5e5',
        borderWidth: 0.3,
        position: 'absolute',
        left: 20,
        right: 20,
        textAlign: 'center',
    },
    busyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: 300,
        height: 200,
    },
    busyIndicator: {
        padding: 12,
        backgroundColor: '#0f0f0f',
        opacity: 0.8,
        borderRadius: 6,
    },
});