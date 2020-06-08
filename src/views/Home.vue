<template>
    <div class="container">
        <ul>
            <li></li>
            <li>
                <span></span>
            </li>
            <li>
                <span></span>
            </li>
            <li>
                <span></span>
            </li>
            <li>
                <span></span>
            </li>
            <li>
                <span></span>
            </li>
            <li>
                <span></span>
            </li>
            <li>
                <span></span>
            </li>
            <li>
                <span></span>
            </li>
            <li>
                <span></span>
            </li>
        </ul>
        <div class="link">
            <router-link class="label" :to="{ name: 'Electric'}">
                物理电学
            </router-link>
            <router-link class="label" :to="{ name: 'Motion'}">
                物理运动学
            </router-link>
            <router-link class="label" :to="{ name: 'Field'}">
                物理电场磁场
            </router-link>
            <router-link class="label" :to="{ name: 'Chemistry'}">
                化学
            </router-link>
        </div>
    </div>
</template>

<script>
export default {
    name: '',
    data() {
        return {};
    },
    methods: {
    // ======================事件处理函数======================
    // ======================业务逻辑函数======================
    // ========================纯函数=========================
    // ======================网络请求函数======================
    // =======================初始化函数=======================
    }
};
</script>

<style lang='less' scoped>
.container {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  background: #04091c;
}
.link {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 40px 0;
  .label {
    border-radius: 10px;
    padding: 20px 40px;
    color: antiquewhite;
    font-size: 28px;
    transition: 300ms ease-in-out;
    &:hover {
      background-color:#394057;
      color: wheat;
    }
  }
}
ul {
  width: 610px;
  height: 610px;
  margin: auto;
  list-style: none;
  overflow: hidden;
  // background: #ccc；
  position: relative;
}
ul li {
  border: 2px solid #394057;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;

  /*animation: change 3s linear infinite;*/
  animation-name: change;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}
ul li:nth-child(1) {
  width: 60px;
  height: 60px;
  box-shadow: 0px 0px 50px #c90;
  background: #c90;
  border: none;
  animation-duration: 1.2s;
}
ul li:nth-child(2) {
  width: 120px;
  height: 120px;
  animation-duration: 3.2s;
}
ul li:nth-child(3) {
  width: 180px;
  height: 180px;
  animation-duration: 9.2s;
}
ul li:nth-child(4) {
  width: 240px;
  height: 240px;
  animation-duration: 4.2s;
}
ul li:nth-child(5) {
  width: 300px;
  height: 300px;
  animation-duration: 2.2s;
}
ul li:nth-child(6) {
  width: 360px;
  height: 360px;
  animation-duration: 8.2s;
}
ul li:nth-child(7) {
  width: 420px;
  height: 420px;
  animation-duration: 10.2s;
}
ul li:nth-child(8) {
  width: 480px;
  height: 480px;
  animation-duration: 15.2s;
}
ul li:nth-child(9) {
  width: 540px;
  height: 540px;
  animation-duration: 6.2s;
}
ul li:nth-child(10) {
  width: 600px;
  height: 600px;
  animation-duration: 7.2s;
}
ul li span {
  width: 12px;
  height: 12px;
  position: absolute;
  top: -6px;
  left: 50%;
  background: green;
  border-radius: 50%;
}

@keyframes change {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}
</style>
