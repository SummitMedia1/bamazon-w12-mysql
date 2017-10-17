var Table = require ("cli-table");
var fs = require ("fs");
var inquirer = require ("inquirer");
var mysql = require ("mysql");
var prompt = require ("prompt");

var connection = mysql.createConnection({
  host: "127.0.0.1",  //localhost
  port: 3306,
  user: "root",
  password: "root",
  database: "bamazon01"
});

connection.connect(function(err) {
  // if (err) throw err;
  //console.log("You are connected as id " + connection.threadId + "\n");
  readBamazon();
  // displayProducts();
});

var readBamazon = function(){
  console.log("Let the Buying Commence\n");
};
// readBamazon();
displayProducts();

function displayProducts(){
  // if (err) throw err;
  var table = new Table({
    head: ['Item ID', 'Product Name', 'Department', 'Price', 'Qty.', 'Avail'],
    colWidths: [11, 50, 20, 11, 6, 6]
});

    connection.query("Select * FROM products ", function(err, res) {
      // if (err) throw err;
      for (i = 0; i < res.length; i++) {
// console.log([res[i].item_id, res[i].product_name, res[i].department_name, + "$" + res[i].retail_price, res[i].stock_quantity]);
        table.push([res[i].item_id, res[i].product_name, res[i].department_name, '$' + res[i].retail_price.toFixed(2), res[i].stock_quantity, res[i].remaining_inventory]);
      }

      console.log(table.toString());
      iWantToBuy();
      });
}

//-----------------------------------------GET BALL ROLLING-----------------------------------------------------
function iWantToBuy() {
  var items = [];
  inquirer.prompt([
    {
      name: "items",
      type: "input",
      message: "Please select the Item ID# for the product you would like to purchase.",
      validate: function(value){
        if(isNaN(value) === false) {
          return true;
          }
          return false;
        }
      }, {
              name: "quantity",
              type: "input",
              message: "Please enter the quantity of this item you would like to purchase.",
              validate: function(value){
              if(isNaN(value) === false){
                return true;
              }
                return false;

            }
            }])
            .then(function(answers){
              // var idOfPurchase = answers.items;
              var quan = answers.quantity;
              var purchaseCheck = 'SELECT item_id, product_name, stock_quantity, sold_inventory, retail_price, remaining_inventory FROM products where ?';
                connection.query(purchaseCheck, {item_id: answers.items}, function(err, res){
                // if (err) throw err;
                  var productID = res[0].item_id;
                  var stock = res[0].stock_quantity;
                  var retail_price = res[0].retail_price;
                  var product_name = res[0].product_name;
                  var product_sales = res[0].sold_inventory;
                  var department_name = res[0].department_name;
                  var remaining_inventory = res[0].remaining_inventory;

        if (remaining_inventory === 0){
          inquirerPrompt();
          }  else {
                if (quan <= remaining_inventory) {
                  var yourCost1 = quan * retail_price;
                  console.log(" ");
                  console.log('-------------------------------------------------------------------------------------');
                   console.log('\n  Great news! We have your item in stock and will process your order immediately. \n');
                   console.log('-------------------------------------------------------------------------------------');
                   console.log(' The total cost for \n' + ' (' + quan + ')' + "\n " + product_name + " \n is " + "$" + yourCost1 + ".");
                   makePurchase(quan, product_name, retail_price, yourCost1, remaining_inventory, productID);
                 }
                   else {
                     console.log(" ");
                     console.log('-------------------------------------------------------------------------------------');
                     console.log(' We apologize but the the quantity of purchase exceeds our available inventory.');
                     console.log('\n We have ' + remaining_inventory + " " + product_name + " \n in stock.");
                     console.log('-------------------------------------------------------------------------------------');
                     console.log(" ");

                    remainingInventoryPurchase(quan, product_name, retail_price, yourCost1, remaining_inventory, productID);
                }
              }
              });
          });
        }

 //-----------------------------------------OUT CLAUSE-----------------------------------------------------
                          function inquirerPrompt(){
                            inquirer.prompt([{
                            name: "choice",
                            type: "list",
                            message: "What would you like to do next?",
                            choices: ['Return to Bamazon\'s inventory list', 'End your online session with Bamazon?']
                          }])
                          .then(function(user){
                            if(user.choice !== 'Return to Bamazon\'s inventory list') {
                              console.log(' OK. Thank you for visting Bamazon\'s online storefront. Please shop with us soon.');
                              connection.end();
                            }

                            else {
                              iWantToBuy();
                            }
                          });
                        }


//-----------------------------------------CONFIRM PURCHASE-----------------------------------------------------


              function makePurchase(quan, product_name, retail_price, yourCost1, remaining_inventory, productID){
                          inquirer.prompt([{
                            name: "confirmation",
                            type: "list",
                            message: "Please confirm that you agree to purchase " + '(' + quan + ')' + "\n" + product_name + " \n for " + "$" + yourCost1 + ". Please select 1 or 2.",
                            choices: ['Yes', 'No']
                          }]).then(function(user){
                            if(user.confirmation == "Yes"){
                                connection.query('UPDATE products SET sold_inventory = sold_inventory - ' + quan + ' WHERE item_id = ' + productID);
                                  connection.query('UPDATE products SET remaining_inventory = stock_quantity + sold_inventory WHERE item_id = ' + productID);
                              console.log(' Thank you for supporting Bamazon\'s online storefront.\n You will receive an email shortly regarding payment and shipping options. ');
                              console.log('\n-------------------------------------------------------------------------------------');
                                console.log("Sold inventory has been updated");
                                displayProducts();
                              }

                                else {
                                  if (user.confirmation !== "Yes")
                                  inquirer.prompt([{
                                    name: "end",
                                    type: "list",
                                    message: "Would you like to return to the inventory list, or would you like to exit the program?",
                                    choices: ["Return to Inventory", "Exit"]
                                  }])
                                  .then(function(input){
                                    if(input.end !== "Exit"){
                                      displayProducts();
                                  }
                                  else {
                                      console.log('Thank you for visiting Bamazon\'s online storefront.');
                                      connection.end();
                                    }

                                  });
                                }
                              });
                            }
//-----------------------------------------INVENTORY SHORT BUT WANT TOT BUY?-----------------------------------------------------
                                function remainingInventoryPurchase(quan, product_name, retail_price, yourCost1, remaining_inventory, productID){
                                  inquirer.prompt([{
                                      name: "stillPurchase",
                                      type: "list",
                                      message: "Would you like to purchase the " + remaining_inventory + " unit(s) we have in stock? Please select 1 or 2",
                                      choices: ['Yes','No']
                                    }])
                                    .then(function(user){
                                        if(user.stillPurchase === 'Yes') {
                                          var yourCost2 = remaining_inventory * retail_price;
                                          console.log('-------------------------------------------------------------------------------------');
                                            console.log(' Perfect! The total cost for \n' + ' (' + remaining_inventory + ')' + "\n " + product_name + " \n is " + "$" + yourCost2 + ".");
                                            console.log('\n-------------------------------------------------------------------------------------');
                                            console.log(' Thank you for supporting Bamazon\'s online storefront.\n You will receive an email shortly regarding payment and shipping options. ');
                                            console.log('\n-------------------------------------------------------------------------------------');
                                          }
                                        });
                                      }
