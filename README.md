# crawl-screenshot-diff

Crawls a website, make screenshots and compare those screenshots visually 

It uses angularjs 1.3 for the web frontend and iojs and a mysql database on the server side.

## About this project
This was a quick hack for a big website relaunch project to track the progress of the development and population with content of a new website (using Typo3 as CMS). That's why the front-end is not fully developed in a sense, that there are always feedbacks when a button is clicked or similar events. It's more of an "expert-system" - use the browser console and a terminal to get a grip of what's going on and if a click on a button just activated the browser window or started a new job.

## How to install

### required software

* iojs
* ImageMagick
* curl
* phantomjs
* mysql

### clone the repository

```
git clone https://github.com/bumzack/crawl-screenshot-diff.git
```

### use npm to install the required packages

```
npm install
```

### create an SSL certificate 
Got to the `server` directory and create a SSL certificate. If you want use an existing certificate, change the path and filenames in `server.js` accordingly.

If you want to create your own certificate, create one using the following command:
```
openssl req -x509 -nodes -days 3650 -newkey rsa:2048 -keyout crawlscreen.key -out crawlscreen.crt
```

### Import the database dump 
Import the database dump into a mysql database. 

e.g.
```
mysql -u USER -p DATABASENAME < database/crawlscreendiff.sql
```
replace `USER` and `DATABASENAME` with appropiate values for your setup.


## Configuration

In the `server` directory you find a file called `config.js`. Adjust the constants to your settings. The most important settings are:
* `listenPort`: which port the server listens to. Default: port `3000`.
* `database`: username, password and databasename for the mysql database. Default values: `crawlscreendiff`
* `appSecret`: secret for the JWT authentication. Defaultvalue: `crawlScreenshotApp`
* `phantomjs`: path to the executeable binary `phantomjs`  (including the name of the binary).

## First run

Change to the `server` directory and start the server with  `node server.js`. 
Open your browser and enter `https://localhost:3000` which should present you with a login form.
The database dump contains 2 users, which allows you to login:
 
* one admin user: username:  `admin`, password: `admin` 
* one readonly user: username:  `readonly`, password: `readonly` 

If you want to add more users or change the default passwords, you can use the following mysql statements: 

##### insert an admin user
```
INSERT INTO crawl_user (username,  password, admin)  VALUES ('admin', SHA2('admin', 512), true)
```

##### insert an unprivileged user
```
INSERT INTO crawl_user (username,  password, admin, accessrights)  VALUES ('readonlyuser',  SHA2('readonlyuser', 512), false, "PAGE_ANALYTICS,PAGE_SEO")
```

## what it does
* In a first step this tool uses `readonly` to retrieve the HTML code of the domain, uses `jsdom` and `jquery` to analyze the HTML Code and finds all internal links (and external links and images and forms and ...). Then it crawls through all internal links and saves the HTML code in the mysql database. No images, no javascript, no CSS files are downloaded.
When there is no unvisited internal link left, the crawl job is finished.
* In a second step screenshots can be made for all of these found pages.
* If the first 2 steps are repeated for the same domain, then the differences on these pages can be visualized in an diff-image resp. there is also an "all-in-one" image.

### 3 different jobs / cronjobs
So there are 3 different jobs, which can be manually started via the web front-end or can also be started via cron-jobs. See the directory `server/cronjobs` for examples how this can be achieved. You'll find scripts there which start a crawl-job and a screenshot-job and a different script which starts a screenshot-comparison job for the last 2 crawl jobs of the domain.
This makes it possible to automatically create diff-images on a daily/weekly basis for a domain.

### logging
In the `server/log` directory several log files are  created and can grow quite fast in size. 

### troubleshooting
* mysql connection fails: set the correct path to the `mysql.lock` file in the config.js file. (it worked on Mac OSX without the path, on CentOS 7.1 the path was necessary to make it work).
* phantomjs on Mac OSX: the current version is 2.0.0. if there are problems, try downgrading to 1.9.7. 
* if you get an error similar to `yieldable wrapper  dbQuery threadId 2770 error-msg: Error: write EPIPE` then you can try an either 
    * decrease the value of `curljobMaxarraylength` or 
    * if you have root access on your server, then increase the values of the following 2 constants in the `[mysqld]` section in the `my.cnf`  file (don't know if 512M is the right or a good value - it seems enough tough :-) )
		* `max_allowed_packet=512M`
		* `net_buffer_length=512M`

the error indicates, that the SQL queries are too big. For technical details see this stackoverflow  [question](http://stackoverflow.com/questions/93128/mysql-error-1153-got-a-packet-bigger-than-max-allowed-packet-bytes)

  
### the SEO part
is quite **experimental**. 

When a crawl-job is finished, all the content is split it into single words and inserted into a table in the mysql database. This makes ist possible to count the occurencies of each word on a single page - and also take into account in which kind of HTML element the word is placed. So it is possible to weigh the use of a word whether it is only used once in a `<p>` element or if it is used in the `<title>` tag, an `<h1>` and a `<p>` tag. 
To my limited knowledge of how google decides what's an important word an a page, this is sorta one of the criteria.


### a few words regarding security
* not all mysql statements/values are escaped
* both the curl and phantomjs command use parameters which allow the access to untrusted SSL certificates. If you don't want that, then remove the `-k` parameter for the curl call and the `--ignore-ssl-errors=true` parameter for the phantomjs call.
 

### unused features
There is some code, which is currently not used or activated but it should be possible to make these features work without going through too much pain.
* text external links: after parsing the html code with jsdom, different content types are stored in the database. Currently only internal links are used. There are also external links and these external links can be tested: which HTTP code is returned when these links are `curl`ed. This allows for a simple check whether or not external links on the page are working and which are not.
* user admin: add/remove users via the web frontend. Change passwords in the web frontend. 
* blacklist of words which should be irgnored for the SEO part.

## License
This software is licensed under the The MIT License (MIT) - see [The MIT License](https://github.com/bumzack/crawl-screenshot-diff/blob/master/license.txt) for details.
