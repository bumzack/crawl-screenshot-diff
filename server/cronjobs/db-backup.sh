#!/bin/sh
NOW=$(date)

mysqldump -u crawlscreen -pcrawlscreen crawlscreen > "/home/bumzack/server/crawlscreen/backups/crawlscreen-$NOW.sql"
gzip "/home/bumzack/server/crawl-search/backups/crawlscreen-$NOW.sql"
