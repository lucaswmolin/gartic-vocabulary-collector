var jq = document.createElement('script');
jq.src = "https://code.jquery.com/jquery-3.4.1.min.js";
document.getElementsByTagName('head')[0].appendChild(jq);
jq.onload = function(){ 
	jQuery.noConflict(); 
	$=jQuery; 
	receiveWord();	
};

var id = 0;
var key = "";
var sround = 0;
var nround = 0;
var start = 0;
var maxLetters = -1;
var arrVocabulary;
var afk = 1;
var draw = 0;
var send = 1;
var vocabulary = "";

function sendWord(word){
	console.log("Enviando para o banco de dados...");
	
	$.ajax({
		url: "",
		type: "POST",
		crossDomain: true,
		data: {session : id, word : word, key: key},
		success: function (response) {
			if (response == "OK"){
				console.log("Palavra recebida.");
			}
		},
		error: function (xhr, status) {
			console.log("Ocorreu um erro ao tentar enviar a palavra ao banco de dados.");
		}
	});
}

function receiveWord(){
	console.log("Extraindo o vocabulário do banco de dados...");
	
	$.ajax({
		url: "",
		type: "GET",
		crossDomain: true,
		success: function (response) {
			vocabulary = response;
			loadVocabulary();
			console.log((arrVocabulary.length - 1) + " palavras extraídas.");
		},
		error: function (xhr, status) {
			console.log("Ocorreu um erro ao tentar extrair o vocabulário do banco de dados.");
		}
	});
}

function loadVocabulary(){
	arrVocabulary = vocabulary.split(";");
	id = new Date().getTime();
	start = 1;
}

function addWord(word){	
	var haveWord = 0;
	for (let i = 0; i < (arrVocabulary.length - 1); i++){
		if (word == arrVocabulary[i]){
			haveWord = 1;
			break;
		}
	}
	
	if (haveWord == 0){
		arrVocabulary.push(word);
		console.log("É uma palavra nova!");
	} else {
		console.log("A palavra já existe no vocabulário.");
	}
	
	if (send == 1){
		sendWord(word);
	}
}

function checkHint(){
	if (start == 1){
		var answer = [];
		var wordLength = 0;
		var span = document.getElementsByTagName("span");
		if (span != null){
			for (let i = 0; i < span.length; i++){
				var word = span[i].parentNode;
				if (word.classList.contains("word")){
					wordLength += 1;
					answer.push((span[i].innerText).toLowerCase());
				}
			}
			
			if (wordLength > 0){
				var hint = "";
				var arrWords = document.getElementsByClassName("word");
				for (let j = 0; j < (arrVocabulary.length - 1); j++){
					var currentWord = arrVocabulary[j];
					var tempWord = currentWord.replace(" ", "");
					if (tempWord.length == wordLength){
						var hasLetter = 0;
						var isEqual = 1;
						for (let k = 0; k < answer.length; k++){
							if (answer[k].length > 0){
								hasLetter += 1;
								if (answer[k] != tempWord[k]){
									isEqual = 0;
								}
							}
						}
						
						var sameLength = 0;
						var arrCurrentWord = currentWord.split(" ");
						if (arrWords.length == arrCurrentWord.length){
							sameLength = 1;
						}
						
						if (sameLength == 1){		
							if (hasLetter == 0){
								hint += currentWord + "\n";
							} else {
								if (isEqual == 1){
									hint += currentWord + "\n";
								}
							}
						}
					}
				}
				
				if (hasLetter > maxLetters){
					maxLetters = hasLetter;
					if (hint.length > 0){
						console.log(hint);
					} else {
						console.log("Nenhuma sugestão de resposta foi encontrada.");
					}
				}
			}
		}
	}
}

function checkNotification(){
	var notification = document.getElementById("notification");
	if (notification != null){
		var notText = notification.innerText;
		if (notText.substr(0, 9) == "INTERVALO"){
			if (sround == 0){
				var arrNotification = notText.split(":");
				if (arrNotification.length > 1){
					var word = arrNotification[1].trim();
					if (word != "("){																		
						console.log("A resposta era: " + word + ".");

						addWord(word);	
						sround = 1;	
					}
				}
			}
		} else 
		if (notText.substr(0, 12) == "NOVA RODADA!" || notText.substr(0, 12) == "É A SUA VEZ!"){
			if (nround == 0){
				maxLetters = -1;
				sround = 0;
				nround = 1;
				console.clear();
				console.log("Nova rodada!");
			}
		}
	} else {
		nround = 0;
	} 
	
	if (afk == 1){
		keepActive();
	}
	
	if (draw == 0){
		skipDraw();
	}
}

function keepActive(){	
	var btnObj = document.getElementsByClassName("btYellowBig");
	var btn = btnObj[0];
	if (btn != null){
		btn.click();
		console.log("Ainda estou aqui!");
	}
}

function skipDraw(){
	var buttons = document.getElementsByTagName("button");
	for (let i = 0; i < buttons.length; i++){
		if (buttons[i].innerHTML == "PULAR"){
			buttons[i].click();
			console.log("Eu não quero desenhar agora.");
		}
	}
}

setInterval(checkHint, 100);
setInterval(checkNotification, 100);
