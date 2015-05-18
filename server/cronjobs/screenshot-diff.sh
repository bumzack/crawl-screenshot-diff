#!/bin/sh
cd /home/bumzack/server/crawl-search/server
echo "cronjob create screenshot-diff -  started @  $(date)" >> /home/bumzack/server/crawl-search/server/cronjobs/cron.log
 
for i in {21..98}
do
 	node scripts/make_screenshot_comparison.js $i
done 
  
echo "cronjob create screenshot-diff    ended @  $(date)" >> /home/bumzack/server/crawl-search/server/cronjobs/cron.log
