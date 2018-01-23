
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableWithoutFeedback,
    FlatList
} from 'react-native';
import PropTypes from 'prop-types';
import { Devices } from "../common/Api";

class RankingTabBar extends React.Component{
    static propTypes = {
        activeTab: PropTypes.number,
        requestData: PropTypes.func
    };
    static defaultProps = {
        activeTab: 0
    };
    render(){
        return (
            <View style={styles.tabs}>
                {this.props.tabs.map((text,index) => {
                    let color = this.props.activeTab === index ? "#f3916b" : "#4c4c4c";
                    let borderBottomColor = this.props.activeTab === index ? "#f3916b" : "transparent";

                    return (
                        <TouchableWithoutFeedback
                            key={index}
                            onPress={() => this._tabSwifit(index)}
                            style={styles.tab}
                        >
                            <View style={[styles.tab,{borderBottomWidth:2, borderBottomColor:borderBottomColor}]}>
                                <Text style={[{color: color},styles.tabText]}>
                                    {text}
                                </Text>
                            </View>
                        </TouchableWithoutFeedback>
                    )
                })}
            </View>
        );
    }
    _tabSwifit(index){
        const { tabStatusValue } = this.props;

        this.props.requestData(tabStatusValue[index]);
        this.props.goToPage(index);
    }
}

export default RankingTabBar;

const styles = StyleSheet.create({
    tabs: {
        flexDirection: 'row',
        height: 40,
        borderBottomWidth: 1 / Devices.pixel,
        borderBottomColor: '#e5e5e5',
        borderStyle: 'solid'
    },
    tab: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
    },
    tabText: {
        fontSize: 15,
    },
});
















