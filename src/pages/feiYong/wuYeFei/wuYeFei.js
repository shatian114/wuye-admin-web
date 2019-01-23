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
import axiosSys from 'axios';
import qs from 'qs';
const axios = axiosSys.create({
  baseURL: petGlobal.apiPath,
});
const myAxios = axiosSys.create({
  baseURL: petGlobal.myApi,
});

const FormItem = Form.Item;
const { Option } = Select;
const { MonthPicker } = DatePicker;

/*@connect(({ loading }) => ({
  submitting: loading.effects['form/submitRegularForm'],
}))*/
@Form.create()
class wuYeFei extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      selectFile: {},
      operateType: 'add',
      currentPage: 1,
      pageCount: 1,
      changeRecord: {},
      tempid: 1,
      searching: false,
      importing: false,
      addOrChangeing: false,
      changeModalVisible: false,
      viewImgArr: [],
      tableColumns: [
        { title: '业主编号', dataIndex: 'yzbh' },
        { title: '小区名称', dataIndex: 'xqmc' },
        { title: '物业名称', dataIndex: 'wymc' },
        { title: '楼房面积', dataIndex: 'mj' },
        { title: '物业电价', dataIndex: 'wydj' },
        { title: '本月物业费', dataIndex: 'bywy' },
        { title: '物业费欠缴', dataIndex: 'wyqj' },
        { title: '本期物业费', dataIndex: 'bqwy' },
        { title: '车牌号', dataIndex: 'cph' },
        { title: '地库数量', dataIndex: 'dk' },
        { title: '地面数量', dataIndex: 'dm' },
        { title: '地库车价', dataIndex: 'dkcj' },
        { title: '地面车价', dataIndex: 'dmcj' },
        { title: '本月车费', dataIndex: 'bycf' },
        { title: '车费欠缴', dataIndex: 'cfqj' },
        { title: '本期车费', dataIndex: 'bqcf' },
        { title: '水费单价', dataIndex: 'sf' },
        { title: '本月吨数', dataIndex: 'byds' },
        { title: '本月水费', dataIndex: 'bysf' },
        { title: '当期小计', dataIndex: 'dqxj' },
        { title: '年月', dataIndex: 'ny' },
        { title: '是否结扣', dataIndex: 'isover' },
        {
          title: '操作',
          dataIndex: 'ID' + 1,
          render: (ID, record, row) => (
            <div>
              <Row style={{ width: 100 }}>
                <Col span={12}>
                  <Button size="small">修改</Button>
                </Col>
                <Col span={12}>
                  <Popconfirm
                    title="确认删除？"
                    onConfirm={this.delData.bind(this, ID, record, row)}
                  >
                    <Button size="small" loading={record.deling}>
                      删除
                    </Button>
                  </Popconfirm>
                </Col>
              </Row>
            </div>
          ),
        },
      ],
      tableDataSource: [],
    };
  }

  delData = (ID, record, row, e) => {
    console.log('del: ' + record.uniqueID);
    //设置删除按钮为loading
    let tableDataTemp = this.state.tableDataSource;
    tableDataTemp[row].deling = true;
    this.setState(
      {
        tableDataSource: tableDataTemp,
        tempid: this.tempid + 1,
      },
      () => {
        //调用服务端的删除api
        axios
          .get('', {
            params: {
              command: 'hainanwuye_delete',
              ID: record.ID,
            },
          })
          .then(res => {
            tableDataTemp[row].deling = false;
            this.setState({
              tableDataSource: tableDataTemp,
              tempid: this.tempid + 1,
            });

            let resJson = res.data;
            if (resJson.ret == 'success') {
              message.success('删除成功');
              this.search();
            } else {
              message.warning(resJson.info);
            }
          })
          .catch(err => {
            tableDataTemp[row].deling = false;
            this.setState({
              tableDataSource: tableDataTemp,
              tempid: this.tempid + 1,
            });

            message.error(err.data);
          });
      }
    );
  };

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
          command: 'hainanwuyefei_query',
          pageindex: this.state.currentPage,
          pagenum: 30,
          wymc: fields.search_wymc ? fields.search_wymc : '',
          xqmc: fields.search_xqmc ? fields.search_xqmc : '',
          yzbh: fields.search_yzbh ? fields.search_yzbh : '',
          yzxx: fields.search_yzxx ? fields.search_yzxx : '',
          ny: petGlobal.formatSearchNy(fields.search_ny ? fields.search_ny : ''),
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
          message.warning(resJson.info);
        }
      })
      .catch(err => {
        this.setState({
          searching: false,
        });
        console.log('axios err: ', err);
      });
  };

  //弹出修改表单，并给表单赋值默认值
  modalChange = (operateType, ID, record, row, e) => {
    if (operateType == 'add') {
      this.setState({
        operateType: operateType,
        changeModalVisible: true,
        tempid: this.tempid + 1,
      });
      this.props.form.setFields({
        change_wymc: { value: '' },
        change_wyms: { value: '' },
      });
    } else {
      console.log(operateType, ID, record, row, e);
      this.setState({
        operateType: operateType,
        changeModalVisible: true,
        changeRecord: record,
        tempid: this.tempid + 1,
      });

      this.props.form.setFields({
        change_wymc: { value: record.wymc },
        change_wyms: { value: record.wyms },
      });
    }
  };

  //调用服务端的修改或添加端口
  changeData = e => {
    e.preventDefault();
    console.log('start change :');
    this.props.form.validateFields(null, { validateFieldsAndScroll: true }, (err, value) => {
      if (!err) {
        this.setState({ addOrChangeing: true });
        let fields = this.props.form.getFieldsValue();
        let command = this.state.operateType == 'add' ? 'hainanwuye_create' : 'hainanwuye_modify';
        axios
          .get('', {
            params: {
              command: command,
              ID: this.state.changeRecord.ID,
              wymc: fields.change_wymc ? fields.change_wymc : '',
              wyms: fields.change_wyms ? fields.change_wyms : '',
            },
          })
          .then(res => {
            this.setState({
              addOrChangeing: false,
              changeModalVisible: false,
            });
            let resJson = res.data;
            if (resJson.ret == 'success') {
              if (this.state.operateType == 'add') {
                message.success('添加成功');
              } else {
                message.success('修改成功');
              }

              this.search();
            } else {
              message.warning(resJson.info);
            }
            console.log('change response: ', res.data);
          })
          .catch(err => {
            console.log('change err: ', err.data);
          });
      } else {
        message.error('请先检查表单');
      }
    });
  };

  modalCancel = () => {
    this.setState({
      changeModalVisible: false,
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

  //上传xls
  importXls = file => {
    this.setState({ importing: true });
    petGlobal.readXls(file.file).then(xlsJson => {
      console.log(xlsJson);
      myAxios
        .post(
          '/daoRuWuYeFei',
          qs.stringify({
            xlsJson: JSON.stringify(xlsJson),
          })
        )
        .then(res => {
          this.setState({ importing: false });
          console.log(res);
          if (res.data.ret == 'success') {
            message.success('成功插入' + res.data.insertNum + '条数据');
            this.search();
          } else {
            message.warning('插入失败，请检查表格格式');
          }
        })
        .catch(err => {
          this.setState({ importing: true });
          console.log(err);
        });
    });
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
      pageSize: 10,
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
            <FormItem label="业主编号">
              {getFieldDecorator('search_yzbh', {
                rules: [],
              })(<Input />)}
            </FormItem>
            <FormItem label="业主信息">
              {getFieldDecorator('search_yzxx', {
                rules: [],
              })(<Input />)}
            </FormItem>
            <FormItem label="年月">
              {getFieldDecorator('search_ny', {
                rules: [],
              })(<MonthPicker format="YYYYMM" />)}
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
            <FormItem>
              <Button icon="plus-circle" htmlType="button">
                添加
              </Button>
            </FormItem>
            <FormItem>
              <Upload showUploadList={false} onChange={this.importXls} customRequest={() => {}}>
                <Button htmlType="button" icon="login" loading={this.state.importing}>
                  导入
                </Button>
              </Upload>
            </FormItem>
            <FormItem>
              <Button
                icon="download"
                htmlType="button"
                onClick={petGlobal.downMuban.bind(this, 'wuYeFei.xls')}
              >
                下载模板
              </Button>
            </FormItem>
          </Form>

          <Table
            dataSource={this.state.tableDataSource}
            columns={this.state.tableColumns}
            rowKey="uniqueID"
            pagination={pageConf}
          />

          <Modal
            visible={this.state.changeModalVisible}
            closable={false}
            keyboard={true}
            onCancel={this.modalCancel}
            width="40%"
            footer={null}
          >
            <Form>
              <Form.Item label="物业名称" {...changeFormItemLayout} onSubmit={this.changeData}>
                {getFieldDecorator('change_wymc', {
                  rules: [{ required: true, message: '必填' }],
                })(<Input />)}
              </Form.Item>
              <Form.Item label="物业描述" {...changeFormItemLayout}>
                {getFieldDecorator('change_wyms', {
                  rules: [{ required: true, message: '必填' }],
                })(<Input />)}
              </Form.Item>

              <FormItem>
                <Button
                  htmlType="submit"
                  onClick={this.changeData}
                  loading={this.state.addOrChangeing}
                >
                  确定
                </Button>
                <Button htmlType="button" onClick={this.modalCancel}>
                  取消
                </Button>
              </FormItem>
            </Form>
          </Modal>
        </Card>
      </div>
    );
  }
}

export default wuYeFei;
