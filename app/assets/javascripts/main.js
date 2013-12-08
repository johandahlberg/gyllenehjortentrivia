var JSON_URL = "initalizegame";
var GH_DOKI_URL = "http://gyllenehjorten.se/dokuwiki/doku.php?id=";

var strCurrentCard = "";
var strOldCard;
var blnTags = false;

var strTags;
var strCategories;
var objQuestions;

function initialize() {
		
	//Hämta alla taggar, kategorier och frågor.
	$.getJSON(JSON_URL)
		.done(function(data) {
			
			//Spara de här variablerna så vi kommer åt dem sen.
			strTags = data.tags;
			strCategories = data.categories;
			objQuestions = data.questions;
			
			//Skriv ut kategorierna.
			addLinkList(strCategories, "category", "#categories");
			
			//Gör kategorierna klickbara.
			$(".category").click(function() {
				console.log($(this).html());
				console.log(strCategories[3]);
				newQuestion($(this).html());
			});
			
			//Skriv ut taggarna.
			addLinkList(strTags, "tag", "#tags");
			
			//Hämta en ny fråga av slumpvis utvald kategori.
			var intRandom = Math.floor(Math.random()*strCategories.length);
			newQuestion(strCategories[intRandom]);
			
		})
		.fail(function() {
			
			//Skriv ut ett snällt felmeddelande.
			$("#messagetext").html("Kunde inte hämta frågor.");
			changeCard("message");
			
		});

}

function addLinkList(strLinks, strClass, strElement) {
	
		//Skapa HTML-koden.
		var strHTML = "";
		for(var i=0; i<strLinks.length; i++) {
			strHTML += "<a class='" + strClass + "'>" + strLinks[i] + "</a>";
		}
		
		//Skriv ut den.
		console.log(strHTML);
		$(strElement).html(strHTML);
		
}

function newQuestion(strCategory) {
	
	//Hitta en ny fråga som inte tagits och som är av rätt kategori.
	objQuestion = getUnusedQuestion(strCategory);
	
	if(objQuestion == null) {
		
		//Fanns ingen fråga alls - visa ett meddelande.
		$("#messagetext").html("Det finns inga frågor med denna tag i denna kategori.");
		changeCard("message");
		
	}
	else {
		
		//Fanns en fråga - skriv ut den.
		$("#questiontext").html(objQuestion.question);
		$("#answertext").html(objQuestion.answer);
		if(objQuestion.link == "") {
			$("#readmore").css("display", "none");
		}
		else {
			$("#readmore").attr("href", GH_DOKI_URL + objQuestion.link)
			              .css("display", "none");
		}
		
		//Visa frågesidan.
		changeCard("question");

	}
	
}

function getUnusedQuestion(strCategory) {
	
	var objQuestion = null;
	
	//Kolla om det finns någon passande fråga och returnera i så fall.
	for(var i=0; i<objQuestions.length; i++)
		if(!objQuestions[i].used && isAllowed(objQuestions[i], strCategory))
			return objQuestions[i];
	
	//Det fanns ingen fråga. Sätt frågor som oanvända.
	for(var i=0; i<objQuestions.length; i++) {
		if(isAllowed(objQuestions[i], strCategory)) {
			objQuestions[i].used = false;
			if(objQuestion == null) objQuestion = objQuestions[i];
		}
	}
			
	//Returnera frågan om vi hittade en nu (och annars null)
	return objQuestion;
}

function isAllowed(objQuestion, strCategory) {
	return objQuestion.category == strCategory;
}

function showInfo() {
	
	//Visa infokortet, och kom ihåg vad vi ska byta tillbak till.
	if(strCurrentCard != "info") {
		strOldCard = strCurrentCard;
		changeCard("info");
	}
	
}

function closeInfo() {
	
	//Stäng infokortet.
	changeCard(strOldCard);
	
}

function changeCard(strCard) {
	
	//Göm det nuvarande kortet (om det finns)
	if(strCurrentCard != "") {
		$("#" + strCurrentCard).css("display", "none");
	}
	
	//Visa det nya kortet.
	$("#" + strCard).css("display", "block");
	
	//Kom ihåg vilket kort vi är på.
	strCurrentCard = strCard;
	
}

function toggleTags() {
	
	//Visa eller dölj tagglistan.
	blnTags = !blnTags;
	var strNewStyle = blnTags ? "block" : "none";
	$("#tags").css("display", strNewStyle);
	
}