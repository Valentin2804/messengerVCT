async function insertUser(username, password){

    var userExists = await checkUserExists(username);

    if(! userExists)
    {
        var lenght = password.lenght;

        bcrypt.genSalt(lenght, function(err, salt) {

            if(err)
            {
                throw err;
            }else
            {
                bcrypt.hash(password, salt, function(err, hash) {

                    if(err)
                    {
                        throw err;
                    }else
                    {
                        var params = [username, hash];
                        var query = "INSERT INTO Users(username, password) VALUES ( ?, ? );";

                        con.query(query, params, function(err){
                            if(err)
                            {
                                throw err;
                            }
                        })
                    }
                });
            }
        });
    }else
    {
        console.log("this user already exists");
    }
}

function checkUserPassword(user, password)
{

    return new Promise((resolve, reject) => {
        var params = [user];

        var query = 'SELECT Password FROM Users WHERE Users.Username = ?;';

        con.query(query, params, function(err, result)
        {
            if(err)
            {
                throw err;
            }

            bcrypt.compare(password, result[0].Password, function(err, result){
                if(err)
                {
                    console.log(err);
                    reject(err);
                }else if(result)
                {
                    resolve(true);
                }else
                {
                    resolve(false);
                }
            })
        })
    });
}

function checkUserExists(username){

    return new Promise((resolve, reject) => {

        var userExists = false;

        var params = [username];
        
        var query = 'SELECT COUNT(*) as count FROM Users WHERE Users.Username = ?;';

        con.query(query, params, function(err, result){
            if(err)
            {
                console.log(err);
                reject(err);
            }
            if(result[0].count == 1)
            {
                userExists = true;
            }
            resolve(userExists);
        })
    });
}

function getUserContacts(userName){

    return new Promise((resolve, reject) => {

        var params = [userName, userName];

        var query = "SELECT DISTINCT Receiver FROM Message_table \
        WHERE Sender = 'Pesho'\
        UNION\
        SELECT DISTINCT Sender FROM Message_table\
        WHERE Receiver = 'Pesho';";

        con.query(query, params, function(err, result, fields){
            if(err)
            {
                console.log(err);
                reject(err);
            }
            resolve(result);
        });
    });
}

function sendMessage(sender, receiver, message)
{
    return new Promise((resolve, reject) => {


        var params = [sender, receiver, message];

        var query = "INSERT INTO Message_table(Sender, Receiver, Message, Time_of_message)\
        VALUES('?', '?', '?', NOW());";

        con.query(query, params, function(err, result, fields){
            if(err)
            {
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
            if(err)
            {
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
            if(err) 
            {
                console.log(err);
                reject(err);
            }
            resolve(result);
        });
    });
}