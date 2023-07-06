<template>
  <div v-if="loading" class="loading">
    <div v-for="i in num" :key="i" class="l" />
  </div>
</template>

<script>
export default {
  props: {
    loading: { type: Boolean, default: false },
    num: { type: Number, default: 5 }
  }
}
</script>

<style lang="scss" scoped>
.loading{
  .l {
    width: 4px;
    height: 4px;
    border-radius: 2px;
    background: #68b2ce;
    float: left;
    margin: 0 3px;
    animation: l linear 1s infinite;
    -webkit-animation: l linear 1s infinite;
}
.l:nth-child(1){
    animation-delay:0s;
}
.l:nth-child(2){
    animation-delay:0.15s;
}
.l:nth-child(3){
    animation-delay:0.3s;
}
.l:nth-child(4){
    animation-delay:0.45s;
}
.l:nth-child(5){
    animation-delay:0.6s;
}
@keyframes l{
    0%,60%,100% {transform: scale(1);}
    30% {transform: scale(2.5);}
}
@-webkit-keyframes l{
    0%,60%,100% {transform: scale(1);}
    30% {transform: scale(2.5);}
}
}

</style>
