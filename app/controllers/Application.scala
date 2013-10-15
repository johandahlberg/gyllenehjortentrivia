package controllers

import play.api._
import play.api.mvc._
import java.net.URL
import scala.util.Random

object Application extends Controller {

  case class Question(category: Int, question: String, answer: String)
  case class Card(questions: List[Question])

  def index = Action {

    val spreadSheets = getSpreadSheets()
    val answersAndQuestions = getQuestionsAndAnswers(spreadSheets)
    val groupedAnswersAndQuestions = groupQuestionsByCategory(answersAndQuestions)

    val card = createQuestionsCard(groupedAnswersAndQuestions)

    Ok(views.html.index(card))
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
        Question(splitString(1).toInt, splitString(3), splitString(4))
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