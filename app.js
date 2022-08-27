//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose= require("mongoose")
const app = express();
const _ = require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://admin-madhur:test123@cluster0.kumfynt.mongodb.net/todolistDB")

const itemschema = {
  name : String
}

const Item  = mongoose.model("Item" , itemschema)

const buy = new Item({
  name : "This is your To-do-list"
})


const cook = new Item({
  name : "+ to add an item"
})

const eat = new Item({
  name : "<-- To delete an item"
})

const defaultItems = [buy,cook,eat]

const listSchema = {
  name : String,
  items : [itemschema]

}

const List = mongoose.model("List" , listSchema);



app.get("/", function(req, res) {

  Item.find({} , function(err,founditems){
    if(founditems.length === 0){
      Item.insertMany(defaultItems , function(err){
        if(err)
        console.log(err)
        else 
        console.log("Items uploaded successfully")
      })
      res.redirect("/")
    }
    else 
    res.render("list", {listTitle : "Today", newListItems: founditems});

  })
})


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const newItem = new Item({
    name : itemName
  })

  if(listName === "Today")
  { 
    newItem.save();
    res.redirect("/");
  }
  else {
    List.findOne({name : listName}, function(err, foundItem){
      if(!err)
      {
        foundItem.items.push(newItem);
        foundItem.save();
        res.redirect("/"+ listName);}

    })
  }
  
});

app.post("/delete" , function(req,res){
  const id = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
  Item.findByIdAndRemove(id ,function(err){
    if(err)
    console.log(err)
    else res.redirect("/")
  })}

  else {
    List.findOneAndUpdate({name : listName} , {$pull: {items : {_id : id}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName)
      }


    });


  }

})




app.get("/:route", function(req, res){
  const customListName = _.capitalize(req.params.route);

  List.findOne({name: customListName}, function(err,foundname){
    if(!err)
    {if(foundname){
      res.render("list", {
        listTitle: foundname.name,
        newListItems : foundname.items
      })
    }
    else {
      const lists = new  List({
        name : customListName,
        items : defaultItems
      })
    
      lists.save();
      res.redirect("/" + customListName)
    }
}

  })


 


  }
)

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
