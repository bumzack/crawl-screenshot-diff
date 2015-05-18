# crawl-screenshot-diff

Crawls a website, make screenshots and compare those screenshots visually 

It uses angularjs 1.3 for the web frontend and iojs and a mysql database on the server.


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
Got to the `server` directory and create a SSL certificate if you don't have one. If you want use existing certificates change the path and filenames in  `server.js` accordingly.

If you want to create your own certificate use the following command:
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
Open your browser and enter https://localhost:3000 which should opene the login form.
The database dump contains 2 users:
* one admin user: username:  `admin`, password: `admin` 
* one readonly user: username:  `readonly`, password: `readonly` 

If you want to add more users or change the default passwords, use the following mysql statements: 

##### insert an admin user
```
INSERT INTO crawl_user (username,  password, admin)  VALUES ('admin', SHA2('admin', 512), true)
```

##### insert an unprivileged user
```
INSERT INTO crawl_user (username,  password, admin, accessrights)  VALUES ('readonlyuser',  SHA2('readonlyuser', 512), false, "PAGE_ANALYTICS,PAGE_SEO")
```

## what it does
*In a first step this tool uses `readonly` to retrieve the HTML code of the domain, uses `jsdom` and `jquery` to analyze the HTML Code and finds all internal links (and external links and images and forms and ...). Then it crawls through all internal links and saves the HTML code in the mysql database. No images, no javascript, no CSS files are downloaded.
When there is no unvisited internal link left, the crawl job is finished.
*In a second step screenshots can be made for all of these found pages.
*If the first 2 steps are repeated for the same domain, then the differences on these pages can be visualized in an diff-image resp. there is also an "all-in-one" image.

### 3 different jobs / cronjobs
So there are 3 different jobs, which can be manually started via the web front-end or can also be started via cron-jobs. See the directory `server/cronjobs` for examples how this can be achieved. You'll find scripts there which start a crawl-job and a screenshot-job and a different script which starts a screenshot-comparison job for the last 2 crawl jobs of the domain.
This makes it possible to automatically create diff-images on a daily/weekly basis for a domain.

### logging
In the `server/log` directory several log files are  created and can grow quite fast in size. 

### troubleshooting
* mysql connection fails: set the correct path to the "mysql.lock" file in the config.js file. (it worked on max osx without the path, on CentOS 7.1 the path was necessary to make it work).
* phantomjs on maxosx: the current version is 2.0.0. if there are problems, try downgrading to 1.9.7. 

### the SEO part
is quite experimental. 
When a crawl-job is finished, all the content is split it into single words and inserted into a table in the mysql database. This makes ist possible to count the occurencies of each word on a single page - and also take into account in which kind of HTML element the word is placed. So it is possible to weigh the use of a word whether it is only used once in a <p> element or if it is used in the <title> tag, an <h1> and a <p> tag. 
To my limited knowledge of how google decides what's an important word an a page, this is kinda one of the criteria.

### a few words regarding security
* not all mysql statements/values are escaped 

## License
This software is licensed under the The MIT License (MIT) - see [The MIT License](https://github.com/bumzack/crawl-screenshot-diff/blob/master/license.txt) for details.


 
	
