var JSON_URL = "initalizegame";
var GH_DOKI_URL = "http://gyllenehjorten.se/dokuwiki/doku.php?id=";

var strCurrentCard = "";
var strOldCard;
var blnOpenCard = false;

var blnTag = new Array();
var blnAll = true;

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
			
			//Skriv ut kategorierna, och gör dem klickbara.
			$("#categories").append(linkList(strCategories, "category"));
			$(".category").attr("id", function(index) { return index; })
			              .addClass(function(index) { return "category" + index; })
			              .click(function() { newQuestion($(this).attr("id")); });
			
			//Skriv ut taggarna, och gör dem klickbara.
			$("#tags .cardmain").append(linkList(strTags, "tag"));
			$(".tag").attr("id", function(index) { return index; })
			         .addClass("unchecked")
			         .click(function() { toggleTag(this); });
			
			//Fixa alla-taggen
			$("#alltags").click(checkAllTags);
			
			//Evenhandler för diverse knappar.
			$(".close").click(closeCard);
			$("#showtags").click(function() { openCard("tags"); });
			$("#showinfo").click(function() { openCard("info"); });
			$("#showdifficulty").click(function() { openCard("difficulty"); });
			$("#showquestion").click(function() { changeCard("question"); });
			$("#showanswer").click(function() { changeCard("answer"); });
			
			//Hämta en ny fråga av slumpvis utvald kategori.
			newQuestion(-1);
			
			//Visa hela härligheten.
			$("#loadingscreen").hide();
			$("#container").show();
			
		})
		.fail(function() {
			
			//Skriv ut ett snällt felmeddelande.
			$("#loadingscreen").html("Kunde inte hämta frågor.");
			
		});

});

function linkList(strLinks, strClass) {
	
		//Skapa HTML-koden.
		var strHTML = "";
		for(var i=0; i<strLinks.length; i++) {
			strHTML += "<a class='" + strClass + "'>" + strLinks[i] + "</a> ";
		}
		
		//Returnera den
		return strHTML;
}

//
// HÄMTA NYA FRÅGA
//

function newQuestion(intCategory) {
	
	//Om vi ska slumpa en fråga.
	if(intCategory < 0 || intCategory >= strCategories.length)
		intCategory = Math.floor(Math.random()*strCategories.length);
		
	//Hämta namnet på kategorin.
	strCategory = strCategories[intCategory];
	
	//Hitta en ny fråga som inte tagits och som är av rätt kategori.
	objQuestion = getUnusedQuestion(strCategory);
	
	if(objQuestion == null) {

		//Fanns ingen fråga alls - visa ett meddelande.
		$("#message .cardmain").html("Det finns inga frågor med denna tag i denna kategori.");
		changeCard("message");
		
	}
	else {
		
		//Fanns en fråga - skriv ut den.
		$("#question .cardmain").html(objQuestion.question);
		$("#answer .cardmain").html(objQuestion.answer);
		$(".currentcategory").html(objQuestion.category)
							 .removeClass(allCategoryClasses())
		                     .addClass("category" + intCategory);
		if(objQuestion.link == "") {
			$("#readmore").css("display", "none");
		}
		else {
			$("#readmore").attr("href", GH_DOKI_URL + objQuestion.link)
			              .css("display", "none");
		}
		
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
	
	//Om vi markerat alla så är det lugnt.
	if(blnAll)
		return true;
	
	//Kolla om någon av de ibockade taggarna finns i frågan.
	for(var i=0; i<blnTag.length; i++)
		if(blnTag[i] && objQuestion.tags.indexOf(strTags[i]) != -1)
			return true;
	
	//Vi hittade ingen matchning.
	return false;
}

function allCategoryClasses() {

	//Lista alla kategoriklasserna (category0 category1...)
	var strClasses = ""
	for(var i=0; i<strCategories.length; i++)
		strClasses += " category" + i;
		
	return strClasses;
	
}

//
// VÄXLA MELLAN KORT
//

function openCard(strCard) {
	
	//Öppna kortet (om inget är öppet) och kom ihåg vad vi ska byta tillbaka till.
	if(!blnOpenCard) {
		strOldCard = strCurrentCard;
		changeCard(strCard);
		blnOpenCard = true;
	}
	
}

function closeCard() {
	
	//Stäng kortet om något kort är öppet.
	if(blnOpenCard)
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
	
	//Vi har inte längre ett öppet kort.
	blnOpenCard = false;
	
}

//
// BOCKA I OCH UR TAGGAR
//

function checkAllTags() {
	
	//Bocka ur alla taggar.
	$(".tag").addClass("unchecked")
	         .removeClass("checked");
	             
	//Bocka i alternativet alla.
	$("#alltags").addClass("checked")
	             .removeClass("unchecked");
	             
	//Ändra värdena.
	blnTag = new Array();
	blnAll = true;
		
}

function toggleTag(objTag) {
	
	//Ängra utseendet.
	$(objTag).toggleClass("checked unchecked");
	
	//Bocka ur alla.
	$("#alltags").addClass("unchecked")
	             .removeClass("checked");
		       	  
	//Lägg till/ta bort från listan.   
	blnTag[$(objTag).attr("id")] = $(objTag).hasClass("checked");
	blnAll = false;
	
	//Om det inte finns någon tag bockar vi i alla.
	if(noTags())
		checkAllTags();	
}

function noTags() {

	//Returnera falskt om någon tagg är ibockad...
	for(var i=0; i<blnTag.length; i++)
		if(blnTag[i]) return false;
	
	//...annars falskt.
	return true;
	
}

//I debuggsyfte.
function printTags() {
	var t = "";
	if(blnAll) t = "Alla ";
	for(var i=0; i<blnTag.length; i++)
		if(blnTag[i])
			t += strTags[i] + " ";

	console.log(t);
	
}