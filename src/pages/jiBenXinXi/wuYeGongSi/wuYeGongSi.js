import React, { PureComponent } from 'react';
import { connect } from 'dva';
import zhCN from 'antd/lib/locale-provider/zh_CN';
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
  LocaleProvider,
  Alert,
} from 'antd';
import styles from './index.less';
import petGlobal from '@/petGlobal';
import axiosSys from 'axios';
var qs = require('qs');

const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;
const axios = axiosSys.create({ baseURL: petGlobal.apiPath });
const myAxios = axiosSys.create({ baseURL: petGlobal.myApi });

/*@connect(({ loading }) => ({
  submitting: loading.effects['form/submitRegularForm'],
}))*/
@Form.create()
class wuYeGongSi extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      xlsFile: undefined,
      importAlertMsg: '',
      importAlertType: 'success',
      importModalVisible: false,
      selectFile: {},
      operateType: 'add',
      currentPage: 1,
      changeRecord: {},
      searching: false,
      importing: false,
      addOrChangeing: false,
      changeModalVisible: false,
      viewImgArr: [],
      tableColumns: [
        { title: 'ID', dataIndex: 'ID' },
        { title: '物业名称', dataIndex: 'wymc' },
        { title: '物业描述', dataIndex: 'wyms' },
        {
          title: '操作',
          dataIndex: 'ID' + 1,
          render: (ID, record, row) => (
            <div>
              <Radio.Group size="small">
                <Radio.Button onClick={this.modalChange.bind(this, 'change', ID, record, row)}>
                  修改
                </Radio.Button>
                <Popconfirm title="确认删除？" onConfirm={this.delData.bind(this, ID, record, row)}>
                  <Radio.Button loading={record.deling}>删除</Radio.Button>
                </Popconfirm>
              </Radio.Group>
            </div>
          ),
        },
      ],
      tableDataSource: [],
      pageCount: 1,
    };
  }

  delData = (ID, record, row, e) => {
    console.log('del: ' + record.ID);
    //设置删除按钮为loading
    let tableDataTemp = Object.assign([], this.state.tableDataSource);
    tableDataTemp[row].deling = true;
    this.setState(
      {
        tableDataSource: tableDataTemp,
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
            });

            message.error(err.data);
          });
      }
    );
  };

  //搜索
  search = e => {
    this.setState({
      searching: true,
    });
    let fields = this.props.form.getFieldsValue();
    axios
      .get('', {
        params: {
          command: 'hainanwuye_query',
          pageindex: this.state.currentPage,
          pagenum: 30,
          wymc: fields.search_wymc ? fields.search_wymc : '',
          wyms: fields.search_wyms ? fields.search_wyms : '',
        },
      })
      .then(res => {
        this.setState({
          searching: false,
        });
        if (res.data.ret == 'success') {
          let resJson = res.data.nodes;
          for (var k in resJson) {
            resJson[k]['deling'] = false;
          }
          this.setState({
            pageCount: parseInt(res.data.totalpagesum),
            tableDataSource: resJson,
          });
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

  btnTest = () => {
    let v = '    ';
    console.log('i' + v.trim() + 'j');
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
      let testResBoolean = true;
      let testResStr = '';
      let wybhArr = [];
      let wymcmsArr = [];
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
        if (!testResBoolean) {
          break;
        }
        //编号是否有重复的
        let wybh = xlsJson[i][0];
        if (wybhArr.indexOf(wybh) != -1) {
          testResBoolean = false;
          testResStr = '物业编号有重复，第' + i + '行和第' + (wybhArr.indexOf(wybh) + 1) + '行';
          break;
        }
        wybhArr.push(wybh);
        //物业名称和物业描述连接起来是否重复
        let wymcms = xlsJson[i][1] + xlsJson[i][2];
        if (wymcmsArr.indexOf(wymcms) != -1) {
          testResBoolean = false;
          testResStr =
            '物业名称和描述有重复，第' + i + '行和第' + (wybhArr.indexOf(wybh) + 2) + '行';
          break;
        }
        wymcmsArr.push(wymcms);
      }
      if (testResBoolean) {
        message.success('本地校验通过，正在上传服务器...');
        myAxios
          .post(
            '/daoRuWuYeGongSi',
            qs.stringify({
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
        message.error(testResStr);
        this.setState({ importing: false });
      }
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
      <Card bordered={false}>
        <Form hideRequiredMark layout="inline">
          <FormItem label="物业名称">
            {getFieldDecorator('search_wymc', {
              rules: [],
            })(<Input />)}
          </FormItem>
          <FormItem label="物业描述">
            {getFieldDecorator('search_wyms', {
              rules: [],
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
            <Button
              htmlType="button"
              onClick={this.modalChange.bind(this, 'add')}
              icon="plus-circle"
            >
              添加
            </Button>
          </FormItem>
          <FormItem>
            <Button
              htmlType="button"
              icon="login"
              onClick={() => {
                this.setState({ importModalVisible: true });
              }}
            >
              导入
            </Button>
          </FormItem>
          <FormItem>
            <Button
              htmlType="button"
              onClick={petGlobal.downMuban.bind(this, 'wuYeGongSi.xls')}
              icon="download"
            >
              下载模板
            </Button>
          </FormItem>
        </Form>

        <Table
          dataSource={this.state.tableDataSource}
          columns={this.state.tableColumns}
          rowKey="ID"
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
          <Form hideRequiredMark>
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
            message="请先选择表格文件"
            type="info"
            style={{ marginTop: 10, marginBottom: 10 }}
            banner={true}
          />
          <Upload
            onChange={file => this.setState({ xlsFile: file.fileList[0] })}
            customRequest={() => {}}
          >
            <Button htmlType="button" icon="login">
              选择表格文件
            </Button>
          </Upload>
        </Modal>
      </Card>
    );
  }
}

export default wuYeGongSi;
