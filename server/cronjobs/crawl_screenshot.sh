#!/bin/sh
cd /home/bumzack/server/crawl-search/server

echo "cronjob    crawl_screenshoot.sh    started   @  $(date)" >> /home/bumzack/server/crawl-search/server/cronjobs/cron.log

for i in {11..15}
do
 	node scripts/crawl_and_screenshot.js $i 1
done 
  
echo "cronjob crawl_screenshot.sh   ended @  $(date)" >> /home/bumzack/server/crawl-search/server/cronjobs/cron.log
