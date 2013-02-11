package controllers

import play.api._
import play.api.mvc._
import play.api.data._
import play.api.data.Forms._
import play.api.libs.json.Json._
import models.Bucket
import scala.io.Source
import play.api.libs.concurrent._
import play.api.Play.current
import utils.DmpParser
import play.Logger

object Application extends Controller {

  def index = Action {
    Redirect(routes.Application.buckets)
  }

  def buckets = Action {
    Ok(views.html.index(Bucket.all(), bucketForm))
  }

  def viewDetails(id: Long) = Action {
    Bucket.all().find(_.id == id).map(b => views.html.details(b)).map(Ok(_)).getOrElse(Ok("not found"))
  }

  def newBucket = Action { implicit request =>
    bucketForm.bindFromRequest.fold(
      errors => BadRequest(views.html.index(Bucket.all(), errors)),
      label => {
        Bucket.create(label._1, label._2)
        Redirect(routes.Application.buckets)
      })
  }

  def upload = Action(parse.multipartFormData) {
    Logger.info("upload")
    request => request.body.file("dmp").map { dmp =>
      Logger.info("moving file")
      import java.io.File
      val filename = dmp.filename
      val contentType = dmp.contentType
      val dir = new File("public/dmps")
      dir.mkdirs()
      val newFile = new File(dir, filename)
      dmp.ref.moveTo(newFile, true)

      Logger.info("parsing DMP")
      val futureResult = Akka.future { DmpParser(newFile).parse }
      Async {
        futureResult.map(p => {
          Bucket.create(p._1, p._2)
          Redirect(routes.Application.buckets)
        })
      }
    }.getOrElse {
      Logger.warn("file missing")
      Redirect(routes.Application.index).flashing(
        "error" -> "Missing file")
    }
  }

  def uploadAjax = Action(parse.temporaryFile) { request =>
    Logger.info("upload ajax")
    val tempFile = java.io.File.createTempFile("dmp", ".dmp", new java.io.File("public/dmps"))
    request.body.moveTo(tempFile, true)

    Logger.info("parsing DMP")
    val futureResult = Akka.future { DmpParser(tempFile).parse }
    Async {
      futureResult.map(p => {
        Bucket.create(p._1, p._2)
        Redirect(routes.Application.buckets)
      })
    }

    Ok(toJson(Map("status" -> "OK")))
  }

  def deleteBucket(id: Long) = TODO

  val bucketForm = Form(tuple("name" -> nonEmptyText, "content" -> nonEmptyText))

}