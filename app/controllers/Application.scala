package controllers

import play.api._
import play.api.mvc._
import java.net.URL
import scala.util.Random
import play.api.libs.json.Json
import scala.io.Codec

object Application extends Controller {

  implicit val questionFormat = Json.format[Question]
  case class Question(category: String, question: String, answer: String, tags: Set[String] = Set.empty, link: String = "", used: Boolean = false)

  implicit val gameFormat = Json.format[GameInitializer]
  case class GameInitializer(questions: List[Question], categories: Set[String], tags: Set[String])

  def index = Action {
    Ok(views.html.index("Hello world!"))
  }

  def getQuestionsFromSpreadsheet(spreadsheet: List[String]): List[Question] = {
    val spreadSheets = getSpreadSheets()
    getQuestionsAndAnswers(spreadSheets)
  }

  /**
   * Get all the stuff necessary to run the game
   */
  def initializeGame = Action {
    val answersAndQuestions = getQuestionsAndAnswers(getSpreadSheets())
    val uniqueTags = answersAndQuestions.map(x => x.tags).foldLeft(Set[String]())((x, y) => x ++ y)
    val categories = answersAndQuestions.map(x => x.category).foldLeft(Set[String]())((x, y) => x + y)
    val everything = GameInitializer(answersAndQuestions, categories, uniqueTags)
    Ok(Json.toJson(everything))
  }

  /**
   * Returns all questions by e.g:
   * http://localhost:9000/questions
   */
  def questions = Action {
    val answersAndQuestions = getQuestionsAndAnswers(getSpreadSheets())
    val randomlyOrdered = Random.shuffle(answersAndQuestions)
    Ok(Json.toJson(randomlyOrdered))
  }

  /**
   * Returns all questions by e.g:
   * http://localhost:9000/tags
   */
  def tags = Action {
    val answersAndQuestions = getQuestionsAndAnswers(getSpreadSheets())
    val uniqueTags = answersAndQuestions.map(x => x.tags).foldLeft(Set[String]())((x, y) => x ++ y)
    Ok(Json.toJson(uniqueTags))
  }

  /**
   *   Formats the spreadsheet rows into questions. This is somewhat hack-ish at the moment.
   */
  def getQuestionsAndAnswers(list: List[String]): List[Question] = {

    val questionList =
      for (
        line <- list;
        if line.split("\\t").size > 5
      ) yield {
        val splitString = line.split("\\t").toList
        val tags = splitString(7).split(",").map(x => x.trim).filter(x => x != "").toSet
        Question(splitString(1), splitString(3), splitString(4), tags)
      }
    questionList
  }

  def getSpreadSheets(): List[String] = {

    val sheet = (scala.io.Source.fromURL(
      new URL("https://docs.google.com/spreadsheet/pub?key=0AgX8h-A0AgGIdGNMY1d4cjJNY2VTVFZIYmhrcGtJZUE&single=true&gid=1&output=txt"))(Codec.UTF8)).getLines

    // Hack solution to demand values in each required field
    // Also skips the header by using tail  
    sheet.toList.tail.filter(p => {
      val fields = p.split("\\t").toList
      fields.size > 5 && !fields(1).isEmpty() && !fields(3).isEmpty() && !fields(4).isEmpty()
    })
  }

}