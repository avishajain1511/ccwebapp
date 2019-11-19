// connecting to database

var mysql = require('mysql');
require('dotenv').config()

var con = mysql.createConnection({
  host: process.env.host,
  user: "dbuser",
  password: "Master123",
  database: "mydb"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  var userSql = "CREATE TABLE IF NOT EXISTS `mydb`.`users` (" +
    "`id` varchar(100) NOT NULL," +
    "`firstname` varchar(100) COLLATE utf8_unicode_ci NOT NULL," +
    "`lastname` varchar(100) COLLATE utf8_unicode_ci NOT NULL," +
    "`email` varchar(100) COLLATE utf8_unicode_ci NOT NULL," +
    "`password` varchar(255) COLLATE utf8_unicode_ci NOT NULL," +
    "`created` datetime NOT NULL," +
    "`modified` datetime NOT NULL," +
    "PRIMARY KEY (`id`)" +
   ") ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;"
  var recipeSql = " CREATE TABLE IF NOT EXISTS `mydb`.`recipe` (" +
  " `id`  varchar(100)  NOT NULL , `created_ts` datetime NOT NULL," +
    "`updated_ts` datetime NOT NULL, `author_id`	varchar(255)   COLLATE utf8_unicode_ci NOT NULL," +
    "`cook_time_in_min` int COLLATE utf8_unicode_ci NOT NULL," +
    " `prep_time_in_min` int COLLATE utf8_unicode_ci NOT NULL," +
    "`total_time_in_min` int COLLATE utf8_unicode_ci NOT NULL," +
    "`title` varchar(255)  COLLATE utf8_unicode_ci NOT NULL," +
    "`cusine` varchar(255)  COLLATE utf8_unicode_ci NOT NULL," +
    "`servings`  int(11)  COLLATE utf8_unicode_ci NOT NULL," +
    "`ingredients` varchar(255)  COLLATE utf8_unicode_ci NOT NULL," +
    "PRIMARY KEY (id)" +
    ") ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;";
    var NutritionInformationsql = " CREATE TABLE IF NOT EXISTS `mydb`.`NutritionInformation` " +
    "(" +
    " `id`  varchar(100) NOT NULL," +
    "`calories` int(11)," +
    "`cholesterol_in_mg` float(8,4)," +
    "`sodium_in_mg` VARCHAR(100) NOT NULL," +
    "`carbohydrates_in_grams` VARCHAR(100) NOT NULL," +
    "`protein_in_grams` VARCHAR(100) NOT NULL," +
    "`recipeTable_idrecipe` VARCHAR(100) NOT NULL," +
    "FOREIGN KEY (recipeTable_idrecipe) REFERENCES `recipe`(`id`)," +
    " PRIMARY KEY (id)" +
    ")ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci; ";
    var Imagesql = " CREATE TABLE IF NOT EXISTS `mydb`.`Images` " +
    "(" +
    " `id`  varchar(100) NOT NULL," +
    "`url` VARCHAR(100) NOT NULL," +
    "`imageName` VARCHAR(254) NOT NULL," +
    "`AcceptRanges` VARCHAR(254) NOT NULL," +
    "`LastModified` VARCHAR(254) NOT NULL," +
    "`ContentLength` VARCHAR(254) NOT NULL," +
    "`ETag` VARCHAR(254) NOT NULL," +
    "`ContentType` VARCHAR(254) NOT NULL," +
    "`recipeTable_idrecipe` VARCHAR(100) NOT NULL," +
    "FOREIGN KEY (recipeTable_idrecipe) REFERENCES `recipe`(`id`)," +
    " PRIMARY KEY (id)" +
    ")ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci; ";
console.log(Imagesql)
  var orderlistSql = " CREATE TABLE IF NOT EXISTS `mydb`.`orderlist` (`id`  varchar(100)  NOT NULL ,`position` int(11) NOT NULL,`items` varchar(255) NOT NULL,`recipeTable_idrecipe` VARCHAR(100) NOT NULL, FOREIGN KEY (recipeTable_idrecipe) REFERENCES `recipe`(`id`),PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;"
  console.log(recipeSql);
  con.query(userSql, function (err, result) {
    if (err) console.log("allready exist");
    console.log("Table 1 created");
  });
  con.query(recipeSql, function (err, result) {
    if (err) console.log(err);
    console.log("Table 2 created");
  });
  con.query(orderlistSql, function (err, result) {
    if (err) console.log("allready exist");
    console.log("Table 4 created");
  });
  con.query(NutritionInformationsql, function (err, result) {
    if (err) console.log("allready exist");
    console.log("Table 3 created");
  });
  con.query(Imagesql, function (err, result) {
    if (err) console.log("allready exist");
    console.log("Table 5 created");
          });
});
module.exports= con;
