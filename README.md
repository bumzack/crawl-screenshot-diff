# crawl-screenshot-diff
crawl a website, make screenshots and make visual diffs between different crawl jobs 

makes use of
	-) iojs (node.js won't probably not work, because jsdom requires iojs and native iojs promises are used)
	-) koajs
	-) mysql for node
	-) a lot of koa libraries 
 
required software
	-) imagemagick
	-) phantomjs
	-) mysql

openssl req -x509 -nodes -days 3650 -newkey rsa:2048 -keyout crawlscreen.key -out crawlscreen.crt

developed on mac osx
production use on centos 7.1

troubleshooting
	-) mysql connection fails: set the correct path to the "mysql.lock" file in the config.js file
	
