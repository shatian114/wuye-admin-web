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
class yeZhu extends PureComponent {
  constructor(props) {
    super(props);
    axios.defaults.baseURL = petGlobal.apiPath;

    this.state = {
      selectXqid: '-1',
      xiaoQuLoading: false,
      xiaoQuArr: [{ ID: '-1', title: '请先选择物业公司...' }],
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
        {
          title: '业主编号',
          dataIndex: 'yzbh',
        },
        {
          title: '小区编号',
          dataIndex: 'xqbh',
        },
        {
          title: '小区名称',
          dataIndex: 'xqmc',
        },
        {
          title: '物业名称',
          dataIndex: 'wymc',
        },
        {
          title: '地理位置',
          dataIndex: 'dlwz',
        },
        {
          title: '楼房面积',
          dataIndex: 'lfmj',
        },
        {
          title: '楼层编号',
          dataIndex: 'lfbh',
        },
        {
          title: '联系方式',
          dataIndex: 'yzsj',
        },
        {
          title: '账户余额',
          dataIndex: 'leftamount',
        },
        {
          title: '是否欠费',
          dataIndex: 'isnormal',
          render: (isnormal, record, row) => isnormal,
        },
        {
          title: '详情描述',
          dataIndex: 'qianfeinum',
        },
        {
          title: '操作',
          dataIndex: 'ID',
          render: (ID, record, row) => (
            <div>
              <Row style={{ width: 200 }}>
                <Col span={6}>
                  <Button size="small">修改</Button>
                </Col>
                <Col span={6}>
                  <Popconfirm
                    title="确认删除？"
                    onConfirm={this.delData.bind(this, ID, record, row)}
                  >
                    <Button size="small" loading={record.deling}>
                      删除
                    </Button>
                  </Popconfirm>
                </Col>
                <Col span={6}>
                  <Button
                    size="small"
                    loading={record.koufei}
                    onClick={this.changeFei.bind(this, 'koufei', ID, record, row)}
                  >
                    扣费
                  </Button>
                </Col>
                <Col span={6}>
                  <Button
                    size="small"
                    loading={record.cuifei}
                    onClick={this.changeFei.bind(this, 'cuifei', ID, record, row)}
                  >
                    催费
                  </Button>
                </Col>
              </Row>
            </div>
          ),
        },
      ],
      tableDataSource: [],
    };
  }

  changeFei = (operateType, ID, record, row) => {
    message.success('正在操作，请稍后...');
    axios
      .get('', {
        params: {
          command: 'hainan_' + operateType,
          ID: ID,
        },
      })
      .then(res => {
        if (res.data.ret == 'success') {
          message.success('操作成功');
        } else {
          message.warning(res.data.info);
        }
        this.search();
      })
      .catch(err => {
        message.error('网络请求错误');
      });
  };

  allChangeFei = (operateType, e) => {
    message.success('正在操作，请稍后...');
    this.state.tableDataSource.map((value, key) => {
      axios
        .get('', {
          params: {
            command: 'hainan_' + operateType,
            ID: value.ID,
          },
        })
        .then(res => {
          if (this.state.tableDataSource.length - 1 === key) {
            message.success('全部操作完成');
            this.search();
          }
        })
        .catch(err => {});
    });
  };

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
          command: 'hainanyezhu_query',
          pageindex: this.state.currentPage,
          pagenum: 30,
          xqid: fields.search_xiaoquid,
          yzbh: fields.search_yzbh,
          lfbh: fields.search_lfbh,
          isnormal: fields.search_isnormal,
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
            resJson[k]['koufei'] = false;
            resJson[k]['cuifei'] = false;
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

  //选择完物业公司后，加载对应物业公司的小区
  selectWuYeGongSi = wyid => {
    console.log(wyid);
    if (wyid != '-1') {
      this.setState(
        { xiaoQuLoading: true, xiaoQuArr: [{ ID: '-1', title: '正在加载小区...' }] },
        () => {
          myAxios
            .post(
              '/t_1wuyexiaoquMgr',
              qs.stringify({
                command: 'getWuYeXiaoQuList',
                wyid: wyid,
              })
            )
            .then(res => {
              this.setState({ xiaoQuLoading: false });
              if (res.data.ret == 'success') {
                let xiaoQuArr = res.data.nodes;
                for (var i = 0; i < xiaoQuArr.length; i++) {
                  xiaoQuArr[i]['title'] = xiaoQuArr[i]['xqbh'] + ': ' + xiaoQuArr[i]['xqmc'];
                }
                xiaoQuArr.unshift({ ID: '-1', title: '请选择物业公司' });
                this.setState({ xiaoQuArr: xiaoQuArr });
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
        }
      );
    }
  };

  //上传xls
  importXls = () => {
    console.log(this.state.selectWyid);
    if (this.state.selectXqid == '-1') {
      message.error('请选择小区');
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
          let bhArr = [];
          for (var i = 1; i < xlsJson.length; i++) {
            //判断每行的数据是否有3个并且不为空
            for (var j = 0; j < 3; j++) {
              let testVal = xlsJson[i][j];
              //检测数据是否有空的
              if (testVal == undefined || testVal.trim() == '') {
                testResStr = '第' + (i + 1) + '行的第' + (j + 1) + '个数据为空，请修正';
                testResBoolean = false;
                break;
              }
            }
            //用空字符串补足后面没有数据的单元格
            for (var j = 0; j < 5; j++) {
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
            let bh = xlsJson[i][0];
            if (bhArr.indexOf(bh) != -1) {
              testResBoolean = false;
              testResStr = '业主编号有重复，第' + i + '行和第' + (bhArr.indexOf(bh) + 1) + '行';
              break;
            }
            bhArr.push(bh);
          }
          if (testResBoolean) {
            message.success('本地校验通过，正在上传服务器...');
            myAxios
              .post(
                '/daoRuYeZhu',
                qs.stringify({
                  xqid: this.state.selectXqid,
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
                  message.warning('插入失败，原因：' + res.data.info);
                }
              })
              .catch(err => {
                this.setState({ importing: false });
                message.warning('服务器或网络错误：' + err);
                console.log(err);
              });
          } else {
            message.error(testResStr);
          }
          console.log('验证完的xlsJson：', xlsJson);
        });
      });
    }
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
            <FormItem label="小区ID">
              {getFieldDecorator('search_xiaoquid', {
                rules: [],
                initialValue: '',
              })(<Input />)}
            </FormItem>
            <FormItem label="业主编号">
              {getFieldDecorator('search_yzbh', {
                rules: [],
                initialValue: '',
              })(<Input />)}
            </FormItem>
            <FormItem label="楼房编号">
              {getFieldDecorator('search_lfbh', {
                rules: [],
                initialValue: '',
              })(<Input />)}
            </FormItem>

            <FormItem label="状态">
              {getFieldDecorator('search_isnormal', { initialValue: '所有' })(
                <Select dropdownMatchSelectWidth={true}>
                  <Option value="所有">所有</Option>
                  <Option value="正常">正常</Option>
                  <Option value="欠费">欠费</Option>
                </Select>
              )}
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
              <Button icon="plus-circle">添加</Button>
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
                onClick={petGlobal.downMuban.bind(this, 'yeZhu.xls')}
              >
                下载模板
              </Button>
            </FormItem>
            <FormItem>
              <Button onClick={this.allChangeFei.bind(this, 'koufei')} htmlType="button">
                一键扣费
              </Button>
            </FormItem>
            <FormItem>
              <Button onClick={this.allChangeFei.bind(this, 'cuifei')} htmlType="button">
                一键催费
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
                {getFieldDecorator('change_isnormal', {})(
                  <Select dropdownMatchSelectWidth={true}>
                    <Option value="1">正常</Option>
                    <Option value="0">异常</Option>
                  </Select>
                )}
              </FormItem>
              <FormItem label="平台提成比例" {...changeFormItemLayout}>
                {getFieldDecorator('change_rate', {
                  rules: [
                    { pattern: /^\d$/, message: '必须是数字' },
                    { required: true, message: '必填' },
                  ],
                })(<Input />)}
              </FormItem>
              <FormItem label="是否交过保证金" {...changeFormItemLayout}>
                {getFieldDecorator('change_ispaygurantee', {})(
                  <Select dropdownMatchSelectWidth={true}>
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
              message="请依次选择物业公司、小区，再选择表格文件"
              type="info"
              style={{ marginTop: 10, marginBottom: 10 }}
              banner={true}
            />
            <Select
              defaultValue="-1"
              loading={this.state.wuYeGongSiLoading}
              dropdownMatchSelectWidth={true}
              style={{ marginBottom: 10 }}
              onChange={this.selectWuYeGongSi}
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
            <Select
              defaultValue="-1"
              loading={this.state.xiaoQuLoading}
              dropdownMatchSelectWidth={true}
              style={{ marginBottom: 10 }}
              onChange={v => this.setState({ selectXqid: v })}
            >
              {this.state.xiaoQuArr.map((v, k) => {
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

export default yeZhu;
