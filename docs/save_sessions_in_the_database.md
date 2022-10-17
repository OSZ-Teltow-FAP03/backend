# Why is it good save to save sessions in the database? 

## question :
This question does not show any research effort; it is unclear or not useful
I have seen that codeigniter have facility to save session values in database.
It says saving session in database is good security practice.

But I think saving session information in the database helps improve performance.
They save only a few elements of the session, such as:

  ```SQL
  CREATE TABLE IF NOT EXISTS  'ci_sessions' (
    session_id varchar(40) DEFAULT '0' NOT NULL,
    ip_address varchar(16) DEFAULT '0' NOT NULL,
    user_agent varchar(50) NOT NULL,
    last_activity int(10) unsigned DEFAULT 0 NOT NULL,
    user_data text NOT NULL,
    PRIMARY KEY (session_id)
  );
  ```
But if a site uses more session variables such as username, last log in time, etc, I can save them in database and use them in the program.

Do I have to add these columns to the same table? I think saving session information in the database only helps reduce web servers' memory usage (RAM). Can anybody explain in what sense does it improve security.


## answer :

- A session ID is stored in a cookie. If a hacker can steal that ID, he can pretend to be someone else, because a session is identified by... it's ID.

- By saving a user's session ID, IP and agent server-side (your database for example) you can compare the data saved in the database with the client. If a hacker steals someone's session ID, the hacker just might not have a matching IP and/or user-agent, making the users not match which allows you to show or hide certain content.

- It improves performance insofar as the database server has more layers to improve performance through caching and in-memory storage, whereas file based sessions always incur a disk access. Concurrent access can be improved since you can choose other concurrency mechanisms than file locking. If your database server is already busy with regular database work though, additionally throwing session handling at it may or may not be a good idea.

- The performance needs of the application are very demanding and require a more sophisticated storage solution for session data. There are many existing ideas and methodologies that address database performance issues, and these can be used when sessions are stored in a database.


You have to compare the data manually though.

For downvoters: a file in filesystem isn't less secured than a record in database.
## Resources
[storing sessions in a database](https://shiflett.org/articles/storing-sessions-in-a-database)