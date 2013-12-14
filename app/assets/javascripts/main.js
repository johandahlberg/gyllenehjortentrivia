var JSON_URL = "initalizegame";
var GH_DOKI_URL = "http://gyllenehjorten.se/dokuwiki/doku.php?id=";

var strCurrentCard = "message";
var strOldCard;
var blnOpenCard = false;

var strTags;
var strCategories;
var objQuestions;

//
// LADDA SIDAN
//

$(function() {
			
	//Hämta alla taggar, kategorier och frågor.
	$.getJSON(JSON_URL)
		.done(function(data) {
			
			//Spara de här variablerna så vi kommer åt dem sen.
			strTags = data.tags;
			strCategories = data.categories;
			objQuestions = data.questions;
			
			//Blanda korten.
			shuffleArray(objQuestions);
			
			//Skriv ut kategorierna, och gör dem klickbara.
			$("#category-list").append(categoryList());
			$(".category").click(function() { newQuestion($(this).attr("name")); });
			
			//Skriv ut taggarna, och gör dem klickbara.
			$("#tag-list").append(tagList());
			$(".tag").click(function() { toggleTag(this); });
			
			//Fixa alla-taggen
			$("#alltags").click(checkAllTags);
			
			//Evenhandler för diverse knappar.
			$(".close").click(closeCard);
			$("#random").click(function() { newQuestion(-1); });
			$("#showtags").click(function() { openCard("tags"); });
			$("#showinfo").click(function() { openCard("info"); });
			$("#showdifficulty").click(function() { openCard("difficulty"); });
			$("#question").click(function() { changeCard("answer"); });
			$("#answer").click(function() { changeCard("question"); });
			
			//Hämta en ny fråga av slumpvis utvald kategori.
			newQuestion(-1);
			
			//Visa härligheten.
			$("#controls").css("visibility", "visible");
			
		})
		.fail(function() {
			
			//Skriv ut ett snällt felmeddelande.
			$("#loadingscreen").html("Kunde inte hämta frågor.");
			
		});

});

function shuffleArray(a) {

	var j, t;

	//Fisher-Yates
	for(var i=a.length-1; i>0; i--) {
		j = Math.floor(Math.random() * i);
		t = a[i];
		a[i] = a[j];
		a[j] = t;	
	}
		
	
}

function categoryList() {
	
		//Skapa HTML-koden.
		var strHTML = "";
		for(var i=0; i<strCategories.length; i++)
			strHTML += "<button name='" + i + "' type='button' class='category btn btn-" + i + "'>" 
			         + strCategories[i].charAt(0).toUpperCase() + "</button>";

		//Returnera den
		return strHTML;
}

function tagList() {
	
		//Skapa HTML-koden.
		var strHTML = "";
		for(var i=0; i<strTags.length; i++)
			strHTML += "<button type='button' name='" + strTags[i] + "' class='tag btn btn-default'>" 
					 + strTags[i] + "</button> ";

		//Returnera den
		return strHTML;
}

//
// HÄMTA NYA FRÅGA
//

function newQuestion(intCategory) {
	
	//Om vi ska slumpa en fråga.
	if(intCategory < 0)
		intCategory = Math.floor(Math.random()*strCategories.length);
		
	//Hämta namnet på kategorin.
	strCategory = strCategories[intCategory];
	
	//Hitta en ny fråga som inte tagits och som är av rätt kategori.
	objQuestion = getUnusedQuestion(strCategory);
	
	if(objQuestion == null) {

		//Fanns ingen fråga alls - visa ett meddelande.
		showMessage("Oj då!", "Det finns ingen fråga av den typ du vill ha. Testa att välja fler kategorier eller nivåer.");
		
	}
	else {
		
		//Fanns en fråga - skriv ut den.
		$("#question-text").html(objQuestion.question);
		$("#answer-text").html(objQuestion.answer);
		$(".currentcategory").html(objQuestion.category);
		$("#question").add("#answer")
					  .removeClass(allPanelClasses())
		              .addClass("panel-" + intCategory);
		                     
		/*if(objQuestion.link == "") {
			$("#readmore").css("display", "none");
		}
		else {
			$("#readmore").attr("href", GH_DOKI_URL + objQuestion.link)
			              .css("display", "none");
		}*/
		
		//Nu är frågan använd.
		objQuestion.used = true;
		
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
	return objQuestion.category == strCategory && hasCategory(objQuestion);
}

function hasCategory(objQuestion) {
	
	var strChecked = getCheckedTags();
	
	//Om inget är ikryssat så är allt OK.
	if(strChecked.length == 0)
		return true;
	
	//Kolla om någon av de ibockade taggarna finns i frågan.
	for(var i=0; i<strChecked.length; i++)
		if(objQuestion.tags.indexOf(strChecked[i]) != -1)
			return true;
	
	//Vi hittade ingen matchning.
	return false;
}

function allPanelClasses() {

	//Lista alla kategoriklasserna (category0 category1...)
	var strClasses = ""
	for(var i=0; i<strCategories.length; i++)
		strClasses += " panel-" + i;
		
	return strClasses;
	
}

//
// VÄXLA MELLAN KORT
//

function changeCard(strCard) {
	
	//Göm det nuvarande kortet (om det finns)
	if(strCurrentCard != "") {
		$("#" + strCurrentCard).css("display", "none");
	}
	
	//Visa det nya kortet.
	$("#" + strCard).css("display", "block");
	
	//Kom ihåg vilket kort vi är på.
	strCurrentCard = strCard;
	
	//Vi har inte längre ett öppet kort.
	blnOpenCard = false;
	
}

function openCard(strCard) {
	
	//Om det inte redan är ett öppet kort ska vi byta tillbaka till nuvarande.
	if(!blnOpenCard)
		strOldCard = strCurrentCard;
	
	//Byt kort och kom ihåg att det är ett öppnat.
	changeCard(strCard);
	blnOpenCard = true;
	
}

function closeCard() {
	
	//Stäng kortet om något kort är öppet.
	if(blnOpenCard)
		changeCard(strOldCard);
	
}

function showMessage(strHeading, strText) {
	$("#message-heading").html(strHeading);
	$("#message-text").html(strText);
	changeCard("message");
}

//
// BOCKA I OCH UR TAGGAR
//

function checkAllTags() {
	
	//Bocka ur alla taggar.
	$(".tag").removeClass("active");
		
}

function toggleTag(objTag) {
	
	//Bocka i/ur alla-taggen.
	if($(objTag).hasClass("active")) {
		if(getCheckedTags().length == 1)
			$("#alltags").addClass("active");
	}
	else {
		$("#alltags").removeClass("active");
	}
			
}

function getCheckedTags() {

	//Lagra alla namn i en vektor.
	var strCheckedTags = new Array();
	$(".tag.active").each(function() {
		strCheckedTags.push($(this).attr("name"));
	});
	
	//Returnera.
	return strCheckedTags;
	
}

//I debuggsyfte.
function printTags() {

	console.log(getCheckedTags().toString());
	
}