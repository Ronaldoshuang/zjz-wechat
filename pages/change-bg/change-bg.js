const { compress, downloadImageToPhotosAlbum } = require("../../utils");
const { generateBase64AlphaPhoto } = require("../../api/photo");
const { addUserPhotoWithBase64Alpha,addBackground } = require("../../api/user_photo");
import settings from "../../settings"
import Dialog from '@vant/weapp/dialog/dialog'
var app = getApp();
var videoAd = null
var adEnable = false
var colors = {
    white: [ "#FFFFFF", "#FFFFFF" ],
    lightblue: [ "#8EC5E9", "#AFD7F0" ],
    blue: [ "#1A8AE4", "#4EA4ED" ],
    red: [ "#C40C20", "#D5284A" ],
    gray: [ "#818892", "#A7AFB7" ]
};

Page({
    data: {
        statusBarHeight: app.globalData.statusBarHeight,
        imageBase64: "",
        src: "",
        color: "",
        colors: [ "white", "lightblue", "blue", "red", "gray" ],
        skipAd: settings.skipAd,
    },
    onLoad: function(t) {
      if (wx.createRewardedVideoAd) {
        videoAd = wx.createRewardedVideoAd({
          adUnitId: 'adunit-2491d0b848d77cc5'
        })
        videoAd.onLoad(() => {console.log('onLoad event emit')})
        videoAd.onError((err) => {this.internalSavePhoto()})
        videoAd.onClose((res) => {
          if (res && res.isEnded) {
            this.internalSavePhoto()
          } else {
            console.log('user stop unfinsh')
          }
        })
        adEnable = false
      }
    },
    pickPhoto: function(t) {
        const that = this; // 保存当前 this 的引用
      wx.chooseMedia({
        count: 1,
        mediaType: 'image',
        sourceType: [ "album" ],
        success: result => {
          compress(result.tempFiles[0].tempFilePath, 1024*1024, 80, file => {
            wx.showLoading({
                title: "图片处理中.."
            })
            wx.getImageInfo({
                src: file,
                success: result => {
                  this.setData({
                    pix_width: result.width,
                    pix_height: result.height 
                  })
                    wx.uploadFile({
                        url: settings.host.photo+'/idphoto',
                        filePath: file, //imgSrc是微信小程wx.chooseImage等图片选择接口生成图片的tempFilePaths，无论后端能接收多少个这里都只能放一个，这是这个接口的限制
                        name: 'input_image',   //后端接收图片的字段名
                        //请求头
                        header: {
                            'content-type': 'multipart/form-data',
                        },
                        //携带的其他参数可以放在这
                        formData: {
                            width: result.width,
                            height: result.height,
                        },
                        success(res) {
                            if (res.statusCode >= 400) {
                                console.log('无法识别到图片，请根据拍摄指南，重新上传图片',res);
                                wx.showToast({
                                    title: '无法识别到图片，请根据拍摄指南，重新上传图片',
                                    icon: 'none'
                                })
                                return
                            }
                            that.setData({
                                imageBase64: JSON.parse(res.data).image_base64,
                                src: JSON.parse(res.data).image_base64,
                                color: that.data.color ? that.data.color : "white"
                            })
                            wx.hideLoading()
                        }
                        ,
                        fail(err) {
                            wx.hideLoading()
                            wx.showToast({ title: '无法识别到图片，请根据拍摄指南，重新上传图片', icon: 'none' });
                        }
                    })


              },
              fail: err => {
                  console.log(err);
              }
            })
          })
        }
      })
    },
    changeColor: function(t) {
        this.data.src ? this.setData({
            color: t.currentTarget.dataset.color
        }) : wx.showToast({
            title: "请先选择照片",
            icon: "none"
        })
    },
    hexToRgb(color) {
        var hex = "#ffffff"
        if (color === "white") {
            hex = "#ffffff"
        } else if (color === "lightblue") {
            hex = "#8ec5e9"
        } else if (color === "blue") {
            hex = "#1a8ae4"
        } else if (color === "red") {
            hex = "#c40c20"
        } else if (color === "gray") {
            hex = "#818892"
        } else {
            wx.showToast({
                title: "[4002] 程序异常，请联系客服处理！",
                icon: "none",
                duration: 2000
            });
        }
        return hex
    },
    internalSavePhoto: function() {
      wx.showLoading({
        title: "图片处理中...",
        mask: true
      });

        addBackground({
          input_image_base64: this.data.imageBase64,
          color: this.hexToRgb(this.data.color),
        openid: app.globalData.openid,
        name: "换底色"
      }).then(result => {
          var filepath = wx.env.USER_DATA_PATH+'/test.png';
          wx.getFileSystemManager().writeFile({
              filePath: filepath,
              data: result.image_base64.replace('data:image/png;base64,', ''),
              encoding:'base64',
              success: res => {
                  wx.saveImageToPhotosAlbum({
                      filePath: filepath,
                      success: function(e) {
                          wx.showToast({
                              title: "保存成功，可前往【手机相册】中查看",
                              icon: "none",
                              duration: 2000
                          });
                      },
                      fail: function(e) {
                          console.log(e)
                          "saveImageToPhotosAlbum:fail cancel" != e.errMsg ? wx.showModal({
                              content: "请打开相册权限",
                              confirmText: "去设置",
                              success: function(e) {
                                  e.confirm && wx.openSetting();
                              }
                          }) : wx.showToast({
                              title: "[4003] 保存失败",
                              icon: "none"
                          });
                      }
                  });
              }
          })
      }).catch(e => {
          wx.hideLoading()
          console.log(e)
          wx.showToast({
              title: "[5003] 换底色异常，请重试或联系客服处理！",
              icon: "none",
              duration: 2000
          });
      })
    },
    savePhoto: function() {
      if (!this.data.src) {
        wx.showToast({
          title: "请先选择照片",
          icon: "none"
        })
        return
      }
      if (adEnable && !this.data.skipAd) {
        Dialog.confirm({
          message: '完整观看视频可免费下载',
        }).then(() => {
          videoAd.show().catch(() => {
            videoAd.load()
              .then(() => videoAd.show())
              .catch(err => {
                console.log('激励视频 广告显示失败')
              })
          })
        })
      } else {
        this.internalSavePhoto()
      }
      
    },
    closeReupload: function() {
        this.setData({
            showReupload: false
        });
    }
});