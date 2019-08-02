<template>
  <div id="IMContent">
    
  </div>
</template>

<script>
export default {
  data() {
    target: "";
  },
  methods: {
    _click() {
      alert("click");
    }
  },
  destroyed() {
    console.log("IM销毁了");
  }
};
</script>
