const MOON_DIFFS = [
 {id: 'flag', shape: 'circle', x: 343, y: 100, r: 36, text: 'Flaga. Na Księżycu nie ma powietrza, więc nie ma wiatru. Flaga nie powiewa, więc astronauci dali w niej poziomy drążek, żeby się rozpościerała.'},
 {id: 'earth', shape: 'circle', x: 470, y: 42, r: 30, text: 'Ziemia na niebie. Z Księżyca widać Ziemię jako dużą niebieską kulę. Z jednej strony Księżyca wisi ona prawie w jednym miejscu nieba.'},
 {id: 'steps', shape: 'circle', x: 168, y: 172, r: 50, text: 'Ślady butów. Na Księżycu nie ma wiatru ani deszczu, więc ślady astronautów mogą zostać tam bardzo, bardzo długo.'},
 {id: 'crater', shape: 'circle', x: 445, y: 178, r: 38, text: 'Krater. To ślad po uderzeniu meteorytu. Na Księżycu jest ich mnóstwo, bo nie ma atmosfery, która spaliłaby meteory.'},
 {id: 'sky', shape: 'sky', text: 'Niebo. Na Księżycu niebo jest czarne nawet w dzień, bo nie ma atmosfery, która rozprasza światło. Na Ziemi dlatego niebo jest niebieskie.'}
];

function drawMoonScene(c, top, original) {
 c.save();
 c.translate(0, top);
 c.beginPath();
 c.rect(0, 0, 560, 200);
 c.clip();
 if (original) {
  c.fillStyle = '#02030a';
  c.fillRect(0, 0, 560, 200);
  c.fillStyle = '#fff';
  [[40, 30], [120, 70], [200, 25], [270, 60], [390, 20], [520, 80], [90, 100], [430, 90], [300, 15], [560, 40]].forEach(([x, y]) => c.fillRect(x, y, 2, 2));
 } else {
  const sky = c.createLinearGradient(0, 0, 0, 130);
  sky.addColorStop(0, '#3f86dc');
  sky.addColorStop(1, '#a9d4f7');
  c.fillStyle = sky;
  c.fillRect(0, 0, 560, 200);
 }
 const ground = c.createLinearGradient(0, 128, 0, 200);
 ground.addColorStop(0, '#9a9aa2');
 ground.addColorStop(1, '#5a5a62');
 c.fillStyle = ground;
 c.beginPath();
 c.moveTo(0, 140);
 c.quadraticCurveTo(140, 122, 280, 134);
 c.quadraticCurveTo(420, 146, 560, 128);
 c.lineTo(560, 200);
 c.lineTo(0, 200);
 c.closePath();
 c.fill();
 const crater = (x, y, w, h) => {
  c.fillStyle = 'rgba(40,40,48,.5)';
  c.beginPath();
  c.ellipse(x, y, w, h, 0, 0, TAU);
  c.fill();
  c.strokeStyle = 'rgba(210,210,220,.45)';
  c.lineWidth = 2;
  c.beginPath();
  c.ellipse(x, y - 1, w, h, 0, Math.PI, TAU);
  c.stroke();
 };
 crater(90, 172, 34, 9);
 crater(360, 184, 44, 11);
 crater(520, 160, 24, 7);
 if (original) crater(445, 178, 36, 10);
 c.fillStyle = '#c9a24b';
 c.fillRect(55, 105, 50, 32);
 c.fillStyle = '#e8e8ee';
 c.fillRect(62, 96, 36, 10);
 c.strokeStyle = '#d0d0d8';
 c.lineWidth = 3;
 [[60, 137, 40, 160], [100, 137, 122, 160], [80, 137, 80, 160]].forEach(([fromX, fromY, toX, toY]) => {
  c.beginPath();
  c.moveTo(fromX, fromY);
  c.lineTo(toX, toY);
  c.stroke();
 });
 c.fillStyle = '#9a9aa4';
 c.fillRect(212, 110, 10, 28);
 c.fillStyle = '#f4f4f8';
 c.fillRect(221, 108, 28, 34);
 c.fillRect(223, 140, 10, 26);
 c.fillRect(237, 140, 10, 26);
 c.fillStyle = '#6a6a74';
 c.fillRect(222, 164, 12, 6);
 c.fillRect(236, 164, 12, 6);
 c.fillStyle = '#f4f4f8';
 c.beginPath();
 c.arc(235, 94, 15, 0, TAU);
 c.fill();
 const visor = c.createLinearGradient(225, 86, 245, 102);
 visor.addColorStop(0, '#f6d77a');
 visor.addColorStop(1, '#a8742a');
 c.fillStyle = visor;
 c.beginPath();
 c.ellipse(238, 94, 9, 8, 0, 0, TAU);
 c.fill();
 c.strokeStyle = '#f4f4f8';
 c.lineWidth = 8;
 c.lineCap = 'round';
 c.beginPath();
 c.moveTo(249, 116);
 c.lineTo(268, 126);
 c.stroke();
 if (original) {
  c.strokeStyle = '#d8d8e0';
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(320, 150);
  c.lineTo(320, 82);
  c.moveTo(320, 84);
  c.lineTo(366, 84);
  c.stroke();
  c.fillStyle = '#ffffff';
  c.fillRect(320, 85, 46, 28);
  c.fillStyle = '#d23a3a';
  [86, 93, 100, 107].forEach(stripeY => c.fillRect(320, stripeY, 46, 3.5));
  c.fillStyle = '#243a8a';
  c.fillRect(320, 85, 20, 14);
  const planet = c.createRadialGradient(464, 36, 2, 470, 42, 22);
  planet.addColorStop(0, '#9ad0ff');
  planet.addColorStop(1, '#2a62c0');
  c.fillStyle = planet;
  c.beginPath();
  c.arc(470, 42, 20, 0, TAU);
  c.fill();
  c.fillStyle = '#4eaa69';
  c.beginPath();
  c.ellipse(464, 40, 8, 6, -.4, 0, TAU);
  c.ellipse(476, 50, 6, 8, .5, 0, TAU);
  c.fill();
  c.fillStyle = 'rgba(255,255,255,.75)';
  c.beginPath();
  c.ellipse(472, 33, 9, 3, .2, 0, TAU);
  c.fill();
  c.fillStyle = 'rgba(30,30,38,.6)';
  for (let step = 0; step < 6; step++) {
   c.beginPath();
   c.ellipse(120 + step * 17, step % 2 ? 176 : 168, 6, 2.6, 0, 0, TAU);
   c.fill();
  }
 }
 c.restore();
}
