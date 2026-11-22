---
title: "유럽은 어디까지일까"
published: 2026-07-26
description: "EU 27개국, 솅겐 29개국, 인구 8개국. 같은 유럽 지도 위에 서로 다른 경계가 겹쳐 있었습니다."
image: "/assets/images/world-again/world-again-03-teaser.png"
tags: ["World Again", "데이터 시각화", "유럽"]
category: "Visualization"
draft: false
---

<iframe
  id="wa03-frame"
  src="/embeds/world-again-03.html"
  title="유럽은 어디까지일까 인터랙티브 지도"
  style="width:100%;height:3200px;border:0;background:transparent;display:block;"
  scrolling="no"
></iframe>
<script>
window.addEventListener("message", function (e) {
  if (e.data && e.data.type === "wa03-height") {
    var f = document.getElementById("wa03-frame");
    if (f) f.style.height = e.data.height + "px";
  }
});
</script>
