<h1 align="center">
    backend
</h1>

<div align="center">

Before start, you need to have the following tools installed on computer: [Git](https://git-scm.com), [Node.js](https://nodejs.org/en/) and/or [Yarn](https://yarnpkg.com/). [MySQl::Workbench](https://www.mysql.com/products/workbench/).

</div>

## Table of Contents

- [Quick Start](#quick-start)
  - [MySQL install](#mysql-install)
  - [Creating an SSL Certificate](#creating-an-ssl-certificate)
- [API](#api)
- [Sessions](#sessions)
  - [Flow](#flow)
  - [Features](#features)
  - [Cookies](#cookies)
    - [Security](#security)
    - [Attributes](#attributes)
    - [Flags](#flags)
    - [CSRF](#csrf)
  - [Tokens](#tokens)
    - [Flow](#flow-1)
    - [Features](#features-1)
  - [JWT (JSON Web Tokens)](#jwt-json-web-tokens)
    - [Security](#security-1)
    - [XSS](#xss)
  - [Client Storage](#client-storage)
    - [`localStorage`](#localstorage)
      - [Pros](#pros)
      - [Cons](#cons)
      - [Best for](#best-for)
      - [Worst for](#worst-for)
  - [Sessions vs. JWT](#sessions-vs-jwt)
    - [Sessions + Cookies](#sessions--cookies)
      - [Pros](#pros-1)
      - [Cons](#cons-1)
    - [JWT Auth](#jwt-auth)
      - [Pros](#pros-2)
      - [Cons](#cons-2)
  - [Options for Auth in SPAs / APIs](#options-for-auth-in-spas--apis)
    - [Stateless JWT](#stateless-jwt)
    - [Stateful JWT](#stateful-jwt)
    - [Sessions](#sessions-1)
  - [Verdict](#verdict)
  - [Why not JWT?](#why-not-jwt)
    - [Important](#important)
    - [Auxiliary measures](#auxiliary-measures)
- [Enpoints](#enpoints)
- [How to encrypt and decrypt in nodejs](#how-to-encrypt-and-decrypt-in-nodejs)
  - [1. Hash functions with Bcrypt (one-way)](#1-hash-functions-with-bcrypt-one-way)
- [2. Simple Encryption and Decryption (two-way)](#2-simple-encryption-and-decryption-two-way)
  - [🦠 errorcodes and statuscode messages](#--errorcodes-and-statuscode-messages)
- [Libraries used](#libraries-used)

# Quick Start

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

## MySQL install

if you want to install the MySQL server on your Ubuntu machine
[How To Install MySQL on Ubuntu 20.04](https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-20-04);

## Creating an SSL Certificate

1. First, generate a key file used for self-signed certificate generation with the command below. The command will create a private key as a file called key.pem.

```bash
mkdir https_key && cd https_key && openssl genrsa -out key.pem
```

2. Next, generate a certificate service request (CSR) with the command below. You’ll need a CSR to provide all of the input necessary to create the actual certificate.

```bash
openssl req -new -key key.pem -out csr.pem
```

<img src="./src/img/openssl_1.png" alt="openssl_1">

3. Finally, generate your certificate by providing the private key created to sign it with the public key created in step two with an expiry date of 9,999 days. This command below will create a certificate called cert.pem.

```bash
openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
```

The following config Data can be used to modify how the software works.

```bash
cp -r ./config/.config.json ./config/config.json
```

info about config data

```json
{
	"host": "0.0.0.0",
	"port": 4000,
	"databank": [
		{
			"host": "nearix67.de",
			"port": 17172,
			"user": "hildegardt",
			"password": "hildegardt",
			"database": "projektarbeit",
			"clearExpired": true,
			"checkExpirationInterval": 900000,
			"expiration": 86400000,
			"createDatabaseTable": true,
			"connectionLimit": 1,
			"endConnectionOnClose": true,
			"charset": "utf8mb4_bin"
		}
	],
	"mailAuth": [
		{
			"host": "smtp",
			"port": 465,
			"secure": true,
			"auth": {
				"user": "",
				"pass": ""
			}
		}
	],
	"https": true,
	"ssl_keys": [
		{
			"key": "/config/ssl/server.key",
			"cert": "/config/ssl/server.crt"
		}
	],
	"filePath": "./uploads/"
}
```

Then run this command to start your local server

```bash
npm start
```

or

```bash
npm start
```

---

# API

Server will listen on port `3001`, and it expose the following APIs:

- **POST** - `/auth/register` - Register a new user

  - **name** - _string_
  - **lastname** - _string_
  - **username** - _string_
  - **email** - _string_
  - **password** - _string_

- **POST** - `/auth/login` - Login user
  - **email** - _string_ or **username** - _string_
  - **password** - _string_

# Sessions

### Flow

- user submits login _credentials_, e.g. email & password
- server verifies the credentials against the DB
- server creates a temporary user **session**
- sever issues a cookie with a **session ID**
- user sends the cookie with each request
- server validates it against the session store & grants access
- when user logs out, server destroys the sess. & clears the cookie

### Features

- every user session is stored server-side (**stateful**)
  - memory (e.g. file system)
  - cache (e.g. `Redis` or `Memcached`), or
  - DB (e.g. `Postgres`, `MongoDB`, `MySQL`)
- each user is identified by a session ID
  - **opaque** ref.
    - no 3rd party can extract data out
    - only issuer (server) can map back to data
  - stored in a cookie
    - signed with a secret
    - protected with flags
- SSR web apps, frameworks (`Spring`, `Rails`), scripting langs (`PHP`)

## Cookies

- `Cookie` header, just like `Authorization` or `Content-Type`
- used in session management, personalization, tracking
- consists of _name_, _value_, and (optional) _attributes_ / _flags_
- set with `Set-Cookie` by server, appended with `Cookie` by browser

```
HTTP/1.1 200 OK
Content-type: text/html
Set-Cookie: SESS_ID=9vKnWqiZvuvVsIV1zmzJQeYUgINqXYeS; Domain=example.com; Path=/
```

### Security

- signed (`HMAC`) with a secret to mitigate tampering
- _rarely_ encrypted (`AES`) to protected from being read
  - no security concern if read by 3rd party
  - carries no meaningful data (random string)
  - even if encrypted, still a 1-1 match
- encoded (`URL`) - not for security, but compat

### Attributes

- `Domain` and `Path` (can only be used on a given site & route)
- `Expiration` (can only be used until expiry)
  - when omitted, becomes a _session cookie_
  - gets deleted when browser is closed

### Flags

- `HttpOnly` (cannot be read with JS on the client-side)
- `Secure` (can only sent over encrypted `HTTPS` channel), and
- `SameSite` (can only be sent from the same domain, i.e. no CORS sharing)

### CSRF

- unauthorized actions on behalf of the authenticated user
- mitigated with a CSRF token (e.g. sent in a separate `X-CSRF-TOKEN` cookie)

## Tokens

### Flow

- user submits login _credentials_, e.g. email & password
- server verifies the credentials against the DB
- sever generates a temporary **token** and embeds user data into it
- server responds back with the token (in body or header)
- user stores the token in client storage
- user sends the token along with each request
- server verifies the token & grants access
- when user logs out, token is cleared from client storage

### Features

- tokens are _not_ stored server-side, only on the client (**stateless**)
- _signed_ with a secret against tampering
  - verified and can be trusted by the server
- tokens can be _opaque_ or _self-contained_
  - carries all required user data in its payload
  - reduces database lookups, but exposes data to XSS
- typically sent in `Authorization` header
- when a token is about to expire, it can be _refreshed_
  - client is issued both access & refresh tokens
- used in SPA web apps, web APIs, mobile apps

## JWT (JSON Web Tokens)

- open standard for authorization & info exchange
- _compact_, _self-contained_, _URL-safe_ tokens
- signed with _symmetric_ (secret) or _asymmetric_ (public/private) key

```
HTTP/1.1 200 OK
Content-type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1YmQ2MWFhMWJiNDNmNzI0M2EyOTMxNmQiLCJuYW1lIjoiSm9obiBTbWl0aCIsImlhdCI6MTU0MTI3NjA2MH0.WDKey8WGO6LENkHWJRy8S0QOCbdGwFFoH5XCAR49g4k
```

- contains **header** (meta), **payload** (claims), and **signature** delimited by `.`

```js
atob('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
// "{"alg":"HS256","typ":"JWT"}"
//     ↑ algorithm   ↑ type

atob('eyJzdWIiOiI1YmQ2MWFhMWJiNDNmNzI0M2EyOTMxNmQiLCJuYW1lIjoiSm9obiBTbWl0aCIsImlhdCI6MTU0MTI3NjA2MH0');
// "{"sub":"5bd61aa1bb43f7243a29316d","name":"John Smith","iat":1541276060}"
//     ↑ subject (e.g. user ID)         ↑ claim(s)		    ↑ issued at (in seconds)
```

### Security

- signed (`HMAC`) with a secret
  - guarantees that token was not tampered
  - any manipulation (e.g. exp. time) invalidates token
- _rarely_ encrypted (`JWE`)
  - (web) clients need to read token payload
  - can't store the secret in client storage securely
- encoded (`Base64Url`) - not for security, but transport
  - payload can be decoded and read
  - no sensitive/private info should be stored
  - access tokens should be short-lived

### XSS

- client-side script injections
- malicious code can access client storage to
  - steal user data from the token
  - initiate AJAX requests on behalf of user
- mitigated by sanitizing & escaping user input

## Client Storage

- JWT can be stored in client storage, `localStorage` or `sessionStorage`

  - `localStorage` has no expiration time
  - `sessionStorage` gets cleared when page is closed

### `localStorage`

Browser key-value store with a simple JS API

#### Pros

- domain-specific, each site has its own, other sites can't read/write
- max size higher than cookie (`5 MB` / domain vs. `4 KB` / cookie)

#### Cons

- plaintext, hence not secure by design
- limited to string data, hence need to serialize
- can't be used by web workers
- stored permanently, unless removed explicitly
- accessible to any JS code running on the page (incl. XSS)
  - scripts can steal tokens or impersonate users

#### Best for

- public, non-sensitive, string data

#### Worst for

- private sensitive data
- non-string data
- offline capabilities

## Sessions vs. JWT

### Sessions + Cookies

#### Pros

- session IDs are opaque and carry no meaningful data
- cookies can be secured with flags (same origin, HTTP-only, HTTPS, etc.)
- HTTP-only cookies can't be compromised with XSS exploits
- battle-tested 20+ years in many langs & frameworks

#### Cons

- server must store each user session in memory
- session auth must be secured against CSRF
- horizontal scaling is more challenging
  - risk of single point of failure
  - need sticky sessions with load balancing

### JWT Auth

#### Pros

- server does not need to keep track of user sessions
- horizontal scaling is easier (any server can verify the token)
- CORS is not an issue if `Authorization` header is used instead of `Cookie`
- FE and BE architecture is decoupled, can be used with mobile apps
- operational even if cookies are disabled

#### Cons

- server still has to maintain a blacklist of revoked tokens
  - defeats the purpose of stateless tokens
  - a whitelist of active user sessions is more secure
- when scaling, the secret must be shared between servers
- data stored in token is "cached" and can go _stale_ (out of sync)
- tokens stored in client storage are vulnerable to XSS
  - if JWT token is compromised, attacker can
    - steal user info, permissions, metadata, etc.
    - access website resources on user's behalf
- requires JavaScript to be enabled

## Options for Auth in SPAs / APIs

1. Sessions
2. Stateless JWT
3. Stateful JWT

### Stateless JWT

- user payload embedded in the token
- token is signed & `base64url` encoded
  - sent via `Authorization` header
  - stored in `localStorage` / `sessionStorage` (in plaintext)
- server retrieves user info from the token
- no user sessions are stored server side
- only revoked tokens are persisted
- refresh token sent to renew the access token

### Stateful JWT

- only user ref (e.g. ID) embedded in the token
- token is signed & `base64url` encoded
  - sent as an HTTP-only cookie (`Set-Cookie` header)
  - sent along with non-HTTP `X-CSRF-TOKEN` cookie
- server uses ref. (ID) in the token to retrieve user from the DB
- no user sessions stored on the server either
- revoked tokens still have to be persisted

### Sessions

- sessions are persisted server-side and linked by sess. ID
- session ID is signed and stored in a cookie
  - sent via `Set-Cookie` header
  - `HttpOnly`, `Secure`, & `SameSite` flags
  - scoped to the origin with `Domain` & `Path` attrs
- another cookie can hold CSRF token

## Verdict

Sessions are (probably) better suited for web apps and websites.

## Why not JWT?

- server state needs to be maintained either way
- sessions are easily extended or invalidated
- data is secured server side & doesn't leak through XSS
- CSRF is easier to mitigate than XSS (still a concern)
- data never goes stale (always in sync with DB)
- sessions are generally easier to set up & manage
- most apps/sites don't require enterprise scaling

### Important

Regardless of auth mechanism

- XSS can compromise user accounts
  - by leaking tokens from `localStorage`
  - via AJAX requests with user token in `Authorization`
  - via AJAX requests with `HttpOnly` cookies
- SSL/HTTPS must be configured
- security headers must be set

### Auxiliary measures

- IP verification
- user agent verification
- two-factor auth
- API throttling

# Endpoints

Server exposes the following Enpoints:

- **POST** - `/auth/register` - Register a new user

  - **name** - _Request Body encrypted string_ -- First name
  - **lastname** - _Request Body encrypted string_ -- Last name
  - **username** - _Request Body encrypted string_ -- Username
  - **email** - _Request Body encrypted string_ -- Email
  - **password** - _Request Body encrypted string_ -- Password

- **POST** - `/auth/login` - Login user

  - **email** - _Request Body encrypted string_ -- Email or Username of User
  - **password** - _Request Body encrypted string_ -- Password

- **POST** - `/auth/forgetpassword` - forgetPassword

  - **email** - _Request Body encrypted string_ -- Email of User

- **GET** - `/auth/forgetpassword/:token` - forgetpassword

  - **token** - _Query Attribute string_ -- Token to verify

- **POST** - `/auth/forgetpassword/:token` - forgetpassword

  - **password** - _Request Body encrypted string_ -- Password
  - **token** - _Request Body encrypted string_ -- Token to verify

- **GET** - `/auth/logout` - Logout user

- **GET** - `/files/stream` - Streams File if it is Streamable

  - **FileID** - _Query Attribute integer_ -- ID of the File
  - **range** - _HTTP Header_ -- Data Range automatically set by Player

- **GET** - `/files/download` - Downloads File

  - **FileID** - _Query Attribute integer_ -- ID of the File

- **POST** - `/files/upload` - Uploads File

  - **FilmID** - _Request Body encrypted string_ -- ID of the Film
  - **File** - _Multipart/Form-Data File_ -- see https://stackoverflow.com/questions/35722093/send-multipart-form-data-files-with-angular-using-http

- **GET** - `/films/get` - Lists/Searches Film

  - **filmQuery** - _Query Attribute string_ -- Optional search string

- **GET** - `/films/listFiles` - Lists Files assosiated with Film

  - **FilmID** - _Query Attribute integer_ -- ID of the Film

- **DELETE** - `/films/delete` - Deletes Film

  - **FilmID** - _Request Body encrypted string_ -- ID of the Film

- **POST** - `/films/create` - Creates Film

  - **Filmtitel** - _Request Body encrypted string_ -- Required
  - **Status** - _Request Body encrypted string_ -- Required
  - **Lehrjahr** - _Request Body encrypted integer_ -- Required
  - **Stichworte** - _Request Body encrypted string_ -- Required
  - **Prüfstück** - _Request Body encrypted 1 or 0_ -- Required
  - **Programmtyp** - _Request Body encrypted string_ -- Required
  - **Erzählsatz** - _Request Body encrypted string_ -- Required
  - **Upload** - _Request Body encrypted date_ -- Required
  - **Erstellungsdatum** - _Request Body encrypted date_ -- Required
  - **Mitwirkende** - _Request Body encrypted string_ -- Required
  - **Erscheinungsdatum** - _Request Body encrypted date_ -- Required
  - **Tonformat** - _Request Body encrypted string_ -- Optional
  - **Bildformat** - _Request Body encrypted string_ -- Optional
  - **Bildfrequenz** - _Request Body encrypted string_ -- Optional
  - **Farbtiefe** - _Request Body encrypted string_ -- Optional
  - **Videocontainer** - _Request Body encrypted string_ -- Optional
  - **Tonspurbelegung** - _Request Body encrypted string_ -- Optional
  - **Timecode_Anfang** - _Request Body encrypted string_ -- Optional
  - **Timecode_Ende** - _Request Body encrypted string_ -- Optional
  - **Dauer** - _Request Body encrypted string_ -- Optional
  - **Videocodec** - _Request Body encrypted string_ -- Optional
  - **Auflösung** - _Request Body encrypted string_ -- Optional
  - **Dauer** - _Request Body encrypted string_ -- Optional
  - **Vorschaubild** - _Request Body encrypted string_ -- Optional
  - **Autor** - _Request Body encrypted string_ -- Optional
  - **Bemerkung** - _Request Body encrypted string_ -- Optional
  - **Bewertungen** - _Request Body encrypted string_ -- Optional
  - **Klasse** - _Request Body encrypted string_ -- Optional

- **PATCH** - `/films/update` - Updates Film, only send attributes are changed

  - **FilmID** - _Request Body encrypted integer_ -- Required
  - **Prüfstück** - _Request Body encrypted 1 or 0_ -- Required
  - **Filmtitel** - _Request Body encrypted string_ -- Optional
  - **Status** - _Request Body encrypted string_ -- Optional
  - **Lehrjahr** - _Request Body encrypted integer_ -- Optional
  - **Stichworte** - _Request Body encrypted string_ -- Optional
  - **Programmtyp** - _Request Body encrypted string_ -- Optional
  - **Erzählsatz** - _Request Body encrypted string_ -- Optional
  - **Upload** - _Request Body encrypted date_ -- Optional
  - **Erstellungsdatum** - _Request Body encrypted date_ -- Optional
  - **Mitwirkende** - _Request Body encrypted string_ -- Optional
  - **Erscheinungsdatum** - _Request Body encrypted date_ -- Optional
  - **Tonformat** - _Request Body encrypted string_ -- Optional
  - **Bildformat** - _Request Body encrypted string_ -- Optional
  - **Bildfrequenz** - _Request Body encrypted string_ -- Optional
  - **Farbtiefe** - _Request Body encrypted string_ -- Optional
  - **Videocontainer** - _Request Body encrypted string_ -- Optional
  - **Tonspurbelegung** - _Request Body encrypted string_ -- Optional
  - **Timecode_Anfang** - _Request Body encrypted string_ -- Optional
  - **Timecode_Ende** - _Request Body encrypted string_ -- Optional
  - **Dauer** - _Request Body encrypted string_ -- Optional
  - **Videocodec** - _Request Body encrypted string_ -- Optional
  - **Auflösung** - _Request Body encrypted string_ -- Optional
  - **Dauer** - _Request Body encrypted string_ -- Optional
  - **Vorschaubild** - _Request Body encrypted string_ -- Optional
  - **Autor** - _Request Body encrypted string_ -- Optional
  - **Bemerkung** - _Request Body encrypted string_ -- Optional
  - **Bewertungen** - _Request Body encrypted string_ -- Optional
  - **Klasse** - _Request Body encrypted string_ -- Optional

- **GET** - `/users/get` - Gets all Data of User

  - **UserID** - _Query Attribute integer_ -- ID of the User

- **PATCH** - `/users/updateRole` - Updates role of User

  - **UserID** - _Request Body encrypted integer_ -- ID of the User
  - **role** - _Request Body encrypted string_ -- new role of the User

- **GET** - `/users/list` - Lists username, name, lastname, email and role of all Users

- **DELETE** - `/users/delete` - Deletes Film

  - **UserID** - _Request Body encrypted string_ -- ID of the User

- **POST** - `/users/changePassword` - Change Password of the User

  - **UserID** - _Request Body encrypted integer_ -- ID of the User
  - **password** - _Request Body encrypted string_ -- Password

---

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

bcrypt.hash(myPlaintextPassword, saltRounds).then(function (hash) {
	// Store hash in your password DB.
});
```

At user login to compare password with the one stored in the db you can use:

```javascript
bcrypt.compare(plaintextPassToCheck, hashStoredInDB).then(function (res) {
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
const Crypto = require('node:crypto');
const config = require('../config/config');

function encode(text) {
	const iv = Crypto.randomBytes(16).toString('hex');
	const key = Crypto.createHash('sha256').update(config.cryptoKey).digest();
	const cipher = Crypto.createCipheriv('aes-256-gcm', key, iv);
	let encrypted = cipher.update(text, 'utf8', 'hex');
	encrypted += cipher.final('hex');
	const authTag = cipher.getAuthTag();

	return { data: encrypted, iv: iv, auth: authTag.toString('hex') };
}

function decode(encrypted) {
	try {
		encrypted = JSON.parse(encrypted);
		const text = encrypted.data;
		const iv = encrypted.iv;
		const authTag = Buffer.from(encrypted.auth, 'hex');
		const key = Crypto.createHash('sha256').update(config.cryptoKey).digest();
		const decipher = Crypto.createDecipheriv('aes-256-gcm', key, iv);
		decipher.setAuthTag(authTag);
		var dec = decipher.update(text, 'hex', 'utf8');
		dec += decipher.final('utf8');
	} catch (error) {
		return false;
	}
	return dec;
}
```

---

## 🦠 errorcodes and statuscode messages

A table that shows the error and status codes and their respective messages.
| code | Msg |
| :------------ |:---------------|
| 101 | Anfrage nicht gültig|
| 102 | Nicht angemeldet|
| 103 | Berechtigungen fehlen|
| 104 | Benutzername oder E-Mail bereits registriert|
| 105 | E-Mail existiert nicht|
| 106 | Kennwort Mindestlänge ist 8 Zeichen|
| 107 | Benutzername hat ungültige Zeichen|
| 108 | Benutzername/E-Mail oder Passwort falsch|
| 109 | "UserID" nicht gesetzt|
| 110 | Benutzer nicht gefunden|
| 111 | "FilmID" nicht gesetzt|
| 112 | Film nicht gefunden|
| 113 | "FileID" nicht gesetzt|
| 114 | Datei nicht gefunden|
| 115 | Datei nicht streambar|
| 116 | Range-Header nicht gesetzt|
| 117 | Token nicht gefunden|
| 201 | Daten gesendet|
| 202 | Benutzer registriert|
| 203 | Benutzer eingelogt|
| 204 | Benutzer abgemeldet|
| 205 | Benutzer geändert|
| 206 | Benutzer gelöscht|
| 207 | Film hinzugefügt|
| 208 | Film geändert|
| 209 | Film gelöscht|
| 210 | Datei hochgeladen|
| 211 | E-Mail gesendet|
| 401 | DB Error|
| 402 | Bycrypt Error|
| 403 | Mail Error|
|

# Libraries used

- [pm2](https://www.npmjs.com/package/pm2) # for production
- [nodemon](https://www.npmjs.com/package/nodemon) # for Dev
- [express](https://www.npmjs.com/package/express)
- [express-session](https://www.npmjs.com/package/express-session)
- [express-fileupload](https://www.npmjs.com/package/express-fileupload)
- [cors](https://www.npmjs.com/package/cors)
- [cookie-parser](https://www.npmjs.com/package/cookie-parser)
- [body-parser](https://www.npmjs.com/package/body-parser)
- [mysql](https://www.npmjs.com/package/mysql)
- [cors](https://www.npmjs.com/package/cors)
- [Formik](https://www.npmjs.com/package/formik)
- [bcrypt](https://www.npmjs.com/package/bcrypt)
- [crypto](https://www.npmjs.com/package/crypto)
