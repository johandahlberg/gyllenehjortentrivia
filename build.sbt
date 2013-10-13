name := "ghtp"

version := "1.0-SNAPSHOT"

resolvers += "mvn repo" at "http://mvnrepository.com/"

libraryDependencies ++= Seq(
  jdbc,
  anorm,
  cache,
  "com.google.gdata" % "core" % "1.47.1"
)     


play.Project.playScalaSettings
