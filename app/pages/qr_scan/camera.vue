<script setup>
import AppButton from '~/components/Button/AppButton.vue';
import { ref, onMounted } from 'vue';

const video = ref(null);
const canvas = ref(null);
const ctx = ref(null);

const constraints = ref ({
  audio: false,
  video: true,
});

onMounted(async () => {
  if (video.value && canvas.value) {
    ctx.value = canvas.value.getContext("2d");

    await navigator.mediaDevices.getUserMedia(constraints.value).then(SetStream).catch(e => {
      console.error(e);
    })
  }
})

function SetStream(stream) {
  video.value.srcObject = stream;
  video.value.play();

  requestAnimationFrame(Draw);
}

function Draw() {
  ctx.value.drawImage(video.value, 0, 0, canvas.value.width, canvas.value.height);
  requestAnimationFrame(Draw);
}

function TakePicture() {
  var link = document.createElement('a');
  link.download = `vue-cam-${new Date().getTime()}.png`;
  link.href = canvas.value.toDataURL();
  link.click();
}

</script>

<template>
  <ion-page>
    <ion-content>
      <div class="frame">
        <video ref="video" autoplay playsinline webkit-playsinline muted hidden></video>
        <canvas ref="canvas" width="1280" height="820" class="canvascam"></canvas>
      </div>
      <div class="frame">
          <AppButton label="Tack pice" @click="TakePicture"/>
        </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.canvascam {
  background: #000;
  border-radius: 1.5rem;
  justify-content: center;
  align-items: center;
}

.frame {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 1rem;
  padding-bottom: 1rem;
}

</style>