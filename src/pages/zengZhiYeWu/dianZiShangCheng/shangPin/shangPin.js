import React, { PureComponent } from 'react';
import ReactPlayer from 'react-player';
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
  Select,
  Upload,
  Progress,
} from 'antd';
const { Option } = Select;
import styles from './index.less';
import petGlobal from '@/petGlobal';
import axiosSys from 'axios';
const myAxios = axiosSys.create({ baseURL: petGlobal.myApi, timeout: petGlobal.axiosTimeout });
var qs = require('qs');

@Form.create()
class shangPin extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      playUrl: '',
      visibieVideoPlayer: false,
      percent: 0,
      tagindexImg: [],
      mainpic: undefined,
      selectVideo: undefined,
      uploadKey: 1,
      pageCount: 1,
      pageindex: 1,
      tableDataSource: [],
      tableColumns: [
        { title: 'ID', dataIndex: 'ID' },
        { title: '产品类型ID', dataIndex: 'producttypeid' },
        { title: '区域标识', dataIndex: 'zone' },
        { title: '商品编号', dataIndex: 'productid' },
        { title: '商品排序', dataIndex: 'orderindex' },
        { title: '商品名称', dataIndex: 'productname' },
        { title: '剩余数量', dataIndex: 'num' },
        { title: '商品描述', dataIndex: 'productdes' },
        {
          title: '支付的费用',
          dataIndex: 'price',
          render: (ID, record, row) => <span>￥{record.price}</span>,
        },
        {
          title: '是否显示视频链接',
          dataIndex: 'ishowvideolink',
          render: (ID, record, row) => <span>{record.ishowvideolink == '1' ? '是' : '否'}</span>,
        },
        {
          title: '视频',
          dataIndex: 'videolink',
          render: (ID, record, row) => (
            <Button onClick={this.playVideo.bind(this, record)}>查看视频</Button>
          ),
        },
        {
          title: '是否通过审核',
          dataIndex: 'ispassed',
          render: (ID, record, row) => <span>{record.ispassed == '1' ? '是' : '否'}</span>,
        },
        {
          title: '是否置顶',
          dataIndex: 'istop',
          render: (ID, record, row) => <span>{record.istop == '1' ? '是' : '否'}</span>,
        },
        { title: '门店标识', dataIndex: 'shoptag' },
        {
          title: '是否允许用户上传图片',
          dataIndex: 'isneeduserpic',
          render: (ID, record, row) => <span>{record.isneeduserpic == '1' ? '是' : '否'}</span>,
        },
        {
          title: '用户是否可留言',
          dataIndex: 'isneeduserinfo',
          render: (ID, record, row) => <span>{record.isneeduserinfo == '1' ? '是' : '否'}</span>,
        },
        {
          title: '是否需要输入完整收获地址',
          dataIndex: 'isneeduseraddress',
          render: (ID, record, row) => <span>{record.isneeduseraddress == '1' ? '是' : '否'}</span>,
        },
        {
          title: '是否要填写桌号信息',
          dataIndex: 'isneedesktag',
          render: (ID, record, row) => <span>{record.isneeddesktag == '1' ? '是' : '否'}</span>,
        },
        {
          title: '是否放到首页',
          dataIndex: 'isatmain',
          render: (ID, record, row) => <span>{record.isatmain == '1' ? '是' : '否'}</span>,
        },
        { title: '主图', dataIndex: 'mainpic' },
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

  //播放视频
  playVideo = record => {
    this.setState({ playUrl: record.videolink, visibieVideoPlayer: true }, () => {
      console.log(this.state.playUrl);
    });
  };

  //搜索
  search = () => {
    this.props.form.validateFields(
      ['search_producttypeid', 'search_zone', 'search_productid'],
      { validateFieldsAndScroll: true },
      (err, value) => {
        if (err) {
          message.warning('请检查输入的值');
        } else {
          this.setState({ searching: true }, () => {
            let fields = this.props.form.getFieldsValue();
            myAxios
              .post(
                '/productMgr',
                qs.stringify({
                  command: 'query',
                  producttypeid: fields.search_producttypeid,
                  zone: fields.search_zone,
                  productid: fields.search_productid,
                  productname: fields.search_productname,
                  shoptag: fields.search_shoptag,
                  ispassed: fields.search_ispassed,
                  istop: fields.search_istop,
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
          '/productMgr',
          qs.stringify({
            command: 'del',
            id: record.ID,
          })
        )
        .then(res => {
          console.log(res.data);
          if (res.data.ret == 'success') {
            //删除主图和缩略图
            console.log(
              'delMainImg: ' + record.ID,
              petGlobal.delImg('product_' + record.ID + '_mainpic.jpg')
            );
            record.tagindex.map(v => {
              console.log(
                'delTagIndex: ' + record.ID + '---' + v,
                petGlobal.delImg('product_' + record.ID + '_' + v + '.jpg')
              );
            });
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
    if (
      this.state.operateType == 'add' &&
      (this.state.selectVideo == undefined || this.state.mainpic == undefined)
    ) {
      message.warning('请选择视频和主图');
      return;
    }
    this.props.form.validateFields(
      [
        'change_producttypeid',
        'change_zone',
        'change_productid',
        'change_productname',
        'change_shoptag',
      ],
      { validateFieldsAndScroll: true },
      (err, value) => {
        if (err) {
          message.warning('请检查输入的值');
        } else {
          //先上传视频，得到视频地址和key
          petGlobal.uploadUgc(this.state.selectVideo, this.progressCall).then(result => {
            console.log(result);
            this.setState({ addOrChangeing: true }, () => {
              let fields = this.props.form.getFieldsValue();
              myAxios
                .post(
                  '/producttypeMgr',
                  qs.stringify({
                    command: this.state.operateType,
                    videoid: result.fileId,
                    videolink: result.videoUrl,
                    tagindex: petGlobal.geneUuidArr(this.state.tagindexImg.length),
                    producttypeid: fields.change_producttypeid,
                    productid: fields.change_productid,
                    productname: fields.change_productname,
                    zone: fields.change_zone,
                    shoptag: fields.change_shoptag,
                    ispassed: fields.change_ispassed,
                    istop: fields.change_istop,
                    orderindex: fields.change_orderindex,
                    productdes: fields.change_productdes,
                    num: fields.change_num,
                    price: fields.change_price,
                    ishowvideolink: fields.change_ishowvideolink,
                    isneeduserpic: fields.change_isneeduserpic,
                    isneeduserinfo: fields.change_isneeduserinfo,
                    isneeduseraddress: fields.change_isneeduseraddress,
                    isneeddesktag: fields.change_isneeddesktag,
                    isatmain: fields.change_isatmain,
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
          });
        }
      }
    );
  };

  //上传视频进度
  progressCall = result => {
    let curr = result.curr;
    this.setState({ percent: parseInt(curr * 100) }, () => {
      console.log(this.state.percent);
    });
  };

  //弹出修改或添加表单
  modalChange = (operateType, changeRecord) => {
    console.log('visible addorchange modal');
    if (operateType == 'add') {
      this.props.form.resetFields([
        'change_producttypeid',
        'change_productname',
        'change_zone',
        'change_productid',
        'change_shoptag',
        'change_ispassed',
        'change_istop',
        'change_orderindex',
        'change_isatmain',
        'change_ishowvideolink',
        'change_isneeddesktag',
        'change_isneeduseraddress',
        'change_isneeduserinfo',
        'change_isneeduserpic',
        'change_num',
        'change_price',
        'change_productdes',
      ]);
    } else {
      this.props.form.setFields({
        change_producttypeid: { value: changeRecord.producttypeid },
        change_productname: { value: changeRecord.producttypename },
      });
      this.setState({ changeRecord, changeRecord });
    }
    this.setState({
      uploadKey: this.state.uploadKey + 1,
      operateType: operateType,
      changeModalVisible: true,
    });
  };

  //添加或删除视频
  addVideo = file => {
    this.setState({ selectVideo: file.fileList[0] });
  };

  //添加主图
  addMainpic = file => {
    this.setState({ mainpic: file.fileList[0] });
  };

  //添加索引图
  addTagindex = file => {
    this.setState({ tagindexImg: file.fileList });
  };

  //修改页数
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
          <Form.Item label="区域标识">
            {getFieldDecorator('search_zone', {
              rules: [{ validator: petGlobal.valid.search_zone }],
              initialValue: '',
            })(<Input />)}
          </Form.Item>
          <Form.Item label="商品编号">
            {getFieldDecorator('search_productid', {
              rules: [{ validator: petGlobal.valid.onlyNumber }],
              initialValue: '',
            })(<Input />)}
          </Form.Item>
          <Form.Item label="商品名称">
            {getFieldDecorator('search_productname', {
              rules: [],
              initialValue: '',
            })(<Input />)}
          </Form.Item>
          <Form.Item label="门店标识">
            {getFieldDecorator('search_shoptag', {
              rules: [],
              initialValue: '',
            })(<Input />)}
          </Form.Item>
          <Form.Item label="是否通过审核">
            {getFieldDecorator('search_ispassed', { rules: [], initialValue: '2' })(
              <Select dropdownMatchSelectWidth={true}>
                <Option value="2">全部</Option>
                <Option value="1">是</Option>
                <Option value="0">否</Option>
              </Select>
            )}
          </Form.Item>
          <Form.Item label="是否置顶">
            {getFieldDecorator('search_istop', { rules: [], initialValue: '2' })(
              <Select dropdownMatchSelectWidth={true}>
                <Option value="2">全部</Option>
                <Option value="1">是</Option>
                <Option value="0">否</Option>
              </Select>
            )}
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
          //播放视频modal
        }
        <Modal
          visible={this.state.visibieVideoPlayer}
          onCancel={() => this.setState({ visibieVideoPlayer: false })}
          footer={null}
          width="100%"
          closable={false}
        >
          <div align="center">
            <ReactPlayer url={this.state.playUrl} playing controls={true} light={true} />
          </div>
        </Modal>

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
            <Form.Item label="区域标识" {...changeFormItemLayout}>
              {getFieldDecorator('change_zone', {
                rules: [
                  { required: true, message: '必填' },
                  { validator: petGlobal.valid.add_zone },
                ],
                initialValue: '',
              })(<Input />)}
            </Form.Item>
            <Form.Item label="商品编号" {...changeFormItemLayout}>
              {getFieldDecorator('change_productid', {
                rules: [{ required: true, message: '必填' }, { max: 20, message: '长度最大为20' }],
                initialValue: '',
              })(<Input />)}
            </Form.Item>
            <Form.Item label="商品名称" {...changeFormItemLayout}>
              {getFieldDecorator('change_productname', {
                rules: [{ required: true, message: '必填' }, { max: 20, message: '长度最大为20' }],
                initialValue: '',
              })(<Input />)}
            </Form.Item>
            <Form.Item label="商品排序" {...changeFormItemLayout}>
              {getFieldDecorator('change_orderindex', {
                rules: [{ required: true, message: '必填' }, { max: 20, message: '长度最大为20' }],
                initialValue: '',
              })(<Input />)}
            </Form.Item>
            <Form.Item label="剩余数量" {...changeFormItemLayout}>
              {getFieldDecorator('change_num', {
                rules: [{ required: true, message: '必填' }, { max: 20, message: '长度最大为20' }],
                initialValue: '',
              })(<Input />)}
            </Form.Item>
            <Form.Item label="商品描述" {...changeFormItemLayout}>
              {getFieldDecorator('change_productdes', {
                rules: [{ required: true, message: '必填' }, { max: 20, message: '长度最大为20' }],
                initialValue: '',
              })(<Input />)}
            </Form.Item>
            <Form.Item label="支付费用" {...changeFormItemLayout}>
              {getFieldDecorator('change_price', {
                rules: [{ required: true, message: '必填' }, { max: 20, message: '长度最大为20' }],
                initialValue: '',
              })(<Input />)}
            </Form.Item>
            <Form.Item label="门店标识" {...changeFormItemLayout}>
              {getFieldDecorator('change_shoptag', {
                rules: [{ required: true, message: '必填' }, { max: 20, message: '长度最大为20' }],
                initialValue: '',
              })(<Input />)}
            </Form.Item>
            <Form.Item label="是否显示视频" {...changeFormItemLayout}>
              {getFieldDecorator('change_ishowvideolink', { rules: [], initialValue: '0' })(
                <Select dropdownMatchSelectWidth={true}>
                  <Option value="1">是</Option>
                  <Option value="0">否</Option>
                </Select>
              )}
            </Form.Item>
            <Form.Item label="是否允许用户上传图片" {...changeFormItemLayout}>
              {getFieldDecorator('change_isneeduserpic', { rules: [], initialValue: '0' })(
                <Select dropdownMatchSelectWidth={true}>
                  <Option value="1">是</Option>
                  <Option value="0">否</Option>
                </Select>
              )}
            </Form.Item>
            <Form.Item label="是否允许用户留言" {...changeFormItemLayout}>
              {getFieldDecorator('change_isneeduserinfo', { rules: [], initialValue: '0' })(
                <Select dropdownMatchSelectWidth={true}>
                  <Option value="1">是</Option>
                  <Option value="0">否</Option>
                </Select>
              )}
            </Form.Item>
            <Form.Item label="是否需要输入完整收获地址" {...changeFormItemLayout}>
              {getFieldDecorator('change_isneeduseraddress', { rules: [], initialValue: '0' })(
                <Select dropdownMatchSelectWidth={true}>
                  <Option value="1">是</Option>
                  <Option value="0">否</Option>
                </Select>
              )}
            </Form.Item>
            <Form.Item label="是否要填写桌号信息" {...changeFormItemLayout}>
              {getFieldDecorator('change_isneeddesktag', { rules: [], initialValue: '0' })(
                <Select dropdownMatchSelectWidth={true}>
                  <Option value="1">是</Option>
                  <Option value="0">否</Option>
                </Select>
              )}
            </Form.Item>
            <Form.Item label="是否通过审核" {...changeFormItemLayout}>
              {getFieldDecorator('change_ispassed', { rules: [], initialValue: '0' })(
                <Select dropdownMatchSelectWidth={true}>
                  <Option value="1">是</Option>
                  <Option value="0">否</Option>
                </Select>
              )}
            </Form.Item>
            <Form.Item label="是否置顶" {...changeFormItemLayout}>
              {getFieldDecorator('change_istop', { rules: [], initialValue: '0' })(
                <Select dropdownMatchSelectWidth={true}>
                  <Option value="1">是</Option>
                  <Option value="0">否</Option>
                </Select>
              )}
            </Form.Item>
            <Form.Item label="是否放到首页" {...changeFormItemLayout}>
              {getFieldDecorator('change_isatmain', { rules: [], initialValue: '2' })(
                <Select dropdownMatchSelectWidth={true}>
                  <Option value="1">是</Option>
                  <Option value="0">否</Option>
                </Select>
              )}
            </Form.Item>
            <Form.Item>
              <div key={this.state.uploadKey}>
                <Upload
                  disabled={this.state.selectVideo !== undefined}
                  multiple={false}
                  accept="video/*"
                  listType="picture-card"
                  onChange={this.addVideo}
                  beforeUpload={(file, fileList) => {
                    return false;
                  }}
                >
                  添加视频
                </Upload>
                <Progress percent={this.state.percent} />
              </div>
            </Form.Item>
            <Form.Item>
              <div key={this.state.uploadKey}>
                <Upload
                  disabled={this.state.mainpic !== undefined}
                  multiple={false}
                  accept="image/jpg,image/jpeg,image/png"
                  listType="picture-card"
                  onChange={this.addMainpic}
                  beforeUpload={(file, fileList) => {
                    return false;
                  }}
                >
                  添加主图，只可以添加一张
                </Upload>
              </div>
            </Form.Item>
            <Form.Item>
              <div key={this.state.uploadKey}>
                <Upload
                  disabled={this.state.mainpic !== undefined}
                  multiple={true}
                  accept="image/jpg,image/jpeg,image/png"
                  listType="picture-card"
                  onChange={this.addTagindex}
                  beforeUpload={(file, fileList) => {
                    return false;
                  }}
                >
                  添加索引图
                </Upload>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    );
  }
}

export default shangPin;
