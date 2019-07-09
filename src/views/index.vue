<template>
  <Content :style="{margin: '0 auto',height: '100%',width: '1250px'}">
    <div style="height: 100%;width: 100%;padding-top:20px;background:#f5f7f9">
      <Row>
        <Col span='18' style="background:#fff;height:250px;padding-top:20px">
          <Col span="6" style="height:100px;line-height:100px">
            <div class="item_box"  @click="$router.push({name:'LivePreview'})">
              <div class="img"><img style="margin-top:-10px" src="../assets/images/icon1.png" alt=""></div>
              <div class="content">
                <p class="title">{{$t('home.LivePreview')}}</p>
                <p class="body">{{$t('home.LivePreview_tip')}}</p>
              </div>
            </div>
          </Col>
          <Col span="6" style="height:100px;line-height:100px">
            <div class="item_box" @click="$router.push({name:'VideoPlayback'})">
              <div class="img"><img  style="margin-top:-10px"  src="../assets/images/icon2.png" alt=""></div>
              <div class="content">
                  <p class="title">{{$t('home.Video_playback')}}</p>
                  <p class="body">{{$t('home.Video_playback_tip')}}</p>
              </div>
            </div>
          </Col>
          <Col span="6" style="height:100px;line-height:100px" >
            <div class="item_box" @click="$router.push({name:'Locate'})">
                <div class="img"><img style="margin-top:-10px"  src="../assets/images/icon3.png" alt=""></div>
                <div class="content">
                    <p class="title">{{$t('home.location')}}</p>
                    <p class="body">{{$t('home.location_tip')}}</p>
                </div>
              </div>
          </Col>
          <Col span="6" style="height:100px;line-height:100px">
          <div class="item_box" >
                <div class="img"><img src="../assets/images/icon4.png" alt=""></div>
                <div class="content">
                    <p class="title">{{$t('home.Track_playback')}}</p>
                    <p class="body">{{$t('home.Track_playback_tip')}}</p>
                </div>
              </div>
          </Col>
          <Divider dashed style="margin-bottom:10px"/>
          <Col span="6" style="height:100px;line-height:100px">
              <div class="item_box" >
                <div class="img"><img src="../assets/images/icon5.png" alt=""></div>
                <div class="content">
                    <p class="title">{{$t('home.Picture_monitor')}}</p>
                    <p class="body">{{$t('home.Picture_monitor_tip')}}</p>
                </div>
              </div>
          </Col>
          <!-- <Col span="6" style="height:100px;line-height:100px">
            <div class="item_box" >
                <div class="img"><img  style="margin-top:-10px"  src="../assets/images/icon6.png" alt=""></div>
                <div class="content">
                    <p class="title">图片回放</p>
                    <p class="body">历史视频查询,点播,下载</p>
                </div>
            </div>
          </Col> -->
        </Col>
        <Col class="see" span="6">
          <div class="content">
            <div class="see_hd">
                <p><span>{{$t('tab.monitor')}}</span><a href='#'>{{$t('home.more')}}&gt;</a></p>
            </div>
            <i-circle
              :size="200"
              :trail-width="10"
              :stroke-width="9"
              :percent="75"
              stroke-linecap="square"
              stroke-color="#43a3fb">
              <div class="demo-Circle-custom">
                  <h1>42,776</h1>
                  <p>{{$t('home.Online_rate_statistics')}}</p>
                  <span>
                      {{$t('home.online')}}
                    <i>75%</i>
                  </span>
              </div>
          </i-circle>
          </div>
        </Col>
      </Row>
    </div>
  </Content>
</template>
<script>
export default {

};
</script>

<style lang="less" scoped>
  .item_box{
    &:hover{
      background: rgb(236, 244, 254)
    }
    cursor: pointer;
    width: 200px;
    height: 80px;
    margin: 10px auto;
    transform: translateX(20px);
    display: inline-block;
    // border: 1px solid #000;
    .img{
      float: left;
      margin-left: 10px;
      height: 100%;
      width: 48px;
      img{
        display: block;
        transform: translateY(50%);
        width: 48px;
      }
    }
    .content {
      float: left;
      width: 140px;
      p.title{
        margin-left: 5px;
        width: 100%;
        font-size: 15px;
        font-weight: 600;
        line-height: 40px;
      }
      p.body{
        margin-left: 5px;
        line-height: 15px;
      }
    }
    span{
      display: inline-block;
      float: left;
      height:78px;
    }
    // p{
    //   height: 80px;
    //   float: left;
    // }
  }
  .see {
    float: right;
    padding-left: 10px;
    height: 400px;
    .content {
      width: 100%;
      height: 400px;
      background: #fff;

      .see_hd {
        width: 100%;
        height: 30px;
        border-bottom: 1px solid #ccc;
        p{
          line-height: 29px;
          span:first-child {
            padding-left: 10px;
            font-size: 14px;
            font-weight: 600;
          }
          a{
            padding-right: 10px;
            color: #ccc;
            float: right;
          }
        }
      }
      .ivu-chart-circle{
        margin-top: 40px;
        transform: translateX(25%);
      }
      .demo-Circle-custom{
        & h1{
            color: #3f414d;
            font-size: 28px;
            font-weight: normal;
        }
        & p{
            color: #657180;
            font-size: 14px;
            margin: 10px 0 15px;
        }
        & span{
            display: block;
            padding-top: 15px;
            color: #657180;
            font-size: 14px;
            &:before{
                content: '';
                display: block;
                width: 50px;
                height: 1px;
                margin: 0 auto;
                background: #e0e3e6;
                position: relative;
                top: -15px;
            };
        }
        & span i{
            font-style: normal;
            color: #3f414d;
        }
    }
    }
    
  }
  
</style>

