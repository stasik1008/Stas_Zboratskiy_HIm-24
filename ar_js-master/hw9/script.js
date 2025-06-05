AFRAME.registerComponent('videohandler', {
  init: function () {
    const video = document.querySelector("#marker-video");
    const sceneEl = this.el.sceneEl;

    sceneEl.addEventListener("renderstart", () => {
      const mindarComponent = sceneEl.components["mindar-image"];
      const anchor = mindarComponent.controller._anchors[0];

      anchor.onTargetFound = () => {
        video.play();
      };

      anchor.onTargetLost = () => {
        video.pause();
      };
    });
  }
});
