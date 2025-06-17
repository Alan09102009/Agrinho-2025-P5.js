let fazendeiro;
let colheitas = [];
let inimigos = [];
let foices = []; // Para a foice
let cidade;

let VELOCIDADE_MOVIMENTO = 4; // Ajustei a velocidade de movimento

let estadoJogo = "menu"; // Pode ser "menu", "jogando", "ganhou", "perdeu"
let tempoInicial;
let tempoRestante;
const TEMPO_TOTAL_JOGO = 45; // Segundos

let fazendeiroPodeMatar = false;
let tempoFoiceAtiva = 0;
const DURACAO_FOICE = 5000; // 5 segundos que a foice fica ativa

const TEMPO_RESSURGIR_INIMIGO = 17000; // 17 segundos para o inimigo ressurgir

// Variável para rastrear as teclas pressionadas
let keys = {
  a: false,
  d: false,
  w: false,
  s: false,
};

// --- Classes do Jogo ---

class Fazendeiro {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.largura = 40;
    this.altura = 60;
    this.velocidadeX = 0; // Adiciona velocidadeX para controlar o movimento horizontal
    this.velocidadeY = 0; // Adiciona velocidadeY para controlar o movimento vertical
    this.colheitasColetadas = 0;
  }

  mostrar() {
    textSize(40);
    text("👨‍🌾", this.x, this.y + this.altura); // Emoji de fazendeiro
  }

  atualizar() {
    // Aplica movimento horizontal e vertical
    this.x += this.velocidadeX;
    this.y += this.velocidadeY;

    // Impede que o fazendeiro saia da tela
    this.x = constrain(this.x, 0, width - this.largura);
    this.y = constrain(this.y, 0, height - this.altura);

    // Lógica da foice ativa
    if (fazendeiroPodeMatar && millis() - tempoFoiceAtiva > DURACAO_FOICE) {
      fazendeiroPodeMatar = false;
    }
  }

  // Define as velocidades X e Y diretamente
  definirVelocidade(vx, vy) {
    this.velocidadeX = vx;
    this.velocidadeY = vy;
  }

  coletar(item) {
    if (
      this.x < item.x + item.tamanho &&
      this.x + this.largura > item.x &&
      this.y < item.y + item.tamanho &&
      this.y + this.altura > item.y
    ) {
      return true;
    }
    return false;
  }

  colidirComInimigo(inimigo) {
    return (
      this.x < inimigo.x + inimigo.largura &&
      this.x + this.largura > inimigo.x &&
      this.y < inimigo.y + inimigo.altura &&
      this.y + this.altura > inimigo.y
    );
  }

  entregarNaCidade(cidade) {
    return (
      this.x < cidade.x + cidade.tamanho &&
      this.x + this.largura > cidade.x &&
      this.y < cidade.y + cidade.tamanho &&
      this.y + this.altura > cidade.y
    );
  }
}

class Colheita {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.tamanho = 30;
  }

  mostrar() {
    textSize(this.tamanho);
    text("🌱", this.x, this.y + this.tamanho);
  }
}

class Inimigo {
  constructor(x, y, velocidadeX, velocidadeY) {
    this.x = x;
    this.y = y;
    this.largura = 30;
    this.altura = 50;
    this.velocidadeX = velocidadeX;
    this.velocidadeY = velocidadeY; // Adicionado velocidadeY para movimento livre
    this.vivo = true;
    this.tempoMorte = 0;
  }

  mostrar() {
    if (this.vivo) {
      textSize(40);
      text("🧟", this.x, this.y + this.altura);
    }
  }

  atualizar() {
    if (this.vivo) {
      this.x += this.velocidadeX;
      this.y += this.velocidadeY; // Move verticalmente

      // Inverte a direção se atingir as bordas da tela
      if (this.x < 0 || this.x + this.largura > width) {
        this.velocidadeX *= -1;
      }
      if (this.y < 0 || this.y + this.altura > height) {
        this.velocidadeY *= -1;
      }
    } else {
      if (millis() - this.tempoMorte > TEMPO_RESSURGIR_INIMIGO) {
        this.vivo = true;
      }
    }
  }

  morrer() {
    this.vivo = false;
    this.tempoMorte = millis();
  }
}

class Foice {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.tamanho = 30;
    this.coletada = false;
  }

  mostrar() {
    if (!this.coletada) {
      textSize(this.tamanho);
      text("🪓", this.x, this.y + this.tamanho);
    }
  }
}

class Cidade {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.tamanho = 70;
  }

  mostrar() {
    textSize(this.tamanho);
    text("🏙️", this.x, this.y + this.tamanho);
  }
}

// --- Funções do p5.js ---

function setup() {
  createCanvas(800, 500);
  frameRate(60);
}

