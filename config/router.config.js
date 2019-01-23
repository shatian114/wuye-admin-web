export default [
  // user
  {
    path: '/user',
    component: '../layouts/UserLayout',
    routes: [
      { path: '/user', redirect: '/user/login' },
      { path: '/user/login', component: './User/Login' },
      { path: '/user/register', component: './User/Register' },
      { path: '/user/register-result', component: './User/RegisterResult' },
    ],
  },
  // app
  {
    path: '/',
    component: '../layouts/BasicLayout',
    Routes: ['src/pages/Authorized'],
    authority: ['admin', 'user'],
    routes: [
      { path: '/', redirect: '/jiBenXinXi/wuYeGongSi' },

      // 基本信息
      {
        path: '/jiBenXinXi',
        name: '基本信息管理',
        icon: 'dashboard',
        routes: [
          {
            path: '/jiBenXinXi/wuYeGongSi',
            name: '物业公司管理',
            component: './jiBenXinXi/wuYeGongSi/wuYeGongSi',
          },
          {
            path: '/jiBenXinXi/xiaoQu',
            name: '小区管理',
            component: './jiBenXinXi/xiaoQu/xiaoQu',
          },
          {
            path: '/jiBenXinXi/yeZhu',
            name: '业主管理',
            component: './jiBenXinXi/yeZhu/yeZhu',
          },
        ],
      },
      // 费用管理
      {
        path: '/feiYong',
        name: '费用管理',
        icon: 'money-collect',
        routes: [
          {
            path: '/feiYong/wuYeFei',
            name: '物业费管理',
            component: './feiYong/wuYeFei/wuYeFei',
          },
          {
            path: '/feiYong/chongZhiLiuShui',
            name: '充值流水管理',
            component: './feiYong/chongZhiLiuShui/chongZhiLiuShui',
          },
          {
            path: '/feiYong/kouFeiJiLu',
            name: '扣费记录管理',
            component: './feiYong/kouFeiJiLu/kouFeiJiLu',
          },
          {
            path: '/feiYong/feiYongTaiZhang',
            name: '费用台帐管理',
            component: './feiYong/feiYongTaiZhang/feiYongTaiZhang',
          },
          {
            path: '/feiYong/piLiangCuiFei',
            name: '批量催费管理',
            component: './feiYong/piLiangCuiFei/piLiangCuiFei',
          },
          {
            path: '/feiYong/piLiangKouFei',
            name: '批量扣费管理',
            component: './feiYong/piLiangKouFei/piLiangKouFei',
          },
        ],
      },
      // 统计分析
      {
        path: '/tongJiFenXi',
        name: '统计分析',
        icon: 'line-chart',
        routes: [
          {
            path: '/tongJiFenXi/chongZhiLv',
            name: '充值率统计分析',
            component: './tongJiFenXi/chongZhiLv/chongZhiLv',
          },
          {
            path: '/tongJiFenXi/qianFeiLv',
            name: '欠费率统计分析',
            component: './tongJiFenXi/qianFeiLv/qianFeiLv',
          },
          {
            path: '/tongJiFenXi/liuShuiTongZhi',
            name: '流水统计分析',
            component: './tongJiFenXi/liuShuiTongZhi/liuShuiTongZhi',
          },
          {
            path: '/tongJiFenXi/zhiFuLeiXing',
            name: '支付类型统计分析',
            component: './tongJiFenXi/zhiFuLeiXing/zhiFuLeiXing',
          },
          {
            path: '/tongJiFenXi/shiDuan',
            name: '时段同比环比',
            component: './tongJiFenXi/shiDuan/shiDuan',
          },
        ],
      },
      // 社区论坛
      {
        path: '/sheQuLunTan',
        name: '社区论坛',
        icon: 'book',
        routes: [
          {
            path: '/sheQuLunTan/huoDong',
            name: '活动管理',
            component: './sheQuLunTan/huoDong/huoDong',
          },
          {
            path: '/sheQuLunTan/tieZi',
            name: '帖子管理',
            component: './sheQuLunTan/tieZi/tieZi',
          },
          {
            path: '/sheQuLunTan/yongHu',
            name: '用户管理',
            component: './sheQuLunTan/yongHu/yongHu',
          },
        ],
      },
      // 我的社区
      {
        path: '/woDeSheQu',
        name: '我的社区',
        icon: 'robot',
        routes: [
          {
            path: '/woDeSheQu/sheQuGongGao',
            name: '社区公告',
            component: './woDeSheQu/sheQuGongGao/sheQuGongGao',
          },
          {
            path: '/woDeSheQu/juWeiHui',
            name: '居委会',
            component: './woDeSheQu/juWeiHui/juWeiHui',
          },
          {
            path: '/woDeSheQu/tongXunLu',
            name: '通讯录',
            component: './woDeSheQu/tongXunLu/tongXunLu',
          },
          {
            path: '/woDeSheQu/jianShen',
            name: '健身',
            component: './woDeSheQu/jianShen/jianShen',
          },
          {
            path: '/woDeSheQu/tiaoSaoShiChang',
            name: '跳蚤市场',
            component: './woDeSheQu/tiaoSaoShiChang/tiaoSaoShiChang',
          },
        ],
      },
      // 社区服务
      {
        path: '/sheQuFuWu',
        name: '社区服务',
        icon: 'filter',
        routes: [
          {
            path: '/sheQuFuWu/baoJie',
            name: '保洁管理',
            component: './sheQuFuWu/baoJie/baoJie',
          },
          {
            path: '/sheQuFuWu/weiXiu',
            name: '维修管理',
            component: './sheQuFuWu/weiXiu/weiXiu',
          },
          {
            path: '/sheQuFuWu/zuLi',
            name: '租赁管理',
            component: './sheQuFuWu/zuLi/zuLi',
          },
        ],
      },
      // 增值业务
      {
        path: '/zengZhiYeWu',
        name: '增值业务',
        icon: 'gift',
        routes: [
          {
            path: '/zengZhiYeWu/zhouBianShangQuan',
            name: '周边商圈',
            component: './zengZhiYeWu/zhouBianShangQuan/zhouBianShangQuan',
          },
          {
            path: '/zengZhiYeWu/xuNiFuWu',
            name: '虚拟服务',
            component: './zengZhiYeWu/xuNiFuWu/xuNiFuWu',
          },
          {
            path: '/zengZhiYeWu/dianZiShangCheng',
            name: '电子商城',
            routes: [
              {
                path: '/zengZhiYeWu/dianZiShangCheng/shangPinLeiBie',
                name: '商品类别',
                component: './zengZhiYeWu/dianZiShangCheng/shangPinLeiBie/shangPinLeiBie',
              },
              {
                path: '/zengZhiYeWu/dianZiShangCheng/shangPin',
                name: '商品',
                component: './zengZhiYeWu/dianZiShangCheng/shangPin/shangPin',
              },
            ],
          },
        ],
      },
    ],
  },
];
