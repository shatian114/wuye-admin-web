import React, { PureComponent } from 'react';

class NoDevelop extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <h1>本模块正在内测，还未发布到公网平台，敬请等待！</h1>
        <img src={require('@/assets/contentBack2.jpg')} style={{ width: '100%', height: '100%' }} />
      </div>
    );
  }
}

export default NoDevelop;
