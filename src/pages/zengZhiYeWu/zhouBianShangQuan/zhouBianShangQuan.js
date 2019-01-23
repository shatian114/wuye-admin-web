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
  Avatar,
} from 'antd';
import styles from './index.less';
import petGlobal from '@/petGlobal';
import axiosSys from 'axios';
var qs = require('qs');
import BaiDuMap from '@/components/BaiDuMap';
import DelImg from '@/components/DelImg';

const FormItem = Form.Item;
const { Option } = Select;
const axios = axiosSys.create({
  baseURL: petGlobal.apiPath,
});
const myAxios = axiosSys.create({
  baseURL: petGlobal.myApi,
});

/*@connect(({ loading }) => ({
  submitting: loading.effects['form/submitRegularForm'],
}))*/
@Form.create()
class zhouBianShangQuan extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      mapPoint: {
        lat: 39.915,
        lng: 116.404,
      },
      mainpic: undefined,
      delTagKeyArr: [],
      changeTagKeyArr: [],
      tagImgArr: [],
      tagKeyArr: [],
      carouselHtml: '<>',
      tagindex: '',
      operateType: 'add',
      pageindex: 1,
      changeRecord: {},
      searching: false,
      importing: false,
      addOrChangeing: false,
      carouselVisible: false,
      changeModalVisible: false,
      viewImgArr: [],
      uploadKey: 1,
      tableColumns: [
        {
          title: 'ID',
          dataIndex: 'ID',
        },
        {
          title: '区域编号',
          dataIndex: 'zone',
        },
        {
          title: '店铺名称',
          dataIndex: 'shopname',
        },
        {
          title: '店铺描述',
          dataIndex: 'shopdesc',
        },
        {
          title: '手机号',
          dataIndex: 'mobilephone',
        },
        {
          title: '座机号',
          dataIndex: 'telephone',
        },
        {
          title: '地址',
          dataIndex: 'address',
          render: (ID, record, row) => (
            <p onClick={this.viewMap.bind(this, record)}>{record.address}</p>
          ),
        },
        {
          title: '是否审核过',
          dataIndex: 'ispassed',
          render: (ID, record, row) => (record.ispassed == 1 ? '是' : '否'),
        },
        {
          title: '是否置顶',
          dataIndex: 'istop',
          render: (ID, record, row) => (record.istop == 1 ? '是' : '否'),
        },
        {
          title: '图片',
          dataIndex: 'mainpic',
          render: (ID, record, row) => (
            <img
              width="auto"
              height="40"
              onClick={this.viewImg.bind(this, record)}
              src={
                petGlobal.tpUriPre + 'arroundshop_' + record.ID + '_mainpic.jpg?' + Math.random()
              }
              alt="无图片"
            />
          ),
        },
        {
          title: '操作',
          dataIndex: 'ID' + 1,
          render: (ID, record, row) => (
            <div>
              <Row style={{ width: 100 }}>
                <Col span={12}>
                  <Button
                    size="small"
                    onClick={this.modalChange.bind(this, 'change', ID, record, row)}
                  >
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
      tableDataSource: [],
      pageCount: 1,
    };
  }

  //查看图片
  viewImg = record => {
    let carouselHtmlTmp = '';
    let viewImgArrTmp = [petGlobal.tpUriPre + 'arroundshop_' + record.ID + '_mainpic.jpg'];
    let tagindexArr = record.tagindex.split(',');
    tagindexArr.map(v => {
      viewImgArrTmp.push(petGlobal.tpUriPre + 'arroundshop_' + record.ID + '_' + v + '.jpg');
    });
    viewImgArrTmp.map(v => {
      carouselHtmlTmp += '<div><img src="' + v + '" /></div>';
    });
    this.setState({
      carouselVisible: true,
      carouselHtml: carouselHtmlTmp,
      viewImgArr: viewImgArrTmp,
    });
    console.log(carouselHtmlTmp);
  };

  //查看地图
  viewMap = record => {
    let mapApiStr =
      'http://api.map.baidu.com/marker?location=' +
      record.lat +
      ',' +
      record.lng +
      '&title=店铺位置&output=html&src=www.china-xiuwei.com&content=' +
      record.address;
    console.log(mapApiStr);
    window.open(mapApiStr);
  };

  //删除
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
        myAxios
          .post(
            '/zhouBianShangQuanMgr',
            qs.stringify({
              command: 'del',
              id: record.ID,
            })
          )
          .then(res => {
            tableDataTemp[row].deling = false;
            this.setState({
              tableDataSource: tableDataTemp,
            });

            let resJson = res.data;
            if (resJson.ret == 'success') {
              //删除对应的图片
              let delImgArr = [{ key: 'arroundshop_' + record.ID + '_mainpic.jpg' }];
              petGlobal.delImg('arroundshop_' + record.ID + '_mainpic.jpg');
              console.log('tagindex', record.tagindex);
              record.tagindex.split(',').map(v => {
                console.log('push v ', v);
                delImgArr.push({ Key: 'arroundshop_' + record.ID + '_' + v + '.jpg' });
                petGlobal.delImg('arroundshop_' + record.ID + '_' + v + '.jpg');
              });
              message.success('删除成功');
              this.search();
            } else {
              message.warning(resJson.info);
            }
          })
          .catch(err => {
            console.log(err);
            tableDataTemp[row].deling = false;
            this.setState({
              tableDataSource: tableDataTemp,
            });

            message.error(err.data);
          });
      }
    );
  };

  //调用服务端的搜索接口
  search = () => {
    this.setState({
      searching: true,
      dataSource: {},
    });
    let fields = this.props.form.getFieldsValue();
    myAxios
      .post(
        '/zhouBianShangQuanMgr',
        qs.stringify({
          command: 'query',
          pageindex: this.state.pageindex,
          pagenum: petGlobal.pagenum,
          zone: fields.search_zone,
          shopname: fields.search_shopname,
          shopdesc: fields.search_shopdesc,
          mobilephone: fields.search_mobilephone,
          telephone: fields.search_telephone,
          address: fields.search_address,
          ispassed: fields.search_ispassed,
          istop: fields.search_istop,
        })
      )
      .then(res => {
        console.log(res.data);
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
        uploadKey: this.state.uploadKey + 1,
        operateType: operateType,
        changeModalVisible: true,
        changeTagKeyArr: [],
        mainpic: undefined,
        tagImgArr: [],
        tagKeyArr: [],
      });
      this.props.form.setFields({
        change_zone: { value: '' },
        change_shopname: { value: '' },
        change_shopdesc: { value: '' },
        change_mobilephone: { value: '' },
        change_telephone: { value: '' },
        change_ispassed: { value: '0' },
        change_istop: { value: '0' },
        change_mainpic: { value: {} },
      });
    } else {
      console.log(operateType, ID, record, row, e);
      let mapPointTmp = Object.assign({}, this.state.mapPoint);
      mapPointTmp.lat = record.lat;
      mapPointTmp.lng = record.lng;
      this.setState({
        uploadKey: this.uploadKey + 1,
        delTagKeyArr: [],
        tagImgArr: [],
        tagKeyArr: [],
        mapPoint: mapPointTmp,
        operateType: operateType,
        changeModalVisible: true,
        changeRecord: record,
        changeTagKeyArr: record.tagindex.split(','),
        mainpic: undefined,
      });
      this.props.form.setFields({
        change_zone: { value: record.zone },
        change_shopname: { value: record.shopname },
        change_shopdesc: { value: record.shopdesc },
        change_mobilephone: { value: record.mobilephone },
        change_telephone: { value: record.telephone },
        change_ispassed: { value: record.ispassed + '' },
        change_istop: { value: record.istop + '' },
        change_address: { value: record.address },
        change_mainpic: { value: {} },
      });
    }
  };

  //调用服务端的修改或添加端口
  changeData = e => {
    console.log(this.state.uploadKey);
    let tagindexArr = this.state.changeTagKeyArr.concat(this.state.tagKeyArr);

    this.setState({ tagindex: tagindexArr.join(',') }, () => {
      if (this.state.operateType === 'add' && this.state.mainpic === undefined) {
        message.error('请选择主图');
        return;
      }
      if (tagindexArr.length == 0) {
        message.error('请选择索引图');
        return;
      }
      console.log('start change :');
      this.props.form.validateFields(null, { validateFieldsAndScroll: true }, (err, value) => {
        if (!err) {
          console.log('validate ok');
          this.setState({ addOrChangeing: true });
          let fields = this.props.form.getFieldsValue();
          myAxios
            .post(
              '/zhouBianShangQuanMgr',
              qs.stringify({
                command: this.state.operateType,
                ID: this.state.changeRecord.ID,
                zone: fields.change_zone,
                shopname: fields.change_shopname,
                shopdesc: fields.change_shopdesc,
                mobilephone: fields.change_mobilephone,
                telephone: fields.change_telephone,
                ispassed: fields.change_ispassed,
                istop: fields.change_istop,
                lat: this.state.mapPoint.lat,
                lng: this.state.mapPoint.lng,
                address: fields.change_address,
                tagindex: tagindexArr.join(','),
              })
            )
            .then(res => {
              let resJson = res.data;
              if (resJson.ret == 'success') {
                //如果是修改，先删除需要删除的图片
                if (this.state.operateType === 'change') {
                  this.state.delTagKeyArr.map(v => {
                    console.log(
                      'del img: ',
                      petGlobal.delImg(
                        '/arroundshop_' + this.state.changeRecord.ID + '_' + v + '.jpg'
                      )
                    );
                  });
                }

                let id = this.state.operateType == 'add' ? res.data.id : this.state.changeRecord.ID;

                //添加成功，上传之前准备的图片
                //上传主图
                if (
                  this.state.operateType == 'add' ||
                  (this.state.operateType == 'change' && this.state.mainpic != undefined)
                ) {
                  console.log(
                    'up mainpic ',
                    petGlobal.uploadImg(
                      this.state.mainpic.originFileObj,
                      '/arroundshop_' + id + '_mainpic' + '.jpg'
                    )
                  );
                }

                //上传索引图
                this.state.tagImgArr.map((v, k) => {
                  console.log(
                    'up k ',
                    petGlobal.uploadImg(
                      v.originFileObj,
                      '/arroundshop_' + id + '_' + this.state.tagKeyArr[k] + '.jpg'
                    )
                  );
                });
                if (this.state.operateType == 'add') {
                  message.success('添加成功');
                } else {
                  message.success('修改成功');
                }

                this.search();
              } else {
                message.warning(resJson.info);
              }
              this.setState({
                addOrChangeing: false,
                changeModalVisible: false,
              });
              console.log('change response: ', res.data);
            })
            .catch(err => {
              console.log('change err: ', err);
              this.setState({
                addOrChangeing: false,
                changeModalVisible: false,
              });
            });
        } else {
          message.error('请先检查表单');
        }
      });
    });
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

  //获取地图的返回坐标
  setMap = point => {
    console.log(point);
    this.setState({ mapPoint: point });
  };

  //添加主图
  addMainPic = file => {
    this.setState({ mainpic: file.fileList[0] });
  };

  //添加索引图片
  addImg = file => {
    this.setState(
      { tagImgArr: file.fileList, tagKeyArr: petGlobal.geneUuidArr(file.fileList.length) },
      () => {
        console.log(this.state.tagImgArr.length);
      }
    );
  };

  //删除图片
  goDel = imgKey => {
    console.log('goDel: ', imgKey, this.state.delTagKeyArr.push(imgKey));
    let delTagKeyArrTmp = Object.assign([], this.state.delTagKeyArr);
    let changeTagKeyArrTmp = Object.assign(
      [],
      petGlobal.delArrEle(this.state.changeTagKeyArr, imgKey)
    );

    this.setState({ delTagKeyArr: delTagKeyArrTmp, changeTagKeyArr: changeTagKeyArrTmp }, () => {
      console.log(this.state.delTagKeyArr, this.state.changeTagKeyArr);
    });
  };

  //设置图片浏览
  myPaging = i => {
    console.log(i);
    return (
      <a>
        <img width="auto" height="60px" src={this.state.viewImgArr[i]} />
      </a>
    );
  };

  render() {
    const { submitting } = this.props;
    const {
      form: { getFieldDecorator, getFieldValue },
    } = this.props;

    const changeFormItemLayout = {
      labelCol: {
        sm: { span: 4 },
      },
      wrapperCol: {
        sm: { span: 20 },
      },
    };

    const pageConf = {
      pageSize: petGlobal.pagenum,
      current: this.state.pageindex,
      onChange: this.changePage,
      total: this.state.pageCount,
    };

    const carouselSet = {
      customPaging: this.myPaging,
    };

    return (
      <Card bordered={false}>
        <Form hideRequiredMark layout="inline">
          <FormItem label="区域标识">
            {getFieldDecorator('search_zone', {
              rules: [],
              initialValue: '',
            })(<Input />)}
          </FormItem>
          <FormItem label="实体店名称">
            {getFieldDecorator('search_shopname', {
              rules: [],
              initialValue: '',
            })(<Input />)}
          </FormItem>
          <FormItem label="实体店描述">
            {getFieldDecorator('search_shopdesc', {
              rules: [],
              initialValue: '',
            })(<Input />)}
          </FormItem>
          <FormItem label="联系手机">
            {getFieldDecorator('search_mobilephone', {
              rules: [],
              initialValue: '',
            })(<Input />)}
          </FormItem>
          <FormItem label="座机">
            {getFieldDecorator('search_telephone', {
              rules: [],
              initialValue: '',
            })(<Input />)}
          </FormItem>
          <FormItem label="地址">
            {getFieldDecorator('search_address', {
              rules: [],
              initialValue: '',
            })(<Input />)}
          </FormItem>
          <FormItem label="是否审核过">
            {getFieldDecorator('search_ispassed', { initialValue: '2' })(
              <Select dropdownMatchSelectWidth={true}>
                <Option value="2">全部</Option>
                <Option value="1">是</Option>
                <Option value="0">否</Option>
              </Select>
            )}
          </FormItem>
          <FormItem label="是否置顶">
            {getFieldDecorator('search_istop', { initialValue: '2' })(
              <Select dropdownMatchSelectWidth={true}>
                <Option value="2">全部</Option>
                <Option value="1">是</Option>
                <Option value="0">否</Option>
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
            <Button
              htmlType="button"
              onClick={this.modalChange.bind(this, 'add')}
              icon="plus-circle"
            >
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
          width="80%"
          visible={this.state.carouselVisible}
          closable={false}
          keyboard={true}
          onCancel={() => this.setState({ carouselVisible: false })}
          footer={null}
        >
          <Carousel {...carouselSet}>
            {this.state.viewImgArr.map((v, k) => {
              return (
                <div key={k} align="center">
                  <img
                    src={v}
                    style={{ marginBottom: 60, maxWidth: '800px', maxHeight: '600px' }}
                  />
                </div>
              );
            })}
          </Carousel>
          <div style={{ height: 60 }} />
        </Modal>

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
            <FormItem label="区域标识" {...changeFormItemLayout}>
              {getFieldDecorator('change_zone', {
                rules: [{ validator: petGlobal.valid.add_zone }],
                initialValue: '',
              })(<Input disabled={this.state.operateType === 'change'} />)}
            </FormItem>
            <FormItem label="实体店名称" {...changeFormItemLayout}>
              {getFieldDecorator('change_shopname', {
                rules: [{ required: true, message: '必填' }],
                initialValue: '',
              })(<Input />)}
            </FormItem>
            <FormItem label="实体店描述" {...changeFormItemLayout}>
              {getFieldDecorator('change_shopdesc', {
                rules: [{ required: true, message: '必填' }],
                initialValue: '',
              })(<Input />)}
            </FormItem>
            <FormItem label="联系手机" {...changeFormItemLayout}>
              {getFieldDecorator('change_mobilephone', {
                rules: [{ validator: petGlobal.valid.mobilePhone }],
                initialValue: '',
              })(<Input />)}
            </FormItem>
            <FormItem label="座机" {...changeFormItemLayout}>
              {getFieldDecorator('change_telephone', {
                rules: [{ validator: petGlobal.valid.telePhone }],
                initialValue: '',
              })(<Input />)}
            </FormItem>
            <FormItem label="地址" {...changeFormItemLayout}>
              {getFieldDecorator('change_address', {
                rules: [],
                initialValue: '',
              })(<Input />)}
            </FormItem>
            <FormItem label="是否审核过" {...changeFormItemLayout}>
              {getFieldDecorator('change_ispassed', { initialValue: '0' })(
                <Select dropdownMatchSelectWidth={true}>
                  <Option value="1">是</Option>
                  <Option value="0">否</Option>
                </Select>
              )}
            </FormItem>
            <FormItem label="是否置顶" {...changeFormItemLayout}>
              {getFieldDecorator('change_istop', { initialValue: '0' })(
                <Select dropdownMatchSelectWidth={true}>
                  <Option value="1">是</Option>
                  <Option value="0">否</Option>
                </Select>
              )}
            </FormItem>
            <FormItem>
              <div key={this.state.uploadKey}>
                <Upload
                  disabled={this.state.mainpic !== undefined}
                  multiple={false}
                  accept="image/jpg,image/jpeg,image/png"
                  listType="picture-card"
                  onChange={this.addMainPic}
                  beforeUpload={(file, fileList) => {
                    return false;
                  }}
                >
                  {this.state.operateType == 'change' ? (
                    <p>主图只能是一张，选择添加则会覆盖之前的</p>
                  ) : (
                    '添加主图---只能是一张'
                  )}
                </Upload>
              </div>
            </FormItem>
            <FormItem>
              {this.state.operateType === 'change'
                ? this.state.changeTagKeyArr.map((v, k) => {
                    return (
                      <DelImg
                        key={k}
                        imgUrl={
                          petGlobal.tpUriPre +
                          'arroundshop_' +
                          this.state.changeRecord.ID +
                          '_' +
                          v +
                          '.jpg'
                        }
                        imgKey={v}
                        goDel={this.goDel}
                      />
                    );
                  })
                : ''}
              <div key={this.state.uploadKey}>
                <Upload
                  multiple={true}
                  accept="image/jpg,image/jpeg,image/png"
                  listType="picture-card"
                  onChange={this.addImg}
                  beforeUpload={(file, fileList) => {
                    return false;
                  }}
                >
                  添加索引图---可以多张
                </Upload>
              </div>
            </FormItem>
            <p style={{ color: '#f00' }}>
              请点击下面的地图选择店铺的地图坐标，目前默认坐标为：{this.state.mapPoint.lat}-
              {this.state.mapPoint.lng}
            </p>
            <BaiDuMap mapPoint={this.state.mapPoint} setMap={this.setMap} />
          </Form>
        </Modal>
      </Card>
    );
  }
}

export default zhouBianShangQuan;
