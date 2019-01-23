import React, { PureComponent } from 'react';
import { Button } from 'antd';
import moment from 'moment';
import groupBy from 'lodash/groupBy';
import NoticeIcon from '../NoticeIcon';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';

export default class GlobalHeaderRight extends PureComponent {
  logout = () => {
    localStorage.removeItem('loginUser');
    router.push('/user/login');
  };

  render() {
    return (
      <div className={styles.right}>
        <Button type="primary" icon="logout" onClick={this.logout}>
          退出
        </Button>
      </div>
    );
  }
}
