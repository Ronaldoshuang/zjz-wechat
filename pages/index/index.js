const { listRecommendPhotoSize, listPhotoSize } = require("../../api/size_list.js");

var app = getApp()
let interstitialAd = null

Page({
    data: {
        active: "99",
        show: true,
        statusBarHeight: app.globalData.statusBarHeight
    },
    onLoad: function() {
      if (wx.createInterstitialAd) {
        interstitialAd = wx.createInterstitialAd({
          adUnitId: 'adunit-566bd72e0f6f7ace'
        })
        interstitialAd.onLoad(() => {console.log('onLoad event emit')})
        interstitialAd.onError((err) => {console.log('onError event emit', err)})
        interstitialAd.onClose(() => {})
      }
      if (interstitialAd) {
        interstitialAd.show().catch((err) => {
          console.error(err)
        })
      }
        listPhotoSize({
            recommend: 1
        }).then(result => {
            console.log('返回的菜单', result)
            this.setData({
                specs: result.data
            })
        })
    },
    gotoSpecDetail: function(a) {
      app.globalData.spec = a.currentTarget.dataset.spec
      wx.navigateTo({
          url: "../spec-detail/spec-detail"
      })
    },
    gotoOneInchSpec: function() {
      app.globalData.spec = {
        bg_colors: ["white", "lightblue", "blue", "red", "gray"],
        height: 35,
        name: "一寸",
        pix_height: 413,
        pix_width: 295,
        width: 25,
      } 
      wx.navigateTo({
          url: "../spec-detail/spec-detail"
      })
    },
    gotoTwoInchSpec: function() {
      app.globalData.spec = {
        bg_colors: ["white", "lightblue", "blue", "red", "gray"],
        height: 50,
        name: "二寸",
        pix_height: 591,
        pix_width: 413,
        width: 35,
      } 
      wx.navigateTo({
          url: "../spec-detail/spec-detail"
      })
    },
    gotochangeBg: function() {
        // wx.showToast({
        //     title: "功能正在维护，敬请期待！",
        //     icon: "none",
        //     duration: 2000
        // });
      wx.navigateTo({
        url: "../change-bg/change-bg"
      })
    },
    gotoSearch: function() {
      wx.navigateTo({
        url: "../search/search"
      })
    },
    clickTab: function(o) {
      var name = o.detail.name
      this.setData({active: name})
      if (name==99) {
          listPhotoSize({
              recommend: 1
          }).then(result => {
              console.log('返回的菜单', result)
              this.setData({
                  specs: result.data
              })
          })
      } else {
        listPhotoSize({
          category: name
        }).then(result => {
            console.log('返回的菜单', result)
          this.setData({
            specs: result.data
          })
        })
      }
    },
    loadHostList: function() {
      listRecommendPhotoSize().then(data => {
        this.setData({
          specs: data
        })
      })
    },
    onShareAppMessage: function() {
        return {
            title: "海马证件照",
            path: "/pages/index/index"
        }
    }
})