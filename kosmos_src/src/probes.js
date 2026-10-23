/* ---------- rysowane sondy (New Horizons, Giotto, Ingenuity) ---------- */

function drawDish(c, x, y, rx, ry, tilt, rim, inner) {
 c.save();
 c.translate(x, y);
 c.rotate(tilt);
 const shade = c.createLinearGradient(-rx, -ry, rx, ry);
 shade.addColorStop(0, rim);
 shade.addColorStop(1, '#9aa3b2');
 c.fillStyle = shade;
 c.beginPath();
 c.ellipse(0, 0, rx, ry, 0, 0, TAU);
 c.fill();
 c.fillStyle = inner;
 c.beginPath();
 c.ellipse(0, ry * .06, rx * .86, ry * .82, 0, 0, TAU);
 c.fill();
 c.strokeStyle = 'rgba(80,90,110,.55)';
 c.lineWidth = Math.max(1, rx * .02);
 for (let ring = 1; ring <= 3; ring++) {
  c.beginPath();
  c.ellipse(0, ry * .06, rx * .86 * ring / 3.4, ry * .82 * ring / 3.4, 0, 0, TAU);
  c.stroke();
 }
 c.restore();
}

const PROBE_BOX = {
 newhorizons(c, w, h) {
  c.lineJoin = 'round';
  c.lineCap = 'round';
  /* generator prądu (walec z boku) */
  const rtg = c.createLinearGradient(0, h * .5, 0, h * .66);
  rtg.addColorStop(0, '#d2d6de');
  rtg.addColorStop(.5, '#8b93a3');
  rtg.addColorStop(1, '#5b6272');
  c.fillStyle = rtg;
  c.fillRect(w * .66, h * .5, w * .3, h * .16);
  c.fillStyle = '#4a5160';
  for (let fin = 0; fin < 6; fin++) c.fillRect(w * (.7 + fin * .045), h * .47, w * .02, h * .22);
  c.fillStyle = '#2f3542';
  c.beginPath();
  c.ellipse(w * .96, h * .58, w * .018, h * .08, 0, 0, TAU);
  c.fill();
  /* korpus w złotej folii */
  const body = c.createLinearGradient(w * .3, h * .4, w * .7, h * .95);
  body.addColorStop(0, '#f1cf6c');
  body.addColorStop(.5, '#c99a31');
  body.addColorStop(1, '#8e6a1e');
  c.fillStyle = body;
  c.beginPath();
  c.moveTo(w * .32, h * .5);
  c.lineTo(w * .68, h * .5);
  c.lineTo(w * .76, h * .86);
  c.lineTo(w * .5, h * .96);
  c.lineTo(w * .24, h * .86);
  c.closePath();
  c.fill();
  c.strokeStyle = 'rgba(90,60,10,.6)';
  c.lineWidth = Math.max(1, w * .006);
  c.beginPath();
  c.moveTo(w * .5, h * .5);
  c.lineTo(w * .5, h * .96);
  c.moveTo(w * .4, h * .5);
  c.lineTo(w * .36, h * .9);
  c.moveTo(w * .6, h * .5);
  c.lineTo(w * .64, h * .9);
  c.stroke();
  /* maleńkie dysze i przyrząd */
  c.fillStyle = '#2f3542';
  c.fillRect(w * .44, h * .88, w * .12, h * .06);
  c.fillStyle = '#d8dce6';
  c.beginPath();
  c.arc(w * .28, h * .72, w * .02, 0, TAU);
  c.fill();
  /* podpora anteny i antena */
  c.strokeStyle = '#6a7284';
  c.lineWidth = Math.max(2, w * .014);
  c.beginPath();
  c.moveTo(w * .4, h * .5);
  c.lineTo(w * .46, h * .38);
  c.moveTo(w * .6, h * .5);
  c.lineTo(w * .54, h * .38);
  c.stroke();
  drawDish(c, w * .5, h * .27, w * .17, h * .21, -.05, '#f4f5f8', '#e5e8ef');
  c.fillStyle = '#394050';
  c.beginPath();
  c.arc(w * .5, h * .25, w * .012, 0, TAU);
  c.fill();
 },
 giotto(c, w, h) {
  c.lineJoin = 'round';
  c.lineCap = 'round';
  /* tarcza przed pyłem (płaski dysk na dole) */
  const shield = c.createLinearGradient(w * .3, h * .76, w * .7, h * .9);
  shield.addColorStop(0, '#c9d0dc');
  shield.addColorStop(1, '#7d8798');
  c.fillStyle = shield;
  c.beginPath();
  c.ellipse(w * .5, h * .84, w * .21, h * .1, 0, 0, TAU);
  c.fill();
  c.fillStyle = '#5a6475';
  c.beginPath();
  c.ellipse(w * .5, h * .82, w * .17, h * .075, 0, 0, TAU);
  c.fill();
  c.strokeStyle = 'rgba(255,255,255,.35)';
  c.lineWidth = 1.2;
  c.beginPath();
  c.ellipse(w * .5, h * .82, w * .1, h * .045, 0, 0, TAU);
  c.stroke();
  /* walcowy korpus z ogniwami słonecznymi */
  const cyl = c.createLinearGradient(w * .34, 0, w * .66, 0);
  cyl.addColorStop(0, '#2b4a86');
  cyl.addColorStop(.35, '#4d78c4');
  cyl.addColorStop(1, '#1f3866');
  c.fillStyle = cyl;
  c.fillRect(w * .34, h * .42, w * .32, h * .36);
  c.strokeStyle = 'rgba(190,215,255,.4)';
  c.lineWidth = 1;
  for (let cell = 1; cell < 8; cell++) {
   c.beginPath();
   c.moveTo(w * (.34 + cell * .04), h * .42);
   c.lineTo(w * (.34 + cell * .04), h * .78);
   c.stroke();
  }
  c.beginPath();
  c.moveTo(w * .34, h * .6);
  c.lineTo(w * .66, h * .6);
  c.stroke();
  c.fillStyle = '#aab3c4';
  c.beginPath();
  c.ellipse(w * .5, h * .42, w * .16, h * .045, 0, 0, TAU);
  c.fill();
  c.fillStyle = '#dde2ec';
  c.beginPath();
  c.ellipse(w * .5, h * .78, w * .16, h * .04, 0, 0, Math.PI);
  c.fill();
  /* antena na górze */
  c.strokeStyle = '#8b93a3';
  c.lineWidth = Math.max(2, w * .014);
  c.beginPath();
  c.moveTo(w * .5, h * .41);
  c.lineTo(w * .5, h * .3);
  c.stroke();
  drawDish(c, w * .5, h * .21, w * .15, h * .17, -.12, '#fbfbfd', '#eceff5');
  c.fillStyle = '#394050';
  c.beginPath();
  c.arc(w * .5, h * .19, w * .012, 0, TAU);
  c.fill();
 },
 ingenuity(c, w, h) {
  c.lineJoin = 'round';
  c.lineCap = 'round';
  /* nóżki: cztery cienkie patyczki rozchylone na boki */
  c.strokeStyle = '#2a2d33';
  c.lineWidth = Math.max(2, w * .012);
  c.beginPath();
  c.moveTo(w * .42, h * .78);
  c.lineTo(w * .36, h * .94);
  c.moveTo(w * .58, h * .78);
  c.lineTo(w * .64, h * .94);
  c.moveTo(w * .46, h * .8);
  c.lineTo(w * .42, h * .96);
  c.moveTo(w * .54, h * .8);
  c.lineTo(w * .58, h * .96);
  c.stroke();
  /* małe kółka na końcach nóżek */
  c.fillStyle = '#2a2d33';
  [[.36, .94], [.64, .94], [.42, .96], [.58, .96]].forEach(([px, py]) => {
   c.beginPath();
   c.arc(w * px, h * py, w * .018, 0, TAU);
   c.fill();
  });
  /* słupki od kadłuba do wirników */
  c.strokeStyle = '#6a7284';
  c.lineWidth = Math.max(2, w * .014);
  c.beginPath();
  c.moveTo(w * .28, h * .3);
  c.lineTo(w * .4, h * .62);
  c.moveTo(w * .72, h * .3);
  c.lineTo(w * .6, h * .62);
  c.stroke();
  /* kadłub: małe pudełko, białe z pomarańczowym panelem na górze */
  const body = c.createLinearGradient(w * .34, 0, w * .66, 0);
  body.addColorStop(0, '#cfc9bd');
  body.addColorStop(.5, '#f5f1e8');
  body.addColorStop(1, '#b8b1a3');
  c.fillStyle = body;
  c.fillRect(w * .34, h * .56, w * .32, h * .24);
  c.strokeStyle = 'rgba(90,80,60,.5)';
  c.lineWidth = Math.max(1, w * .006);
  c.stroke();
  /* panel słoneczny na górze kadłuba */
  c.fillStyle = '#e8862e';
  c.fillRect(w * .38, h * .56, w * .24, h * .07);
  c.fillStyle = 'rgba(255,255,255,.35)';
  for (let stripe = 0; stripe < 4; stripe++) c.fillRect(w * (.4 + stripe * .055), h * .565, w * .012, h * .06);
  /* kamera pod kadłubem */
  c.fillStyle = '#394050';
  c.beginPath();
  c.arc(w * .5, h * .82, w * .035, 0, TAU);
  c.fill();
  c.fillStyle = '#9fd8ff';
  c.beginPath();
  c.arc(w * .49, h * .81, w * .014, 0, TAU);
  c.fill();
  /* wirniki: dwa duże śmigła u góry, po lewej i prawej */
  const rotor = cx => {
   c.fillStyle = '#454b57';
   c.beginPath();
   c.arc(w * cx, h * .18, w * .025, 0, TAU);
   c.fill();
   c.strokeStyle = '#33373f';
   c.lineWidth = Math.max(2, w * .014);
   c.beginPath();
   c.ellipse(w * cx, h * .18, w * .16, h * .035, 0, 0, TAU);
   c.stroke();
   c.beginPath();
   c.ellipse(w * cx, h * .18, w * .035, h * .16, 0, 0, TAU);
   c.stroke();
   c.fillStyle = '#c9cfda';
   c.beginPath();
   c.arc(w * cx - w * .15, h * .18, w * .018, 0, TAU);
   c.arc(w * cx + w * .15, h * .18, w * .018, 0, TAU);
   c.arc(w * cx, h * .18 - h * .15, w * .018, 0, TAU);
   c.arc(w * cx, h * .18 + h * .15, w * .018, 0, TAU);
   c.fill();
  };
  rotor(.28);
  rotor(.72);
 }
};
