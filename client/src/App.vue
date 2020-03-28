<template>
  <div id="app">
    <el-container>
      <el-aside width="300px" style="padding:20px;">
        <el-form :model="form" ref="form" label-width="80px" :rules="rules">
          <el-form-item label="上限阈值" prop="watchup">
            <el-input v-model="form.watchup" :disabled="running">
              <span slot="suffix">元</span>
            </el-input>
          </el-form-item>
          <el-form-item label="下限阈值" prop="watchdown">
            <el-input v-model="form.watchdown" :disabled="running">
              <span slot="suffix">元</span>
            </el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="form.mobile" :disabled="running"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button
              :type="running?'danger':'success'"
              @click="StartOrStop"
            >{{running==false?'开始监视':'停止监视'}}</el-button>
          </el-form-item>
        </el-form>
      </el-aside>
      <el-main>
        <h2>最后更新时间：{{updateTime.getHours()>9?updateTime.getHours():'0'+updateTime.getHours()}}:{{updateTime.getMinutes()>9?updateTime.getMinutes():'0'+updateTime.getMinutes()}}:{{updateTime.getSeconds()>9?updateTime.getSeconds():'0'+updateTime.getSeconds()}}</h2>
        <h1 :class="{up:isup}">
          <span>价格：{{nowPrice}} 元/克</span>
        </h1>

        <highcharts :options="chartOptions"></highcharts>
      </el-main>
    </el-container>
  </div>
</template>

<script>
export default {
  components: {},
  methods: {
    StartOrStop() {
      this.$refs.form.validate(s => {
        if (s) {
          this.running = !this.running;
        }
      });
    }
  },
  data() {
    return {
      running: false,
      rules: {
        watchup: [
          {
            required: true,
            message: "必须输入"
          },
          { pattern: /^\d+(.\d{0,2})?$/, message: "请输入监控数字" }
        ],
        watchdown: [
          {
            required: true,
            message: "必须输入"
          },
          { pattern: /^\d+(.\d{0,2})?$/, message: "请输入监控数字" }
        ],
        mobile: [
          {
            required: true,
            message: "必须输入"
          }
        ]
      },
      nowPrice: 0,
      form: {
        watchup: "370.00",
        watchdown: "0.00",
        mobile: ""
      },
      updateTime: new Date(),
      isup: false,
      chartOptions: {
        credits: { enabled: false },
        useUTC: false,
        title: {
          text: "",
          enabled: false
        },

        series: [
          {
            data: []
          }
        ],
        legend: {
          enabled: false
        },
        yAxis: {
          startOnTick: false,
          endOnTick: false,
          title: {
            text: "价格"
          }
        },
        xAxis: {
          title: {
            text: "时间"
          },
          // max:new Date(time.getFullYear(),time.getMonth(),time.getDate()).setDate(time.getDate()+1),
          type: "datetime",
          dateTimeLabelFormats: {
            millisecond: "%H:%M:%S.%L",
            second: "%H:%M:%S",
            minute: "%H:%M",
            hour: "%H:%M",
            day: "%m-%d",
            week: "%m-%d",
            month: "%Y-%m",
            year: "%Y"
          }
        },
        tooltip: {
          //headerFormat: "距离: {point.x} km<br>",
          pointFormat: "价格：{point.y} 元 ",
          shared: true,
          dateTimeLabelFormats: {
            millisecond: "%H:%M:%S.%L",
            second: "%H:%M:%S",
            minute: "%H:%M:%S",
            hour: "%H:%M",
            day: "%m-%d",
            week: "%m-%d",
            month: "%Y-%m",
            year: "%Y"
          }
        }
      }
    };
  },
  mounted() {
    this.$axios.get("/server/api/todayPrices").then(res => {
      var data = res.data.resultData.datas;
      var map = data.map(s => [
        new Date(s.value[0]) - 0,
        parseFloat(s.value[1])
      ]);
      console.log(map);
      this.chartOptions.series[0].data = map;
    });
    setInterval(() => {
      this.$axios.get("/server/api/latestPrice").then(res => {
        var data = res.data.resultData.datas;
        var charData = this.chartOptions.series[0].data;
        this.updateTime = new Date(parseInt(data.time));

        var point = [new Date(parseInt(data.time)) - 0, parseFloat(data.price)];
        this.nowPrice = point[1];
        if (
          charData.length == 0 ||
          charData[charData.length - 1][1] != data.price
        ) {
          if (charData.length > 0) {
            if (charData[charData.length - 1][1] > data.price) {
              this.isup = false;
            } else {
              this.isup = true;
            }
          }
          if (this.running) {
            var limit;
            if (data.price > this.form.watchup) {
              limit = data.price + ">" + this.form.watchup;
            } else if (data.price < this.form.watchdown) {
              limit = data.price + "<" + this.form.watchdown;
            }
            if (limit) {
              this.running=false;
              this.$axios
                .get("/server/api/send", {
                  params: {
                    m: this.form.mobile,
                    n: limit
                  }
                })
                .then(res => {
                  try {
                    if (res.data.SendStatusSet[0].Code == "Ok") {
                      this.$alert("监听完成，短信发送成功", "发送成功", {
                        confirmButtonText: "确定"
                      });
                    } else {
                      this.$alert(
                        "监听完成，但短信发送失败[" +
                          res.data.SendStatusSet[0].Message +
                          "]",
                        "发送失败",
                        {
                          confirmButtonText: "确定"
                        }
                      );
                    }
                  } catch (e) {
                    this.$alert("监听完成，但短信发送失败", "发送失败", {
                      confirmButtonText: "确定"
                    });
                  }
                });
            }
          }

          charData.push(point);
        }
      });
    }, 2000);
  }
};
</script>

<style>
#app {
  box-shadow: 1px 1px 10px rgba(0, 0, 0, 0.2);
  width: 1200px;
  margin: 0 auto;
  background: #fff;
}
body {
  background: #f1f1f1;
}
h1 span {
  vertical-align: middle;
}
.up {
  color: red;
}
</style>
