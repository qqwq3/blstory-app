
import React,{ Component } from 'react';
import {
    StyleSheet,
    View,
} from 'react-native';
import Drawer from 'react-native-drawer';
import PropTypes from 'prop-types';

class DrawerJsx extends Component{
    static propTypes = {
        children: PropTypes.any,
    };
    closeControlPanel = () => {
        this._drawer.close();
    };
    openControlPanel = () => {
        this._drawer.open();
    };
    render(){
        return (
            <Drawer {...this.props} ref={(ref) => this._drawer = ref}>
                <View style={styles.container}>
                    {this.props.children}
                </View>
            </Drawer>
        );
    }
}

export default DrawerJsx;

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
});





































