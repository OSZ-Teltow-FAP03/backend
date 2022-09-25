<h1 align="center">
    backend
</h1>


## 💻 Projekt


Before start, you need to have the following tools installed on computer: [Git](https://git-scm.com), [Node.js](https://nodejs.org/en/) and/or [Yarn](https://yarnpkg.com/). [MySQl::Workbench](https://www.mysql.com/products/workbench/).



### 📗 Quick Start

Install backend by running either of the following:
> Install NodeJS LTS from NodeJs Official Page (NOTE: Product only works with LTS version)

Clone the repository with the following command:
```bash
https://github.com/OSZ-Teltow-FAP03/backend.git
```
Run in terminal this command:
```bash
cd backend && npm i 
```

Change your mySQL database data .env
```bash
cp -r env .env
```
Then run this command to start your local server
```bash
npm rum dev 
```
or
```bash
npm start
```
----

# API
Server will listen on port `3001`, and it expose the following APIs:


- **POST** - `/auth/register` - Register a new user
  - **name** - *string*
  - **lastname** - *string*
  - **username** - *string*
  - **email** - *string*
  - **password** - *string*

- **POST** - `/auth/login` - Login user
  - **email** - *string* or **username** - *string*
  - **password** - *string*

---------
# How to encrypt and decrypt in nodejs

In my projects I essentially find useful two ways to encrypt strings: hash functions one-way and one-way and encryption-decryption two-way :

## 1. Hash functions with Bcrypt (one-way)

Hash functions are essentials for store encrypted password, and the best library for nodejs is Bcrypt. You can find more information in this article: why use Bcrypt?.

Install: 
```bash 
npm install bcrypt
```
To hash a password:
```javascript
const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 'myPassword';

bcrypt.hash(myPlaintextPassword, saltRounds).then(function(hash) {
	// Store hash in your password DB.
});
```
At user login to compare password with the one stored in the db you can use:
```javascript
bcrypt.compare(plaintextPassToCheck, hashStoredInDB).then(function(res) {
  // res == true/false
});
```
More info: github.com/kelektiv/node.bcrypt.js

# 2. Simple Encryption and Decryption (two-way)

In other scenarios I needed to crypt strings in order to hide texts to users but in a way that allows me to decrypt and retrieve the original content. In this case a fast tool is Crypto.

Install:

```bash 
npm install crypto
```
To encrypt and decrypt a string:

```javascript
var crypto = require('crypto');

var cypherKey = "mySecretKey";

function encrypt(text){
  var cipher = crypto.createCipher('aes-256-cbc', cypherKey)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted; //94grt976c099df25794bf9ccb85bea72
}

function decrypt(text){
  var decipher = crypto.createDecipher('aes-256-cbc',cypherKey)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec; //myPlainText
}
```



## 🦠  errorcodes messages 

A table that shows the error codes and their respective messages.
| code  | Msg  |
| :------------: |:---------------|
| 100 | username or Email already registered|
| 101 | Invalid email|
| 102 | Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.|
| 103 | Invalid email|
| 104 | Not registered user!|
| 105 | Email or password incorrect|
| 106 | User successfully registered|


  Backend: 
* [express](https://www.npmjs.com/package/express)
* [express-session](https://www.npmjs.com/package/express-session)
* [cors](https://www.npmjs.com/package/cors)
* [cookie-parser](https://www.npmjs.com/package/cookie-parser)
* [body-parser](https://www.npmjs.com/package/body-parser)
* [mysql](https://www.npmjs.com/package/mysql)
* [nodemon](https://www.npmjs.com/package/nodemon)
* [cors](https://www.npmjs.com/package/cors)
* [Formik](https://www.npmjs.com/package/formik)
* [bcrypt](https://www.npmjs.com/package/bcrypt)
* [crypto](https://www.npmjs.com/package/crypto)