function setupGame() {
  fazendeiro = new Fazendeiro(50, height / 2); // Posição inicial centralizada verticalmente

  colheitas = [];
  colheitas.push(new Colheita(200, 100));
  colheitas.push(new Colheita(500, 350));
  colheitas.push(new Colheita(700, 150));
  colheitas.push(new Colheita(130, 400));

  inimigos = [];
  inimigos.push(new Inimigo(300, 150, 1.5, 1)); // Inimigos com movimento horizontal e vertical
  inimigos.push(new Inimigo(500, 300, -2, -1.5));
  inimigos.push(new Inimigo(650, 50, 1, 2));

  foices = [];
  foices.push(new Foice(300, 50));
  foices.push(new Foice(750, 400));

  cidade = new Cidade(80, 70);

  tempoInicial = millis();
  fazendeiroPodeMatar = false;
}

function draw() {
  if (estadoJogo === "menu") {
    background(0, 150, 0); // Fundo verde para o menu
    fill(255);
    textSize(50);
    textAlign(CENTER, CENTER);
    // Título do menu
    text("FAZENDA APOCALÍPTICA DEMO", width / 2, height / 2 - 80);

    // Botão Play
    let buttonWidth = 150;
    let buttonHeight = 60;
    let buttonX = width / 2 - buttonWidth / 2;
    let buttonY = height / 2;

    fill(255, 200, 0); // Cor amarela para o botão
    rect(buttonX, buttonY, buttonWidth, buttonHeight, 10); // Arredondar bordas

    fill(0); // Texto preto para o botão
    textSize(32);
    // Centralizando o texto "PLAY" verticalmente no botão
    text("PLAY", width / 2, buttonY + buttonHeight / 2 + 5);

    // Instruções
    fill(255);
    textSize(18);
    text(
      "Controles: W (cima), S (baixo), A (esquerda), D (direita)",
      width / 2,
      height / 2 + 100
    );
    text("Colete todas as 🌱 e leve à 🏙️ em 45s!", width / 2, height / 2 + 130);
    text(
      "Cuidado com os 🧟! Pegue a 🪓 para combatê-los.",
      width / 2,
      height / 2 + 160
    );
  } else if (estadoJogo === "jogando") {
    background(144, 238, 144); // Fundo verde claro

    let tempoDecorrido = (millis() - tempoInicial) / 1000;
    tempoRestante = TEMPO_TOTAL_JOGO - floor(tempoDecorrido);

    if (tempoRestante <= 0) {
      estadoJogo = "perdeu";
    }

    // Lógica para o movimento do fazendeiro
    // Reiniciamos dirX e dirY a cada quadro para garantir que o movimento
    // seja baseado apenas nas teclas *atualmente* pressionadas.
    let dirX = 0;
    let dirY = 0;

    if (keys['a']) {
      dirX = -1;
    }
    if (keys['d']) {
      dirX = 1;
    }
    if (keys['w']) {
      dirY = -1;
    }
    if (keys['s']) {
      dirY = 1;
    }

    fazendeiro.definirVelocidade(
      dirX * VELOCIDADE_MOVIMENTO,
      dirY * VELOCIDADE_MOVIMENTO
    );

    fazendeiro.atualizar();
    fazendeiro.mostrar();

    for (let i = colheitas.length - 1; i >= 0; i--) {
      colheitas[i].mostrar();
      if (fazendeiro.coletar(colheitas[i])) {
        fazendeiro.colheitasColetadas++;
        colheitas.splice(i, 1);
      }
    }

    for (let i = foices.length - 1; i >= 0; i--) {
      if (!foices[i].coletada) {
        foices[i].mostrar();
        if (fazendeiro.coletar(foices[i])) {
          foices[i].coletada = true;
          fazendeiroPodeMatar = true;
          tempoFoiceAtiva = millis();
        }
      }
    }

    for (let inimigo of inimigos) {
      inimigo.atualizar();
      inimigo.mostrar();

      if (inimigo.vivo) {
        if (fazendeiro.colidirComInimigo(inimigo)) {
          if (fazendeiroPodeMatar) {
            inimigo.morrer();
          } else {
            estadoJogo = "perdeu";
          }
        }
      }
    }

    cidade.mostrar();

    if (
      fazendeiro.colheitasColetadas === 4 &&
      fazendeiro.entregarNaCidade(cidade)
    ) {
      estadoJogo = "ganhou";
    }

    fill(0);
    textSize(20);
    textAlign(LEFT, TOP);
    text(`Colheitas: ${fazendeiro.colheitasColetadas}`, 10, 10);
    text(`Tempo: ${tempoRestante}s`, 10, 40);
    if (fazendeiroPodeMatar) {
      fill(0, 150, 0);
      text(`Foice ATIVA!`, 10, 70);
    }
  } else if (estadoJogo === "ganhou") {
    background(255, 215, 0); // Dourado
    fill(255);
    textSize(50);
    textAlign(CENTER, CENTER);
    text("VOCÊ GANHOU!", width / 2, height / 2 - 80);

    let menuButtonWidth = 200;
    let menuButtonHeight = 60;
    let menuButtonX = width / 2 - menuButtonWidth / 2;
    let menuButtonY = height / 2 + 20;

    fill(255, 200, 0);
    rect(menuButtonX, menuButtonY, menuButtonWidth, menuButtonHeight, 10);
    fill(0);
    textSize(28);
    text("Voltar ao Menu", width / 2, menuButtonY + menuButtonHeight / 2 + 5);

    let playAgainButtonWidth = 200;
    let playAgainButtonHeight = 60;
    let playAgainButtonX = width / 2 - playAgainButtonWidth / 2;
    let playAgainButtonY = height / 2 + 100;

    fill(255, 200, 0);
    rect(
      playAgainButtonX,
      playAgainButtonY,
      playAgainButtonWidth,
      playAgainButtonHeight,
      10
    );
    fill(0);
    textSize(28);
    text(
      "Jogar Novamente",
      width / 2,
      playAgainButtonY + playAgainButtonHeight / 2 + 5
    );
  } else if (estadoJogo === "perdeu") {
    background(255, 215, 0); // Dourado
    fill(255);
    textSize(50);
    textAlign(CENTER, CENTER);
    text("VOCÊ PERDEU!", width / 2, height / 2 - 80);

    let menuButtonWidth = 200;
    let menuButtonHeight = 60;
    let menuButtonX = width / 2 - menuButtonWidth / 2;
    let menuButtonY = height / 2 + 20;

    fill(255, 200, 0);
    rect(menuButtonX, menuButtonY, menuButtonWidth, menuButtonHeight, 10);
    fill(0);
    textSize(28);
    text("Voltar ao Menu", width / 2, menuButtonY + menuButtonHeight / 2 + 5);

    let playAgainButtonWidth = 200;
    let playAgainButtonHeight = 60;
    let playAgainButtonX = width / 2 - playAgainButtonWidth / 2;
    let playAgainButtonY = height / 2 + 100;

    fill(255, 200, 0);
    rect(
      playAgainButtonX,
      playAgainButtonY,
      playAgainButtonWidth,
      playAgainButtonHeight,
      10
    );
    fill(0);
    textSize(28);
    text(
      "Jogar Novamente",
      width / 2,
      playAgainButtonY + playAgainButtonHeight / 2 + 5
    );
  }
}

