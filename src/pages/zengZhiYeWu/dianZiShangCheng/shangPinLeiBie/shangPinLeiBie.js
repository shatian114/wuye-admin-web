import React, { PureComponent } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Icon,
  Table,
  Tag,
  Modal,
  Popconfirm,
  message,
  Row,
  Col,
} from 'antd';
import styles from './index.less';
import petGlobal from '@/petGlobal';
import axiosSys from 'axios';
const myAxios = axiosSys.create({ baseURL: petGlobal.myApi, timeout: petGlobal.axiosTimeout });
var qs = require('qs');

@Form.create()
class shangPinLeiBie extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      pageCount: 1,
      pageindex: 1,
      tableDataSource: [],
      tableColumns: [
        { title: 'ID', dataIndex: 'ID' },
        { title: '产品类型ID', dataIndex: 'producttypeid' },
        { title: '产品类型名称', dataIndex: 'producttypename' },
        {
          title: '操作',
          dataIndex: 'ID' + 1,
          render: (ID, record, row) => (
            <div>
              <Row style={{ width: 100 }}>
                <Col span={12}>
                  <Button size="small" onClick={this.modalChange.bind(this, 'change', record, row)}>
                    修改
                  </Button>
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
      changeRecord: {},
      searching: false,
      changeModalVisible: false,
    };
  }

  //搜索
  search = () => {
    this.props.form.validateFields(
      ['search_producttypeid', 'search_producttypename'],
      { validateFieldsAndScroll: true },
      (err, value) => {
        if (err) {
          message.warning('请检查输入的值');
        } else {
          this.setState({ searching: true }, () => {
            let fields = this.props.form.getFieldsValue();
            myAxios
              .post(
                '/producttypeMgr',
                qs.stringify({
                  command: 'query',
                  producttypeid: fields.search_producttypeid,
                  producttypename: fields.search_producttypename,
                  pagenum: petGlobal.pagenum,
                  pageindex: this.state.pageindex,
                })
              )
              .then(res => {
                console.log(res.data);
                if (res.data.ret == 'success') {
                  message.success('搜索完成');
                  let nodes = res.data.nodes;
                  for (let i = 0; i < nodes.length; i++) {
                    nodes[i]['deling'] = false;
                  }
                  this.setState({
                    tableDataSource: res.data.nodes,
                    pageCount: parseInt(res.data.pageCount),
                  });
                } else {
                  message.error('搜索失败： ' + res.data.info);
                }
              })
              .catch(err => {
                console.log(err);
              })
              .then(() => {
                this.setState({ searching: false });
              });
          });
        }
      }
    );
  };

  //删除
  delData = (ID, record, row) => {
    console.log('del ID: ', record.ID);
    let tableDataSourceTmp = Object.assign([], this.state.tableDataSource);
    tableDataSourceTmp[row].deling = true;
    this.setState({ tableDataSource: tableDataSourceTmp }, () => {
      myAxios
        .post(
          '/producttypeMgr',
          qs.stringify({
            command: 'del',
            id: record.ID,
          })
        )
        .then(res => {
          console.log(res.data);
          if (res.data.ret == 'success') {
            message.success('删除成功');
            this.search();
          } else {
            message.warning('删除失败: ' + res.data.info);
            tableDataSourceTmp = Object.assign([], this.state.tableDataSource);
            tableDataSourceTmp[row].deling = false;
            this.setState({ tableDataSource: tableDataSourceTmp });
          }
        })
        .catch(err => {
          console.log(err);
        });
    });
  };

  //添加或修改
  changeData = () => {
    this.props.form.validateFields(null, { validateFieldsAndScroll: true }, (err, value) => {
      if (err) {
        message.warning('请检查输入的值');
      } else {
        this.setState({ addOrChangeing: true }, () => {
          let fields = this.props.form.getFieldsValue();
          myAxios
            .post(
              '/producttypeMgr',
              qs.stringify({
                command: this.state.operateType,
                producttypeid: fields.change_producttypeid,
                producttypename: fields.change_producttypename,
                ID: this.state.changeRecord.ID,
              })
            )
            .then(res => {
              console.log(res.data);
              if (res.data.ret == 'success') {
                message.success(this.state.operateType == 'add' ? '添加成功' : '修改成功');
                this.search();
              } else {
                message.warning('失败：' + res.data.info);
              }
              this.setState({ addOrChangeing: false, changeModalVisible: false });
            })
            .catch(err => {
              message.error('服务器发生错误');
              console.log(err);
            });
        });
      }
    });
  };

  //弹出修改或添加表单
  modalChange = (operateType, changeRecord) => {
    console.log('visible addorchange modal');
    if (operateType == 'add') {
      this.props.form.setFields({
        change_producttypeid: { value: '' },
        change_producttypename: { value: '' },
      });
    } else {
      this.props.form.setFields({
        change_producttypeid: { value: changeRecord.producttypeid },
        change_producttypename: { value: changeRecord.producttypename },
      });
      this.setState({ changeRecord, changeRecord });
    }
    this.setState({ operateType: operateType, changeModalVisible: true });
  };

  changePage = (pageindex, pageSize) => {
    console.log('pageindex: ' + pageindex);
    this.setState(
      {
        pageindex: pageindex,
      },
      () => this.search()
    );
  };

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
    } = this.props;

    const pageConf = {
      pageSize: petGlobal.pagenum,
      current: this.state.pageindex,
      onChange: this.changePage,
      total: this.state.pageCount,
    };

    const changeFormItemLayout = {
      labelCol: {
        sm: { span: 4 },
      },
      wrapperCol: {
        sm: { span: 20 },
      },
    };

    return (
      <Card bordered={false}>
        {
          //搜索表单
        }
        <Form hideRequiredMark layout="inline">
          <Form.Item label="产品类型ID">
            {getFieldDecorator('search_producttypeid', {
              rules: [{ validator: petGlobal.valid.onlyNumber }],
              initialValue: '',
            })(<Input />)}
          </Form.Item>
          <Form.Item label="产品类型名称">
            {getFieldDecorator('search_producttypename', {
              rules: [],
              initialValue: '',
            })(<Input />)}
          </Form.Item>
          <Form.Item>
            <Button
              icon="search"
              type="primary"
              htmlType="button"
              loading={this.state.searching}
              onClick={this.search}
            >
              搜索
            </Button>
          </Form.Item>
          <Form.Item>
            <Button
              htmlType="button"
              onClick={this.modalChange.bind(this, 'add')}
              icon="plus-circle"
            >
              添加
            </Button>
          </Form.Item>
        </Form>

        {
          //搜索结果
        }
        <Table
          dataSource={this.state.tableDataSource}
          columns={this.state.tableColumns}
          rowKey="ID"
          pagination={pageConf}
        />

        {
          //添加表单
        }
        <Modal
          maskClosable={false}
          visible={this.state.changeModalVisible}
          closable={false}
          keyboard={true}
          onCancel={() => this.setState({ changeModalVisible: false })}
          width="40%"
          onOk={this.changeData}
          confirmLoading={this.state.addOrChangeing}
        >
          <Form hideRequiredMark>
            <Form.Item label="产品类型ID" {...changeFormItemLayout}>
              {getFieldDecorator('change_producttypeid', {
                rules: [
                  { required: true, message: '必填' },
                  { validator: petGlobal.valid.onlyNumber },
                  { max: 6, message: '长度最大为6位' },
                ],
                initialValue: '',
              })(<Input />)}
            </Form.Item>
            <Form.Item label="产品类型名称" {...changeFormItemLayout}>
              {getFieldDecorator('change_producttypename', {
                rules: [{ required: true, message: '必填' }, { max: 20, message: '长度最大为20' }],
                initialValue: '',
              })(<Input />)}
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    );
  }
}

export default shangPinLeiBie;
