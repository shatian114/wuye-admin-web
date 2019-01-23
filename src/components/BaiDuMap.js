import React, { PureComponent } from 'react';
import BMap from 'BMap';

class BaiDuMap extends PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount = () => {
    var map = new BMap.Map('allmap');
    let mapPoint = this.props.mapPoint;
    console.log(this.props);
    var point = new BMap.Point(mapPoint.lng, mapPoint.lat);
    map.centerAndZoom(point, 15);
    map.enableScrollWheelZoom(true);
    map.addEventListener('click', (...paramArr) => {
      this.props.setMap(paramArr[0].point);
    });
  };

  render() {
    return <div id="allmap" style={{ width: '100%', height: 400 }} />;
  }
}

export default BaiDuMap;
