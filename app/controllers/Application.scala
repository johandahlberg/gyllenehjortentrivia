package controllers

import play.api._
import play.api.mvc._
import java.net.URL
import scala.util.Random
import play.api.libs.json.Json

/**
 * @TODO Clean up all unused code here.
 */
object Application extends Controller {

  implicit val questionFormat = Json.format[Question]
  case class Question(category: Int, question: String, answer: String, tags: Set[String] = Set.empty)
  case class Card(questions: List[Question])

  def index = Action {

    val spreadSheets = getSpreadSheets()
    val answersAndQuestions = getQuestionsAndAnswers(spreadSheets)
    val groupedAnswersAndQuestions = groupQuestionsByCategory(answersAndQuestions)

    val card = createQuestionsCard(groupedAnswersAndQuestions)

    Ok(views.html.index(card))
  }

  /**
   * Returns a question in the specified category (any if all),
   * and matching at least one of the tags.
   */
  def question(category: String, tags: String) = Action {

    val spreadSheets = getSpreadSheets()
    val answersAndQuestions = getQuestionsAndAnswers(spreadSheets)

    val tagSet = tags.split(";").toSet

    // Filter by category and tag
    val questionFromCategory =
      if (category == "all")
        answersAndQuestions
      else
        answersAndQuestions.filter(p => p.category.toString == category)

    val filteredBytag =
      if (tags.isEmpty())
        questionFromCategory
      else
        questionFromCategory.filter(p => !tagSet.intersect(p.tags).isEmpty)
        
    
    // Select one random question matching query
    val rand = new Random(System.currentTimeMillis())
    val randomIndex = rand.nextInt(filteredBytag.length)    
    val selectedQuestion = filteredBytag(randomIndex)

    if (filteredBytag.isEmpty)
      BadRequest("No question matching request")
    else
      Ok(Json.toJson(selectedQuestion))

  }

  def createQuestionsCard(categoriesAndQuestions: Map[Int, List[Question]]): Card = {
    val questionsFromEachKey =
      for (key <- categoriesAndQuestions.keys) yield {
        val questions = categoriesAndQuestions(key)
        val rand = new Random(System.currentTimeMillis());
        val random_index = rand.nextInt(questions.length);
        val result = questions(random_index);
        result
      }
    Card(questionsFromEachKey.toList.sortBy(f => f.category))
  }

  def groupQuestionsByCategory(questions: List[Question]): Map[Int, List[Question]] = {
    questions.groupBy(f => f.category)
  }

  def getQuestionsAndAnswers(list: List[String]): List[Question] = {

    val questionList =
      for (
        line <- list;
        if line.split("\\t").size > 5
      ) yield {
        val splitString = line.split("\\t").toList
        val tags = splitString(7).split("\\s").toSet
        Question(splitString(1).toInt, splitString(3), splitString(4), tags)
      }
    questionList
  }

  def getSpreadSheets(): List[String] = {

    val sheet = scala.io.Source.fromURL(
      new URL("https://docs.google.com/spreadsheet/pub?key=0AgX8h-A0AgGIdHl1dHZXU1BfVzM0RUdOYzhjd0dZLVE&single=true&gid=0&output=txt")).getLines

    // Hack solution to demand values in each required field
    // Also skips the header by using tail  
    sheet.toList.tail.filter(p => {
      val fields = p.split("\\t").toList
      fields.size > 5 && !fields(1).isEmpty() && !fields(3).isEmpty() && !fields(4).isEmpty()
    })
  }

}