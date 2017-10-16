var Table = require ("cli-table");
var fs = require ("fs");
var inquirer = require ("inquirer");
var mysql = require ("mysql");
var prompt = require ("prompt");
var d = new Date();

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
    head: ['Item ID', 'Product Name', 'Department', 'Price', 'Quantity'],
    colWidths: [11, 50, 20, 11, 11]
});
  // console.log("Here is Bamazon's inventory list for today: " + table);
    connection.query("Select * FROM products ", function(err, res) {
      // if (err) throw err;
      for (i = 0; i < res.length; i++) {
// console.log([res[i].item_id, res[i].product_name, res[i].department_name, + "$" + res[i].retail_price, res[i].stock_quantity]);
        table.push([res[i].item_id, res[i].product_name, res[i].department_name, '$' + res[i].retail_price.toFixed(2), res[i].stock_quantity]);
      }

      console.log(table.toString());
      iWantToBuy();
      });
}

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
              var purchaseCheck = 'SELECT item_id, product_name, stock_quantity, retail_price FROM products where ?';
                connection.query(purchaseCheck, {item_id: answers.items}, function(err, res){
                // if (err) throw err;
                  var stock = res[0].stock_quantity;
                  var retail_price = res[0].retail_price;
                  var product_name = res[0].product_name;
                  var product_sales = res[0].sold_inventory;
                  var department_name = res[0].department_name;

                 if (quan <= stock) {
                   var yourCost1 = quan * retail_price;
                   console.log(" ");
                   console.log('-------------------------------------------------------------------------------------');
                    console.log('\n  Great news! We have your item in stock and will process your order immediately. \n');
                    console.log('-------------------------------------------------------------------------------------');
                      console.log(' The total cost for \n' + ' (' + quan + ')' + "\n " + product_name + " \n is " + "$" + yourCost1 + ".");
                      inquirer.prompt([{
                        name: "confirmation",
                        type: "confirm",
                        message: "Please confirm that you agree to purchase " + '(' + quan + ')' + "\n" + product_name + " \n for " + "$" + yourCost1 + "."
                      }]).then(function(user){
                        if(user.confirmation === "yes"){
                          console.log(' Thank you for supporting Bamazon\'s online storefront.\n You will receive an email shortly regarding payment and shipping options. ');
                          console.log('\n-------------------------------------------------------------------------------------');
                          inquirer.prompt([{
                            name: "choice",
                            type: "list",
                            message: "What would you like to do next?",
                            choices: ['Return to Bamazon\'s inventory list', 'End your online session with Bamazon?']
                          }])
                          .then(function(user){
                            if(user.choice !== 'Return to Bamazon\'s inventory list') {
                              console.log(' OK. Thank you for visting Bamazon\'s online storefront. Please come again to shop soon.');
                              connection.end();
                            }else {
                              displayProducts();

                        }
                    }

                    else {
                      console.log(" ");
                      console.log('-------------------------------------------------------------------------------------');
                      console.log(' We apologize but the the quantity of purchase exceeds our available inventory.');
                      console.log('\n We have ' + stock + " " + product_name + " \n in stock.");
                      console.log('-------------------------------------------------------------------------------------');
                      console.log(" ");
                    }
                    inquirer.prompt([{
                        name: "stillPurchase",
                        type: "list",
                        message: "Would you like to purchase the " + stock + " unit(s) we have in stock?",
                        choices: ['Yes','No']
                      }])
                      .then(function(user){
                          if(user.stillPurchase === 'Yes') {
                            var yourCost2 = stock * retail_price;
                            console.log('-------------------------------------------------------------------------------------');
                              console.log(' Perfect! The total cost for \n' + ' (' + stock + ')' + "\n " + product_name + " \n is " + "$" + yourCost2 + ".");
                              console.log('\n-------------------------------------------------------------------------------------');
                              console.log(' Thank you for supporting Bamazon\'s online storefront.\n You will receive an email shortly regarding payment and shipping options. ');
                              console.log('\n-------------------------------------------------------------------------------------');
                              connection.end();
                        }
                          else {
                            inquirer.prompt([{
                              name: "choice",
                              type: "list",
                              message: "What would you like to do next?",
                              choices: ['Return to Bamazon\'s inventory list', 'End your online session with Bamazon?']
                            }])
                            .then(function(user){
                              if(user.choice !== 'Return to Bamazon\'s inventory list') {
                                console.log(' OK. Thank you for visting Bamazon\'s online storefront. Please come again to shop soon.');
                                connection.end();
                              }else {
                                displayProducts();
                            }
                          });
                          }
                        });
                      }
                    });

              }
            });
        });
}
                            // console.log('\n -----------------------------------------------------------------------------------------------\n\r OK. We apologize for this inconvenience. What would you like to do next?');
//                             //  console.log('\n -----------------------------------------------------------------------------------------------\n\r ');
//
//                           inquirer.prompt([{
//                             name: "cartOrEnd",
//                             type: "list",
//                             message: " What would you like to do next?\n Would you like to checkout now, or would you like to keep shopping?\n   Select 1 or 2, and then hit ENTER",
//                             choices: ['Checkout Now', new inquirer.Separator(), 'Keep Shopping']
//                           }])
//                           .then(function(user){
//                             if (user.cartOrEnd === 'Checkout Now') {
//                               setTimeout(function(){
//                                 console.log(" ");
//                                 console.log('-------------------------------------------------------------------------------------');
//                                 console.log(' The total cost for \n' + ' (' + quan + ')' + "\n " + product_name + " \n is " + "$" + yourCost + ".");
//                               },2000);
//                               // makePurchaseNow();
//                             }
//                             else {
//                               displayProducts();
//                           }
//
//
//

//                          .then(function(user){

//
//             }
//           });
//         }
//       });
//     });
//   });
// });
//
// }

                        //  console.log(' OK. We will process your order now. ');
                        //   var yourUnitCost = stock * retail_price;
                        //     console.log('The total cost for  ' + stock + ' ' + product_name + ' is ' + '$' + yourUnitCost + ".");

                      //  }
                  //    });
                  //  }
                  //     else {
                   //
                  //            }
                  //          });
                   //
                  //  }

//       }else {}
                            //  else {
                            //    console.log('Thank you for stopping by Bamazon\'s online storefront. We hope you will come again soon.');



                            //    connection.end();

//
//
