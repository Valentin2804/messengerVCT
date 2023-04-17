var http = require('http');
var express = require('express');
var app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//For accessing static content
var publicDir = require('path').join(__dirname,'/public');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicDir));
const fs = require('fs');

//For validating input data
const validator = require('validator');

//For crypting passwords
var bcrypt = require('bcrypt');

//For transfering data to and from database
var mysql2 = require('mysql2');
con = mysql2.createConnection({
    host:'localhost',
    user:'root',
    password:'root',
    database:'VOT'
});
con.connect(function(err){
    if(err){
        console.log(err);
        res.end("ERR: Could not establish database connection");
    }
});

//Server running on port 5000
app.listen(5000);


/** PURE BACKEND LOGIC */


app.get('/', function(req, res){
    res.redirect("/signin");
});

app.get('/signin', function(req, res){
    fs.readFile('signin.html', function(err, data){
            res.setHeader('Content-Type', 'text/html');
        res.end(data);
    });
});

app.get('/home', function(req, res){
    fs.readFile('home.html', function(err, data){
        res.setHeader('Content-Type', 'text/html');
        const pageData = data.toString().replace('__USERNAME__', req.query.username);
        res.end(pageData);
    });
});

app.post('/check/userCredentials/sqlInjections', function(req, res){
    var username = req.body.user;
    var password = req.body.pass;
    var sanitizedUsername = validator.escape(username);
    var sanitizedPassword = validator.escape(password);

    if(sanitizedUsername != username || sanitizedPassword != password){
        res.end("INJECTIONS");
    }else{
        res.end("NO_INJECTIONS");
    }
});

app.post('/check/userCredentials/userExists', async function(req, res){
    var username = req.body.user;
    var password = req.body.pass;

    try{
        var userExists = await checkUserExists(username, password);
        if(userExists){
            res.end("USER_EXISTS");
        }else{
            res.end("USER_NOT_EXISTS");
        }
    }catch(err){
        console.error(err);
        res.end("ERR");
    }
});

app.post('/user/signup', async function(req, res){
    var username = req.body.user;
    var password = req.body.pass;

    try{
        //Sign up user
        var userExists = await checkUserExists(username, password);
        if(userExists){
            throw "ERR: User already exists";
        }
        insertUser(username, password);
        res.end(JSON.stringify({res: "USER_SIGNED_UP"}));
    }catch(ex){
        res.end(JSON.stringify({res: ex}));
    }
});

app.post('/user/login', async function(req, res){
    var username = req.body.user;
    var password = req.body.pass;

    try{
        //Log in user
        var userExists = await checkUserExists(username, password);
        if(!userExists){
            throw "ERR: User does not exist";
        }

        var passwordCorrect = await checkUserPassword(username, password);
        if(!passwordCorrect){
            throw "ERR: Password for user " + username + " is not correct";
        }

        res.end(JSON.stringify({res: "USER_LOGGED_IN"}));
    }catch(ex){
        res.end(JSON.stringify({res: ex}));
    }
});

app.get('/get/user/contacts', async function(req, res){
    var username = req.body.user;
    var contactInfo = await getUserContacts(username);
    var result = {res:"CONTACT_INFO",contacts:[]};

    console.log("Contact info: \n" + contactInfo);
    for(var i = 0; i < length(contactInfo); i++){
        result.contacts[i] = contactInfo[i].username;
    }

    res.end(JSON.stringify(result));
});


/** DATABASE FUNCTIONS */


async function insertUser(username, password){
    var userExists = await checkUserExists(username);

    if(!userExists){
        var lenght = password.lenght;

        bcrypt.genSalt(lenght, function(err, salt){
            if(err){
                throw err;
            }else{
                bcrypt.hash(password, salt, function(err, hash) {
                    if(err){
                        throw err;
                    }else{
                        var params = [username, hash];
                        var query = "INSERT INTO Users(username, password) VALUES ( ?, ? );";

                        con.query(query, params, function(err){
                            if(err){
                                throw err;
                            }
                        });
                    }
                });
            }
        });
    }else{
        console.log("ERR: Internal server error. User already exists (function insertUser())");
    }
}

function checkUserPassword(user, password){
    return new Promise((resolve, reject) => {
        var params = [user];
        var query = 'SELECT Password FROM Users WHERE Users.Username = ?;';

        con.query(query, params, function(err, result){
            if(err){
                throw err;
            }

            bcrypt.compare(password, result[0].Password, function(err, result){
                if(err){
                    console.log(err);
                    reject(err);
                }else if(result){
                    resolve(true);
                }else{
                    resolve(false);
                }
            });
        });
    });
}

function checkUserExists(username){
    return new Promise((resolve, reject) => {
        var userExists = false;
        var params = [username];
        var query = 'SELECT COUNT(*) as count FROM Users WHERE Users.Username = ?;';

        con.query(query, params, function(err, result){
            if(err){
                console.log(err);
                reject(err);
            }
            if(result[0].count == 1){
                userExists = true;
            }
            resolve(userExists);
        })
    });
}

function getUserContacts(userName){
    return new Promise((resolve, reject) => {
        var params = [userName, userName];
        var query = "SELECT DISTINCT Receiver FROM Message_table WHERE Sender = ? UNION SELECT DISTINCT Sender FROM Message_table WHERE Receiver = ?;";

        con.query(query, params, function(err, result, fields){
            if(err){
                console.log(err);
                reject(err);
            }
            resolve(result);
        });
    });
}

function sendMessage(sender, receiver, message){
    return new Promise((resolve, reject) => {
        var params = [sender, receiver, message];
        var query = "INSERT INTO Message_table(Sender, Receiver, Message, Time_of_message)\
        VALUES('?', '?', '?', NOW());";

        con.query(query, params, function(err, result, fields){
            if(err){
                console.log(err);
                reject(err);
            }
            resolve(result);
        });
    });
}

function getChat(user1, user2){
    return new Promise((resolve, reject) => {
        var params = [user1, user2, user2, user1];
        var query = "SELECT Sender, Receiver, Message, Time_of_message FROM Message_table\
        WHERE (Sender = ? AND Receiver = ?) OR (Sender = ? AND Receiver = ?);";

        con.query(query, params, function(err, result, fields){
            if(err){
                console.log(err);
                reject(err);
            }
            resolve(result);
        });
    });
}

function getNewestMessages(user1, user2, id){
    return new Promise((resolve, reject) => {
        var params = [user1, user2, user2, user1, id];
        var query = "SELECT Sender, Receiver, Message, Time_of_message FROM Message_table\
        WHERE ((Sender = ? AND Receiver = ?) OR (Sender = ? AND Receiver = ?)) AND Id > ?;";

        con.query(query, params, function(err, result, fields){
            if(err){
                console.log(err);
                reject(err);
            }
            resolve(result);
        });
    });
}