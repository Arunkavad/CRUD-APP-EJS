const express = require("express");
const router = express.Router();
const User = require("../models/users");
const multer = require("multer");
const fs = require("fs");

//img upload
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

var upload = multer({
  storage: storage,
}).single("image");

//insert an user into database route
router.post("/add", upload, (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    image: req.file.filename,
  });
  user
    .save()
    .then((result) => {
      req.session.message = {
        type: "success",
        message: "user added successfully",
      };
      res.redirect("/");
    })
    .catch((err) => {
      if (err) {
        res.json({ message: err.message, type: "danger" });
      }
    });
});

// (err)=>{
//   if (err) {
//     res.json({message: err.message, type: 'danger'})
//   }

//GET ALL USERS route
router.get("/", (req, res) => {
  User.find()
    .then((users) => {
      res.render("index", { title: "Home Page", users: users });
    })
    .catch((err) => {
      res.json({ message: err.message });
    });
});

//
router.get("/add", (req, res) => {
  // res.render("edit_users", { title: "Add Users" });
  res.render("add_users", { title: "Add Users" });
});

//Edit an user router
router.get("/edit/:id", (req, res) => {
  let id = req.params.id;
  User.findById(id)
    .then((user) => {
      if (!user) {
        res.status(404).send("User not found");
        return;
      }
      res.render("edit_users", { title: "Edit User", user: user });
    })
    .catch((err) => {
      res.status(500).send(err.message);
    });
});

//update user router

router.post("/update/:id", upload, (req, res) => {
  const id = req.params.id;
  let new_image = "";

  if (req.file) {
    new_image = req.file.filenamel;
    try {
      fs.unlinkSync("./uploads/" + req.body.old_image);
    } catch (err) {
      console.log(err);
    }
  } else {
    new_image = req.body.old_image;
  }

  User.findByIdAndUpdate(
    id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: new_image,
    })
    .then((result) => {
      req.session.message = {
        type: "success",
        message: "User updated successfully !",
      };
      res.redirect("/");
    })
    .catch((err) => {
      res.json({ message: err.message, type: "danger" });
    });
  
});


// DELETE user route
router.get('/delete/:id',(req,res)=>{
const id = req.params.id;

User.findByIdAndDelete(id)
.then((result) => {
  if (result.image != '') {
    try {
      fs.unlinkSync('./uploads/'+result.image)
    } catch (error) {
      console.log(error);
    }
  }
  req.session.message = {
    type:"info",
    message:"User deleted successfully"
  }
  res.redirect("/");
})
.catch((err) => {
 res.json({message: err.message})
});
})

module.exports = router;
