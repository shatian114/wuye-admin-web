import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  Card,
  InputNumber,
  Radio,
  Icon,
  Tooltip,
  Table,
  Divider,
  Tag,
  Modal,
  Carousel,
  Popconfirm,
  message,
  Upload,
  Row,
  Col,
} from 'antd';
import styles from './index.less';
import petGlobal from '@/petGlobal';
import axios from 'axios';
import moment from 'moment';

const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;

/*@connect(({ loading }) => ({
  submitting: loading.effects['form/submitRegularForm'],
}))*/
@Form.create()
class kouFeiJiLu extends PureComponent {
  constructor(props) {
    super(props);
    axios.defaults.baseURL = petGlobal.apiPath;

    this.state = {
      currentPage: 1,
      pageCount: 1,
      tempid: 1,
      searching: false,
      tableColumns: [
        { title: '发生时间', dataIndex: 'kfsj' },
        { title: '涉及金额', dataIndex: 'kfje' },
        { title: '物业名称', dataIndex: 'wymc' },
        { title: '小区名称', dataIndex: 'xqmc' },
        { title: '房间编号', dataIndex: 'lfbh' },
        { title: '业主编号', dataIndex: 'yzbh' },
        { title: '业主手机', dataIndex: 'yzsj' },
        { title: '变化原因', dataIndex: 'bhyy' },
        { title: '详细说明', dataIndex: 'xxsm' },
      ],
      tableDataSource: [],
    };
  }

  //调用服务端的搜索接口
  search = e => {
    console.log('currentPage: ' + this.state.currentPage);
    this.setState({
      searching: true,
    });
    let fields = this.props.form.getFieldsValue();
    axios
      .get('', {
        params: {
          command: 'hainanfytzgl_query',
          pageindex: this.state.currentPage,
          pagenum: 30,
          wymc: fields.search_wymc ? fields.search_wymc : '',
          xqmc: fields.search_xqmc ? fields.search_xqmc : '',
          fjbh: fields.search_fjbh ? fields.search_fjbh : '',
          usermobile: fields.search_usermobile ? fields.search_usermobile : '',
          begindate:
            fields.search_rqjg && fields.search_rqjg.length == 2
              ? moment(fields.search_rqjg[0]).format('YYYYMMDD')
              : '',
          enddate:
            fields.search_rqjg && fields.search_rqjg.length == 2
              ? moment(fields.search_rqjg[1]).format('YYYYMMDD')
              : '',
        },
      })
      .then(res => {
        this.setState({
          searching: false,
        });
        console.log(res.data);
        if (res.data.ret == 'success') {
          let resJson = res.data.nodes;
          for (var k in resJson) {
            resJson[k]['deling'] = false;
          }
          this.setState({
            pageCount: resJson.totalpagesum,
            tableDataSource: resJson,
          });
          //console.log(res.data.pageCount);
        } else {
          message.warning(res.data.info);
          this.setState({
            pageCount: 1,
            tableDataSource: [],
          });
        }
      })
      .catch(err => {
        this.setState({
          searching: false,
        });
        console.log('axios err: ', err);
      });
  };

  changePage = (pageNum, pageSize) => {
    console.log('pageNum: ' + pageNum);
    this.setState(
      {
        currentPage: pageNum,
      },
      () => this.search()
    );
  };

  render() {
    const { submitting } = this.props;
    const {
      form: { getFieldDecorator, getFieldValue },
    } = this.props;

    const changeFormItemLayout = {
      labelCol: {
        sm: { span: 3 },
      },
      wrapperCol: {
        sm: { span: 21 },
      },
    };

    const pageConf = {
      pageSize: 30,
      current: this.state.currentPage,
      onChange: this.changePage,
      total: this.state.pageCount,
    };

    return (
      <div>
        <Card bordered={false}>
          <Form hideRequiredMark layout="inline">
            <FormItem label="物业名称">
              {getFieldDecorator('searcy_wymc', {
                rules: [],
              })(<Input />)}
            </FormItem>
            <FormItem label="小区名称">
              {getFieldDecorator('search_xqmc', {
                rules: [],
              })(<Input />)}
            </FormItem>
            <FormItem label="房间编号">
              {getFieldDecorator('search_fjbh', {
                rules: [],
              })(<Input />)}
            </FormItem>
            <FormItem label="用户手机">
              {getFieldDecorator('search_yhsj', {
                rules: [],
              })(<Input />)}
            </FormItem>
            <FormItem label="间隔日期">
              {getFieldDecorator('search_rqjg', {
                rules: [],
              })(<RangePicker format="YYYYMMDD" />)}
            </FormItem>
            <FormItem>
              <Button
                icon="search"
                type="primary"
                htmlType="button"
                loading={this.state.searching}
                onClick={this.search}
              >
                搜索
              </Button>
            </FormItem>
          </Form>

          <Table
            dataSource={this.state.tableDataSource}
            columns={this.state.tableColumns}
            rowKey="uniqueID"
            pagination={pageConf}
          />
        </Card>
      </div>
    );
  }
}

export default kouFeiJiLu;
