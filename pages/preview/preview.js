const { addUserPhotoWithBase64Alpha,addBackground } = require("../../api/user_photo.js");
import settings from "../../settings"
import Dialog from '@vant/weapp/dialog/dialog'
var app = getApp();
let videoAd = null
let adEnable = false

Page({
    data: {
        edit: "",
        statusBarHeight: app.globalData.statusBarHeight,
        whitening: 0,
        buffing: 0,
        skipAd: settings.skipAd,
    },
    onLoad: function(t) {
        this.setData({
            img:  app.globalData.alphaImage,
            openid: app.globalData.openid,
            name: app.globalData.spec.name,
            pix_width: app.globalData.spec.pix_width,
            pix_height: app.globalData.spec.pix_height,
            width: app.globalData.spec.width,
            height: app.globalData.spec.height,
            colors: app.globalData.spec.bg_colors,
            color: app.globalData.spec.bg_colors[0]
        })
        //qs-取消广告
        // if (wx.createRewardedVideoAd) {
        //   videoAd = wx.createRewardedVideoAd({
        //     adUnitId: 'adunit-e4c915532522e3cd'
        //   })
        //   videoAd.onLoad(() => {console.log('onLoad event emit')})
        //   videoAd.onError((err) => {this.gen()})
        //   videoAd.onClose((res) => {
        //     if (res && res.isEnded) {
        //       this.gen()
        //     } else {
        //       console.log('user stop unfinsh')
        //     }
        //   })
        //   adEnable = true
        // }
    },
    changeColor: function(t) {
        this.setData({
            color: t.currentTarget.dataset.color
        });
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
    save: function() {
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
        this.gen()
      }
    },
    gen() {
      wx.showLoading({
        title: "制作中...",
        mask: true
      });
        addBackground({
            input_image_base64: app.globalData.alphaImage,
            color: this.hexToRgb(this.data.color),
            openid: this.data.openid,
        name: this.data.name
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
          title: "[5002] 选择图片制作失败，请尝试或客服处理！",
          icon: "none",
          duration: 2000
        });
      })
    }
});