function keyPressed() {
  keys[key.toLowerCase()] = true;
}

function keyReleased() {
  keys[key.toLowerCase()] = false;
  // REMOVEMOS a linha fazendeiro.definirVelocidade(0, 0); daqui.
  // A lógica de movimento agora é completamente controlada pelo estado 'keys' no draw().
}

function mousePressed() {
  if (estadoJogo === "menu") {
    let buttonWidth = 150;
    let buttonHeight = 60;
    let buttonX = width / 2 - buttonWidth / 2;
    let buttonY = height / 2;

    if (
      mouseX > buttonX &&
      mouseX < buttonX + buttonWidth &&
      mouseY > buttonY &&
      mouseY < buttonY + buttonHeight
    ) {
      estadoJogo = "jogando";
      setupGame();
    }
  } else if (estadoJogo === "ganhou" || estadoJogo === "perdeu") {
    // Botão Voltar ao Menu
    let menuButtonWidth = 200;
    let menuButtonHeight = 60;
    let menuButtonX = width / 2 - menuButtonWidth / 2;
    let menuButtonY = height / 2 + 20;

    // Botão Jogar Novamente
    let playAgainButtonWidth = 200;
    let playAgainButtonHeight = 60;
    let playAgainButtonX = width / 2 - playAgainButtonWidth / 2;
    let playAgainButtonY = height / 2 + 100;

    if (
      mouseX > menuButtonX &&
      mouseX < menuButtonX + menuButtonWidth &&
      mouseY > menuButtonY &&
      mouseY < menuButtonY + menuButtonHeight
    ) {
      estadoJogo = "menu"; // Volta para o menu
    } else if (
      mouseX > playAgainButtonX &&
      mouseX < playAgainButtonX + playAgainButtonWidth &&
      mouseY > playAgainButtonY &&
      mouseY < playAgainButtonY + playAgainButtonHeight
    ) {
      estadoJogo = "jogando"; // Reinicia o jogo
      setupGame();
    }
  }
}