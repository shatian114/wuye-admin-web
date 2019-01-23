import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi/locale';
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
  Alert,
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
const { RangePicker } = DatePicker;

/*@connect(({ loading }) => ({
  submitting: loading.effects['form/submitRegularForm'],
}))*/
@Form.create()
class xiaoQu extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      selectWyid: '-1',
      xlsFile: undefined,
      wuYeGongSiLoading: false,
      wuYeGongSiArr: [{ ID: '-1', title: '正在加载物业公司列表...' }],
      importModalVisible: false,
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
        { title: '小区编号', dataIndex: 'xqbh', width: 90 },
        { title: '省', dataIndex: 'sheng', width: 80 },
        { title: '市', dataIndex: 'shi' },
        { title: '区', dataIndex: 'qu' },
        { title: '物业名称', dataIndex: 'wymc' },
        { title: '楼栋数', dataIndex: 'lds' },
        { title: '户型数', dataIndex: 'hxs' },
        { title: '固定车', dataIndex: 'gdc' },
        { title: '临时车', dataIndex: 'lsc' },
        { title: '路段', dataIndex: 'ld' },
        { title: '小区名称', dataIndex: 'xqmc' },
        { title: '物业费价格', dataIndex: 'wyf' },
        { title: '水费价格', dataIndex: 'sf' },
        { title: '电费价格', dataIndex: 'df' },
        { title: '地库车', dataIndex: 'dkc' },
        { title: '地面车', dataIndex: 'dmc' },
        {
          title: '操作',
          dataIndex: 'ID',
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

  //删除
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
          .post(
            'delAgent',
            qs.stringify({
              ID: ID,
            })
          )
          .then(res => {
            tableDataTemp[row].deling = false;
            this.setState({
              tableDataSource: tableDataTemp,
              tempid: this.tempid + 1,
            });

            let resJson = res.data;
            if (resJson.res == '删除成功') {
              message.success(resJson.res);
              this.search();
            } else {
              message.warning(resJson.res);
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

  //弹出修改表单，并给表单赋值默认值
  modalChange = (operateType, ID, record, row, e) => {
    if (operateType == 'add') {
      this.setState({
        operateType: operateType,
        changeModalVisible: true,
        tempid: this.tempid + 1,
      });
      this.props.form.setFields({
        change_uniqueID: { value: '' },
        change_password: { value: '' },
        change_mobile: { value: '' },
        change_email: { value: '' },
        change_nickname: { value: '' },
        change_rate: { value: '' },
        change_ispaygurantee: { value: '0' },
        change_guranteeamount: { value: '0' },
        change_qq: { value: '' },
        change_weixin: { value: '' },
        change_zone: { value: '' },
        change_clearperoid: { value: '' },
        change_isnormal: { value: '1' },
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
        change_uniqueID: { value: record.uniqueID },
        change_password: { value: record.password },
        change_mobile: { value: record.mobile },
        change_email: { value: record.email },
        change_nickname: { value: record.nickname },
        change_rate: { value: record.rate },
        change_ispaygurantee: { value: record.ispaygurantee + '' },
        change_guranteeamount: { value: record.guranteeamount },
        change_qq: { value: record.qq },
        change_weixin: { value: record.weixin },
        change_zone: { value: record.zone },
        change_clearperoid: { value: record.clearperoid },
        change_isnormal: { value: record.isnormal + '' },
      });
    }
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
          command: 'hainanxiaoqu_query',
          pageindex: this.state.currentPage,
          pagenum: 30,
          xqbh: fields.search_xqbh,
          xqmc: fields.search_xqmc,
          wyid: fields.search_wyid,
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

  //调用服务端的修改或添加端口
  changeData = e => {
    e.preventDefault();
    console.log('start change :');
    this.props.form.validateFields(null, { validateFieldsAndScroll: true }, (err, value) => {
      if (!err) {
        this.setState({ addOrChangeing: true });
        let fields = this.props.form.getFieldsValue();
        axios
          .post(
            'addAgent',
            qs.stringify({
              addOrChange: this.state.operateType,
              ID: this.state.changeRecord.ID,
              uniqueID: fields.change_uniqueID,
              password: fields.change_password,
              mobile: fields.change_mobile,
              email: fields.change_email,
              nickname: fields.change_nickname,
              rate: fields.change_rate,
              ispaygurantee: fields.change_ispaygurantee,
              guranteeamount: fields.change_guranteeamount,
              qq: fields.change_qq,
              weixin: fields.change_weixin,
              zone: fields.change_zone,
              clearperoid: fields.change_clearperoid,
              isnormal: fields.change_isnormal,
            })
          )
          .then(res => {
            this.setState({
              addOrChangeing: false,
              changeModalVisible: false,
            });
            let resJson = res.data;
            if (resJson.res == '修改成功' || resJson.res == '添加成功') {
              message.success(resJson.res);
              this.search();
            } else {
              message.warning(resJson.res);
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

  btnTest = () => {
    console.log(this.props.form.getFieldsValue());
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
  importXls = () => {
    console.log(this.state.selectWyid);
    if (this.state.selectWyid == '-1') {
      message.error('请选择物业公司');
      return;
    }
    if (this.state.xlsFile == undefined) {
      message.error('请先选择表格文件');
    } else {
      this.setState({ importing: true }, () => {
        petGlobal.readXls(this.state.xlsFile).then(xlsJson => {
          console.log(xlsJson);
          let testResBoolean = true;
          let testResStr = '';
          let xqbhArr = [];
          for (var i = 1; i < xlsJson.length; i++) {
            //判断每行的数据是否有3个并且不为空
            for (var j = 0; j < 6; j++) {
              let testVal = xlsJson[i][j];
              //检测数据是否有空的
              if (testVal == undefined || testVal.trim() == '') {
                testResStr = '第' + (i + 1) + '行的第' + (j + 1) + '个数据为空，请修正';
                testResBoolean = false;
                break;
              }
            }
            //用空字符串补足后面没有数据的单元格
            for (var j = 0; j < 15; j++) {
              console.log(j, xlsJson[i][j]);
              if (xlsJson[i][j] == undefined) {
                xlsJson[i][j] = '';
              } else {
                xlsJson[i][j] = xlsJson[i][j] + '';
              }
            }
            if (!testResBoolean) {
              break;
            }
            //编号是否有重复的
            let xqbh = xlsJson[i][0];
            if (xqbhArr.indexOf(xqbh) != -1) {
              testResBoolean = false;
              testResStr = '小区编号有重复，第' + i + '行和第' + (wybhArr.indexOf(wybh) + 1) + '行';
              break;
            }
            xqbhArr.push(xqbh);
          }
          if (testResBoolean) {
            message.success('本地校验通过，正在上传服务器...');
            myAxios
              .post(
                '/daoRuXiaoQu',
                qs.stringify({
                  wyid: this.state.selectWyid,
                  xlsJson: JSON.stringify(xlsJson),
                })
              )
              .then(res => {
                console.log(res);
                if (res.data.ret == 'success') {
                  message.success('成功插入' + res.data.insertNum + '条数据');
                  this.search();
                } else {
                  message.warning('插入失败，原因：' + res.data.info);
                }
              })
              .catch(err => {
                message.warning('服务器或网络错误：' + err);
                console.log(err);
              })
              .then(() => {
                this.setState({ importing: false, importModalVisible: false });
              });
          } else {
            this.setState({ importing: false });
            message.error(testResStr);
          }
          console.log('验证完的xlsJson：', xlsJson);
        });
      });
    }
  };

  //打开导入modal，并且载入物业公司列表
  openImportModal = () => {
    this.setState({ importModalVisible: true, wuYeGongSiLoading: true }, () => {
      //从服务器获取物业公司列表
      myAxios
        .post(
          '/t_1wuyewuyeMgr',
          qs.stringify({
            command: 'getWuYeGongSiList',
          })
        )
        .then(res => {
          this.setState({ wuYeGongSiLoading: false });
          if (res.data.ret == 'success') {
            let wuYeGongSiArr = res.data.nodes;
            for (var i = 0; i < wuYeGongSiArr.length; i++) {
              wuYeGongSiArr[i]['title'] =
                wuYeGongSiArr[i]['wybh'] + ': ' + wuYeGongSiArr[i]['wymc'];
            }
            wuYeGongSiArr.unshift({ ID: '-1', title: '请选择物业公司' });
            this.setState({ wuYeGongSiArr: wuYeGongSiArr });
          } else {
            message.warning(res.data.info);
          }
        })
        .catch(err => {
          this.setState({
            searching: false,
          });
          console.log('axios err: ', err);
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
        sm: { span: 5 },
      },
      wrapperCol: {
        sm: { span: 19 },
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
            <FormItem label="小区编号">
              {getFieldDecorator('search_xqbh', {
                rules: [],
                initialValue: '',
              })(<Input />)}
            </FormItem>
            <FormItem label="小区名称">
              {getFieldDecorator('search_xqmc', {
                rules: [],
                initialValue: '',
              })(<Input />)}
            </FormItem>
            <FormItem label="物业ID">
              {getFieldDecorator('search_wyid', {
                rules: [],
                initialValue: '',
              })(<Input />)}
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
              <Button htmlType="button" icon="login" onClick={this.openImportModal}>
                导入
              </Button>
            </FormItem>
            <FormItem>
              <Button
                icon="download"
                htmlType="button"
                onClick={petGlobal.downMuban.bind(this, 'xiaoQu.xls')}
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
              <Form.Item label="代理ID" {...changeFormItemLayout} onSubmit={this.changeData}>
                {getFieldDecorator('change_uniqueID', {
                  rules: [
                    { pattern: /^\d{6}$/, message: '必须是长度为6的数字' },
                    { required: true, message: '必填' },
                  ],
                })(<Input />)}
              </Form.Item>
              <Form.Item label="昵称" {...changeFormItemLayout}>
                {getFieldDecorator('change_nickname', {
                  rules: [
                    { min: 6, message: '长度不能小于6' },
                    { required: true, message: '必填' },
                  ],
                })(<Input />)}
              </Form.Item>
              <Form.Item label="密码" {...changeFormItemLayout}>
                {getFieldDecorator('change_password', {
                  rules: [
                    { min: 6, message: '长度不能小于6' },
                    { required: true, message: '必填' },
                  ],
                })(<Input />)}
              </Form.Item>
              <FormItem label="手机号" {...changeFormItemLayout}>
                {getFieldDecorator('change_mobile', {
                  rules: [
                    { pattern: /^1\d{10}$/, message: '必须是手机号' },
                    { required: true, message: '必填' },
                  ],
                })(<Input />)}
              </FormItem>
              <FormItem label="邮箱" {...changeFormItemLayout}>
                {getFieldDecorator('change_email', {
                  rules: [
                    { type: 'email', message: '必须是合法的邮箱号' },
                    { required: true, message: '必填' },
                  ],
                })(<Input />)}
              </FormItem>
              <FormItem label="QQ号" {...changeFormItemLayout}>
                {getFieldDecorator('change_qq', {
                  rules: [
                    { pattern: /\d$/, message: 'QQ号必须是纯数字' },
                    { min: 6, message: '长度最小为6' },
                    { max: 10, message: '长度最大为10' },
                    { required: true, message: '必填' },
                  ],
                })(<Input />)}
              </FormItem>
              <FormItem label="微信号" {...changeFormItemLayout}>
                {getFieldDecorator('change_weixin', {
                  rules: [{ required: true, message: '必填' }],
                })(<Input />)}
              </FormItem>
              <FormItem label="区域编号" {...changeFormItemLayout}>
                {getFieldDecorator('change_zone', {
                  rules: [
                    { pattern: /^\d{6}$/, message: '必须是长度为6的数字' },
                    { required: true, message: '必填' },
                  ],
                })(<Input />)}
              </FormItem>
              <FormItem label="状态" {...changeFormItemLayout}>
                {getFieldDecorator('change_isnormal')(
                  <Select style={{ width: 70 }}>
                    <Option value="1">正常</Option>
                    <Option value="0">异常</Option>
                  </Select>
                )}
              </FormItem>
              <FormItem label="平台提成比例" {...changeFormItemLayout}>
                {getFieldDecorator('change_rate', {
                  initialValue: 0,
                  rules: [
                    { pattern: /^\d$/, message: '必须是数字' },
                    { required: true, message: '必填' },
                  ],
                })(<Input />)}
              </FormItem>
              <FormItem label="是否交过保证金" {...changeFormItemLayout}>
                {getFieldDecorator('change_ispaygurantee', {})(
                  <Select style={{ width: 70 }}>
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </Select>
                )}
              </FormItem>
              <FormItem label="保证金数额" {...changeFormItemLayout}>
                {getFieldDecorator('change_guranteeamount', {
                  rules: [
                    { pattern: /^\d$/, message: '必须是数字' },
                    { required: true, message: '必填' },
                  ],
                })(<Input />)}
              </FormItem>
              <FormItem label="结算周期" {...changeFormItemLayout}>
                {getFieldDecorator('change_clearperoid', {
                  rules: [
                    { pattern: /^\d$/, message: '必须是数字' },
                    { required: true, message: '必填' },
                  ],
                })(<Input />)}
              </FormItem>
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

          {
            //导入modal
          }
          <Modal
            visible={this.state.importModalVisible}
            onCancel={() => {
              this.setState({ importModalVisible: false });
            }}
            closable={false}
            onOk={this.importXls}
            confirmLoading={this.state.importing}
          >
            <Alert
              message="请先选择小区所属物业公司，再选择表格文件"
              type="info"
              style={{ marginTop: 10, marginBottom: 10 }}
              banner={true}
            />
            <Select
              defaultValue="-1"
              loading={this.state.wuYeGongSiLoading}
              dropdownMatchSelectWidth={true}
              style={{ marginBottom: 10 }}
              onChange={v => this.setState({ selectWyid: v })}
            >
              {this.state.wuYeGongSiArr.map((v, k) => {
                console.log(v.title);
                return (
                  <Option key={k} value={v.ID}>
                    {v.title}
                  </Option>
                );
              })}
            </Select>
            <br />
            <Upload
              beforeUpload={() => {
                return false;
              }}
              onChange={file => {
                this.setState({ xlsFile: file.fileList[0] });
              }}
              customRequest={() => {}}
            >
              <Button htmlType="button" icon="login">
                选择表格文件
              </Button>
            </Upload>
          </Modal>
        </Card>
      </div>
    );
  }
}

export default xiaoQu;
