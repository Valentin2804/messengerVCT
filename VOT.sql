DROP DATABASE IF EXISTS VOT;

CREATE DATABASE VOT;

USE VOT;

CREATE TABLE Users (
			Username VARCHAR(120) PRIMARY KEY NOT NULL,
			Password VARCHAR(120) NOT NULL
);

CREATE TABLE Message_table(
			Id INTEGER PRIMARY KEY AUTO_INCREMENT,
			Sender VARCHAR(120) NOT NULL,
			Receiver VARCHAR(120) NOT NULL,
            Message VARCHAR(500) NOT NULL,
			Time_of_message DATETIME NOT NULL,
            
            FOREIGN KEY (Receiver) REFERENCES Users (Username),
            FOREIGN KEY (Sender) REFERENCES Users (Username)
);

INSERT INTO Users(Username, Password) VALUES('Pesho', '1234');
INSERT INTO Users(Username, Password) VALUES('Mariika', '2234');
INSERT INTO Users(Username, Password) VALUES('Gogo', '3234');

INSERT INTO Message_table(Sender, Receiver, Message, Time_of_message)
VALUES('Pesho', 'Mariika', 'maika ti e gei', NOW()),
	('Pesho', 'Mariika', 'bashta ti e jena', NOW()),
    ('Mariika', 'Pesho', 'mainata ti', NOW()),
    ('Pesho', 'Gogo', 'maika ti e gei', NOW());

SELECT DISTINCT Receiver FROM Message_table 
WHERE Sender = 'Pesho'
UNION
SELECT DISTINCT Sender FROM Message_table
WHERE Receiver = 'Pesho';

SELECT Password FROM Users
WHERE Users.Username = 'Pesho';