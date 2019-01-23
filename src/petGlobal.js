import axios from 'axios';
import qs from 'qs';
var COS = require('cos-js-sdk-v5');
import moment from 'moment';
import xlsx from 'xlsx';
const UUID = require('uuidjs');

var cos = new COS({
  getAuthorization: function(options, callback) {
    console.log('get sign key: ', options);
    axios
      .post('/geneCosApi', qs.stringify({ key: options.Pathname }))
      .then(res => {
        console.log('sign: ' + res.data.sign);
        callback({
          Authorization: res.data.sign,
        });
      })
      .catch(err => {
        console.log('get key err: ', err);
      });
  },
});

var delCos = new COS({
  getAuthorization: function(options, callback) {
    console.log('get sign key: ', options);
    axios
      .post('/geneCosApiDel', qs.stringify({ key: options.Pathname }))
      .then(res => {
        console.log('sign: ' + res.data.sign);
        callback({
          Authorization: res.data.sign,
        });
      })
      .catch(err => {
        console.log('get key err: ', err);
      });
  },
});

var ugcGetSign = callback => {
  console.log('start get ugc sign');
  axios
    .get('https://qqphoto.cn/pet/pet?command=getuploadsignaturevideo', { param: {} })
    .then(res => {
      console.log('ugcGetSign: ', res.data);
      callback(res.data);
    })
    .catch(err => {
      console.log(err);
    });
};

let petGlobal = {
	verName: 'pzhsq',
  importXlsAlterStr: '请先选择物业公司，再选择表格文件',
  webName: '智慧社区',
  axiosTimeout: 10000,
  apiPath: 'http://wxfuture.club/pzhsq/pet',
  myApi: '/api/webServer',
  //myApi: '/pwuye-mgr_war/api/webServer',
  Bucket: 'pet-1252596634',
  Region: 'ap-chengdu',
  tpUriPre: 'http://pet-1252596634.cos.ap-chengdu.myqcloud.com/',
  pagenum: 10,

  //上传视频，参数：视频文件
  uploadUgc: (ugcFile, progressCall) => {
    console.log('start upload video: ', qcVideo);
    return new Promise((resolve, reject) => {
      qcVideo.ugcUploader.start({
        videoFile: ugcFile.originFileObj,
        getSignature: ugcGetSign,
        error: err => {
          console.log('ugc upload err: ', err);
        },
        progress: result => {
          progressCall(result);
        },
        finish: result => {
          console.log('ugc up res: ', result);
          resolve(result);
        },
      });
    });
  },

  //上传图片，参数1：图片文件，参数2：图片上传的key
  uploadImg: (img, imgPath) => {
    console.log('myApi', petGlobal.myApi);
    axios.defaults.baseURL = petGlobal.myApi;
    var uploadState = false;
    cos.putObject(
      {
        Bucket: petGlobal.Bucket,
        Region: petGlobal.Region,
        Key: imgPath,
        Body: img,
      },
      function(err, data) {
        if (data != undefined) {
          uploadState = true;
          //图片上传成功
          var headers = data['headers'];
          for (var k in headers) {
            console.log(k + ': ' + headers[k]);
          }
          console.log('upload code: ', data);
        } else {
          //图片上传失败
          console.log('img upload fail');
          for (var k in err) {
            if (typeof err[k] == 'Object') {
              for (var k2 in err[k]) {
                console.log(k2 + ': ' + err[k][k2]);
              }
            } else {
              console.log(k + ': ' + err[k]);
            }
          }
        }
      }
    );
    return uploadState;
  },

  //根据值来删除数组元素
  delArrEle: (arr, val) => {
    if (arr.indexOf(val) !== -1) {
      arr.splice(arr.indexOf(val), 1);
    }
    return arr;
  },
  delImg: imgPath => {
    console.log('delimg: ', imgPath);
    delCos.deleteObject(
      {
        Bucket: petGlobal.Bucket,
        Region: petGlobal.Region,
        Key: imgPath,
      },
      (err, data) => {
        console.log(err || data);
      }
    );
  },

  //生成uuid数组
  geneUuidArr: arrNum => {
    let uuidArr = [];
    for (let i = 0; i < arrNum; i++) {
      uuidArr.push(UUID.generate());
    }
    return uuidArr;
  },

  formatSearchNy(ny) {
    if (ny != '') {
      return moment(ny).format('YYYYMM');
    } else {
      return '';
    }
  },

  //格式化间隔日期
  formatjgrq(jgrqArr) {
    if (jgrqArr != undefined) {
      return moment(jgrqArr[0]).format('YYYYMMDD') + '-' + moment(jgrqArr[1]).format('YYYYMMDD');
    } else {
      return '';
    }
  },

  //下载文件，参数为文件名
  downMuban(muBanName) {
    window.open('muBan/' + muBanName);
  },

  //读取表格
  readXls: xlsFile => {
    return new Promise((resolve, reject) => {
      //获取文件对象
      const f = xlsFile.originFileObj;
      var reader = new FileReader();
      //读取完文件的回调
      reader.onload = e => {
        var data = e.target.result;
        var wb = xlsx.read(data, { type: 'binary' });
        var sheet = wb.Sheets[wb.SheetNames[0]];
        //将xls转换成json
        var xlsJson = xlsx.utils.sheet_to_json(sheet, { header: 1 });
        resolve(xlsJson);
      };
      reader.readAsBinaryString(f);
    });
  },

  valid: {
    search_zone: (rule, value, callback) => {
      let reg = /^\d{0,6}$/;
      if (reg.test(value)) {
        callback();
      } else {
        callback('必须是0-6位数字');
      }
    },
    add_zone: (rule, value, callback) => {
      let reg = /^\d{6}$/;
      if (reg.test(value)) {
        callback();
      } else {
        callback('必须是6位数字');
      }
    },
    mobilePhone: (rule, value, callback) => {
      let reg = /^\d{11}$/;
      if (reg.test(value)) {
        callback();
      } else {
        callback('必须是合法手机号');
      }
    },
    telePhone: (rule, value, callback) => {
      let reg = /^\d{3,4}-\d{7,8}$/;
      if (reg.test(value)) {
        callback();
      } else {
        callback('必须是合法的座机号');
      }
    },
    onlyNumber: (rule, value, callback) => {
      let reg = /^\d*$/;
      if (reg.test(value)) {
        callback();
      } else {
        callback('只能是数字');
      }
    },
  },
};

export default petGlobal;
