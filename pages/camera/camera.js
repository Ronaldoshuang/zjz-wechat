const { generateBase64AlphaPhoto } = require("../../api/photo.js");
const { compress } = require("../../utils");
const settings = require("../../settings");
var app = getApp();

Page({
    data: {
        enableCamera: true,
        devicePosition: "back"
    },
    onLoad: function(e) {
      this.setData({
          data: app.globalData.spec
      })
    },
    unauth: function() {
      this.setData({
        enableCamera: false
      })
      wx.showModal({
        content: "请前打开摄像头权限",
        showCancel: false,
        confirmText: "去设置",
        success: (tipRes) => {
          if (tipRes.confirm) {
            wx.openSetting({
              success: (settingRes) => {
                if (settingRes.authSetting["scope.camera"]) {
                  this.setData({
                    enableCamera: true
                  })
                } else {
                  this.unauth()
                }
              },
            })
          }
        }
      })
    },
    changeDevicePhoto: function() {
        "back" == this.data.devicePosition ? this.setData({
            devicePosition: "front"
        }) : this.setData({
            devicePosition: "back"
        });
    },
    takePhoto: function() {
        wx.showLoading({
            title: "制作中.."
        })
        const {
          pix_height,
          pix_width
        } = this.data.data
        wx.createCameraContext().takePhoto({
            quality: "high",
            success: res => {
                var file = res.tempImagePath;
                compress(file, 1024*1024, 80, path=> {
                    wx.uploadFile({
                        url: settings.host.photo+'/idphoto',
                        filePath: path, //imgSrc是微信小程wx.chooseImage等图片选择接口生成图片的tempFilePaths，无论后端能接收多少个这里都只能放一个，这是这个接口的限制
                        name: 'input_image',   //后端接收图片的字段名
                        //请求头
                        header: {
                            'content-type': 'multipart/form-data',
                        },
                        //携带的其他参数可以放在这
                        formData: {
                            width: pix_width,
                            height: pix_height,
                        },
                        success(res) {
                            app.globalData.alphaImage =JSON.parse(res.data).image_base64;
                            wx.hideLoading()
                            wx.redirectTo({
                                url: "../preview/preview"
                            });
                        }
                    }).catch(err => {
                        wx.hideLoading()
                        console.log(err)
                        wx.showToast({
                            title: '[5000] 拍摄制作失败，请重试或联系客服处理！',
                            icon: 'none'
                        })
                    })
                })
            },
            fail: err => {
              wx.hideLoading()
              console.log(err)
              wx.showToast({
                title: '[4001] 拍摄异常，请联系客服处理！',
                icon: 'none'
              })
            }
        });
    },
    cancel: function() {
        wx.navigateBack({
            delta: 1
        });
    }
});