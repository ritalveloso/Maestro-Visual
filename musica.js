let handPose;
let video;
let hands = [];

let playlistsEscutadas = [];
let nomesMúsicas = [
  ['musicas/playlist1/revolving-door.mp3',
    'musicas/playlist1/siren-sounds.mp3',
    'musicas/playlist1/sports-car.mp3',
    'musicas/playlist1/miss-possessive.mp3',
    'musicas/playlist1/were-not-alike.mp3'],
  ['musicas/playlist2/como-seria.mp3',
    'musicas/playlist2/insular.mp3',
    'musicas/playlist2/tempo.mp3',
    'musicas/playlist2/vazio.mp3'],
  ['musicas/playlist3/baile-inolvidable.mp3',
    'musicas/playlist3/dakiti.mp3',
    'musicas/playlist3/moscow-mule.mp3']
];

let musicaAtual;
let playlistAtiva = -1;
let musicaIndiceAtiva = 0;
let gestoRock = false;
let gestoPausa = false;

function preload() {
  handPose = ml5.handPose({ flipped: true });
  for (let i = 0; i < nomesMúsicas.length; i++) {
    playlistsEscutadas[i] = [];
    for (let j = 0; j < nomesMúsicas[i].length; j++) {
      playlistsEscutadas[i][j] = loadSound(nomesMúsicas[i][j]);
    }
  }
}

function setup() {
  let canvas = createCanvas(640, 480);
  canvas.parent('canvas-container'); 
  
  video = createCapture(VIDEO, { flipped: true });
  video.size(640, 480);
  video.hide();
  handPose.detectStart(video, gotHands);
}

function draw() {
  image(video, 0, 0);

  if (hands.length > 0) {
    let hand = hands[0];
    desenharPontos(hand);

    let polegarAberto = dist(hand.keypoints[4].x, hand.keypoints[4].y, hand.keypoints[5].x, hand.keypoints[5].y) > 50;
    let indicadorAberto = hand.keypoints[8].y < hand.keypoints[6].y;
    let medioAberto = hand.keypoints[12].y < hand.keypoints[10].y;
    let anelarAberto = hand.keypoints[16].y < hand.keypoints[14].y;
    let mindinhoAberto = hand.keypoints[20].y < hand.keypoints[18].y;

    let dedosContagem = 0;
    if (indicadorAberto) dedosContagem++;
    if (medioAberto) dedosContagem++;
    if (anelarAberto) dedosContagem++;
    if (mindinhoAberto) dedosContagem++;
    if (polegarAberto) dedosContagem++;

    //gesto de pausa/play  
    if (dedosContagem === 5) {
      if (!gestoPausa) {
        alternarPlayPause();
        gestoPausa = true; //trava
      }
    } else {
      gestoPausa = false; //toca
    }

    //gesto rock
    if (polegarAberto && indicadorAberto && mindinhoAberto && !medioAberto && !anelarAberto) {
      if (!gestoRock) {
        proximaMusica();
        gestoRock = true;
      }
    } else {
      gestoRock = false;
    }

    //troca de playlist
    let novoIndice = dedosContagem - 1;
    if (dedosContagem > 0 && dedosContagem <= nomesMúsicas.length && novoIndice !== playlistAtiva && !gestoRock && !gestoPausa) {
      mudarPlaylist(novoIndice);
    }

    design(dedosContagem);
  }
}

function alternarPlayPause() {
  if (musicaAtual) {
    if (musicaAtual.isPlaying()) {
      musicaAtual.pause();
      console.log("Música pausada");
    } else {
      musicaAtual.play();
      console.log("Música a tocar");
    }
  }
}

function mudarPlaylist(indice) {
  if (musicaAtual) musicaAtual.stop();
  playlistAtiva = indice;
  musicaIndiceAtiva = 0;
  musicaAtual = playlistsEscutadas[playlistAtiva][musicaIndiceAtiva];
  musicaAtual.play();
  console.log("Mudou para Playlist " + (indice + 1));
}

function proximaMusica() {
  if (playlistAtiva !== -1) {
    if (musicaAtual) musicaAtual.stop();
    musicaIndiceAtiva = (musicaIndiceAtiva + 1) % playlistsEscutadas[playlistAtiva].length;
    musicaAtual = playlistsEscutadas[playlistAtiva][musicaIndiceAtiva];
    musicaAtual.play();
    console.log("Próxima música: " + musicaIndiceAtiva);
  }
}

function desenharPontos(hand) {
  for (let i = 0; i < hand.keypoints.length; i++) {
    let keypoint = hand.keypoints[i];
    
    if ([4, 8, 12, 16, 20].includes(i)) {
      fill(255, 0, 255);
    } else {
      fill(0, 255, 0);
    }
    noStroke();
    circle(keypoint.x, keypoint.y, 8);
  }
}

function design(contagem) {
  document.getElementById('dedos-count').innerText = "Dedos Levantados: " + contagem;
  document.getElementById('playlist-name').innerText = "Playlist Ativa: " + (playlistAtiva + 1);
  
  let gestoTexto = "---";
  if (gestoPausa) {
    gestoTexto = "PLAY/PAUSE";
  } else if (gestoRock) {
    gestoTexto = "PRÓXIMA MÚSICA";
  }

  let gesto = document.getElementById('gesto-ativo');
  gesto.innerText = "Gesto: " + gestoTexto;
}

function gotHands(results) {
  hands = results;
}